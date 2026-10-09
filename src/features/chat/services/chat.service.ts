// Streaming client for the AI chat.
//
// We cannot use the native EventSource because:
//   1. the endpoint is POST (the user message travels in the body), and
//   2. we must send `Authorization: Bearer <token>`, which EventSource forbids.
//
// Instead we POST with fetch and read the `text/event-stream` body as a
// ReadableStream, parsing the SSE frames by hand. Requests go through the
// Next.js proxy (/api/backend) in the browser to avoid CORS.

import { ChatEventType, ChatStreamEvent } from "@/features/chat/types";

const CHAT_ENDPOINT = "/api/backend/ai/chat";

const KNOWN_EVENTS: ReadonlySet<string> = new Set<ChatEventType>([
  "session",
  "triage",
  "specialist",
  "tool",
  "quality",
  "status",
  "token",
  "done",
  "error",
]);

export interface SendChatParams {
  message: string;
  /** Sent as `true` on the first message so the backend creates a session. */
  firstInteraction?: boolean;
  /** Session id from the `session` event; sent on every later message. */
  sessionId?: string;
  /** Aborts the in-flight request (e.g. a "stop" button or unmount). */
  signal?: AbortSignal;
}

/**
 * Opens the SSE stream for a single chat turn and invokes `onEvent` for every
 * parsed frame. Resolves when the stream closes; rejects on network/HTTP errors
 * or when aborted.
 */
export async function sendChatMessage(
  { message, firstInteraction, sessionId, signal }: SendChatParams,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  const body: Record<string, unknown> = { message };
  if (firstInteraction) {
    body.first_interaction = true;
  } else if (sessionId) {
    // Carries the conversation memory; ignored by the backend on the first call.
    body.session_id = sessionId;
  }

  // No Authorization header here: the /api/backend proxy injects the Bearer from
  // the HttpOnly cookie before forwarding to the backend.
  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) {
    let detail = `Erro ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) detail = String(body.message);
    } catch {
      // Non-JSON error body; keep the status-based message.
    }
    throw new Error(detail);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line. Tolerate CRLF as well as LF.
      let separatorIndex: number;
      while ((separatorIndex = indexOfFrameBoundary(buffer)) !== -1) {
        const rawFrame = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(nextFrameStart(buffer, separatorIndex));
        const parsed = parseFrame(rawFrame);
        if (parsed) onEvent(parsed);
      }
    }

    // Flush any trailing frame that was not terminated by a blank line.
    const tail = parseFrame(buffer);
    if (tail) onEvent(tail);
  } finally {
    reader.releaseLock();
  }
}

/** Finds the index of the first blank-line boundary (\n\n or \r\n\r\n). */
function indexOfFrameBoundary(buffer: string): number {
  const lf = buffer.indexOf("\n\n");
  const crlf = buffer.indexOf("\r\n\r\n");
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

/** Index where the next frame starts, skipping the matched boundary. */
function nextFrameStart(buffer: string, boundary: number): number {
  return buffer.startsWith("\r\n\r\n", boundary) ? boundary + 4 : boundary + 2;
}

/**
 * Parses a single SSE frame into an event. A frame may carry an `event:` line
 * and one or more `data:` lines; the data is expected to be JSON.
 */
function parseFrame(frame: string): ChatStreamEvent | null {
  const trimmed = frame.trim();
  if (!trimmed) return null;

  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith(":")) continue; // comment / keep-alive
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }

  if (!KNOWN_EVENTS.has(eventName)) return null;

  const rawData = dataLines.join("\n");
  if (rawData === "[DONE]") {
    return { type: "done", data: null };
  }

  return {
    type: eventName as ChatEventType,
    data: safeParseJson(rawData),
  };
}

function safeParseJson(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : { value: parsed };
  } catch {
    // Not JSON after all — surface it as plain text so nothing is lost.
    return { text: raw };
  }
}

// Voice chat endpoints.
//
// The audio itself never goes through our backend: we only ask it for a
// short-lived LiveKit token (bound to the chat session) and, later, resolve the
// SKUs the voice agent recommends into product cards. Requests go through the
// Next.js proxy (/api/backend), which injects the Bearer from the cookie.

import type { ChatProductItem } from "@/features/chat/types";
import { notifySessionExpired } from "@/shared/lib/session-events";

const VOICE_TOKEN_ENDPOINT = "/api/backend/ai/voice/token";
const ITEMS_ENDPOINT = "/api/backend/ai/items";

/** Backend limit for a single `/ai/items` request. */
const MAX_SKUS = 50;

export interface VoiceTokenParams {
  /** Current chat session; omitted to let the backend create a new one. */
  sessionId?: string;
  /** Optional product the conversation is about. */
  itemId?: string;
}

export interface VoiceToken {
  /** LiveKit server URL (wss://…). */
  url: string;
  /** Join token — valid for ~10 minutes and only for connecting; never stored. */
  token: string;
  /** Chat session shared with the text chat. */
  session_id: string;
}

/** HTTP error carrying the response status, so callers can branch on it. */
export class VoiceRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "VoiceRequestError";
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) notifySessionExpired();
    let detail = `Erro ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) detail = String(body.message);
    } catch {
      // Non-JSON error body; keep the status-based message.
    }
    throw new VoiceRequestError(detail, response.status);
  }

  return (await response.json()) as T;
}

/** Asks the backend for a LiveKit join token for the given chat session. */
export function requestVoiceToken({
  sessionId,
  itemId,
}: VoiceTokenParams = {}): Promise<VoiceToken> {
  const body: Record<string, string> = {};
  if (sessionId) body.session_id = sessionId;
  if (itemId) body.item_id = itemId;
  return postJson<VoiceToken>(VOICE_TOKEN_ENDPOINT, body);
}

/** Resolves SKUs into products, in the same order as the given SKUs. */
export async function resolveChatItems(
  skus: string[],
): Promise<ChatProductItem[]> {
  const unique = Array.from(new Set(skus.filter(Boolean))).slice(0, MAX_SKUS);
  if (unique.length === 0) return [];
  const data = await postJson<{ items?: ChatProductItem[] }>(ITEMS_ENDPOINT, {
    skus: unique,
  });
  return Array.isArray(data.items) ? data.items : [];
}

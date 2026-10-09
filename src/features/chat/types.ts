// Domain types for the AI chat feature.

/** SSE event names emitted by the backend transport. */
export type ChatEventType =
  | "session"
  | "triage"
  | "specialist"
  | "tool"
  | "quality"
  | "status"
  | "token"
  | "done"
  | "error";

/** A raw, already-parsed SSE event coming off the stream. */
export interface ChatStreamEvent {
  type: ChatEventType;
  /** Parsed `data:` payload (JSON object); `null` when the line was empty/unparseable. */
  data: Record<string, unknown> | null;
}

export type ChatMessageRole = "user" | "assistant";

export type ChatMessageStatus = "streaming" | "done" | "error";

/**
 * A product returned by the assistant in the `done` event (`items`). Mirrors the
 * backend product entity; kept tolerant since only a few fields are displayed.
 */
export interface ChatProductItem {
  id: number;
  codigoIdentificacao: string;
  marca?: string;
  cor?: string;
  category?: string;
  size?: string;
  preco?: number | string;
  status?: string;
  imageUrls?: string[];
  images?: { id: number; urlS3: string }[];
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  /** Products attached to an assistant reply (from the `done` event). */
  items?: ChatProductItem[];
  status?: ChatMessageStatus;
  error?: string;
}

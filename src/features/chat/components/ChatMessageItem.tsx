"use client";

import { AlertTriangle, AudioLines, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/features/chat/types";
import { ChatProductCard } from "@/features/chat/components/ChatProductCard";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";
import { useTypewriter } from "@/features/chat/hooks/useTypewriter";
import { VoiceLevelMeter } from "@/features/chat/components/VoiceLevelMeter";

function getInitials(name?: string, email?: string): string {
  const source = (name || email || "").trim();
  if (!source) return "";
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || source[0].toUpperCase();
  }
  return source[0].toUpperCase();
}

/** User avatar for chat bubbles: profile picture → initials → generic icon. */
function UserAvatar() {
  const { user } = useUserSession();
  const initials = getInitials(user?.name, user?.email);

  if (user?.picture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.picture}
        alt=""
        width={28}
        height={28}
        referrerPolicy="no-referrer"
        className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action-soft text-xs font-semibold text-action">
      {initials || <UserRound className="h-4 w-4" />}
    </span>
  );
}

/** Three bouncing dots shown while the assistant is preparing its reply. */
function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Digitando">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";
  // Reveal the text progressively for a continuous "typing" feel.
  const text = useTypewriter(message.content);
  const isTyping = text.length < message.content.length;

  return (
    <div className="flex justify-start gap-2 motion-safe:animate-[blockRise_200ms_ease-out]">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action-soft text-action">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="max-w-[82%] rounded-lg rounded-bl-sm border border-line bg-surface px-3.5 py-2.5">
        {text ? (
          <p className="whitespace-pre-wrap break-words text-sm text-foreground">
            {text}
            {(isStreaming || isTyping) && (
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-action align-middle" />
            )}
          </p>
        ) : (
          isStreaming && <TypingDots />
        )}

        {message.items && message.items.length > 0 && (
          <div className="-mx-1 mt-2.5 flex gap-2 overflow-x-auto px-1 pb-1">
            {message.items.map((item) => (
              <ChatProductCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {message.via === "voice" && text && (
          <VoiceBadge className="block text-muted-foreground" />
        )}

        {isError && message.error && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {message.error}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Placeholder for the user's turn in a voice call: shown while they speak,
 * until the transcript arrives. The bars follow the microphone volume.
 */
export function ChatListeningBubble({ getLevel }: { getLevel: () => number }) {
  return (
    <div className="flex justify-end gap-2 motion-safe:animate-[blockRise_200ms_ease-out]">
      <div className="relative flex items-center gap-2.5 overflow-hidden rounded-lg rounded-br-sm bg-action px-3.5 py-2.5 text-sm text-action-foreground shadow-[0_6px_18px_-8px_var(--aura-1)]">
        {/* Light sweep over the bubble while the user speaks. */}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.22)_50%,transparent_70%)] bg-[length:200%_100%] motion-safe:animate-[shimmerX_1.8s_linear_infinite]" />
        <VoiceLevelMeter getLevel={getLevel} className="relative h-5" />
        <span className="relative font-medium opacity-95">Ouvindo...</span>
      </div>
      <UserAvatar />
    </div>
  );
}

/** Marks a message that came from the voice call. */
function VoiceBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "mt-1 inline-flex items-center gap-1 text-[0.625rem] font-medium uppercase tracking-wider",
        className,
      )}
    >
      <AudioLines className="h-3 w-3" />
      Voz
    </span>
  );
}

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    const isLive = message.via === "voice" && message.status === "streaming";
    return (
      <div className="flex justify-end gap-2 motion-safe:animate-[blockRise_200ms_ease-out]">
        <div className="max-w-[82%] rounded-lg rounded-br-sm bg-action px-3.5 py-2.5 text-sm text-action-foreground">
          <p className={cn("whitespace-pre-wrap break-words", isLive && "opacity-80")}>
            {message.content}
            {isLive && (
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-action-foreground align-middle" />
            )}
          </p>
          {message.via === "voice" && <VoiceBadge className="opacity-70" />}
        </div>
        <UserAvatar />
      </div>
    );
  }

  return <AssistantMessage message={message} />;
}

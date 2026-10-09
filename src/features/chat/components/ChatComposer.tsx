"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const MAX_TEXTAREA_HEIGHT = 160;

interface ChatComposerProps {
  isStreaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  disabled?: boolean;
}

export function ChatComposer({
  isStreaming,
  onSend,
  onStop,
  disabled,
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to a cap.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-line bg-surface px-3 py-3 md:px-4">
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder="Escreva sua mensagem..."
          className={cn(
            "flex-1 resize-none rounded-md border border-line bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:border-action",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Parar resposta"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line text-foreground transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || disabled}
            aria-label="Enviar mensagem"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-action text-action-foreground transition-colors hover:bg-action/90 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-[0.6875rem] text-muted-foreground">
        Enter envia · Shift + Enter quebra linha
      </p>
    </div>
  );
}

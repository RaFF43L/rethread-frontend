"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
}

/**
 * Chip-style input for free-text string arrays (e.g. styleTags, occasions).
 * Commit a tag with Enter or comma; Backspace on an empty field removes the last.
 */
export function TagInput({ value, onChange, placeholder, id }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:border-ring hover:border-ring/50",
      )}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-md bg-action-soft px-2 py-0.5 text-xs font-medium text-action"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            aria-label={`Remover ${tag}`}
            className="rounded-full text-action/70 transition-colors hover:text-action"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="h-7 flex-1 min-w-[8ch] bg-transparent px-1 placeholder:text-muted-foreground focus-visible:outline-none"
      />
    </div>
  );
}

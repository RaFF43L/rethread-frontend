"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface AnnouncementBarProps {
  message?: string;
}

export function AnnouncementBar({
  message = "Moda sustentável  ·  Peças únicas e autênticas  ·  Compre via WhatsApp"
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-neutral-950 text-neutral-100 py-2.5 text-center relative">
      <p className="text-[11px] font-medium tracking-[0.16em] uppercase">
        {message}
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-100 transition-colors"
        aria-label="Fechar anúncio"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

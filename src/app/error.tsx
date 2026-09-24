"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, WifiOff } from "lucide-react";
import { env } from "@/shared/lib/env";
import { formatWhatsAppLink } from "@/shared/utils/format";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-5 text-center">
      <img
        src="/logo-segunda-aura.png"
        alt="Segunda Aura"
        className="w-32 h-auto opacity-80"
      />

      <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
        <WifiOff className="w-6 h-6 text-muted-foreground" />
      </div>

      <div className="space-y-2 max-w-sm">
        <h1
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
        >
          Ops, estamos fora do ar
        </h1>
        <p className="text-sm text-muted-foreground">
          Não conseguimos carregar o site no momento. Isso costuma ser
          passageiro — tente novamente em instantes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={handleRetry}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-foreground text-background font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Tentando..." : "Tentar novamente"}
        </button>
      </div>

      <a
        href={formatWhatsAppLink(
          env.whatsappNumber,
          "Olá! Tentei acessar o site da Segunda Aura mas ele parece estar fora do ar.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
      >
        Falar com a gente no WhatsApp
      </a>
    </div>
  );
}

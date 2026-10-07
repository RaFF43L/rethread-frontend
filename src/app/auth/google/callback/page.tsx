"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";

const AUTH_STATE_KEY = "auth_state";
const GENERIC_ERROR = "Não foi possível concluir o login. Tente novamente.";

function CallbackLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-5">
      {/* Mesmo loading do resto do app (logo + spinner), adaptado ao tema. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-segunda-aura.png"
        alt="Segunda Aura"
        className="block dark:hidden w-40 h-auto animate-pulse motion-reduce:animate-none"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-segunda-aura-dark.png"
        alt="Segunda Aura"
        className="hidden dark:block w-40 h-auto animate-pulse motion-reduce:animate-none"
      />
      <div className="h-8 w-8 rounded-full border-2 border-foreground border-t-transparent animate-spin motion-reduce:animate-none" />
      <span className="sr-only">Entrando...</span>
    </main>
  );
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeLogin } = useUserSession();
  const [error, setError] = useState<string | null>(null);
  // Garante que o code seja enviado UMA única vez (Strict Mode em dev roda 2x).
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError =
      searchParams.get("error") || searchParams.get("error_description");

    // O provedor devolveu um erro: não chamamos o backend.
    if (oauthError) {
      // Sincronizando estado React a partir da URL (fonte externa), só no cliente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("O login foi cancelado ou falhou.");
      return;
    }

    // Lê e já remove o state salvo, para ser de uso único.
    const savedState =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(AUTH_STATE_KEY)
        : null;
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(AUTH_STATE_KEY);
    }

    // State ausente ou divergente => aborta antes de qualquer chamada.
    if (!code || !state || !savedState || state !== savedState) {
      setError(GENERIC_ERROR);
      return;
    }

    completeLogin(code)
      .then(() => {
        // A URL com o code não pode permanecer no histórico.
        router.replace("/");
      })
      .catch(() => {
        setError(GENERIC_ERROR);
      });
  }, [searchParams, router, completeLogin]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
        <p className="text-sm text-foreground max-w-sm">{error}</p>
        <Link
          href="/"
          className="inline-flex items-center h-9 px-4 rounded-md bg-action text-action-foreground text-sm font-medium transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Voltar à loja
        </Link>
      </main>
    );
  }

  return <CallbackLoading />;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackContent />
    </Suspense>
  );
}

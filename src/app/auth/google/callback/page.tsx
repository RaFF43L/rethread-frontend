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
      {/* Same loading as the rest of the app (logo + spinner), adapted to the theme. */}
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
  // Ensures the code is sent ONLY once (Strict Mode runs twice in dev).
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError =
      searchParams.get("error") || searchParams.get("error_description");

    // The provider returned an error: we don't call the backend.
    if (oauthError) {
      // Syncing React state from the URL (external source), client-only.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("O login foi cancelado ou falhou.");
      return;
    }

    // Reads and immediately removes the saved state, so it is single-use.
    const savedState =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(AUTH_STATE_KEY)
        : null;
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(AUTH_STATE_KEY);
    }

    // Missing or mismatched state => abort before any call.
    if (!code || !state || !savedState || state !== savedState) {
      setError(GENERIC_ERROR);
      return;
    }

    completeLogin(code)
      .then(() => {
        // The URL with the code must not stay in the history.
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

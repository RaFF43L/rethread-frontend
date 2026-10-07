"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";
import { cn } from "@/shared/lib/utils";

// Ícone oficial do Google (4 cores). O botão em si permanece neutro (tokens do
// tema); só o ícone usa as cores da marca, conforme o guia.
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function getInitials(name?: string, email?: string): string {
  const source = (name || email || "").trim();
  if (!source) return "?";
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || source[0].toUpperCase();
  }
  return source[0].toUpperCase();
}

function getFirstName(name?: string, email?: string): string {
  if (name) return name.trim().split(/\s+/)[0];
  if (email) return email.split("@")[0];
  return "Conta";
}

export function HeaderUserMenu() {
  const { user, status, initError, startLogin, logout } = useUserSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Fecha o menu ao clicar fora ou pressionar Esc.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Carregando a sessão: reserva o espaço do botão para evitar salto de layout.
  if (status === "loading") {
    return (
      <div
        aria-hidden="true"
        className="h-9 w-9 sm:w-[132px] rounded-md bg-line animate-pulse motion-reduce:animate-none"
      />
    );
  }

  // Deslogado: botão "Entrar com Google".
  if (status === "unauthenticated" || !user) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={startLogin}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-line bg-surface text-foreground text-sm font-medium transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <GoogleIcon />
          Entrar com Google
        </button>
        {initError && (
          <span role="alert" className="text-xs text-muted-foreground max-w-[220px] text-right">
            {initError}
          </span>
        )}
      </div>
    );
  }

  // Logado: avatar + primeiro nome, com menu.
  const initials = getInitials(user.name, user.email);
  const firstName = getFirstName(user.name, user.email);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="inline-flex items-center gap-2 h-9 pl-1 pr-1 sm:pr-2 rounded-md transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt=""
            width={32}
            height={32}
            referrerPolicy="no-referrer"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-action-soft text-action text-xs font-semibold">
            {initials}
          </span>
        )}
        <span className="hidden sm:inline text-sm font-medium text-foreground">
          {firstName}
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Menu da conta"
          className="absolute right-0 mt-2 w-56 rounded-md border border-line bg-surface p-1 z-50"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name || firstName}
            </p>
            {user.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className={cn(
              "w-full text-left px-3 py-2 rounded text-sm text-foreground transition-colors",
              "hover:bg-action-soft focus-visible:outline-none focus-visible:bg-action-soft"
            )}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

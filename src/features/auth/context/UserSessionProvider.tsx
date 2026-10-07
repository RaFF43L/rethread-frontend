"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { googleAuthService } from "@/features/auth/services/googleAuth.service";
import {
  clearSession,
  getSessionToken,
  getSessionUser,
  setSessionToken,
  setSessionUser,
} from "@/features/auth/lib/session";
import type { GoogleUser } from "@/shared/types";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface UserSessionContextValue {
  user: GoogleUser | null;
  status: SessionStatus;
  /** Mensagem discreta exibida junto ao botão quando a iniciação falha. */
  initError: string | null;
  /** Começa o fluxo: pede a URL ao backend, guarda o state e redireciona. */
  startLogin: () => Promise<void>;
  /** Encerra a sessão local e no backend. */
  logout: () => Promise<void>;
  /** Usado pela página de callback: troca o code por sessão e persiste. */
  completeLogin: (code: string) => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextValue | null>(null);

const AUTH_STATE_KEY = "auth_state";
const INIT_ERROR_MESSAGE =
  "Não foi possível iniciar o login. Tente novamente.";

export function UserSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();

  // Carrega a sessão ao montar: lê os cookies (não há /auth/me para consultar).
  useEffect(() => {
    const savedUser = getSessionUser();
    // Restaura só do estado externo (cookie), disponível apenas no cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedUser) setUser(savedUser);
    setStatus(savedUser ? "authenticated" : "unauthenticated");
  }, []);

  const startLogin = useCallback(async () => {
    setInitError(null);
    try {
      const { url, state } = await googleAuthService.init();
      // Guarda o state (uso único, validado no callback) e sai para o provedor.
      window.sessionStorage.setItem(AUTH_STATE_KEY, state);
      window.location.assign(url);
    } catch {
      setInitError(INIT_ERROR_MESSAGE);
    }
  }, []);

  const completeLogin = useCallback(async (code: string) => {
    const resp = await googleAuthService.callback(code);
    // Dados do usuário vêm no corpo do callback (backend não tem /auth/me).
    const nextUser: GoogleUser = {
      name: resp.user?.name,
      email: resp.user?.email,
      picture: resp.user?.pictureUrl,
      groups: resp.user?.groups,
    };
    const maxAge = resp.expiresIn;

    if (resp.accessToken) setSessionToken(resp.accessToken, maxAge);
    setSessionUser(nextUser, maxAge);

    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    const token = getSessionToken();
    try {
      await googleAuthService.logout(token ?? undefined);
    } catch {
      // Falha no backend não deve impedir o logout local.
    }
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/");
  }, [router]);

  return (
    <UserSessionContext.Provider
      value={{ user, status, initError, startLogin, logout, completeLogin }}
    >
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const ctx = useContext(UserSessionContext);
  if (!ctx) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return ctx;
}

export type { UserSessionContextValue };

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
import { clearSessionUser, getSessionUser } from "@/features/auth/lib/session";
import type { GoogleUser } from "@/shared/types";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface UserSessionContextValue {
  user: GoogleUser | null;
  status: SessionStatus;
  /** Subtle message shown next to the button when initialization fails. */
  initError: string | null;
  /** Starts the flow: requests the URL from the backend, stores the state, and redirects. */
  startLogin: () => Promise<void>;
  /** Ends the session locally and on the backend. */
  logout: () => Promise<void>;
  /** Used by the callback page: exchanges the code for a session and persists it. */
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

  // Loads the session on mount: reads the cookies (there is no /auth/me to query).
  useEffect(() => {
    const savedUser = getSessionUser();
    // Restores only from external state (cookie), available only on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedUser) setUser(savedUser);
    setStatus(savedUser ? "authenticated" : "unauthenticated");
  }, []);

  const startLogin = useCallback(async () => {
    setInitError(null);
    try {
      const { url, state } = await googleAuthService.init();
      // Stores the state (single-use, validated in the callback) and leaves to the provider.
      window.sessionStorage.setItem(AUTH_STATE_KEY, state);
      window.location.assign(url);
    } catch {
      setInitError(INIT_ERROR_MESSAGE);
    }
  }, []);

  const completeLogin = useCallback(async (code: string) => {
    // The route handler exchanges the code and stores the HttpOnly tokens +
    // profile cookie server-side; it returns only the (non-secret) user.
    const { user: nextUser } = await googleAuthService.callback(code);
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    // The route handler clears the HttpOnly token cookies and calls the backend.
    await googleAuthService.logout();
    // Clear the only client-readable cookie (the profile).
    clearSessionUser();
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

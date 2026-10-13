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
import { onSessionExpired } from "@/shared/lib/session-events";
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
/** How often the profile cookie is re-read to notice an expired session. */
const SESSION_CHECK_INTERVAL_MS = 30_000;

export function UserSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();

  // Loads the session on mount and keeps it in sync: reads the cookies (there
  // is no /auth/me to query).
  useEffect(() => {
    // The profile cookie has the session's max-age, so it vanishes on its own
    // when the session expires; re-reading it catches that (and logins/logouts
    // made in another tab) without a reload.
    const syncFromCookie = () => {
      const savedUser = getSessionUser();
      setUser((current) =>
        current?.email === savedUser?.email ? current : savedUser,
      );
      setStatus(savedUser ? "authenticated" : "unauthenticated");
    };
    // Something got a 401 from the backend: the session is over.
    const expire = () => {
      clearSessionUser();
      setUser(null);
      setStatus("unauthenticated");
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") syncFromCookie();
    };

    // Restores only from external state (cookie), available only on the client.
    syncFromCookie();
    const interval = setInterval(syncFromCookie, SESSION_CHECK_INTERVAL_MS);
    window.addEventListener("focus", syncFromCookie);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const unsubscribe = onSessionExpired(expire);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", syncFromCookie);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      unsubscribe();
    };
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

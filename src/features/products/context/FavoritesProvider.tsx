"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";
import { productsService } from "@/features/products/services/products.service";
import type { Product } from "@/shared/types";

type FavoritesStatus = "idle" | "loading" | "ready";

interface FavoritesContextValue {
  /** Favorited products of the logged-in user, newest first. */
  favorites: Product[];
  /** Loading state of the list. */
  status: FavoritesStatus;
  /** Number of favorites. */
  count: number;
  /** Whether the product (by numeric id) is in the favorites. */
  isFavorite: (numericId: number) => boolean;
  /**
   * Toggles the favorite. If the user is not logged in, starts the login.
   * Performs an optimistic update and reverts on error.
   */
  toggleFavorite: (product: Product) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// High limit to populate the header list and the favorites page in one request.
const FAVORITES_LIMIT = 100;

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status: sessionStatus, startLogin } = useUserSession();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [status, setStatus] = useState<FavoritesStatus>("idle");
  // Prevents concurrent toggles for the same product.
  const pending = useRef<Set<number>>(new Set());

  // Loads the list when the session becomes authenticated; clears on logout.
  useEffect(() => {
    let active = true;

    if (sessionStatus !== "authenticated") {
      setFavorites([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    productsService
      .getFavorites({ limit: FAVORITES_LIMIT })
      .then((res) => {
        if (!active) return;
        setFavorites(res.data);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setFavorites([]);
        setStatus("ready");
      });

    return () => {
      active = false;
    };
  }, [sessionStatus]);

  const isFavorite = useCallback(
    (numericId: number) => favorites.some((p) => p.numericId === numericId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (product: Product) => {
      // Logged out: favoriting requires login.
      if (sessionStatus !== "authenticated") {
        await startLogin();
        return;
      }

      const id = product.numericId;
      if (pending.current.has(id)) return;
      pending.current.add(id);

      const wasFavorite = favorites.some((p) => p.numericId === id);

      // Optimistic update.
      setFavorites((prev) =>
        wasFavorite
          ? prev.filter((p) => p.numericId !== id)
          : [product, ...prev],
      );

      try {
        if (wasFavorite) {
          await productsService.removeFavorite(id);
        } else {
          await productsService.addFavorite(id);
        }
      } catch {
        // Revert on failure.
        setFavorites((prev) =>
          wasFavorite
            ? [product, ...prev.filter((p) => p.numericId !== id)]
            : prev.filter((p) => p.numericId !== id),
        );
      } finally {
        pending.current.delete(id);
      }
    },
    [sessionStatus, startLogin, favorites],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        status,
        count: favorites.length,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}

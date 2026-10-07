"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useFavorites } from "@/features/products/context/FavoritesProvider";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";
import { ProductImage } from "@/shared/components/ProductImage";
import { formatPrice } from "@/shared/utils/format";
import { cn } from "@/shared/lib/utils";

export function HeaderFavorites() {
  const { status: sessionStatus, startLogin } = useUserSession();
  const { favorites, count, status, toggleFavorite } = useFavorites();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Fecha ao clicar fora ou pressionar Esc.
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

  const isAuthenticated = sessionStatus === "authenticated";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Favoritos${count > 0 ? ` (${count})` : ""}`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <Heart
          className={cn(
            "h-5 w-5",
            count > 0 ? "fill-action stroke-action" : "stroke-foreground",
          )}
        />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-action px-1 text-[10px] font-semibold leading-none text-action-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Favoritos"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-line bg-surface p-1 z-50 shadow-lg"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-medium text-foreground">Meus favoritos</p>
            {count > 0 && (
              <span className="text-xs text-muted-foreground">{count}</span>
            )}
          </div>
          <div className="h-px bg-line" />

          {!isAuthenticated ? (
            <div className="px-3 py-6 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Entre para ver e salvar seus favoritos.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void startLogin();
                }}
                className="inline-flex h-9 items-center justify-center rounded-md bg-action px-4 text-sm font-medium text-action-foreground transition-colors hover:bg-action/90"
              >
                Entrar
              </button>
            </div>
          ) : status === "loading" ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Carregando…
            </div>
          ) : count === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Você ainda não favoritou nenhuma peça.
            </div>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto py-1">
                {favorites.map((product) => (
                  <li key={product.numericId}>
                    <div className="group flex items-center gap-3 rounded px-2 py-2 hover:bg-action-soft">
                      <Link
                        href={`/product/${product.id}`}
                        onClick={() => setOpen(false)}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-line bg-muted">
                          <ProductImage
                            src={product.images[0] ?? "/placeholder-product.svg"}
                            alt={product.name}
                            objectFit="cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {product.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {formatPrice(product.price)}
                          </span>
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => void toggleFavorite(product)}
                        aria-label={`Remover ${product.name} dos favoritos`}
                        className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="h-px bg-line" />
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="block rounded px-3 py-2 text-center text-sm font-medium text-action transition-colors hover:bg-action-soft"
              >
                Ver todos os favoritos
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

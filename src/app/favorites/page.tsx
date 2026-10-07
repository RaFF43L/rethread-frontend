"use client";

import { useFavorites } from "@/features/products/context/FavoritesProvider";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";
import { ProductCard } from "@/features/products/components/ProductCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { status: sessionStatus, startLogin } = useUserSession();
  const { favorites, status } = useFavorites();

  const isLoading =
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" && status !== "ready");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-line shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar
            </Link>
            <div className="h-4 w-px bg-line" />
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 fill-action stroke-action" />
              Meus Favoritos
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessionStatus !== "authenticated" ? (
          <EmptyState
            icon={
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
            }
            title="Entre para ver seus favoritos"
            description="Faça login para salvar suas peças favoritas e acessá-las de qualquer dispositivo."
            action={
              <Button variant="default" onClick={() => void startLogin()}>
                Entrar
              </Button>
            }
          />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
            }
            title="Nenhum favorito ainda"
            description="Explore o catálogo e adicione suas peças favoritas clicando no ícone de coração"
            action={
              <Link href="/">
                <Button variant="default">Explorar catálogo</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-muted-foreground">
                {favorites.length}{" "}
                {favorites.length === 1 ? "peça favoritada" : "peças favoritadas"}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

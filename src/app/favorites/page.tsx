"use client";

import { useState, useEffect } from "react";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { productsService } from "@/features/products/services/products.service";
import { ProductCard } from "@/features/products/components/ProductCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { QuickViewModal } from "@/shared/components/QuickViewModal";
import { Button } from "@/shared/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/shared/types";

export default function FavoritesPage() {
  const { favorites, isLoaded, clearFavorites } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadFavoriteProducts() {
      if (!isLoaded || favorites.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Load all favorite products
        const productPromises = favorites.map((id) =>
          productsService.getProductById(id).catch(() => null)
        );
        const loadedProducts = await Promise.all(productPromises);
        setProducts(loadedProducts.filter((p): p is Product => p !== null));
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFavoriteProducts();
  }, [favorites, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 fill-coral stroke-coral" />
              Meus Favoritos
            </h1>
          </div>
          
          {products.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Deseja limpar todos os favoritos?")) {
                  clearFavorites();
                }
              }}
            >
              Limpar tudo
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
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
                {products.length} {products.length === 1 ? "peça" : "peças"} favoritadas
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

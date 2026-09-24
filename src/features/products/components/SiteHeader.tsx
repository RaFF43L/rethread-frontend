"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Shield, Heart } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

const CATEGORY_LABELS: Record<string, string> = {
  calca: "Calças",
  blusa: "Blusas",
  camiseta: "Camisetas",
  short: "Shorts",
  vestido: "Vestidos",
  saia: "Saias",
  jaqueta: "Jaquetas",
  macacao: "Macacões",
};

const SIZES = ["PP", "P", "M", "G", "GG", "XG"];

interface SiteHeaderProps {
  categories: { category: string; count: number }[];
  selectedCategory?: string;
  selectedSize?: string;
}

export function SiteHeader({
  categories,
  selectedCategory,
  selectedSize,
}: SiteHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set("q", term.trim());
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      startTransition(() => router.push(`/?${params.toString()}`));
    },
    [searchParams, startTransition, router],
  );

  useEffect(() => {
    if (!searchOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushSearch(searchTerm), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, searchOpen, pushSearch]);

  const closeSearch = () => {
    setSearchOpen(false);
    if (searchTerm) {
      setSearchTerm("");
      pushSearch("");
    }
  };

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.set("page", "1");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <header className="w-full bg-background border-b border-neutral-300">
      <div className="px-6 md:px-14">
        {/* Top row: logo central com ações nas laterais */}
        <div className="flex items-center justify-between py-5 border-b border-neutral-200">
          {/* Esquerda: Theme Toggle */}
          <div className="flex items-center gap-4 w-32">
            <ThemeToggle />
          </div>

          {/* Centro: Logo */}
          <Link href="/" className="flex-1 flex items-center justify-center gap-3">
            <Image
              src="/logo-segunda-aura.png"
              alt="Segunda Aura Logo"
              width={50}
              height={50}
              className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]"
            />
            <div className="flex flex-col">
              <h1 className="font-serif text-[24px] md:text-[28px] font-bold tracking-[0.08em] text-neutral-950 dark:text-neutral-50 uppercase italic leading-none">
                Segunda Aura
              </h1>
              <p className="text-[8px] md:text-[9px] font-medium tracking-[0.26em] uppercase text-neutral-600 dark:text-neutral-400 mt-0.5">
                Brechó de Estilo
              </p>
            </div>
          </Link>

          {/* Direita: Ícones de ação */}
          <div className="flex items-center gap-4 md:gap-5 w-32 justify-end">
            <button
              type="button"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              className="text-neutral-700 hover:text-neutral-950 transition-colors"
              aria-label="Buscar"
            >
              {searchOpen ? (
                <X className="w-[15px] h-[15px]" />
              ) : (
                <Search className="w-[15px] h-[15px]" />
              )}
            </button>
            <Link
              href="/favorites"
              className="text-neutral-700 hover:text-neutral-950 transition-colors hidden md:block"
              aria-label="Favoritos"
            >
              <Heart className="w-[15px] h-[15px]" />
            </Link>
            <Link
              href="/login"
              className="text-neutral-700 hover:text-neutral-950 transition-colors"
              aria-label="Admin"
            >
              <Shield className="w-[15px] h-[15px]" />
            </Link>
          </div>
        </div>

        {/* Navigation row: Categorias */}
        <nav className="flex items-center justify-center gap-6 md:gap-8 py-3.5 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => updateParam("categoria", null)}
            className={cn(
              "text-[11px] font-medium tracking-[0.14em] uppercase whitespace-nowrap transition-colors",
              !selectedCategory
                ? "text-neutral-950"
                : "text-neutral-800 hover:text-neutral-950"
            )}
          >
            Todas
          </button>
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() =>
                updateParam(
                  "categoria",
                  selectedCategory === cat.category ? null : cat.category
                )
              }
              className={cn(
                "text-[11px] font-medium tracking-[0.14em] uppercase whitespace-nowrap transition-colors",
                selectedCategory === cat.category
                  ? "text-neutral-950"
                  : "text-neutral-800 hover:text-neutral-950"
              )}
            >
              {CATEGORY_LABELS[cat.category] || cat.category}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Bar Expansível */}
      {searchOpen && (
        <div className="border-t border-neutral-200 bg-neutral-50">
          <div className="px-6 md:px-14 py-4">
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por marca, cor ou estilo..."
                autoFocus
                className="w-full pl-12 pr-12 h-12 text-base border-2 border-neutral-300 bg-white text-neutral-950 placeholder:text-neutral-600 outline-none focus:border-coral transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-950"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Tamanhos abaixo da busca */}
            <div className="max-w-2xl mx-auto mt-4 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[10px] tracking-[0.14em] uppercase text-neutral-600 mr-2">
                Tamanho:
              </span>
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    updateParam("tamanho", selectedSize === size ? null : size)
                  }
                  className={cn(
                    "w-10 h-10 border text-[11px] font-medium transition-all",
                    selectedSize === size
                      ? "border-coral bg-coral text-white"
                      : "border-neutral-300 text-neutral-800 hover:border-coral hover:text-coral"
                  )}
                >
                  {size}
                </button>
              ))}
              {selectedSize && (
                <button
                  type="button"
                  onClick={() => updateParam("tamanho", null)}
                  className="text-[10px] tracking-[0.12em] uppercase text-neutral-600 hover:text-coral transition-colors ml-2 underline underline-offset-2"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

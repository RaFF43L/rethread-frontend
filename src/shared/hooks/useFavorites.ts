import { useState, useEffect } from "react";

const FAVORITES_KEY = "segunda_aura_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem(FAVORITES_KEY);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    isLoaded,
    count: favorites.length,
  };
}

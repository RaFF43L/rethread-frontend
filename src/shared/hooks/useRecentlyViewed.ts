import { useState, useEffect } from "react";
import type { Product } from "@/shared/types";

const RECENTLY_VIEWED_KEY = "segunda_aura_recently_viewed";
const MAX_ITEMS = 12;

interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  timestamp: number;
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recently viewed:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const addRecentlyViewed = (product: Pick<Product, "id" | "name" | "price" | "images">) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);
      const newItem: RecentlyViewedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
        timestamp: Date.now(),
      };
      
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  };

  return {
    recentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,
    isLoaded,
    count: recentlyViewed.length,
  };
}

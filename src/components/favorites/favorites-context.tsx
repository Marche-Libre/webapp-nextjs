"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Favorite = {
  id: string;       // unique key, e.g. "post:abc123" or "member:xyz"
  label: string;    // display name
  href: string;     // route
  type: "post" | "category" | "member" | "page";
};

type FavoritesContextValue = {
  favorites: Favorite[];
  add: (fav: Favorite) => void;
  remove: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggle: (fav: Favorite) => void;
};

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  add: () => {},
  remove: () => {},
  isFavorite: () => false,
  toggle: () => {},
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

const STORAGE_KEY = "ml-favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  // Persist on change
  const persist = (next: Favorite[]) => {
    setFavorites(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const add = useCallback((fav: Favorite) => {
    setFavorites((prev) => {
      if (prev.find((f) => f.id === fav.id)) return prev;
      const next = [...prev, fav];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.some((f) => f.id === id);
  }, [favorites]);

  const toggle = useCallback((fav: Favorite) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === fav.id);
      const next = exists ? prev.filter((f) => f.id !== fav.id) : [...prev, fav];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, add, remove, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

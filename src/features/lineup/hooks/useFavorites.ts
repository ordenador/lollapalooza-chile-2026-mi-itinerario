'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FAVORITES_STORAGE_KEY } from '@/lib/constants';
import { readNumberArrayFromStorage, writeNumberArrayToStorage } from '@/lib/storage';

type UseFavoritesResult = {
  favorites: number[];
  favoritesSet: Set<number>;
  toggleFavorite: (artistId: number) => void;
  isFavorite: (artistId: number) => boolean;
};

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<number[]>(() =>
    readNumberArrayFromStorage(FAVORITES_STORAGE_KEY),
  );

  useEffect(() => {
    writeNumberArrayToStorage(FAVORITES_STORAGE_KEY, favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((artistId: number) => {
    setFavorites((previous) => {
      if (previous.includes(artistId)) {
        return previous.filter((id) => id !== artistId);
      }

      return [...previous, artistId];
    });
  }, []);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback(
    (artistId: number) => favoritesSet.has(artistId),
    [favoritesSet],
  );

  return { favorites, favoritesSet, toggleFavorite, isFavorite };
}

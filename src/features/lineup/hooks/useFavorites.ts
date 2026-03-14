'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { FAVORITES_STORAGE_KEY } from '@/lib/constants';
import { readNumberArrayFromStorage, writeNumberArrayToStorage } from '@/lib/storage';

type UseFavoritesResult = {
  favorites: number[];
  favoritesSet: Set<number>;
  toggleFavorite: (artistId: number) => void;
  isFavorite: (artistId: number) => boolean;
};

const FAVORITES_CHANGED_EVENT = 'favorites-changed';
const EMPTY_FAVORITES: number[] = [];
let cachedSerializedFavorites = '[]';
let cachedFavoritesSnapshot: number[] = [];

function getFavoritesSnapshot() {
  const nextSnapshot = readNumberArrayFromStorage(FAVORITES_STORAGE_KEY);
  const serializedSnapshot = JSON.stringify(nextSnapshot);

  if (serializedSnapshot !== cachedSerializedFavorites) {
    cachedSerializedFavorites = serializedSnapshot;
    cachedFavoritesSnapshot = nextSnapshot;
  }

  return cachedFavoritesSnapshot;
}

function getFavoritesServerSnapshot() {
  return EMPTY_FAVORITES;
}

function subscribeToFavorites(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleChange = () => {
    onStoreChange();
  };

  window.addEventListener('storage', handleChange);
  window.addEventListener(FAVORITES_CHANGED_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(FAVORITES_CHANGED_EVENT, handleChange);
  };
}

function notifyFavoritesChanged() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
}

export function useFavorites(): UseFavoritesResult {
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot,
  );

  const toggleFavorite = useCallback((artistId: number) => {
    const previous = getFavoritesSnapshot();
    const next = previous.includes(artistId)
      ? previous.filter((id) => id !== artistId)
      : [...previous, artistId];

    writeNumberArrayToStorage(FAVORITES_STORAGE_KEY, next);
    notifyFavoritesChanged();
  }, []);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback(
    (artistId: number) => favoritesSet.has(artistId),
    [favoritesSet],
  );

  return { favorites, favoritesSet, toggleFavorite, isFavorite };
}

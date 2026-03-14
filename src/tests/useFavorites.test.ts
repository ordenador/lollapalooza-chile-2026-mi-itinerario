import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useFavorites } from '@/features/lineup/hooks/useFavorites';
import { FAVORITES_STORAGE_KEY } from '@/lib/constants';

describe('useFavorites', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('toggles favorites and persists them', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(7);
    });

    expect(result.current.favorites).toContain(7);
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('[7]');

    act(() => {
      result.current.toggleFavorite(7);
    });

    expect(result.current.favorites).not.toContain(7);
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('[]');
  });

  it('rehydrates from localStorage on mount', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([2, 9]));

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([2, 9]);
  });
});

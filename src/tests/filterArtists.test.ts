import { describe, expect, it } from 'vitest';
import { ARTISTS_DATA } from '@/features/lineup/data/artists';
import { filterArtists } from '@/features/lineup/utils/filterArtists';

describe('filterArtists', () => {
  it('filters by search term and stage', () => {
    const result = filterArtists({
      artists: ARTISTS_DATA,
      searchTerm: 'lorde',
      selectedStage: 'Banco de Chile Stage',
      view: 'all',
      favorites: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Lorde');
  });

  it('returns only favorites in mine view', () => {
    const result = filterArtists({
      artists: ARTISTS_DATA,
      searchTerm: '',
      selectedStage: 'Todos',
      view: 'mine',
      favorites: [3, 10],
    });

    expect(result.map((artist) => artist.id)).toEqual([3, 10]);
  });

  it('sorts by start time ascending', () => {
    const result = filterArtists({
      artists: ARTISTS_DATA,
      searchTerm: '',
      selectedStage: 'Todos',
      view: 'all',
      favorites: [],
    });

    expect(result[0]?.start).toBe('14:00');
    expect(result[result.length - 1]?.start).toBe('23:30');
  });
});

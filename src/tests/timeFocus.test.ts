import { describe, expect, it } from 'vitest';
import type { Artist } from '@/features/lineup/types';
import { getLineupFocus } from '@/features/lineup/utils/timeFocus';

const ARTISTS: Artist[] = [
  {
    id: 1,
    name: 'Primera Banda',
    start: '14:00',
    end: '15:00',
    stage: 'Lotus Stage',
    genre: 'Rock',
  },
  {
    id: 2,
    name: 'Segunda Banda',
    start: '15:30',
    end: '16:30',
    stage: 'Lotus Stage',
    genre: 'Pop',
  },
  {
    id: 3,
    name: 'Cierre Nocturno',
    start: '23:30',
    end: '00:30',
    stage: 'Lotus Stage',
    genre: 'Electrónica',
  },
];

describe('getLineupFocus', () => {
  it('marks live artists and anchors on the first live one', () => {
    const result = getLineupFocus(ARTISTS, 14 * 60 + 20);

    expect(result.liveArtistIds).toEqual([1]);
    expect(result.anchorArtistId).toBe(1);
  });

  it('anchors to the next artist when there is no live show yet', () => {
    const result = getLineupFocus(ARTISTS, 15 * 60 + 10);

    expect(result.liveArtistIds).toEqual([]);
    expect(result.anchorArtistId).toBe(2);
  });

  it('keeps overnight artists live after midnight', () => {
    const result = getLineupFocus(ARTISTS, 24 * 60 + 10);

    expect(result.liveArtistIds).toEqual([3]);
    expect(result.anchorArtistId).toBe(3);
  });

  it('anchors to the last artist after the lineup ends', () => {
    const result = getLineupFocus(ARTISTS, 24 * 60 + 45);

    expect(result.liveArtistIds).toEqual([]);
    expect(result.anchorArtistId).toBe(3);
  });
});

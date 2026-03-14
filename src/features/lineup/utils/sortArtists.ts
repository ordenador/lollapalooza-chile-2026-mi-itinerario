import type { Artist } from '@/features/lineup/types';

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function sortArtistsByStart(artists: readonly Artist[]): Artist[] {
  return [...artists].sort((a, b) => {
    const timeDiff = timeToMinutes(a.start) - timeToMinutes(b.start);
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return a.name.localeCompare(b.name, 'es');
  });
}

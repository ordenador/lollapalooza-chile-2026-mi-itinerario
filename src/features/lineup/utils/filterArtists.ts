import type { Artist, Stage, ViewMode } from '@/features/lineup/types';
import { sortArtistsByStart } from '@/features/lineup/utils/sortArtists';

type FilterArtistsInput = {
  artists: readonly Artist[];
  searchTerm: string;
  selectedStage: Stage;
  view: ViewMode;
  favorites: readonly number[];
};

export function filterArtists({
  artists,
  searchTerm,
  selectedStage,
  view,
  favorites,
}: FilterArtistsInput): Artist[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const scopedByView =
    view === 'mine' ? artists.filter((artist) => favorites.includes(artist.id)) : artists;

  const filtered = scopedByView.filter((artist) => {
    const matchesSearch = artist.name.toLowerCase().includes(normalizedSearch);
    const matchesStage = selectedStage === 'Todos' || artist.stage === selectedStage;

    return matchesSearch && matchesStage;
  });

  return sortArtistsByStart(filtered);
}

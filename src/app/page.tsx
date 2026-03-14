'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { ArtistCard } from '@/components/lineup/ArtistCard';
import { ArtistPreviewModal } from '@/components/lineup/ArtistPreviewModal';
import { EmptyState } from '@/components/lineup/EmptyState';
import { FloatingStatsNav } from '@/components/lineup/FloatingStatsNav';
import { LineupHeader } from '@/components/lineup/LineupHeader';
import { StageFilters } from '@/components/lineup/StageFilters';
import {
  ARTISTS_DATA,
  LINEUP_DATE,
  LINEUP_TIME_ZONE,
  STAGES,
} from '@/features/lineup/data/artists';
import {
  ARTIST_PREVIEWS,
  PREVIEW_FALLBACK,
} from '@/features/lineup/data/artist-previews';
import { useFavorites } from '@/features/lineup/hooks/useFavorites';
import { filterArtists } from '@/features/lineup/utils/filterArtists';
import {
  getLineupFocus,
  getTimelineMinuteFromNow,
} from '@/features/lineup/utils/timeFocus';
import type { Artist, Stage, ViewMode } from '@/features/lineup/types';

export default function Page() {
  const { favorites, favoritesSet, isFavorite, toggleFavorite } = useFavorites();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<Stage>('Todos');
  const [view, setView] = useState<ViewMode>('all');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [now, setNow] = useState(() => new Date());
  const hasAutoScrolled = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const filteredArtists = useMemo(
    () =>
      filterArtists({
        artists: ARTISTS_DATA,
        searchTerm,
        selectedStage,
        view,
        favorites,
      }),
    [searchTerm, selectedStage, view, favorites],
  );

  const timelineMinute = useMemo(
    () =>
      getTimelineMinuteFromNow({
        festivalDate: LINEUP_DATE,
        now,
        timeZone: LINEUP_TIME_ZONE,
      }),
    [now],
  );

  const lineupFocus = useMemo(
    () => getLineupFocus(filteredArtists, timelineMinute),
    [filteredArtists, timelineMinute],
  );

  useEffect(() => {
    if (hasAutoScrolled.current || lineupFocus.anchorArtistId === null) {
      return;
    }

    const element = document.querySelector<HTMLElement>(
      `[data-artist-id="${lineupFocus.anchorArtistId}"]`,
    );
    if (!element) {
      return;
    }

    if (typeof element.scrollIntoView !== 'function') {
      return;
    }

    element.scrollIntoView({ block: 'center' });
    hasAutoScrolled.current = true;
  }, [lineupFocus.anchorArtistId]);

  const selectedPreview = selectedArtist
    ? (ARTIST_PREVIEWS[selectedArtist.id] ?? PREVIEW_FALLBACK)
    : null;

  const toggleView = () => {
    setView((previous) => (previous === 'all' ? 'mine' : 'all'));
  };

  return (
    <div className="min-h-screen bg-black pb-28 text-zinc-100">
      <LineupHeader
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        view={view}
        onToggleView={toggleView}
        favoritesCount={favorites.length}
      />

      {view === 'all' ? (
        <StageFilters
          stages={STAGES}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStage}
        />
      ) : null}

      <main className="mx-auto max-w-4xl p-4">
        <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
          <Info className="h-3 w-3" />
          <span>Toca una banda para ver su preview</span>
        </div>

        {filteredArtists.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                artistImageUrl={ARTIST_PREVIEWS[artist.id]?.artistImageUrl ?? null}
                isFavorite={favoritesSet.has(artist.id)}
                isLiveNow={lineupFocus.liveArtistIds.includes(artist.id)}
                onToggleFavorite={toggleFavorite}
                onOpenPreview={setSelectedArtist}
              />
            ))}
          </div>
        )}
      </main>

      <ArtistPreviewModal
        artist={selectedArtist}
        preview={selectedPreview}
        isFavorite={selectedArtist ? isFavorite(selectedArtist.id) : false}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedArtist(null)}
      />

      <FloatingStatsNav
        totalEvents={ARTISTS_DATA.length}
        favoritesCount={favorites.length}
        view={view}
        onToggleView={toggleView}
      />
    </div>
  );
}

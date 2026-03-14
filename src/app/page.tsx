'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Github, Info } from 'lucide-react';
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

const GITHUB_REPOSITORY_URL =
  'https://github.com/ordenador/lollapalooza-chile-2026-mi-itinerario';
const AUTHOR_PROFILE_URL = 'https://ordenador.cl/';
const AUTHOR_AVATAR_URL = 'https://avatars.githubusercontent.com/u/2941875';

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

      <footer className="mx-auto mt-4 w-full max-w-4xl px-4 pb-32">
        <div className="surface-main border-subtle flex flex-wrap items-center justify-between gap-3 border px-3 py-2 text-sm text-zinc-300">
          <a
            href={AUTHOR_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 transition-colors hover:text-white"
          >
            <Image
              src={AUTHOR_AVATAR_URL}
              alt="Avatar de ordenador"
              width={32}
              height={32}
              className="rounded-full border border-zinc-700 object-cover"
            />
            <span>Autor: ordenador.cl</span>
          </a>

          <a
            href={GITHUB_REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border-b border-zinc-600 pb-0.5 transition-colors hover:border-zinc-300 hover:text-white"
          >
            <Github className="h-4 w-4" />
            <span>Ver en GitHub</span>
          </a>
        </div>
      </footer>

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

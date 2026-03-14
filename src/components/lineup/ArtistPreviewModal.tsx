import { ExternalLink, Music, Pause, Play, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Artist, ArtistPreview } from '@/features/lineup/types';

type ArtistPreviewModalProps = {
  artist: Artist | null;
  preview: ArtistPreview | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (artistId: number) => void;
};

export function ArtistPreviewModal({
  artist,
  preview,
  isFavorite,
  onClose,
  onToggleFavorite,
}: ArtistPreviewModalProps) {
  const audioContainerRef = useRef<HTMLDivElement | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const artistImageUrl = preview?.artistImageUrl ?? null;
  const playableSongs =
    preview?.songs.filter((song): song is typeof song & { previewUrl: string } =>
      Boolean(song.previewUrl),
    ) ?? [];
  const linkClassName =
    'inline-flex min-h-9 items-center justify-center border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-cyan-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60';

  const handleAudioPlay = useCallback((currentAudio: HTMLAudioElement) => {
    const audioElements = audioContainerRef.current?.querySelectorAll('audio');

    if (!audioElements) {
      return;
    }

    audioElements.forEach((audioElement) => {
      if (audioElement !== currentAudio) {
        audioElement.pause();
      }
    });
  }, []);

  const toggleSongPlayback = useCallback((songId: string) => {
    const audioElement = audioRefs.current[songId];

    if (!audioElement) {
      return;
    }

    if (audioElement.paused) {
      const playPromise = audioElement.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Ignore autoplay/browser playback restrictions.
        });
      }
      return;
    }

    audioElement.pause();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!artist || !preview) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-3 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`artist-preview-title-${artist.id}`}
    >
      <div className="modal-enter surface-main border-subtle relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-lg flex-col overflow-hidden border shadow-2xl">
        {artistImageUrl ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              aria-hidden="true"
            >
              <Image
                src={artistImageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 32rem"
                className="object-cover"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/90 to-black"
              aria-hidden="true"
            />
          </>
        ) : null}

        <header className="relative z-10 border-b border-zinc-800 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <button
            onClick={onClose}
            className="surface-muted border-subtle text-muted absolute top-4 right-4 border p-2 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none sm:top-6 sm:right-6"
            aria-label="Cerrar preview"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 pr-12">
            <div className="h-16 w-16 shrink-0 overflow-hidden border border-cyan-400/40 bg-zinc-900">
              {artistImageUrl ? (
                <Image
                  src={artistImageUrl}
                  alt={`Foto de ${artist.name}`}
                  width={64}
                  height={64}
                  sizes="64px"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-cyan-400/10">
                  <Music className="h-6 w-6 text-cyan-300" />
                </div>
              )}
            </div>
            <div>
              <h2
                id={`artist-preview-title-${artist.id}`}
                className="font-display text-2xl leading-none text-white"
              >
                {artist.name}
              </h2>
              <p className="text-muted mt-1 text-xs">{artist.stage}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-400">
            {playableSongs.length > 0
              ? 'Si inicias otra canción, la anterior se pausa automáticamente.'
              : 'No encontramos preview de 30 segundos para este artista.'}
          </p>
        </header>

        <div
          className="relative z-10 space-y-5 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
          ref={audioContainerRef}
        >
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Play className="h-3 w-3 fill-current" />
              <span>
                {playableSongs.length > 0
                  ? 'Canciones recomendadas'
                  : 'Preview no disponible'}
              </span>
            </div>

            {playableSongs.length === 0 ? (
              <div className="surface-muted border-subtle border p-4">
                <p className="text-sm text-zinc-100">
                  Usa los links de abajo para escuchar al artista en Spotify, YouTube o
                  Apple Music.
                </p>
              </div>
            ) : (
              <ol className="space-y-3">
                {playableSongs.map((song, index) => {
                  const songId = `${index}-${song.title}`;
                  const isPlaying = playingSongId === songId;

                  return (
                    <li
                      key={`${song.title}-${index}`}
                      className="surface-muted border-subtle border px-3 py-3 sm:px-4"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-display text-cyan-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-100">
                          {song.title}
                        </h3>
                      </div>

                      {song.previewUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              toggleSongPlayback(songId);
                            }}
                            className={`mb-2 inline-flex min-h-10 w-full items-center justify-center gap-2 border px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none ${
                              isPlaying
                                ? 'surface-raised border-cyan-400 text-cyan-300'
                                : 'surface-main border-zinc-700 text-zinc-100 hover:border-cyan-400/70'
                            }`}
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Play className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>
                              {isPlaying ? 'Pausar preview' : 'Reproducir preview (30s)'}
                            </span>
                          </button>

                          <audio
                            preload="none"
                            className="hidden"
                            src={song.previewUrl}
                            ref={(element) => {
                              audioRefs.current[songId] = element;
                            }}
                            onPlay={(event) => {
                              handleAudioPlay(event.currentTarget);
                              setPlayingSongId(songId);
                            }}
                            onPause={() => {
                              setPlayingSongId((current) =>
                                current === songId ? null : current,
                              );
                            }}
                            onEnded={() => {
                              setPlayingSongId((current) =>
                                current === songId ? null : current,
                              );
                            }}
                          >
                            Tu navegador no soporta audio HTML5.
                          </audio>
                        </>
                      ) : (
                        <p className="mb-1 text-xs text-zinc-400">
                          Sin preview de 30 segundos disponible para esta canción.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="surface-muted border-subtle border p-4">
            <p className="mb-3 text-xs font-semibold text-cyan-300">Escuchar artista</p>
            <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:flex-wrap">
              <a
                href={preview.artistLinks.youtube}
                target="_blank"
                rel="noreferrer noopener"
                className={linkClassName}
              >
                <span className="inline-flex items-center gap-1">
                  YouTube artista
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </span>
              </a>
              <a
                href={preview.artistLinks.spotify}
                target="_blank"
                rel="noreferrer noopener"
                className={linkClassName}
              >
                <span className="inline-flex items-center gap-1">
                  Spotify artista
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </span>
              </a>
              {preview.artistLinks.appleMusic ? (
                <a
                  href={preview.artistLinks.appleMusic}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={linkClassName}
                >
                  <span className="inline-flex items-center gap-1">
                    Apple Music artista
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </span>
                </a>
              ) : null}
            </div>
          </section>

          <section className="border border-cyan-400/30 bg-cyan-400/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3 w-3" />
              <span>Vibe en vivo</span>
            </div>

            <p className="mb-3 text-sm leading-relaxed text-zinc-100">
              {preview.styleDescription}
            </p>

            <div className="border-t border-cyan-300/20 pt-3">
              <p className="text-xs text-cyan-100/90">
                <strong>Veredicto:</strong> {preview.verdict}
              </p>
            </div>
          </section>
        </div>

        <footer className="relative z-10 border-t border-zinc-800 p-5 sm:px-6 sm:pt-5 sm:pb-6">
          <button
            onClick={() => {
              onToggleFavorite(artist.id);
              onClose();
            }}
            className={`w-full border px-4 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:outline-none ${
              isFavorite
                ? 'surface-muted border-subtle text-zinc-300 hover:bg-zinc-800'
                : 'button-cyan border-cyan-400 hover:bg-cyan-300'
            }`}
          >
            {isFavorite ? 'Eliminar de mi itinerario' : 'Agregar a mi itinerario'}
          </button>
        </footer>
      </div>
    </div>
  );
}

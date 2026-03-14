import { Clock, Heart, MapPin, Music } from 'lucide-react';
import Image from 'next/image';
import type { Artist } from '@/features/lineup/types';

type ArtistCardProps = {
  artist: Artist;
  artistImageUrl?: string | null;
  isFavorite: boolean;
  isLiveNow: boolean;
  onOpenPreview: (artist: Artist) => void;
  onToggleFavorite: (artistId: number) => void;
};

export function ArtistCard({
  artist,
  artistImageUrl = null,
  isFavorite,
  isLiveNow,
  onOpenPreview,
  onToggleFavorite,
}: ArtistCardProps) {
  return (
    <div
      onClick={() => onOpenPreview(artist)}
      className={`surface-main group flex cursor-pointer items-center justify-between gap-3 border p-4 transition-colors ${
        isLiveNow
          ? 'border-lime-300 hover:border-lime-300'
          : 'border-subtle hover:border-cyan-400/60'
      }`}
      data-testid={`artist-card-${artist.id}`}
      data-artist-id={artist.id}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
        <div className="h-16 w-16 shrink-0 overflow-hidden border border-cyan-400/30 bg-zinc-900">
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
              <Music className="h-5 w-5 text-cyan-300" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-cyan-400">
            <Clock className="h-3 w-3" />
            <span>
              {artist.start} - {artist.end}
            </span>
            {isLiveNow ? (
              <span className="button-lime px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                Ahora
              </span>
            ) : null}
          </div>

          <h3 className="font-display text-xl leading-tight text-white transition-colors group-hover:text-cyan-400">
            {artist.name}
          </h3>

          <div className="mt-1 flex flex-wrap gap-2">
            <span className="text-muted flex items-center gap-1 text-xs">
              <MapPin className="h-2.5 w-2.5" />
              {artist.stage}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(artist.id);
        }}
        className={`border p-3 transition-colors ${
          isFavorite
            ? 'button-cyan border-cyan-400'
            : 'surface-muted border-subtle text-zinc-400 hover:bg-zinc-800'
        }`}
        aria-label={
          isFavorite
            ? `Quitar ${artist.name} de favoritos`
            : `Agregar ${artist.name} a favoritos`
        }
      >
        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}

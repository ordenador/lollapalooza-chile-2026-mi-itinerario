import { Clock, Heart, MapPin } from 'lucide-react';
import type { Artist } from '@/features/lineup/types';

type ArtistCardProps = {
  artist: Artist;
  isFavorite: boolean;
  isLiveNow: boolean;
  onOpenPreview: (artist: Artist) => void;
  onToggleFavorite: (artistId: number) => void;
};

export function ArtistCard({
  artist,
  isFavorite,
  isLiveNow,
  onOpenPreview,
  onToggleFavorite,
}: ArtistCardProps) {
  return (
    <div
      onClick={() => onOpenPreview(artist)}
      className={`surface-main group flex cursor-pointer items-center justify-between border p-4 transition-colors ${
        isLiveNow
          ? 'border-lime-300 hover:border-lime-300'
          : 'border-subtle hover:border-cyan-400/60'
      }`}
      data-testid={`artist-card-${artist.id}`}
      data-artist-id={artist.id}
    >
      <div className="flex flex-col gap-1 pr-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
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

      <div className="flex items-center gap-3">
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
    </div>
  );
}

import { Clock, Heart, MapPin } from 'lucide-react';
import type { Artist } from '@/features/lineup/types';

type ArtistCardProps = {
  artist: Artist;
  isFavorite: boolean;
  onOpenPreview: (artist: Artist) => void;
  onToggleFavorite: (artistId: number) => void;
};

export function ArtistCard({
  artist,
  isFavorite,
  onOpenPreview,
  onToggleFavorite,
}: ArtistCardProps) {
  return (
    <div
      onClick={() => onOpenPreview(artist)}
      className="group flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-500 active:scale-[0.98]"
      data-testid={`artist-card-${artist.id}`}
    >
      <div className="flex flex-col gap-1 pr-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
          <Clock className="h-3 w-3" />
          <span>
            {artist.start} - {artist.end}
          </span>
        </div>

        <h3 className="text-lg font-black uppercase italic leading-tight tracking-tight transition-colors group-hover:text-cyan-400">
          {artist.name}
        </h3>

        <div className="mt-1 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
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
          className={`rounded-full p-3 transition-all ${
            isFavorite
              ? 'bg-cyan-500 text-black'
              : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
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

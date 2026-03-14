import { Music, Play, Sparkles, X } from 'lucide-react';
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
  if (!artist || !preview) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="modal-enter w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-zinc-800 p-2 text-zinc-400 hover:text-white"
            aria-label="Cerrar preview"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-3">
              <Music className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic leading-none">
                {artist.name}
              </h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
                {artist.stage}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                <Play className="h-3 w-3 fill-current" />
                <span>Escucha esto para conocerlos</span>
              </div>

              <div className="space-y-2">
                {preview.songs.map((song, index) => (
                  <div
                    key={`${song}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/50 p-3 transition-colors hover:bg-zinc-800"
                  >
                    <span className="font-black italic text-cyan-500">{index + 1}</span>
                    <span className="text-sm font-bold text-zinc-200">{song}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                <Sparkles className="h-3 w-3" />
                <span>El Vibe del Show</span>
              </div>

              <p className="mb-3 text-sm leading-relaxed text-zinc-300">
                {preview.styleDescription}
              </p>

              <div className="border-t border-cyan-500/10 pt-3">
                <p className="text-xs italic text-cyan-400/80">
                  <strong>Veredicto:</strong> {preview.verdict}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onToggleFavorite(artist.id);
                onClose();
              }}
              className={`w-full rounded-2xl py-4 font-black uppercase tracking-widest transition-all ${
                isFavorite
                  ? 'bg-zinc-800 text-zinc-400'
                  : 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-400'
              }`}
            >
              {isFavorite ? 'Eliminar de mi Itinerario' : '¡Lo quiero ver!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 sm:items-center">
      <div className="modal-enter surface-main border-subtle w-full max-w-md overflow-hidden border shadow-2xl">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="surface-muted border-subtle text-muted absolute right-4 top-4 border p-2 hover:text-white"
            aria-label="Cerrar preview"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="border border-cyan-400/40 bg-cyan-400/10 p-3">
              <Music className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="font-display text-2xl leading-none text-white">
                {artist.name}
              </h2>
              <p className="text-muted mt-1 text-xs">{artist.stage}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Play className="h-3 w-3 fill-current" />
                <span>Canciones recomendadas</span>
              </div>

              <div className="space-y-2">
                {preview.songs.map((song, index) => (
                  <div
                    key={`${song}-${index}`}
                    className="surface-muted border-subtle flex items-center gap-3 border p-3 transition-colors hover:bg-zinc-800"
                  >
                    <span className="font-display text-cyan-400">{index + 1}</span>
                    <span className="text-sm text-zinc-100">{song}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-cyan-400/30 bg-cyan-400/10 p-4">
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
            </div>

            <button
              onClick={() => {
                onToggleFavorite(artist.id);
                onClose();
              }}
              className={`w-full border px-4 py-3 text-sm font-semibold transition-colors ${
                isFavorite
                  ? 'surface-muted border-subtle text-zinc-300'
                  : 'button-cyan border-cyan-400 hover:bg-cyan-300'
              }`}
            >
              {isFavorite ? 'Eliminar de mi itinerario' : 'Agregar a mi itinerario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Heart, Search } from 'lucide-react';
import type { ViewMode } from '@/features/lineup/types';

type LineupHeaderProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  view: ViewMode;
  onToggleView: () => void;
  favoritesCount: number;
};

export function LineupHeader({
  searchTerm,
  onSearchTermChange,
  view,
  onToggleView,
  favoritesCount,
}: LineupHeaderProps) {
  return (
    <header className="border-subtle surface-main sticky top-0 z-50 border-b px-4 py-3">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-xl text-white">
            LOLLAPALOOZA <span className="text-cyan-400">CHILE 2026</span>
          </h1>
          <div className="button-pink px-3 py-1 text-xs font-semibold uppercase">
            Sábado 14 Mar
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar banda..."
              className="surface-muted border-subtle w-full border py-2 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-cyan-400"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              aria-label="Buscar banda"
            />
          </div>

          <button
            onClick={onToggleView}
            className={`flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors ${
              view === 'mine'
                ? 'button-cyan border-cyan-400'
                : 'surface-muted border-subtle text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Heart className={`h-4 w-4 ${view === 'mine' ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">
              {view === 'mine' ? 'Ver Todo' : 'Mis Bandas'}
            </span>
            {favoritesCount > 0 ? (
              <span className="ml-1 bg-black/20 px-1.5 text-xs">{favoritesCount}</span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}

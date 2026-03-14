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
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900 p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black tracking-tighter text-cyan-400">
            LOLLAPALOOZA <span className="text-white">CHILE 2026</span>
          </h1>
          <div className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
            Sábado 14 Mar
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar banda..."
              className="w-full rounded-xl border-none bg-zinc-800 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              aria-label="Buscar banda"
            />
          </div>

          <button
            onClick={onToggleView}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              view === 'mine' ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <Heart className={`h-4 w-4 ${view === 'mine' ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">
              {view === 'mine' ? 'Ver Todo' : 'Mis Bandas'}
            </span>
            {favoritesCount > 0 ? (
              <span className="ml-1 rounded bg-black/20 px-1.5 text-xs">
                {favoritesCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}

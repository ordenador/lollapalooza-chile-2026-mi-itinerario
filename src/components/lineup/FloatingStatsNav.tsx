import type { ViewMode } from '@/features/lineup/types';

type FloatingStatsNavProps = {
  totalEvents: number;
  favoritesCount: number;
  view: ViewMode;
  onToggleView: () => void;
};

export function FloatingStatsNav({
  totalEvents,
  favoritesCount,
  view,
  onToggleView,
}: FloatingStatsNavProps) {
  return (
    <footer className="fixed right-0 bottom-0 left-0 px-4 py-3">
      <div className="surface-main border-subtle mx-auto flex max-w-4xl items-center justify-between gap-4 border px-5 py-3">
        <div className="flex flex-col items-center">
          <span className="font-display text-[10px] text-zinc-400">EVENTOS</span>
          <span className="font-display text-base text-white">{totalEvents}</span>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        <div className="flex flex-col items-center">
          <span className="font-display text-[10px] text-zinc-400">MI RUTA</span>
          <span className="font-display text-base text-cyan-400">{favoritesCount}</span>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        <button
          onClick={onToggleView}
          className={`font-display border px-4 py-2 text-xs transition-colors ${
            view === 'mine'
              ? 'button-pink border-pink-300'
              : 'button-cyan border-cyan-400'
          }`}
        >
          {view === 'mine' ? 'Lineup' : 'Mi Ruta'}
        </button>
      </div>
    </footer>
  );
}

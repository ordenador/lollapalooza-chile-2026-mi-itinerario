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
    <footer className="pointer-events-none fixed bottom-0 left-0 right-0 p-4">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900/90 p-3 px-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-500">
            Eventos
          </span>
          <span className="text-sm font-black italic text-white">{totalEvents}</span>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        <div className="flex flex-col items-center">
          <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-500">
            Mi Itinerario
          </span>
          <span className="text-sm font-black italic text-cyan-400">
            {favoritesCount}
          </span>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        <button
          onClick={onToggleView}
          className={`rounded-2xl px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            view === 'mine' ? 'bg-white text-black' : 'bg-cyan-500 text-black'
          }`}
        >
          {view === 'mine' ? 'Lineup' : 'Mi Ruta'}
        </button>
      </div>
    </footer>
  );
}

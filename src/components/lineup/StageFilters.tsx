import type { Stage } from '@/features/lineup/types';

type StageFiltersProps = {
  stages: readonly Stage[];
  selectedStage: Stage;
  onSelectStage: (stage: Stage) => void;
};

export function StageFilters({
  stages,
  selectedStage,
  onSelectStage,
}: StageFiltersProps) {
  return (
    <div className="no-scrollbar mx-auto max-w-4xl overflow-x-auto px-4 pb-1">
      <div className="flex gap-2">
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => onSelectStage(stage)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectedStage === stage
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>
    </div>
  );
}

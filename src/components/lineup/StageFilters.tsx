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
    <div className="no-scrollbar border-subtle mx-auto max-w-4xl overflow-x-auto border-b px-4 pb-2">
      <div className="flex gap-2">
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => onSelectStage(stage)}
            className={`font-display border px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
              selectedStage === stage
                ? 'button-lime border-lime-300'
                : 'surface-muted border-subtle text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>
    </div>
  );
}

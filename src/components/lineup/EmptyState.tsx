import { Heart } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-muted flex flex-col items-center justify-center space-y-4 py-20">
      <Heart className="h-12 w-12 opacity-20" />
      <p className="px-8 text-center text-sm">No encontramos bandas con esos filtros.</p>
    </div>
  );
}

export type Stage =
  | 'Todos'
  | 'Cenco Malls Stage'
  | 'Banco de Chile Stage'
  | 'Alternative Stage'
  | 'Perry’s by Cenco Malls'
  | 'Lotus Stage'
  | 'Kidzapalooza Stage';

export type Artist = {
  id: number;
  name: string;
  start: string;
  end: string;
  stage: Exclude<Stage, 'Todos'>;
  genre: string;
};

export type ArtistPreview = {
  songs: [string, string, string];
  styleDescription: string;
  verdict: string;
};

export type ViewMode = 'all' | 'mine';

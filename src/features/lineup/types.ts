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

export type SongListeningLinks = {
  appleMusic: string | null;
  spotify: string;
  youtube: string;
};

export type SongPreview = {
  title: string;
  previewUrl: string | null;
  links: SongListeningLinks;
};

export type ArtistListeningLinks = {
  appleMusic: string | null;
  spotify: string;
  youtube: string;
};

export type ArtistPreview = {
  songs: [SongPreview, SongPreview, SongPreview];
  artistImageUrl?: string | null;
  artistLinks: ArtistListeningLinks;
  styleDescription: string;
  verdict: string;
};

export type ViewMode = 'all' | 'mine';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArtistPreviewModal } from '@/components/lineup/ArtistPreviewModal';
import type { Artist, ArtistPreview } from '@/features/lineup/types';

const artist: Artist = {
  id: 1,
  name: 'Test Artist',
  start: '12:00',
  end: '13:00',
  stage: 'Alternative Stage',
  genre: 'Indie',
};

const preview: ArtistPreview = {
  songs: [
    {
      title: 'Song One',
      previewUrl: 'https://example.com/song-1.m4a',
      links: {
        appleMusic: null,
        spotify: 'https://example.com/spotify-1',
        youtube: 'https://example.com/youtube-1',
      },
    },
    {
      title: 'Song Two',
      previewUrl: 'https://example.com/song-2.m4a',
      links: {
        appleMusic: null,
        spotify: 'https://example.com/spotify-2',
        youtube: 'https://example.com/youtube-2',
      },
    },
    {
      title: 'Song Three',
      previewUrl: 'https://example.com/song-3.m4a',
      links: {
        appleMusic: null,
        spotify: 'https://example.com/spotify-3',
        youtube: 'https://example.com/youtube-3',
      },
    },
  ],
  artistLinks: {
    appleMusic: null,
    spotify: 'https://example.com/artist-spotify',
    youtube: 'https://example.com/artist-youtube',
  },
  styleDescription: 'Testing preview playback handling.',
  verdict: 'Great live show.',
};

describe('ArtistPreviewModal audio behavior', () => {
  it('pauses other previews when a new song starts playing', () => {
    const { container } = render(
      <ArtistPreviewModal
        artist={artist}
        preview={preview}
        isFavorite={false}
        onClose={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    );

    const audioElements = Array.from(
      container.querySelectorAll('audio'),
    ) as HTMLAudioElement[];
    const pauseMocks = audioElements.map(() => vi.fn());

    audioElements.forEach((audioElement, index) => {
      Object.defineProperty(audioElement, 'pause', {
        configurable: true,
        value: pauseMocks[index],
      });
    });

    fireEvent.play(audioElements[1]);

    expect(pauseMocks[0]).toHaveBeenCalledTimes(1);
    expect(pauseMocks[1]).not.toHaveBeenCalled();
    expect(pauseMocks[2]).toHaveBeenCalledTimes(1);
  });

  it('shows fallback message and no play button when no song previews exist', () => {
    const previewWithoutAudio: ArtistPreview = {
      ...preview,
      songs: [
        { ...preview.songs[0], previewUrl: null },
        { ...preview.songs[1], previewUrl: null },
        { ...preview.songs[2], previewUrl: null },
      ],
    };

    render(
      <ArtistPreviewModal
        artist={artist}
        preview={previewWithoutAudio}
        isFavorite={false}
        onClose={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/No encontramos preview de 30 segundos para este artista\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Usa los links de abajo para escuchar al artista en Spotify, YouTube o Apple Music\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Reproducir preview/i }),
    ).not.toBeInTheDocument();
  });
});

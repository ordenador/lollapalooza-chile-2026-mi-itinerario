import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Page from '@/app/page';

describe('Lineup page smoke', () => {
  it('renders, opens modal, and filters mine view', () => {
    render(<Page />);

    expect(screen.getByText(/Lollapalooza/i)).toBeInTheDocument();

    const djoCard = screen.getByTestId('artist-card-3');
    fireEvent.click(djoCard);

    expect(screen.getByText(/Vibe en vivo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cerrar preview/i }));

    fireEvent.click(screen.getByRole('button', { name: /Agregar Djo a favoritos/i }));

    fireEvent.click(screen.getByRole('button', { name: /Mis Bandas/i }));

    expect(screen.getByTestId('artist-card-3')).toBeInTheDocument();
    expect(screen.queryByTestId('artist-card-4')).not.toBeInTheDocument();
  });
});

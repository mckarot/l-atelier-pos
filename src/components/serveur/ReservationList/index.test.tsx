// src/components/serveur/ReservationList/index.test.tsx
// Tests unitaires pour le composant ReservationList

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReservationList } from './index';
import { db } from '../../../db/database';
import type { Reservation } from '../../../db/types';

// Mock des hooks et fonctions
vi.mock('../../../hooks/useTodayReservationsList', () => ({
  useTodayReservationsList: vi.fn(),
}));

vi.mock('../../../hooks/useReservations', () => ({
  updateReservationStatus: vi.fn(),
}));

const mockUseTodayReservationsList = vi.mocked(
  require('../../../hooks/useTodayReservationsList').useTodayReservationsList
);
const mockUpdateReservationStatus = vi.mocked(
  require('../../../hooks/useReservations').updateReservationStatus
);

describe('ReservationList', () => {
  const mockOnOpenNewReservation = vi.fn();
  const mockOnEditReservation = vi.fn();

  const mockReservations: Reservation[] = [
    {
      id: 1,
      customerName: 'Jean Dupont',
      email: 'jean@email.com',
      phone: '0612345678',
      date: new Date().toISOString().split('T')[0],
      time: '19:30',
      guests: 4,
      status: 'confirme',
      tableId: 6,
      notes: 'Anniversaire',
      createdAt: Date.now(),
      referenceNumber: 'RES-1234567890-001',
    },
    {
      id: 2,
      customerName: 'Marie Martin',
      email: 'marie@email.com',
      phone: '0789123456',
      date: new Date().toISOString().split('T')[0],
      time: '20:00',
      guests: 2,
      status: 'en_attente',
      notes: 'Près de la fenêtre',
      createdAt: Date.now(),
      referenceNumber: 'RES-1234567890-002',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le titre et la date du jour', () => {
    mockUseTodayReservationsList.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    expect(screen.getByText('Réservations')).toBeInTheDocument();
  });

  it('affiche le bouton Nouvelle Réservation', () => {
    mockUseTodayReservationsList.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    const newButton = screen.getByText('Nouvelle Réservation');
    expect(newButton).toBeInTheDocument();
  });

  it('appelle onOpenNewReservation quand on clique sur le bouton', () => {
    mockUseTodayReservationsList.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    const newButton = screen.getByText('Nouvelle Réservation');
    fireEvent.click(newButton);

    expect(mockOnOpenNewReservation).toHaveBeenCalledTimes(1);
  });

  it('affiche l état de chargement', () => {
    mockUseTodayReservationsList.mockReturnValue({
      reservations: [],
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    expect(screen.getByText('Chargement des réservations…')).toBeInTheDocument();
  });

  it('affiche l état d erreur', () => {
    mockUseTodayReservationsList.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: new Error('Erreur de chargement'),
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('affiche l empty state quand il n y a pas de réservations', () => {
    mockUseTodayReservationsList.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    expect(screen.getByText('Aucune réservation pour aujourd\'hui')).toBeInTheDocument();
  });

  it('affiche la table des réservations', () => {
    mockUseTodayReservationsList.mockReturnValue({
      reservations: mockReservations,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    expect(screen.getByText('19:30')).toBeInTheDocument();
    expect(screen.getByText('20:00')).toBeInTheDocument();
  });

  it('affiche les en-têtes de colonnes', () => {
    mockUseTodayReservationsList.mockReturnValue({
      reservations: mockReservations,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    expect(screen.getByText('Heure')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Couverts')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('appelle updateReservationStatus lors du check-in', async () => {
    mockUpdateReservationStatus.mockResolvedValue(undefined);

    mockUseTodayReservationsList.mockReturnValue({
      reservations: [mockReservations[0]],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    const checkInButton = screen.getByLabelText(`Marquer ${mockReservations[0].customerName} comme arrivé`);
    fireEvent.click(checkInButton);

    await waitFor(() => {
      expect(mockUpdateReservationStatus).toHaveBeenCalledWith(
        mockReservations[0].id,
        'arrive'
      );
    });
  });

  it('appelle updateReservationStatus lors de l annulation', async () => {
    mockUpdateReservationStatus.mockResolvedValue(undefined);

    // Mock pour confirmer la window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    mockUseTodayReservationsList.mockReturnValue({
      reservations: [mockReservations[0]],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    const cancelButton = screen.getByLabelText(`Annuler ${mockReservations[0].customerName}`);
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockUpdateReservationStatus).toHaveBeenCalledWith(
        mockReservations[0].id,
        'annule'
      );
    });
  });

  it('n annule pas si l utilisateur confirme pas', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    mockUseTodayReservationsList.mockReturnValue({
      reservations: [mockReservations[0]],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <ReservationList
        onOpenNewReservation={mockOnOpenNewReservation}
        onEditReservation={mockOnEditReservation}
      />
    );

    const cancelButton = screen.getByLabelText(`Annuler ${mockReservations[0].customerName}`);
    fireEvent.click(cancelButton);

    expect(mockUpdateReservationStatus).not.toHaveBeenCalled();
  });
});

// src/components/serveur/ReservationList/components/ReservationRow.test.tsx
// Tests unitaires pour le composant ReservationRow

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReservationRow } from './ReservationRow';
import type { Reservation } from '../../../../db/types';

const mockReservation: Reservation = {
  id: 1,
  customerName: 'Jean Dupont',
  email: 'jean@email.com',
  phone: '0612345678',
  date: '2024-03-23',
  time: '19:30',
  guests: 4,
  status: 'confirme',
  tableId: 6,
  notes: 'Anniversaire',
  createdAt: Date.now(),
  referenceNumber: 'RES-1234567890-001',
};

describe('ReservationRow', () => {
  const mockOnCheckIn = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche les informations de la réservation', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} />
        </tbody>
      </table>
    );

    expect(screen.getByText('19:30')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Table 6')).toBeInTheDocument();
  });

  it('affiche le statut confirmé', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Confirmé')).toBeInTheDocument();
  });

  it('affiche le statut en attente', () => {
    const reservationEnAttente: Reservation = {
      ...mockReservation,
      status: 'en_attente',
    };

    render(
      <table>
        <tbody>
          <ReservationRow reservation={reservationEnAttente} />
        </tbody>
      </table>
    );

    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  it('affiche le statut annulé', () => {
    const reservationAnnulee: Reservation = {
      ...mockReservation,
      status: 'annule',
    };

    render(
      <table>
        <tbody>
          <ReservationRow reservation={reservationAnnulee} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Annulé')).toBeInTheDocument();
  });

  it('affiche le statut arrivé', () => {
    const reservationArrivee: Reservation = {
      ...mockReservation,
      status: 'arrive',
    };

    render(
      <table>
        <tbody>
          <ReservationRow reservation={reservationArrivee} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Arrivé')).toBeInTheDocument();
  });

  it('affiche un tiret quand il n y a pas de table assignée', () => {
    const reservationSansTable: Reservation = {
      ...mockReservation,
      tableId: undefined,
    };

    render(
      <table>
        <tbody>
          <ReservationRow reservation={reservationSansTable} />
        </tbody>
      </table>
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('affiche le bouton Marquer comme arrivé pour le statut confirme', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} onCheckIn={mockOnCheckIn} />
        </tbody>
      </table>
    );

    const checkInButton = screen.getByLabelText(`Marquer ${mockReservation.customerName} comme arrivé`);
    expect(checkInButton).toBeInTheDocument();
  });

  it('n affiche pas le bouton Marquer comme arrivé pour un autre statut', () => {
    const reservationEnAttente: Reservation = {
      ...mockReservation,
      status: 'en_attente',
    };

    render(
      <table>
        <tbody>
          <ReservationRow reservation={reservationEnAttente} onCheckIn={mockOnCheckIn} />
        </tbody>
      </table>
    );

    expect(
      screen.queryByLabelText(`Marquer ${mockReservation.customerName} comme arrivé`)
    ).not.toBeInTheDocument();
  });

  it('appelle onCheckIn quand on clique sur le bouton', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} onCheckIn={mockOnCheckIn} />
        </tbody>
      </table>
    );

    const checkInButton = screen.getByLabelText(`Marquer ${mockReservation.customerName} comme arrivé`);
    fireEvent.click(checkInButton);

    expect(mockOnCheckIn).toHaveBeenCalledWith(mockReservation.id);
  });

  it('affiche le bouton Éditer', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} onEdit={mockOnEdit} />
        </tbody>
      </table>
    );

    const editButton = screen.getByLabelText(`Modifier ${mockReservation.customerName}`);
    expect(editButton).toBeInTheDocument();
  });

  it('appelle onEdit quand on clique sur le bouton', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} onEdit={mockOnEdit} />
        </tbody>
      </table>
    );

    const editButton = screen.getByLabelText(`Modifier ${mockReservation.customerName}`);
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockReservation.id);
  });

  it('affiche le bouton Annuler', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} onCancel={mockOnCancel} />
        </tbody>
      </table>
    );

    const cancelButton = screen.getByLabelText(`Annuler ${mockReservation.customerName}`);
    expect(cancelButton).toBeInTheDocument();
  });

  it('n affiche pas le bouton Annuler pour une réservation déjà annulée', () => {
    const reservationAnnulee: Reservation = {
      ...mockReservation,
      status: 'annule',
    };

    render(
      <table>
        <tbody>
          <ReservationRow reservation={reservationAnnulee} onCancel={mockOnCancel} />
        </tbody>
      </table>
    );

    expect(
      screen.queryByLabelText(`Annuler ${mockReservation.customerName}`)
    ).not.toBeInTheDocument();
  });

  it('appelle onCancel quand on clique sur le bouton', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} onCancel={mockOnCancel} />
        </tbody>
      </table>
    );

    const cancelButton = screen.getByLabelText(`Annuler ${mockReservation.customerName}`);
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledWith(mockReservation.id);
  });

  it('utilise font-mono pour l heure', () => {
    render(
      <table>
        <tbody>
          <ReservationRow reservation={mockReservation} />
        </tbody>
      </table>
    );

    const timeCell = screen.getByText('19:30');
    expect(timeCell).toHaveClass('font-mono');
  });
});

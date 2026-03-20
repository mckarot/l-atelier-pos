// src/components/serveur/ReservationCard.test.tsx
// Tests pour le composant ReservationCard

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Reservation } from '../../db/types';
import { ReservationCard } from './ReservationCard';

const createMockReservation = (overrides?: Partial<Reservation>): Reservation => ({
  id: 1,
  customerName: 'Jean Dupont',
  email: 'jean.dupont@email.com',
  phone: '06 12 34 56 78',
  date: '2024-01-15',
  time: '13:15',
  guests: 4,
  status: 'confirme',
  tableId: 5,
  notes: 'Anniversaire',
  ...overrides,
});

describe('ReservationCard', () => {
  describe('Rendu de base', () => {
    it('devrait afficher le nom du client', () => {
      const reservation = createMockReservation({ customerName: 'Marie Martin' });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    });

    it('devrait afficher l\'heure', () => {
      const reservation = createMockReservation({ time: '19:30' });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('19:30')).toBeInTheDocument();
    });

    it('devrait afficher le nombre de couverts', () => {
      const reservation = createMockReservation({ guests: 6 });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('6 pers.')).toBeInTheDocument();
    });

    it('devrait afficher le numéro de table', () => {
      const reservation = createMockReservation({ tableId: 8 });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('T.08')).toBeInTheDocument();
    });

    it('devrait afficher les notes', () => {
      const reservation = createMockReservation({ notes: 'Préfère une table près de la fenêtre' });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('Préfère une table près de la fenêtre')).toBeInTheDocument();
    });
  });

  describe('Statuts', () => {
    it('devrait afficher CONFIRMÉ pour le statut confirme', () => {
      const reservation = createMockReservation({ status: 'confirme' });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('CONFIRMÉ')).toBeInTheDocument();
    });

    it('devrait afficher ARRIVÉ pour le statut arrive', () => {
      const reservation = createMockReservation({ status: 'arrive' });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('ARRIVÉ')).toBeInTheDocument();
    });

    it('devrait afficher EN ATTENTE pour le statut en_attente', () => {
      const reservation = createMockReservation({ status: 'en_attente' });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('EN ATTENTE')).toBeInTheDocument();
    });

    it('devrait afficher ANNULÉ pour le statut annule', () => {
      const reservation = createMockReservation({ status: 'annule' });
      render(<ReservationCard reservation={reservation} />);
      expect(screen.getByText('ANNULÉ')).toBeInTheDocument();
    });
  });

  describe('Mode compact', () => {
    it('devrait afficher l\'heure en grand format', () => {
      const reservation = createMockReservation({ time: '13:15' });
      render(<ReservationCard reservation={reservation} compact />);
      expect(screen.getByText('13')).toBeInTheDocument();
      expect(screen.getByText(':15')).toBeInTheDocument();
    });

    it('devrait afficher le label HEURE', () => {
      const reservation = createMockReservation();
      render(<ReservationCard reservation={reservation} compact />);
      expect(screen.getByText('HEURE')).toBeInTheDocument();
    });

    it('devrait afficher le bouton ARRIVÉE pour confirme', () => {
      const reservation = createMockReservation({ status: 'confirme' });
      render(<ReservationCard reservation={reservation} compact />);
      expect(screen.getByText('ARRIVÉE')).toBeInTheDocument();
    });

    it('devrait afficher le bouton QR CODE', () => {
      const reservation = createMockReservation({ status: 'confirme' });
      render(<ReservationCard reservation={reservation} compact />);
      expect(screen.getByText('QR CODE')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('devrait appeler onCheckIn au clic sur ARRIVÉE', async () => {
      const user = userEvent.setup();
      const onCheckIn = vi.fn();
      const reservation = createMockReservation({ status: 'confirme' });
      render(<ReservationCard reservation={reservation} onCheckIn={onCheckIn} compact />);
      
      await user.click(screen.getByText('ARRIVÉE'));
      expect(onCheckIn).toHaveBeenCalledWith(1);
    });

    it('devrait appeler onCancel au clic sur le bouton annuler', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const reservation = createMockReservation({ status: 'confirme' });
      render(<ReservationCard reservation={reservation} onCancel={onCancel} compact />);
      
      await user.click(screen.getByLabelText('Annuler la réservation'));
      expect(onCancel).toHaveBeenCalledWith(1);
    });

    it('ne devrait pas afficher les actions pour le statut arrive', () => {
      const reservation = createMockReservation({ status: 'arrive' });
      render(<ReservationCard reservation={reservation} compact />);
      expect(screen.queryByText('ARRIVÉE')).not.toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un aria-label sur le bouton ARRIVÉE', () => {
      const reservation = createMockReservation({ status: 'confirme' });
      render(<ReservationCard reservation={reservation} compact />);
      expect(screen.getByRole('button', { name: 'Enregistrer l\'arrivée' })).toBeInTheDocument();
    });

    it('devrait avoir un aria-label sur le bouton QR CODE', () => {
      const reservation = createMockReservation({ status: 'confirme' });
      render(<ReservationCard reservation={reservation} compact />);
      expect(screen.getByRole('button', { name: 'Afficher le QR code' })).toBeInTheDocument();
    });
  });
});

// src/components/serveur/TableCard.test.tsx
// Tests pour le composant TableCard

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FloorTable } from './types';
import { TableCard } from './TableCard';

const createMockTable = (overrides?: Partial<FloorTable>): FloorTable => ({
  id: 1,
  name: 'T.01',
  status: 'libre',
  capacity: 4,
  sector: 'Salle',
  currentOrder: undefined,
  ...overrides,
});

describe('TableCard', () => {
  describe('Rendu de base', () => {
    it('devrait afficher le nom de la table', () => {
      const table = createMockTable({ name: 'T.05' });
      render(<TableCard table={table} />);
      expect(screen.getByText('T.05')).toBeInTheDocument();
    });

    it('devrait afficher le statut LIBRE', () => {
      const table = createMockTable({ status: 'libre' });
      render(<TableCard table={table} />);
      expect(screen.getByText('LIBRE')).toBeInTheDocument();
    });

    it('devrait afficher le statut OCCUPÉE', () => {
      const table = createMockTable({ status: 'occupee' });
      render(<TableCard table={table} />);
      expect(screen.getByText('OCCUPÉE')).toBeInTheDocument();
    });

    it('devrait afficher le statut PRÊT', () => {
      const table = createMockTable({ status: 'pret' });
      render(<TableCard table={table} />);
      expect(screen.getByText('PRÊT')).toBeInTheDocument();
    });

    it('devrait afficher le statut RÉSERVÉE', () => {
      const table = createMockTable({ status: 'reserve' });
      render(<TableCard table={table} />);
      expect(screen.getByText('RÉSERVÉE')).toBeInTheDocument();
    });

    it('devrait afficher la capacité', () => {
      const table = createMockTable({ capacity: 6 });
      render(<TableCard table={table} />);
      expect(screen.getByText('6 pers.')).toBeInTheDocument();
    });

    it('devrait afficher le secteur', () => {
      const table = createMockTable({ sector: 'Terrasse' });
      render(<TableCard table={table} />);
      expect(screen.getByText('Terrasse')).toBeInTheDocument();
    });
  });

  describe('Table libre', () => {
    it('devrait afficher "Prête pour dressage"', () => {
      const table = createMockTable({ status: 'libre' });
      render(<TableCard table={table} />);
      expect(screen.getByText('Prête pour dressage')).toBeInTheDocument();
    });

    it('devrait afficher 0.00€', () => {
      const table = createMockTable({ status: 'libre' });
      render(<TableCard table={table} />);
      expect(screen.getByText('0.00€')).toBeInTheDocument();
    });

    it('devrait avoir une bordure tertiary', () => {
      const table = createMockTable({ status: 'libre' });
      render(<TableCard table={table} />);
      const card = screen.getByText('T.01').closest('div');
      expect(card).toHaveClass('border-tertiary');
    });
  });

  describe('Table occupée', () => {
    it('devrait afficher le nom du client', () => {
      const table = createMockTable({
        status: 'occupee',
        currentOrder: {
          id: 1,
          items: [],
          total: 50,
          startTime: Date.now(),
          customerName: 'Pierre D.',
        },
      });
      render(<TableCard table={table} />);
      expect(screen.getByText('Pierre D.')).toBeInTheDocument();
    });

    it('devrait afficher le total de la commande', () => {
      const table = createMockTable({
        status: 'occupee',
        currentOrder: {
          id: 1,
          items: [],
          total: 128.50,
          startTime: Date.now(),
        },
      });
      render(<TableCard table={table} />);
      expect(screen.getByText('128.50€')).toBeInTheDocument();
    });

    it('devrait avoir une bordure primary', () => {
      const table = createMockTable({ status: 'occupee' });
      render(<TableCard table={table} />);
      const card = screen.getByText('T.01').closest('div');
      expect(card).toHaveClass('border-primary');
    });
  });

  describe('Table réservée', () => {
    it('devrait afficher "Réservée"', () => {
      const table = createMockTable({ status: 'reserve' });
      render(<TableCard table={table} />);
      expect(screen.getByText('Réservée')).toBeInTheDocument();
    });

    it('devrait avoir une bordure purple-500', () => {
      const table = createMockTable({ status: 'reserve' });
      render(<TableCard table={table} />);
      const card = screen.getByText('T.01').closest('div');
      expect(card).toHaveClass('border-purple-500');
    });
  });

  describe('Interaction', () => {
    it('devrait appeler onClick au clic', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const table = createMockTable();
      render(<TableCard table={table} onClick={onClick} />);
      
      await user.click(screen.getByText('T.01').closest('div')!);
      expect(onClick).toHaveBeenCalledWith(1);
    });

    it('devrait être focusable au clavier', () => {
      const table = createMockTable();
      render(<TableCard table={table} />);
      const card = screen.getByText('T.01').closest('div');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('devrait appeler onClick avec la touche Enter', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const table = createMockTable();
      render(<TableCard table={table} onClick={onClick} />);
      
      const card = screen.getByText('T.01').closest('div')!;
      card.focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledWith(1);
    });
  });

  describe('Sélection', () => {
    it('devrait appliquer le style isSelected', () => {
      const table = createMockTable();
      render(<TableCard table={table} isSelected />);
      const card = screen.getByText('T.01').closest('div');
      expect(card).toHaveClass('ring-2', 'ring-primary');
    });

    it('devrait avoir aria-pressed true quand sélectionné', () => {
      const table = createMockTable();
      render(<TableCard table={table} isSelected />);
      const card = screen.getByText('T.01').closest('div');
      expect(card).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un aria-label', () => {
      const table = createMockTable({ status: 'libre' });
      render(<TableCard table={table} />);
      const card = screen.getByText('T.01').closest('div');
      expect(card).toHaveAttribute('aria-label', 'Table T.01, LIBRE');
    });

    it('devrait avoir un rôle button', () => {
      const table = createMockTable();
      render(<TableCard table={table} />);
      const card = screen.getByText('T.01').closest('div');
      expect(card).toHaveAttribute('role', 'button');
    });
  });
});

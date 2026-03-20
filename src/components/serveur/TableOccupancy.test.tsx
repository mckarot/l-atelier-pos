// src/components/serveur/TableOccupancy.test.tsx
// Tests pour le composant TableOccupancy

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { OccupancyStats } from './types';
import { TableOccupancy } from './TableOccupancy';

const createMockStats = (overrides?: Partial<OccupancyStats>): OccupancyStats => ({
  free: 8,
  occupied: 5,
  reserved: 3,
  total: 16,
  ...overrides,
});

describe('TableOccupancy', () => {
  describe('Rendu de base', () => {
    it('devrait afficher le nombre de tables libres', () => {
      const stats = createMockStats({ free: 6 });
      render(<TableOccupancy stats={stats} />);
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('devrait afficher le nombre de tables occupées', () => {
      const stats = createMockStats({ occupied: 7 });
      render(<TableOccupancy stats={stats} />);
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('devrait afficher le nombre de tables réservées', () => {
      const stats = createMockStats({ reserved: 3 });
      render(<TableOccupancy stats={stats} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('devrait afficher les labels Libres, Occupées, Réservées', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} />);
      expect(screen.getByText('Libres')).toBeInTheDocument();
      expect(screen.getByText('Occupées')).toBeInTheDocument();
      expect(screen.getByText('Réservées')).toBeInTheDocument();
    });
  });

  describe('Mode compact', () => {
    it('devrait afficher le titre "Occupation des Tables"', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} compact />);
      expect(screen.getByText('Occupation des Tables')).toBeInTheDocument();
    });

    it('devrait afficher le format T-X pour les stats', () => {
      const stats = createMockStats({ free: 5, occupied: 8, reserved: 3 });
      render(<TableOccupancy stats={stats} compact />);
      expect(screen.getByText('T-5')).toBeInTheDocument();
      expect(screen.getByText('T-8')).toBeInTheDocument();
      expect(screen.getByText('T-3')).toBeInTheDocument();
    });
  });

  describe('Mode détaillé', () => {
    it('devrait afficher le sous-titre', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} />);
      expect(screen.getByText('Vue en temps réel du flux de service')).toBeInTheDocument();
    });

    it('devrait afficher la barre de progression', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} />);
      // La barre de progression est présente
      const progressBar = screen.getByLabelText('8 tables libres');
      expect(progressBar).toBeInTheDocument();
    });

    it('devrait afficher la légende', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} />);
      expect(screen.getAllByText('Libres')).toHaveLength(2); // Titre + légende
    });

    it('devrait calculer le taux d\'occupation', () => {
      const stats = createMockStats({ free: 4, occupied: 8, reserved: 4, total: 16 });
      render(<TableOccupancy stats={stats} />);
      // (8 + 4) / 16 = 75%
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('Styles', () => {
    it('devrait avoir une couleur tertiary pour les tables libres', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} compact />);
      const freeCount = screen.getByText('T-8');
      expect(freeCount).toHaveClass('text-tertiary');
    });

    it('devrait avoir une couleur primary pour les tables occupées', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} compact />);
      const occupiedCount = screen.getAllByText('T-5')[0];
      expect(occupiedCount).toHaveClass('text-primary');
    });

    it('devrait avoir une couleur purple-500 pour les tables réservées', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} compact />);
      const reservedCount = screen.getAllByText('T-3')[0];
      expect(reservedCount).toHaveClass('text-purple-500');
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir des aria-labels sur les barres de progression', () => {
      const stats = createMockStats();
      render(<TableOccupancy stats={stats} />);
      expect(screen.getByLabelText('8 tables libres')).toBeInTheDocument();
      expect(screen.getByLabelText('5 tables occupées')).toBeInTheDocument();
      expect(screen.getByLabelText('3 tables réservées')).toBeInTheDocument();
    });
  });
});

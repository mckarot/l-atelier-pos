// src/components/serveur/FloorPlan.test.tsx
// Tests pour le composant FloorPlan

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { seedDatabase } from '../../db/database';
import { FloorPlan } from './FloorPlan';

describe('FloorPlan', () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  describe('Rendu de base', () => {
    it('devrait afficher le titre "Plan de Salle"', async () => {
      render(<FloorPlan />);
      expect(await screen.findByText('Plan de Salle')).toBeInTheDocument();
    });

    it('devrait afficher les tables du seed', async () => {
      render(<FloorPlan />);
      // Le seed crée 16 tables
      expect(await screen.findByText('T.01')).toBeInTheDocument();
      expect(screen.getByText('T.02')).toBeInTheDocument();
      expect(screen.getByText('T.16')).toBeInTheDocument();
    });

    it('devrait afficher le nombre de tables', async () => {
      render(<FloorPlan />);
      expect(await screen.findByText(/Tous les secteurs • 16 Tables/)).toBeInTheDocument();
    });
  });

  describe('Filtres par secteur', () => {
    it('devrait afficher le bouton "Tous"', async () => {
      render(<FloorPlan />);
      expect(await screen.findByText('Tous')).toBeInTheDocument();
    });

    it('devrait afficher les boutons de secteur', async () => {
      render(<FloorPlan />);
      expect(await screen.findByText('Salle principale')).toBeInTheDocument();
      expect(screen.getByText('Terrasse')).toBeInTheDocument();
      expect(screen.getByText('Bar')).toBeInTheDocument();
    });

    it('devrait filtrer les tables par secteur au clic', async () => {
      const user = userEvent.setup();
      render(<FloorPlan />);
      
      await user.click(await screen.findByText('Terrasse'));
      expect(await screen.findByText(/Terrasse •/)).toBeInTheDocument();
    });

    it('devrait afficher "Tous les secteurs" quand aucun filtre', async () => {
      render(<FloorPlan />);
      expect(await screen.findByText('Tous les secteurs • 16 Tables')).toBeInTheDocument();
    });
  });

  describe('Stats d\'occupation', () => {
    it('devrait afficher les stats', async () => {
      render(<FloorPlan />);
      expect(await screen.findByText('Libres')).toBeInTheDocument();
      expect(screen.getByText('Occupées')).toBeInTheDocument();
      expect(screen.getByText('Prêtes')).toBeInTheDocument();
      expect(screen.getByText('Réservées')).toBeInTheDocument();
    });

    it('devrait afficher le nombre de tables libres', async () => {
      render(<FloorPlan />);
      // Le seed a plusieurs tables libres
      const freeCount = await screen.findByText('8'); // Tables libres dans le seed
      expect(freeCount).toBeInTheDocument();
    });
  });

  describe('Sélection de table', () => {
    it('devrait appeler onTableSelect au clic sur une table', async () => {
      const user = userEvent.setup();
      const onTableSelect = vi.fn();
      render(<FloorPlan onTableSelect={onTableSelect} />);
      
      await user.click(await screen.findByText('T.01'));
      expect(onTableSelect).toHaveBeenCalled();
    });

    it('devrait appliquer le style isSelected à la table sélectionnée', async () => {
      render(<FloorPlan selectedTableId={1} />);
      const tableCard = await screen.findByText('T.01').closest('div');
      expect(tableCard).toHaveClass('ring-2', 'ring-primary');
    });
  });

  describe('État vide', () => {
    it('devrait afficher un message quand aucune table', async () => {
      // Ce test nécessiterait de mocker useFloorPlan pour retourner un tableau vide
      // À implémenter avec un mock plus poussé
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir des boutons de filtre accessibles', async () => {
      render(<FloorPlan />);
      const tousButton = await screen.findByRole('button', { name: 'Tous' });
      expect(tousButton).toBeInTheDocument();
    });
  });
});

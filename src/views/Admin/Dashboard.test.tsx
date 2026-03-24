// src/views/Admin/Dashboard.test.tsx
// Tests unitaires pour le composant Dashboard

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { db } from '../../firebase/config';
import { AdminDashboard } from './Dashboard';
import type { Order } from '../../firebase/types';

// Helper pour créer une commande
function createOrder(overrides: Partial<Order> = {}): Omit<Order, 'id'> {
  const now = Date.now();
  return {
    tableId: 1,
    customerName: 'Test Customer',
    status: 'attente',
    items: [{ name: 'Test Item', quantity: 1 }],
    total: 50,
    createdAt: now,
    ...overrides,
  };
}

describe('AdminDashboard', () => {
  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await db.orders.clear();
  });

  describe('Rendu de base', () => {
    it('affiche le titre du tableau de bord', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      });
    });

    it('affiche le sous-titre', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText('Vue d\'ensemble de l\'activité du restaurant')
        ).toBeInTheDocument();
      });
    });

    it('affiche l\'indicateur LIVE', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('LIVE')).toBeInTheDocument();
      });
    });
  });

  describe('Cartes KPI', () => {
    it('affiche les 4 cartes KPI', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Revenu Quotidien')).toBeInTheDocument();
        expect(screen.getByText('Commandes')).toBeInTheDocument();
        expect(screen.getByText('Temps Prep. Moyen')).toBeInTheDocument();
        expect(screen.getByText('Satisfaction')).toBeInTheDocument();
      });
    });

    it('affiche le revenu quotidien', async () => {
      // Arrange
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'paid',
        total: 2485,
        createdAt: startOfDay + 1000,
      });

      // Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('2 485 €')).toBeInTheDocument();
      });
    });

    it('affiche le nombre de commandes', async () => {
      // Arrange
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: startOfDay + 1000,
      });

      await db.orders.add({
        ...createOrder(),
        id: 2,
        createdAt: startOfDay + 2000,
      });

      // Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('affiche le temps de préparation moyen', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        // Valeur par défaut: 18:45
        expect(screen.getByText('18:45')).toBeInTheDocument();
      });
    });

    it('affiche l\'objectif de temps de préparation', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('OBJECTIF: 15:00')).toBeInTheDocument();
      });
    });

    it('affiche le score de satisfaction', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('4.8/5')).toBeInTheDocument();
      });
    });

    it('affiche le label de satisfaction', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Excellent')).toBeInTheDocument();
      });
    });
  });

  describe('Graphique de performance', () => {
    it('affiche le graphique de performance hebdomadaire', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Performance Hebdomadaire')).toBeInTheDocument();
      });
    });

    it('affiche le sous-titre du graphique', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText('Évolution du chiffre d\'affaires (7 derniers jours)')
        ).toBeInTheDocument();
      });
    });

    it('affiche les jours de la semaine', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('LUN')).toBeInTheDocument();
        expect(screen.getByText('MAR')).toBeInTheDocument();
        expect(screen.getByText('MER')).toBeInTheDocument();
        expect(screen.getByText('JEU')).toBeInTheDocument();
        expect(screen.getByText('VEN')).toBeInTheDocument();
        expect(screen.getByText('SAM')).toBeInTheDocument();
        expect(screen.getByText('DIM')).toBeInTheDocument();
      });
    });

    it('affiche les boutons JOUR et SEMAINE', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'JOUR' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'SEMAINE' })).toBeInTheDocument();
      });
    });
  });

  describe('Flux Live', () => {
    it('affiche le flux live', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Flux Live')).toBeInTheDocument();
      });
    });

    it('affiche le lien "VOIR TOUT L\'HISTORIQUE"', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('VOIR TOUT L\'HISTORIQUE')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibilité', () => {
    it('a une section KPI avec aria-label', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('region', { name: 'Indicateurs clés de performance' })
        ).toBeInTheDocument();
      });
    });

    it('a une section Performance avec aria-label', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('region', { name: 'Performance et activité en temps réel' })
        ).toBeInTheDocument();
      });
    });
  });

  describe('État de chargement', () => {
    it('affiche un spinner pendant le chargement initial', () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert - Le spinner devrait être visible initialement
      expect(screen.getByText('progress_activity')).toBeInTheDocument();
      expect(
        screen.getByText('Chargement du tableau de bord...')
      ).toBeInTheDocument();
    });
  });

  describe('Réactivité aux données', () => {
    it('met à jour l\'affichage quand une commande est ajoutée', async () => {
      // Arrange
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      });

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      // Act - Ajouter une commande payée
      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'paid',
        total: 100,
        createdAt: startOfDay + 1000,
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('100 €')).toBeInTheDocument();
      });
    });
  });

  describe('Design system', () => {
    it('utilise font-headline text-2xl pour le titre principal', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        const title = screen.getByText('Tableau de bord');
        expect(title).toHaveClass('font-headline');
        expect(title).toHaveClass('text-2xl');
      });
    });

    it('utilise font-label text-sm pour le sous-titre', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        const subtitle = screen.getByText('Vue d\'ensemble de l\'activité du restaurant');
        expect(subtitle).toHaveClass('font-label');
        expect(subtitle).toHaveClass('text-sm');
      });
    });
  });

  describe('Icônes Material Symbols', () => {
    it('affiche l\'icône payments pour le revenu', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert - Utiliser getAllByText car il y a plusieurs icônes
      await waitFor(() => {
        const paymentsIcons = screen.getAllByText('payments');
        expect(paymentsIcons.length).toBeGreaterThan(0);
      });
    });

    it('affiche l\'icône receipt_long pour les commandes', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('receipt_long')).toBeInTheDocument();
      });
    });

    it('affiche l\'icône timer pour le temps de préparation', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('timer')).toBeInTheDocument();
      });
    });

    it('affiche l\'icône star pour la satisfaction', async () => {
      // Arrange & Act
      render(<AdminDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('star')).toBeInTheDocument();
      });
    });
  });
});

// src/views/Admin/Kitchen.test.tsx
// Tests d'intégration pour la vue Kitchen Display (AdminKitchen)

import { type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { AdminKitchen } from './Kitchen';
import { db } from '../../db/database';
import type { Order } from '../../db/types';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE ROUTING
// ─────────────────────────────────────────────────────────────────────────────

const renderWithRouter = (initialEntries: string[] = ['/admin/kitchen']): RenderResult => {
  const routes: RouteObject[] = [
    {
      path: '/admin/kitchen',
      element: <AdminKitchen />,
    },
  ];

  const router = createMemoryRouter(routes, { initialEntries });
  return render(<RouterProvider router={router} />);
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE SEED
// ─────────────────────────────────────────────────────────────────────────────

const seedOrders = async (orders: Partial<Order>[]): Promise<void> => {
  const now = Date.now();
  const ordersToInsert: Order[] = orders.map((order, i) => ({
    id: i + 1,
    tableId: order.tableId ?? (i % 16) + 1,
    customerName: order.customerName ?? `Client ${i + 1}`,
    status: order.status ?? 'en_attente',
    items: order.items ?? [{ name: `Item ${i + 1}`, quantity: 1, station: 'FROID' }],
    total: order.total ?? 20,
    createdAt: order.createdAt ?? now - (i + 1) * 5 * 60 * 1000,
    updatedAt: order.updatedAt,
    servedAt: order.servedAt,
    notes: order.notes,
  } as Order));

  await db.orders.bulkAdd(ordersToInsert);
};

const clearDatabase = async (): Promise<void> => {
  await db.orders.clear();
  await db.restaurantTables.clear();
  await db.menuItems.clear();
  await db.reservations.clear();
  await db.users.clear();
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('AdminKitchen - Integration', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Rendu initial', () => {
    it('devrait afficher l\'en-tête "Kitchen Display"', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Kitchen Display')).toBeInTheDocument();
      expect(screen.getByText('Tableau de bord cuisine en temps réel')).toBeInTheDocument();
    });

    it('devrait afficher le badge "MODE ADMIN"', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('MODE ADMIN')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône soup_kitchen dans l\'en-tête', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('soup_kitchen')).toBeInTheDocument();
    });

    it('devrait afficher le KDSBoard', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByRole('region', { name: /tableau des commandes kds/i })).toBeInTheDocument();
    });
  });

  describe('Colonnes KDS', () => {
    it('devrait afficher les 3 colonnes (À PRÉPARER, EN COURS, PRÊT)', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('À PRÉPARER')).toBeInTheDocument();
      expect(screen.getByText('EN COURS')).toBeInTheDocument();
      expect(screen.getByText('PRÊT / ENVOYÉ')).toBeInTheDocument();
    });

    it('devrait afficher les compteurs de commandes par colonne', async () => {
      // Arrange
      await seedOrders([
        { id: 1, status: 'en_attente' },
        { id: 2, status: 'en_attente' },
        { id: 3, status: 'en_preparation' },
        { id: 4, status: 'pret' },
        { id: 5, status: 'pret' },
        { id: 6, status: 'pret' },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        // Colonne 1: 02
        expect(screen.getByText('02')).toBeInTheDocument();
        // Colonne 2: 01
        expect(screen.getAllByText('01')).toHaveLength(2);
        // Colonne 3: 03
        expect(screen.getByText('03')).toBeInTheDocument();
      });
    });

    it('devrait afficher "Aucune commande" quand une colonne est vide', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert - Toutes les colonnes sont vides
      expect(screen.getAllByText('Aucune commande')).toHaveLength(3);
    });
  });

  describe('Affichage des commandes dans les colonnes', () => {
    it('devrait afficher les commandes en_attente dans la colonne "À PRÉPARER"', async () => {
      // Arrange
      await seedOrders([
        { id: 1, status: 'en_attente', customerName: 'Pierre', tableId: 5 },
        { id: 2, status: 'en_preparation', customerName: 'Marie' },
        { id: 3, status: 'pret', customerName: 'Jean' },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
        expect(screen.getByText('Table 5 — Pierre')).toBeInTheDocument();
      });
    });

    it('devrait afficher les commandes en_preparation dans la colonne "EN COURS"', async () => {
      // Arrange
      await seedOrders([
        { id: 1, status: 'en_attente' },
        { id: 2, status: 'en_preparation', customerName: 'Marie', tableId: 8 },
        { id: 3, status: 'pret' },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('#ORD-0002')).toBeInTheDocument();
        expect(screen.getByText('Table 8 — Marie')).toBeInTheDocument();
      });
    });

    it('devrait afficher les commandes pret dans la colonne "PRÊT / ENVOYÉ"', async () => {
      // Arrange
      await seedOrders([
        { id: 1, status: 'en_attente' },
        { id: 2, status: 'en_preparation' },
        { id: 3, status: 'pret', customerName: 'Jean', tableId: 12 },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('#ORD-0003')).toBeInTheDocument();
        expect(screen.getByText('Table 12 — Jean')).toBeInTheDocument();
      });
    });

    it('devrait afficher les items avec quantités', async () => {
      // Arrange
      await seedOrders([
        {
          id: 1,
          status: 'en_attente',
          items: [
            { name: 'Tartare de Saumon', quantity: 2, station: 'FROID' },
            { name: 'Filet de Boeuf', quantity: 1, station: 'GRILL' },
          ],
        },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Tartare de Saumon')).toBeInTheDocument();
        expect(screen.getByText('x2')).toBeInTheDocument();
        expect(screen.getByText('Filet de Boeuf')).toBeInTheDocument();
        expect(screen.getByText('x1')).toBeInTheDocument();
      });
    });

    it('devrait afficher la customisation en italique orange', async () => {
      // Arrange
      await seedOrders([
        {
          id: 1,
          status: 'en_attente',
          items: [
            { name: 'Tartare de Saumon', quantity: 1, station: 'FROID', customization: 'Sans citron' },
          ],
        },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        const customization = screen.getByText('Sans citron');
        expect(customization).toBeInTheDocument();
        expect(customization).toHaveClass('italic');
        expect(customization).toHaveClass('text-secondary');
      });
    });
  });

  describe('Timers', () => {
    it('devrait afficher le timer avec le format MM:SS', async () => {
      // Arrange - Commande créée il y a 5 minutes 30 secondes
      const now = Date.now();
      await seedOrders([
        {
          id: 1,
          status: 'en_attente',
          createdAt: now - 5 * 60 * 1000 - 30 * 1000,
        },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('05:30')).toBeInTheDocument();
      });
    });

    it('devrait afficher l\'heure de réception de la commande', async () => {
      // Arrange
      const now = Date.now();
      await seedOrders([
        {
          id: 1,
          status: 'en_attente',
          createdAt: now - 10 * 60 * 1000,
        },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        const timeString = new Date(now - 10 * 60 * 1000).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        expect(screen.getByText(`REÇU À ${timeString}`)).toBeInTheDocument();
      });
    });

    it('devrait mettre à jour le timer en temps réel', async () => {
      // Arrange - Commande créée il y a exactement 5 minutes
      const now = Date.now();
      await seedOrders([
        {
          id: 1,
          status: 'en_attente',
          createdAt: now - 5 * 60 * 1000,
        },
      ]);

      // Act
      renderWithRouter();

      // Assert initial
      await waitFor(() => {
        expect(screen.getByText('05:00')).toBeInTheDocument();
      });

      // Attendre 3 secondes et vérifier la mise à jour
      await new Promise((resolve) => setTimeout(resolve, 3500));

      // Le timer devrait avoir avancé
      expect(screen.getByText('05:03')).toBeInTheDocument();
    });
  });

  describe('Badge MOY: X MIN', () => {
    it('devrait afficher le temps moyen de préparation dans la colonne 1', async () => {
      // Arrange - Commandes terminées pour calculer la moyenne
      await seedOrders([
        {
          id: 1,
          status: 'pret',
          createdAt: Date.now() - 30 * 60 * 1000,
          updatedAt: Date.now() - 10 * 60 * 1000, // 20 min
        },
        {
          id: 2,
          status: 'servi',
          createdAt: Date.now() - 50 * 60 * 1000,
          updatedAt: Date.now() - 30 * 60 * 1000, // 20 min
        },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('MOY: 20 MIN')).toBeInTheDocument();
      });
    });

    it('ne devrait PAS afficher le badge MOY sans commandes terminées', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.queryByText('MOY:')).not.toBeInTheDocument();
    });
  });

  describe('Actions LANCER et TERMINER', () => {
    it('devrait afficher les boutons DÉTAILS et LANCER pour le mode attente', async () => {
      // Arrange
      await seedOrders([
        { id: 1, status: 'en_attente' },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('DÉTAILS')).toBeInTheDocument();
        expect(screen.getByText('LANCER')).toBeInTheDocument();
      });
    });

    it('devrait afficher les boutons AIDE et TERMINER pour le mode preparation', async () => {
      // Arrange
      await seedOrders([
        { id: 1, status: 'en_preparation' },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('AIDE')).toBeInTheDocument();
        expect(screen.getByText('TERMINER')).toBeInTheDocument();
      });
    });

    it('devrait lancer la préparation au clic sur LANCER', async () => {
      // Arrange
      await seedOrders([
        { id: 42, status: 'en_attente', customerName: 'Test' },
      ]);

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('#ORD-0042')).toBeInTheDocument();
      });

      const lancerButton = screen.getByText('LANCER');
      await user.click(lancerButton);

      // Assert - La commande devrait être dans la colonne EN COURS
      await waitFor(() => {
        expect(screen.getByText('EN COURS').closest('section')).toContainElement(
          screen.getByText('#ORD-0042')
        );
      });

      // Vérifier le statut en DB
      const order = await db.orders.get(42);
      expect(order?.status).toBe('en_preparation');
    });

    it('devrait terminer la préparation au clic sur TERMINER', async () => {
      // Arrange
      await seedOrders([
        { id: 99, status: 'en_preparation', customerName: 'Test' },
      ]);

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('#ORD-0099')).toBeInTheDocument();
      });

      const terminerButton = screen.getByText('TERMINER');
      await user.click(terminerButton);

      // Assert - La commande devrait être dans la colonne PRÊT
      await waitFor(() => {
        expect(screen.getByText('PRÊT / ENVOYÉ').closest('section')).toContainElement(
          screen.getByText('#ORD-0099')
        );
      });

      // Vérifier le statut en DB
      const order = await db.orders.get(99);
      expect(order?.status).toBe('pret');
    });

    it('ne devrait PAS afficher de boutons pour le mode pret', async () => {
      // Arrange
      await seedOrders([
        { id: 1, status: 'pret' },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('LANCER')).not.toBeInTheDocument();
        expect(screen.queryByText('TERMINER')).not.toBeInTheDocument();
        expect(screen.queryByText('DÉTAILS')).not.toBeInTheDocument();
        expect(screen.queryByText('AIDE')).not.toBeInTheDocument();
      });
    });
  });

  describe('useLiveQuery réactif', () => {
    it('devrait mettre à jour l\'affichage quand une commande est ajoutée', async () => {
      // Arrange
      renderWithRouter();

      // Assert initial
      expect(screen.getByText('00')).toBeInTheDocument();

      // Act - Ajouter une commande
      await seedOrders([{ id: 1, status: 'en_attente' }]);

      // Assert - Mise à jour réactive
      await waitFor(() => {
        expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
        expect(screen.getByText('01')).toBeInTheDocument();
      });
    });

    it('devrait mettre à jour l\'affichage quand une commande change de statut', async () => {
      // Arrange
      await seedOrders([{ id: 1, status: 'en_attente' }]);
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
      });

      // Act - Changer le statut
      await db.orders.update(1, { status: 'en_preparation' });

      // Assert - La commande devrait être dans la colonne EN COURS
      await waitFor(() => {
        expect(screen.getByText('EN COURS').closest('section')).toContainElement(
          screen.getByText('#ORD-0001')
        );
      });
    });

    it('devrait mettre à jour l\'affichage quand une commande est supprimée', async () => {
      // Arrange
      await seedOrders([{ id: 1, status: 'en_attente' }]);
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
      });

      // Act - Supprimer la commande
      await db.orders.delete(1);

      // Assert - Mise à jour réactive
      await waitFor(() => {
        expect(screen.queryByText('#ORD-0001')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un rôle region sur le board KDS', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByRole('region', { name: /tableau des commandes kds/i })).toBeInTheDocument();
    });

    it('devrait avoir des aria-label sur les colonnes', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByLabelText('Colonne: À PRÉPARER')).toBeInTheDocument();
      expect(screen.getByLabelText('Colonne: EN COURS')).toBeInTheDocument();
      expect(screen.getByLabelText('Colonne: PRÊT / ENVOYÉ')).toBeInTheDocument();
    });

    it('devrait avoir aria-live sur les timers', async () => {
      // Arrange
      await seedOrders([{ id: 1, status: 'en_attente' }]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        const timer = screen.getByRole('status', { name: /temps écoulé/i });
        expect(timer).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('devrait avoir des aria-label sur les boutons LANCER', async () => {
      // Arrange
      await seedOrders([{ id: 1, status: 'en_attente' }]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        const lancerButton = screen.getByRole('button', {
          name: /lancer la préparation de la commande 1/i,
        });
        expect(lancerButton).toBeInTheDocument();
      });
    });

    it('devrait avoir des aria-label sur les boutons TERMINER', async () => {
      // Arrange
      await seedOrders([{ id: 1, status: 'en_preparation' }]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        const terminerButton = screen.getByRole('button', {
          name: /marquer la commande 1 comme prête/i,
        });
        expect(terminerButton).toBeInTheDocument();
      });
    });
  });

  describe('Layout et structure', () => {
    it('devrait avoir un layout flex avec header et board', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const header = screen.getByText('Kitchen Display').closest('header');
      expect(header).toBeInTheDocument();

      const board = screen.getByRole('region', { name: /tableau des commandes kds/i });
      expect(board).toBeInTheDocument();
    });

    it('devrait avoir 3 sections pour les colonnes', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const sections = document.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(3);
    });
  });
});

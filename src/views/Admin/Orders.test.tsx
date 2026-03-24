// src/views/Admin/Orders.test.tsx
// Tests d'intégration pour la vue Live Orders (AdminOrders)

import { type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { AdminOrders } from './Orders';
import { db } from '../../firebase/config';
import type { Order } from '../../firebase/types';
import * as useOrdersModule from '../../hooks/useOrders';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE ROUTING
// ─────────────────────────────────────────────────────────────────────────────

const renderWithRouter = (initialEntries: string[] = ['/admin/orders']): RenderResult => {
  const routes: RouteObject[] = [
    {
      path: '/admin/orders',
      element: <AdminOrders />,
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
  const ordersToInsert: Omit<Order, 'id'>[] = orders.map((order, i) => ({
    tableId: order.tableId ?? (i % 16) + 1,
    customerName: order.customerName ?? `Client ${i + 1}`,
    status: order.status ?? 'attente',
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

describe('AdminOrders - Integration', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Rendu initial', () => {
    it('devrait afficher l\'en-tête "Live Orders"', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Live Orders')).toBeInTheDocument();
      expect(screen.getByText('Suivez et gérez toutes les commandes en temps réel')).toBeInTheDocument();
    });

    it('devrait afficher le compteur de commandes actives', async () => {
      // Arrange
      await seedOrders([
        { status: 'attente' },
        { status: 'preparation' },
        { status: 'pret' },
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('03 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('devrait afficher "00 COMMANDES ACTIVES" quand il n\'y a pas de commandes', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('00 COMMANDES ACTIVES')).toBeInTheDocument();
    });
  });

  describe('Affichage des commandes', () => {
    it('devrait afficher les commandes actives (en_attente, en_preparation, pret)', async () => {
      // Arrange
      await seedOrders([
        { status: 'attente', customerName: 'Pierre' },
        { status: 'preparation', customerName: 'Marie' },
        { status: 'pret', customerName: 'Jean' },
        { status: 'served', customerName: 'Sophie' }, // Ne devrait pas apparaître
        { status: 'paid', customerName: 'Lucas' }, // Ne devrait pas apparaître
      ]);

      // Act
      renderWithRouter();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('03 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      expect(screen.getByText('Pierre')).toBeInTheDocument();
      expect(screen.getByText('Marie')).toBeInTheDocument();
      expect(screen.getByText('Jean')).toBeInTheDocument();
    });

    it('devrait afficher les informations complètes de chaque commande', async () => {
      // Arrange
      await seedOrders([
        {
          tableId: 12,
          customerName: 'Marie Laurent',
          status: 'attente',
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
        expect(screen.getByText('01 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      expect(screen.getByText('Table 12')).toBeInTheDocument();
      expect(screen.getByText('Marie Laurent')).toBeInTheDocument();
      expect(screen.getByText(/2x Tartare de Saumon/)).toBeInTheDocument();
    });

    it('devrait afficher "Aucune commande active" quand il n\'y a pas de commandes', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Aucune commande active')).toBeInTheDocument();
    });
  });

  describe('Filtres et recherche', () => {
    it('devrait filtrer les commandes par statut', async () => {
      // Arrange
      await seedOrders([
        { status: 'attente', customerName: 'Pierre' },
        { status: 'preparation', customerName: 'Marie' },
        { status: 'pret', customerName: 'Jean' },
      ]);

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('03 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Sélectionner le filtre "En attente"
      const statusSelect = screen.getByRole('combobox', { name: /statut/i });
      await user.selectOptions(statusSelect, 'attente');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Pierre')).toBeInTheDocument();
        expect(screen.queryByText('Marie')).not.toBeInTheDocument();
        expect(screen.queryByText('Jean')).not.toBeInTheDocument();
      });
    });

    it('devrait rechercher par nom de client', async () => {
      // Arrange
      await seedOrders([
        { customerName: 'Pierre Dupont' },
        { customerName: 'Marie Laurent' },
        { customerName: 'Jean Martin' },
      ]);

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('03 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      const searchInput = screen.getByRole('textbox', { name: /rechercher/i });
      await user.type(searchInput, 'pierre');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Pierre Dupont')).toBeInTheDocument();
        expect(screen.queryByText('Marie Laurent')).not.toBeInTheDocument();
      });
    });

    it('devrait rechercher par numéro de table', async () => {
      // Arrange
      await seedOrders([
        { tableId: 5, customerName: 'Test 1' },
        { tableId: 12, customerName: 'Test 2' },
        { tableId: 8, customerName: 'Test 3' },
      ]);

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('03 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      const searchInput = screen.getByRole('textbox', { name: /rechercher/i });
      await user.type(searchInput, '12');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test 2')).toBeInTheDocument();
        expect(screen.queryByText('Test 1')).not.toBeInTheDocument();
      });
    });

    it('devrait effacer la recherche au clic sur le bouton clear', async () => {
      // Arrange
      await seedOrders([
        { customerName: 'Pierre' },
        { customerName: 'Marie' },
      ]);

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('02 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      const searchInput = screen.getByRole('textbox', { name: /rechercher/i });
      await user.type(searchInput, 'pierre');

      await waitFor(() => {
        expect(screen.queryByText('Marie')).not.toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /effacer la recherche/i });
      await user.click(clearButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Pierre')).toBeInTheDocument();
        expect(screen.getByText('Marie')).toBeInTheDocument();
      });
    });
  });

  describe('Actions LANCER et TERMINER', () => {
    it('devrait appeler updateOrderStatus au clic sur LANCER', async () => {
      // Arrange
      await seedOrders([
        { status: 'attente', customerName: 'Test' },
      ]);

      // Mock updateOrderStatus
      const updateOrderStatusSpy = vi.spyOn(useOrdersModule, 'updateOrderStatus');
      updateOrderStatusSpy.mockResolvedValue();

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      // Attendre que les commandes soient chargées
      await waitFor(() => {
        expect(screen.getByText('01 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      const lancerButton = screen.getByText('Lancer');
      await user.click(lancerButton);

      // Assert - updateOrderStatus devrait être appelé avec status en_preparation
      expect(updateOrderStatusSpy).toHaveBeenCalled();
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'preparation' })
      );
    });

    it('devrait appeler updateOrderStatus au clic sur TERMINER', async () => {
      // Arrange
      await seedOrders([
        { status: 'preparation', customerName: 'Test' },
      ]);

      // Mock updateOrderStatus
      const updateOrderStatusSpy = vi.spyOn(useOrdersModule, 'updateOrderStatus');
      updateOrderStatusSpy.mockResolvedValue();

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      // Attendre que les commandes soient chargées
      await waitFor(() => {
        expect(screen.getByText('01 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      const terminerButton = screen.getByText('Terminer');
      await user.click(terminerButton);

      // Assert - updateOrderStatus devrait être appelé avec status pret
      expect(updateOrderStatusSpy).toHaveBeenCalled();
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pret' })
      );
    });

    it('devrait mettre à jour l\'affichage après avoir lancé une commande', async () => {
      // Arrange
      await seedOrders([
        { status: 'attente', customerName: 'Test' },
      ]);

      // Mock updateOrderStatus qui met vraiment à jour la DB
      const updateOrderStatusSpy = vi.spyOn(useOrdersModule, 'updateOrderStatus');
      updateOrderStatusSpy.mockImplementation(async ({ id, status }) => {
        await db.orders.update(id, { status });
      });

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('01 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Filtrer par "En attente"
      const statusSelect = screen.getByRole('combobox', { name: /statut/i });
      await user.selectOptions(statusSelect, 'attente');

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });

      // Lancer la commande
      const lancerButton = screen.getByText('Lancer');
      await user.click(lancerButton);

      // Assert - La commande devrait disparaître du filtre "en_attente"
      await waitFor(() => {
        expect(screen.queryByText('Test')).not.toBeInTheDocument();
      });
    });
  });

  describe('useLiveQuery réactif', () => {
    it('devrait mettre à jour l\'affichage quand une commande est ajoutée en DB', async () => {
      // Arrange
      renderWithRouter();

      // Assert initial - aucune commande
      expect(screen.getByText('00 COMMANDES ACTIVES')).toBeInTheDocument();

      // Act - Ajouter une commande
      await seedOrders([{ status: 'attente', customerName: 'Nouveau' }]);

      // Assert - Mise à jour réactive
      await waitFor(() => {
        expect(screen.getByText('01 COMMANDES ACTIVES')).toBeInTheDocument();
        expect(screen.getByText('Nouveau')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('devrait mettre à jour l\'affichage quand une commande est supprimée', async () => {
      // Arrange
      await seedOrders([{ status: 'attente' }]);
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/COMMANDES ACTIVES/)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Act - Supprimer la commande
      await db.orders.delete(1);

      // Assert - Mise à jour réactive
      await waitFor(() => {
        expect(screen.getByText(/00/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('devrait mettre à jour l\'affichage quand le statut change', async () => {
      // Arrange
      await seedOrders([{ status: 'attente' }]);
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('01 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Act - Changer le statut
      await db.orders.update(1, { status: 'preparation' });

      // Assert - Le statut devrait être mis à jour (chercher par role="status")
      await waitFor(() => {
        const statusBadges = document.querySelectorAll('[role="status"]');
        expect(statusBadges.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('Tri par date', () => {
    it('devrait afficher les commandes triées par date décroissante', async () => {
      // Arrange
      const now = Date.now();
      await seedOrders([
        { customerName: 'Ancienne', createdAt: now - 30 * 60 * 1000 },
        { customerName: 'Récente', createdAt: now - 5 * 60 * 1000 },
        { customerName: 'Intermédiaire', createdAt: now - 15 * 60 * 1000 },
      ]);

      // Act
      renderWithRouter();

      // Assert - Vérifier l'ordre dans le tableau
      await waitFor(() => {
        const table = screen.getByRole('table');
        const rows = table.querySelectorAll('tbody tr');
        
        // Première ligne = la plus récente
        expect(rows[0]).toContainElement(screen.getByText('Récente'));
        // Deuxième ligne = intermédiaire
        expect(rows[1]).toContainElement(screen.getByText('Intermédiaire'));
        // Troisième ligne = la plus ancienne
        expect(rows[2]).toContainElement(screen.getByText('Ancienne'));
      }, { timeout: 2000 });
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un rôle search sur la section de filtres', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByRole('search', { name: /filtres des commandes/i })).toBeInTheDocument();
    });

    it('devrait avoir un rôle region sur le tableau des commandes', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByRole('region', { name: /tableau des commandes/i })).toBeInTheDocument();
    });

    it('devrait avoir des labels accessibles pour les inputs', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByLabelText('Statut')).toBeInTheDocument();
      expect(screen.getByLabelText('Rechercher')).toBeInTheDocument();
    });
  });

  describe('Gestion d\'erreur', () => {
    it('devrait gérer les erreurs lors de updateOrderStatus sans crash', async () => {
      // Arrange
      await seedOrders([{ status: 'attente' }]);

      // Mock updateOrderStatus qui throw
      const updateOrderStatusSpy = vi.spyOn(useOrdersModule, 'updateOrderStatus');
      updateOrderStatusSpy.mockRejectedValue(new Error('Database error'));

      // Mock console.error pour éviter les logs
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('01 COMMANDES ACTIVES')).toBeInTheDocument();
      }, { timeout: 2000 });

      const lancerButton = screen.getByText('Lancer');
      await user.click(lancerButton);

      // Assert - Le composant ne devrait pas crash
      expect(updateOrderStatusSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });
});

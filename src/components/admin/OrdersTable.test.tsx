// src/components/admin/OrdersTable.test.tsx
// Tests unitaires pour le composant OrdersTable

import { type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrdersTable, type OrdersTableProps } from './OrdersTable';
import type { Order } from '../../db/types';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE CRÉATION DE DONNÉES
// ─────────────────────────────────────────────────────────────────────────────

const createMockOrders = (count: number): Order[] => {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    tableId: (i % 16) + 1,
    customerName: `Client ${i + 1}`,
    status: (['en_attente', 'en_preparation', 'pret'] as const)[i % 3],
    items: [
      { name: `Item ${i + 1}`, quantity: (i % 3) + 1, station: 'FROID' },
    ],
    total: 20 + i * 10,
    createdAt: now - (i + 1) * 5 * 60 * 1000, // Chaque commande a 5min de plus
  }));
};

const renderOrdersTable = (
  propsOverrides: Partial<OrdersTableProps> = {}
): RenderResult => {
  const defaultProps: OrdersTableProps = {
    orders: createMockOrders(3),
    selectedStatus: 'all',
    searchQuery: '',
    onLaunch: vi.fn(),
    onComplete: vi.fn(),
  };

  return render(<OrdersTable {...defaultProps} {...propsOverrides} />);
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('OrdersTable', () => {
  describe('Rendu initial', () => {
    it('devrait afficher le tableau avec les en-têtes de colonnes', () => {
      // Arrange & Act
      renderOrdersTable();

      // Assert
      expect(screen.getByText('COMMANDE')).toBeInTheDocument();
      expect(screen.getByText('TABLE')).toBeInTheDocument();
      expect(screen.getByText('ITEMS')).toBeInTheDocument();
      expect(screen.getByText('TEMPS')).toBeInTheDocument();
      expect(screen.getByText('STATUT')).toBeInTheDocument();
      expect(screen.getByText('ACTIONS')).toBeInTheDocument();
    });

    it('devrait avoir les attributs d\'accessibilité sur le tableau', () => {
      // Arrange & Act
      renderOrdersTable();

      // Assert
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Commandes en direct');

      const region = screen.getByRole('region', { name: /tableau des commandes/i });
      expect(region).toBeInTheDocument();
    });

    it('devrait afficher les lignes de commandes', () => {
      // Arrange
      const orders = createMockOrders(3);

      // Act
      renderOrdersTable({ orders });

      // Assert
      expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
      expect(screen.getByText('#ORD-0002')).toBeInTheDocument();
      expect(screen.getByText('#ORD-0003')).toBeInTheDocument();
    });

    it('devrait afficher le footer avec le compteur de commandes', () => {
      // Arrange
      const orders = createMockOrders(5);

      // Act
      renderOrdersTable({ orders });

      // Assert
      expect(screen.getByText('5 commandes affichées')).toBeInTheDocument();
    });

    it('devrait afficher "1 commande affichée" au singulier pour une seule commande', () => {
      // Arrange
      const orders = createMockOrders(1);

      // Act
      renderOrdersTable({ orders });

      // Assert
      expect(screen.getByText('1 commande affichée')).toBeInTheDocument();
    });
  });

  describe('Filtrage par statut', () => {
    it('devrait afficher toutes les commandes quand selectedStatus est "all"', () => {
      // Arrange
      const orders = createMockOrders(6); // 2 de chaque statut

      // Act
      renderOrdersTable({ orders, selectedStatus: 'all' });

      // Assert
      expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
      expect(screen.getByText('#ORD-0002')).toBeInTheDocument();
      expect(screen.getByText('#ORD-0003')).toBeInTheDocument();
      expect(screen.getByText('#ORD-0004')).toBeInTheDocument();
      expect(screen.getByText('#ORD-0005')).toBeInTheDocument();
      expect(screen.getByText('#ORD-0006')).toBeInTheDocument();
    });

    it('devrait filtrer et afficher uniquement les commandes en_attente', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
        { id: 2, tableId: 2, customerName: 'Test 2', status: 'en_preparation', items: [], total: 20, createdAt: Date.now() },
        { id: 3, tableId: 3, customerName: 'Test 3', status: 'pret', items: [], total: 30, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, selectedStatus: 'en_attente' });

      // Assert
      expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
      expect(screen.queryByText('#ORD-0002')).not.toBeInTheDocument();
      expect(screen.queryByText('#ORD-0003')).not.toBeInTheDocument();
    });

    it('devrait filtrer et afficher uniquement les commandes en_preparation', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
        { id: 2, tableId: 2, customerName: 'Test 2', status: 'en_preparation', items: [], total: 20, createdAt: Date.now() },
        { id: 3, tableId: 3, customerName: 'Test 3', status: 'pret', items: [], total: 30, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, selectedStatus: 'en_preparation' });

      // Assert
      expect(screen.queryByText('#ORD-0001')).not.toBeInTheDocument();
      expect(screen.getByText('#ORD-0002')).toBeInTheDocument();
      expect(screen.queryByText('#ORD-0003')).not.toBeInTheDocument();
    });

    it('devrait filtrer et afficher uniquement les commandes pret', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
        { id: 2, tableId: 2, customerName: 'Test 2', status: 'en_preparation', items: [], total: 20, createdAt: Date.now() },
        { id: 3, tableId: 3, customerName: 'Test 3', status: 'pret', items: [], total: 30, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, selectedStatus: 'pret' });

      // Assert
      expect(screen.queryByText('#ORD-0001')).not.toBeInTheDocument();
      expect(screen.queryByText('#ORD-0002')).not.toBeInTheDocument();
      expect(screen.getByText('#ORD-0003')).toBeInTheDocument();
    });
  });

  describe('Recherche', () => {
    it('devrait rechercher par numéro de commande', () => {
      // Arrange
      const orders: Order[] = [
        { id: 123, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
        { id: 456, tableId: 2, customerName: 'Test 2', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, searchQuery: '123' });

      // Assert
      expect(screen.getByText('#ORD-0123')).toBeInTheDocument();
      expect(screen.queryByText('#ORD-0456')).not.toBeInTheDocument();
    });

    it('devrait rechercher par numéro de table', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 5, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
        { id: 2, tableId: 12, customerName: 'Test 2', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, searchQuery: '12' });

      // Assert
      expect(screen.queryByText('#ORD-0001')).not.toBeInTheDocument();
      expect(screen.getByText('#ORD-0002')).toBeInTheDocument();
    });

    it('devrait rechercher par nom de client', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'Pierre Dupont', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
        { id: 2, tableId: 2, customerName: 'Marie Laurent', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, searchQuery: 'pierre' });

      // Assert
      expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
      expect(screen.queryByText('#ORD-0002')).not.toBeInTheDocument();
    });

    it('devrait rechercher par nom d\'item', () => {
      // Arrange
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test 1',
          status: 'en_attente',
          items: [{ name: 'Tartare de Saumon', quantity: 1, station: 'FROID' }],
          total: 10,
          createdAt: Date.now(),
        },
        {
          id: 2,
          tableId: 2,
          customerName: 'Test 2',
          status: 'en_attente',
          items: [{ name: 'Filet de Boeuf', quantity: 1, station: 'GRILL' }],
          total: 20,
          createdAt: Date.now(),
        },
      ];

      // Act
      renderOrdersTable({ orders, searchQuery: 'saumon' });

      // Assert
      expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
      expect(screen.queryByText('#ORD-0002')).not.toBeInTheDocument();
    });

    it('devrait être case-insensitive', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'PIERRE', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, searchQuery: 'pierre' });

      // Assert
      expect(screen.getByText('#ORD-0001')).toBeInTheDocument();
    });

    it('devrait afficher le compteur filtré après recherche', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'Pierre', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
        { id: 2, tableId: 2, customerName: 'Marie', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, searchQuery: 'pierre' });

      // Assert
      expect(screen.getByText('1 commande affichée')).toBeInTheDocument();
    });
  });

  describe('Tri par date décroissante', () => {
    it('devrait trier les commandes par createdAt décroissant (plus récent en premier)', () => {
      // Arrange
      const now = Date.now();
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'Ancienne', status: 'en_attente', items: [], total: 10, createdAt: now - 30 * 60 * 1000 },
        { id: 2, tableId: 2, customerName: 'Récente', status: 'en_attente', items: [], total: 20, createdAt: now - 5 * 60 * 1000 },
        { id: 3, tableId: 3, customerName: 'Intermédiaire', status: 'en_attente', items: [], total: 30, createdAt: now - 15 * 60 * 1000 },
      ];

      // Act
      renderOrdersTable({ orders, selectedStatus: 'all', searchQuery: '' });

      // Assert - Vérifier l'ordre dans le DOM (la plus récente en premier)
      const table = screen.getByRole('table');
      const rows = table.querySelectorAll('tbody tr');
      
      // La première ligne devrait être la plus récente (#ORD-0002)
      expect(rows[0]).toContainElement(screen.getByText('#ORD-0002'));
      // La deuxième ligne devrait être l'intermédiaire (#ORD-0003)
      expect(rows[1]).toContainElement(screen.getByText('#ORD-0003'));
      // La troisième ligne devrait être la plus ancienne (#ORD-0001)
      expect(rows[2]).toContainElement(screen.getByText('#ORD-0001'));
    });
  });

  describe('État vide', () => {
    it('devrait afficher "Aucune commande active" quand il n\'y a pas de commandes', () => {
      // Arrange & Act
      renderOrdersTable({ orders: [] });

      // Assert
      expect(screen.getByText('Aucune commande active')).toBeInTheDocument();
      expect(screen.getByText('receipt_long')).toBeInTheDocument();
    });

    it('devrait afficher "Aucune commande ne correspond aux filtres" avec filtre de statut', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'Test', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, selectedStatus: 'pret' });

      // Assert
      expect(screen.getByText('Aucune commande ne correspond aux filtres')).toBeInTheDocument();
    });

    it('devrait afficher "Aucune commande ne correspond aux filtres" avec recherche', () => {
      // Arrange
      const orders: Order[] = [
        { id: 1, tableId: 1, customerName: 'Pierre', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, searchQuery: 'marie' });

      // Assert
      expect(screen.getByText('Aucune commande ne correspond aux filtres')).toBeInTheDocument();
    });

    it('ne devrait PAS afficher le footer quand il n\'y a pas de commandes', () => {
      // Arrange & Act
      renderOrdersTable({ orders: [] });

      // Assert
      const footer = screen.queryByRole('contentinfo');
      expect(footer).not.toBeInTheDocument();
    });
  });

  describe('Appels des callbacks', () => {
    it('devrait appeler onLaunch avec le bon orderId', async () => {
      // Arrange
      const user = userEvent.setup();
      const onLaunch = vi.fn();
      const orders: Order[] = [
        { id: 42, tableId: 1, customerName: 'Test', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, onLaunch });

      // Act
      await user.click(screen.getByText('Lancer'));

      // Assert
      expect(onLaunch).toHaveBeenCalledWith(42);
    });

    it('devrait appeler onComplete avec le bon orderId', async () => {
      // Arrange
      const user = userEvent.setup();
      const onComplete = vi.fn();
      const orders: Order[] = [
        { id: 99, tableId: 1, customerName: 'Test', status: 'en_preparation', items: [], total: 10, createdAt: Date.now() },
      ];

      // Act
      renderOrdersTable({ orders, onComplete });

      // Act
      await user.click(screen.getByText('Terminer'));

      // Assert
      expect(onComplete).toHaveBeenCalledWith(99);
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un en-tête de tableau avec scope="col"', () => {
      // Arrange & Act
      renderOrdersTable();

      // Assert
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(1);
      headers.forEach((header) => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('devrait avoir une structure de tableau sémantique', () => {
      // Arrange & Act
      renderOrdersTable();

      // Assert
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(document.querySelector('thead')).toBeInTheDocument();
      expect(document.querySelector('tbody')).toBeInTheDocument();
    });
  });
});

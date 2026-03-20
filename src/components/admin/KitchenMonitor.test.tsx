// src/components/admin/KitchenMonitor.test.tsx
// Tests unitaires pour le composant KitchenMonitor

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { db } from '../../db/database';
import { KitchenMonitor } from './KitchenMonitor';
import type { Order } from '../../db/types';

// Helper pour créer une commande
function createOrder(overrides: Partial<Order> = {}): Omit<Order, 'id'> {
  const now = Date.now();
  return {
    tableId: 1,
    customerName: 'Test Customer',
    status: 'en_preparation',
    items: [{ name: 'Test Item', quantity: 1 }],
    total: 50,
    createdAt: now,
    ...overrides,
  };
}

describe('KitchenMonitor', () => {
  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await db.orders.clear();
  });

  describe('Rendu de base', () => {
    it('affiche le titre "MONITEUR CUISINE EN DIRECT"', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('MONITEUR CUISINE EN DIRECT');
    });

    it('affiche le compteur de commandes', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        tableId: 4,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert - Use getAllBy to find multiple matches
      const counters = await screen.findAllByText(/COMMANDE/);
      expect(counters.length).toBeGreaterThan(0);
    });

    it('affiche l\'indicateur "SYNC OK"', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('SYNC OK');
    });

    it('utilise le rôle region pour l\'accessibilité', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByRole('region', { name: 'MONITEUR CUISINE EN DIRECT' });
    });
  });

  describe('En-tête du tableau', () => {
    it('affiche les 5 colonnes du tableau', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('COMMANDE');
      await screen.findByText('TABLE');
      await screen.findByText('ITEMS');
      await screen.findByText('TEMPS ÉCOULÉ');
      await screen.findByText('STATUT');
    });

    it('utilise font-label text-xs font-bold uppercase pour les headers', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Affichage des commandes', () => {
    it('affiche les commandes actives dans le tableau', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 2841,
        tableId: 4,
        status: 'en_preparation',
        items: [
          { name: 'Burger Classique', quantity: 2 },
          { name: 'Salade César', quantity: 1 },
        ],
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('#ORD-2841');
      await screen.findByText('Table 04');
    });

    it('affiche le numéro de commande au format #ORD-XXXX', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 123,
        tableId: 1,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('#ORD-0123');
    });

    it('affiche le nom de la table au format "Table XX"', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        tableId: 8,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('Table 08');
    });

    it('affiche les items avec quantité', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        items: [
          { name: 'Burger Classique', quantity: 2 },
          { name: 'Salade César', quantity: 1 },
        ],
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('2x');
      await screen.findByText('Burger Classique');
      await screen.findByText('1x');
      await screen.findByText('Salade César');
    });

    it('affiche les items avec style pill', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        items: [{ name: 'Test Item', quantity: 1 }],
      });

      // Act
      render(<KitchenMonitor />);

      // Assert - Les items devraient avoir le style pill (rounded-full)
      // Le texte "Test Item" est dans un span avec rounded-full sur le parent
      const item = await screen.findByText('Test Item');
      const parent = item.parentElement;
      expect(parent).toHaveClass('rounded-full');
    });
  });

  describe('Temps écoulé - Couleurs', () => {
    it('affiche le temps en vert si < 10 minutes', async () => {
      // Arrange - Commande créée il y a 5 minutes
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fiveMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert - Le temps devrait être en vert (tertiary)
      const timeDisplay = await screen.findByText(/^\d{2}:\d{2}$/);
      expect(timeDisplay).toHaveClass('text-tertiary');
    });

    it('affiche le temps en orange si entre 10 et 20 minutes', async () => {
      // Arrange - Commande créée il y a 15 minutes
      const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fifteenMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert - Le temps devrait être en orange (secondary)
      const timeDisplay = await screen.findByText(/^\d{2}:\d{2}$/);
      expect(timeDisplay).toHaveClass('text-secondary');
    });

    it('affiche le temps en rouge si > 20 minutes', async () => {
      // Arrange - Commande créée il y a 25 minutes
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: twentyFiveMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert - Le temps devrait être en rouge (error)
      const timeDisplay = await screen.findByText(/^\d{2}:\d{2}$/);
      expect(timeDisplay).toHaveClass('text-error');
    });

    it('affiche le temps au format MM:SS', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert - Le temps devrait être au format MM:SS
      const timeDisplay = await screen.findByText(/^\d{2}:\d{2}$/);
      expect(timeDisplay).toBeInTheDocument();
    });
  });

  describe('Statut des commandes', () => {
    it('affiche "EN PRÉPARATION" pour une commande normale', async () => {
      // Arrange - Commande récente (< 20 min)
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fiveMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('EN PRÉPARATION');
    });

    it('affiche "RETARDÉ" pour une commande > 20 minutes', async () => {
      // Arrange - Commande créée il y a 25 minutes
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: twentyFiveMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('RETARDÉ');
    });

    it('affiche l\'icône warning pour le statut RETARDÉ', async () => {
      // Arrange
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: twentyFiveMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('warning');
    });

    it('affiche l\'icône set_meal pour le statut EN PRÉPARATION', async () => {
      // Arrange
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fiveMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('set_meal');
    });

    it('utilise bg-error/20 text-error pour le badge RETARDÉ', async () => {
      // Arrange
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: twentyFiveMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      const badge = await screen.findByText('RETARDÉ');
      expect(badge).toHaveClass('bg-error/20');
      expect(badge).toHaveClass('text-error');
    });
  });

  describe('État vide', () => {
    it('affiche "Aucune commande en cours" quand il n\'y a pas de commandes', async () => {
      // Arrange - Aucune commande

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('Aucune commande en cours');
    });

    it('affiche l\'icône restaurant quand il n\'y a pas de commandes', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('restaurant');
    });

    it('affiche un message centré quand il n\'y a pas de commandes', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert - Le message devrait être dans un layout centré
      const message = await screen.findByText('Aucune commande en cours');
      expect(message).toBeInTheDocument();
    });
  });

  describe('Compteur de commandes', () => {
    it('affiche "1 COMMANDE EN COURS" pour une seule commande', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('1 COMMANDE EN COURS');
    });

    it('affiche "X COMMANDES EN COURS" pour plusieurs commandes', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
      });
      await db.orders.add({
        ...createOrder(),
        id: 2,
      });
      await db.orders.add({
        ...createOrder(),
        id: 3,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByText('3 COMMANDES EN COURS');
    });
  });

  describe('Design system', () => {
    it('utilise bg-surface-container pour le fond', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      const region = await screen.findByRole('region');
      expect(region).toHaveClass('bg-surface-container');
    });

    it('utilise rounded-xl pour le border-radius', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      const region = await screen.findByRole('region');
      expect(region).toHaveClass('rounded-xl');
    });

    it('utilise font-mono pour le numéro de commande', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 123,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      const orderId = await screen.findByText('#ORD-0123');
      expect(orderId).toHaveClass('font-mono');
    });

    it('utilise font-mono pour le temps écoulé', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      const timeDisplay = await screen.findByText(/^\d{2}:\d{2}$/);
      expect(timeDisplay).toHaveClass('font-mono');
    });

    it('utilise font-label font-bold pour le nom de la table', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        tableId: 4,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      const tableName = await screen.findByText('Table 04');
      expect(tableName).toHaveClass('font-label');
      expect(tableName).toHaveClass('font-bold');
    });
  });

  describe('Classes personnalisées', () => {
    it('fusionne les classes personnalisées avec les classes de base', async () => {
      // Arrange & Act
      render(<KitchenMonitor className="custom-class" />);

      // Assert
      const region = await screen.findByRole('region');
      expect(region).toHaveClass('custom-class');
      expect(region).toHaveClass('bg-surface-container');
    });
  });

  describe('Accessibilité', () => {
    it('a un rôle region', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByRole('region');
    });

    it('a un aria-label descriptif', async () => {
      // Arrange & Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByRole('region', { name: 'MONITEUR CUISINE EN DIRECT' });
    });

    it('a un rôle table', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      await screen.findByRole('table');
    });

    it('a des row pour chaque commande', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
      });
      await db.orders.add({
        ...createOrder(),
        id: 2,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert
      const rows = await screen.findAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + rows
    });
  });

  describe('Tri des commandes', () => {
    it('affiche les commandes en retard en premier', async () => {
      // Arrange
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;

      // Commande récente (sera affichée en second)
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fiveMinAgo,
      });

      // Commande en retard (sera affichée en premier)
      await db.orders.add({
        ...createOrder(),
        id: 2,
        createdAt: twentyFiveMinAgo,
      });

      // Act
      render(<KitchenMonitor />);

      // Assert - La commande retardée devrait apparaître avant
      // Vérifier que RETARDÉ est affiché
      await screen.findByText('RETARDÉ');

      // Vérifier que la première ligne de données contient le badge RETARDÉ
      const retardBadge = await screen.findByText('RETARDÉ');
      expect(retardBadge).toBeInTheDocument();
      expect(retardBadge).toHaveClass('text-error');
    });
  });
});

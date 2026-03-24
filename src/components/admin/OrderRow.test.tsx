// src/components/admin/OrderRow.test.tsx
// Tests unitaires pour le composant OrderRow

import { type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderRow, type OrderRowProps } from './OrderRow';
import type { Order } from '../../firebase/types';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE CREATION DE DONNÉES
// ─────────────────────────────────────────────────────────────────────────────

const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  tableId: 5,
  customerName: 'Jean Dupont',
  status: 'attente',
  items: [
    { name: 'Tartare de Saumon', quantity: 2, station: 'FROID' },
    { name: 'Filet de Boeuf', quantity: 1, station: 'GRILL', customization: 'À point' },
  ],
  total: 45.50,
  createdAt: Date.now() - 5 * 60 * 1000, // Il y a 5 minutes
  ...overrides,
});

const renderOrderRow = (
  propsOverrides: Partial<OrderRowProps> = {}
): RenderResult => {
  const defaultProps: OrderRowProps = {
    order: createMockOrder(),
    onLaunch: vi.fn(),
    onComplete: vi.fn(),
  };

  return render(
    <table>
      <tbody>
        <OrderRow {...defaultProps} {...propsOverrides} />
      </tbody>
    </table>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('OrderRow', () => {
  describe('Rendu initial', () => {
    it('devrait afficher le numéro de commande au format #ORD-XXXX', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ id: 42 }) });

      // Assert
      expect(screen.getByText('#ORD-0042')).toBeInTheDocument();
    });

    it('devrait afficher l\'heure de création de la commande', () => {
      // Arrange
      const createdAt = Date.now() - 10 * 60 * 1000;
      const order = createMockOrder({ createdAt });

      // Act
      renderOrderRow({ order });

      // Assert
      const timeString = new Date(createdAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(screen.getByText(timeString)).toBeInTheDocument();
    });

    it('devrait afficher le numéro de table', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ tableId: 12 }) });

      // Assert
      expect(screen.getByText('Table 12')).toBeInTheDocument();
    });

    it('devrait afficher le nom du client', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ customerName: 'Marie Laurent' }) });

      // Assert
      expect(screen.getByText('Marie Laurent')).toBeInTheDocument();
    });

    it('devrait afficher "Client" par défaut si customerName est absent', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ customerName: undefined }) });

      // Assert
      expect(screen.getByText('Client')).toBeInTheDocument();
    });

    it('devrait afficher le résumé des items avec quantités', () => {
      // Arrange
      const order = createMockOrder({
        items: [
          { name: 'Item 1', quantity: 2, station: 'FROID' },
          { name: 'Item 2', quantity: 1, station: 'GRILL' },
        ],
      });

      // Act
      renderOrderRow({ order });

      // Assert
      expect(screen.getByText('2x Item 1, 1x Item 2')).toBeInTheDocument();
    });

    it('devrait avoir un attribut role="row" sur la ligne', () => {
      // Arrange & Act
      renderOrderRow();

      // Assert
      const row = screen.getByRole('row', { name: /commande 1, table 5/i });
      expect(row).toBeInTheDocument();
      expect(row).toHaveAttribute('aria-label', 'Commande 1, table 5');
    });
  });

  describe('Affichage du statut', () => {
    it('devrait afficher le badge "EN ATTENTE" pour le statut en_attente', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ status: 'attente' }) });

      // Assert
      expect(screen.getByText('EN ATTENTE')).toBeInTheDocument();
    });

    it('devrait afficher le badge "EN PRÉPARATION" pour le statut en_preparation', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ status: 'preparation' }) });

      // Assert
      expect(screen.getByText('EN PRÉPARATION')).toBeInTheDocument();
    });

    it('devrait afficher le badge "PRÊT" pour le statut pret', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ status: 'pret' }) });

      // Assert
      expect(screen.getByText('PRÊT')).toBeInTheDocument();
    });

    it('devrait avoir un indicateur coloré (point) dans le badge de statut', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ status: 'attente' }) });

      // Assert - Le badge contient un point indicateur
      const badge = document.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Timer et couleurs', () => {
    it('devrait afficher le timer avec le temps écoulé', () => {
      // Arrange - Commande créée il y a 5 minutes
      const order = createMockOrder({ createdAt: Date.now() - 5 * 60 * 1000 });

      // Act
      renderOrderRow({ order });

      // Assert
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });

    it('devrait avoir le timer en blanc (text-on-surface) pour 0-10min', () => {
      // Arrange - Commande créée il y a 5 minutes
      const order = createMockOrder({ createdAt: Date.now() - 5 * 60 * 1000 });

      // Act
      renderOrderRow({ order });

      // Assert
      const timer = screen.getByRole('status', { name: /temps écoulé/i });
      expect(timer).toBeInTheDocument();
    });

    it('devrait avoir le timer en orange (text-secondary) pour 10-20min', () => {
      // Arrange - Commande créée il y a 15 minutes
      const order = createMockOrder({ createdAt: Date.now() - 15 * 60 * 1000 });

      // Act
      renderOrderRow({ order });

      // Assert
      const timer = screen.getByText('15:00');
      expect(timer).toHaveClass('text-secondary');
    });

    it('devrait avoir le timer en rouge (text-error) pour 20min+', () => {
      // Arrange - Commande créée il y a 25 minutes
      const order = createMockOrder({ createdAt: Date.now() - 25 * 60 * 1000 });

      // Act
      renderOrderRow({ order });

      // Assert
      const timer = screen.getByText('25:00');
      expect(timer).toHaveClass('text-error');
    });

    it('devrait afficher l\'icône warning quand le timer est en danger (>20min)', () => {
      // Arrange - Commande créée il y a 25 minutes
      const order = createMockOrder({ createdAt: Date.now() - 25 * 60 * 1000 });

      // Act
      renderOrderRow({ order });

      // Assert
      expect(screen.getByText('warning')).toBeInTheDocument();
      expect(screen.getByText('warning')).toHaveAttribute('aria-label', "Temps d'attente critique");
    });

    it('ne devrait PAS afficher l\'icône warning pour un timer normal (<10min)', () => {
      // Arrange - Commande créée il y a 5 minutes
      const order = createMockOrder({ createdAt: Date.now() - 5 * 60 * 1000 });

      // Act
      renderOrderRow({ order });

      // Assert
      expect(screen.queryByText('warning')).not.toBeInTheDocument();
    });
  });

  describe('Boutons d\'action', () => {
    describe('Bouton LANCER (statut en_attente)', () => {
      it('devrait afficher le bouton LANCER pour une commande en_attente', () => {
        // Arrange & Act
        renderOrderRow({ order: createMockOrder({ status: 'attente' }) });

        // Assert
        expect(screen.getByRole('button', { name: /lancer la préparation/i })).toBeInTheDocument();
        expect(screen.getByText('Lancer')).toBeInTheDocument();
      });

      it('devrait appeler onLaunch au clic sur le bouton LANCER', async () => {
        // Arrange
        const user = userEvent.setup();
        const onLaunch = vi.fn();
        renderOrderRow({
          order: createMockOrder({ id: 42, status: 'attente' }),
          onLaunch,
        });

        // Act
        await user.click(screen.getByText('Lancer'));

        // Assert
        expect(onLaunch).toHaveBeenCalledWith(42);
        expect(onLaunch).toHaveBeenCalledTimes(1);
      });

      it('devrait avoir le bouton LANCER avec la classe bg-primary-container', () => {
        // Arrange & Act
        renderOrderRow({ order: createMockOrder({ status: 'attente' }) });

        // Assert
        const button = screen.getByText('Lancer');
        expect(button).toHaveClass('bg-primary-container');
      });
    });

    describe('Bouton TERMINER (statut en_preparation)', () => {
      it('devrait afficher le bouton TERMINER pour une commande en_preparation', () => {
        // Arrange & Act
        renderOrderRow({ order: createMockOrder({ status: 'preparation' }) });

        // Assert
        expect(screen.getByRole('button', { name: /marquer la commande.*comme prête/i })).toBeInTheDocument();
        expect(screen.getByText('Terminer')).toBeInTheDocument();
      });

      it('devrait appeler onComplete au clic sur le bouton TERMINER', async () => {
        // Arrange
        const user = userEvent.setup();
        const onComplete = vi.fn();
        renderOrderRow({
          order: createMockOrder({ id: 99, status: 'preparation' }),
          onComplete,
        });

        // Act
        await user.click(screen.getByText('Terminer'));

        // Assert
        expect(onComplete).toHaveBeenCalledWith(99);
        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      it('devrait avoir le bouton TERMINER avec la classe bg-tertiary-container', () => {
        // Arrange & Act
        renderOrderRow({ order: createMockOrder({ status: 'preparation' }) });

        // Assert
        const button = screen.getByText('Terminer');
        expect(button).toHaveClass('bg-tertiary-container');
      });
    });

    describe('Aucun bouton (statut pret)', () => {
      it('ne devrait PAS afficher de bouton pour une commande pret', () => {
        // Arrange & Act
        renderOrderRow({ order: createMockOrder({ status: 'pret' }) });

        // Assert
        expect(screen.queryByText('Lancer')).not.toBeInTheDocument();
        expect(screen.queryByText('Terminer')).not.toBeInTheDocument();
      });

      it('devrait afficher "Complète" pour une commande pret', () => {
        // Arrange & Act
        renderOrderRow({ order: createMockOrder({ status: 'pret' }) });

        // Assert
        expect(screen.getByText('Complète')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un aria-label sur la ligne du tableau', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ id: 10, tableId: 7 }) });

      // Assert
      const row = screen.getByRole('row');
      expect(row).toHaveAttribute('aria-label', 'Commande 10, table 7');
    });

    it('devrait avoir un aria-label sur le bouton LANCER', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ id: 5, status: 'attente' }) });

      // Assert
      const button = screen.getByRole('button', { name: /lancer la préparation de la commande 5/i });
      expect(button).toBeInTheDocument();
    });

    it('devrait avoir un aria-label sur le bouton TERMINER', () => {
      // Arrange & Act
      renderOrderRow({ order: createMockOrder({ id: 5, status: 'preparation' }) });

      // Assert
      const button = screen.getByRole('button', { name: /marquer la commande 5 comme prête/i });
      expect(button).toBeInTheDocument();
    });

    it('devrait avoir role="status" sur le badge de statut', () => {
      // Arrange & Act
      renderOrderRow();

      // Assert - Le badge de statut a role="status"
      const badge = document.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });

    it('devrait avoir aria-label sur l\'icône warning', () => {
      // Arrange
      const order = createMockOrder({ createdAt: Date.now() - 25 * 60 * 1000 });

      // Act
      renderOrderRow({ order });

      // Assert
      const warningIcon = screen.getByText('warning');
      expect(warningIcon).toHaveAttribute('aria-label', "Temps d'attente critique");
    });
  });

  describe('Effets de survol et transitions', () => {
    it('devrait avoir la classe hover:bg-surface-container-highest/30 sur la ligne', () => {
      // Arrange & Act
      renderOrderRow();

      // Assert
      const row = screen.getByRole('row');
      expect(row).toHaveClass('hover:bg-surface-container-highest/30');
    });

    it('devrait avoir la classe transition-colors sur la ligne', () => {
      // Arrange & Act
      renderOrderRow();

      // Assert
      const row = screen.getByRole('row');
      expect(row).toHaveClass('transition-colors');
    });
  });

  describe('Gestion des items longs', () => {
    it('devrait tronquer les items longs avec un title', () => {
      // Arrange
      const order = createMockOrder({
        items: [
          { name: 'Item très long qui dépasse', quantity: 1, station: 'FROID' },
          { name: 'Autre item très long aussi', quantity: 1, station: 'GRILL' },
        ],
      });

      // Act
      renderOrderRow({ order });

      // Assert
      const itemsCell = screen.getByText(/Item très long/i);
      expect(itemsCell).toHaveAttribute('title');
      expect(itemsCell).toHaveClass('truncate');
    });
  });
});

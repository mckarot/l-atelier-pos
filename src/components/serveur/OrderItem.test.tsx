// src/components/serveur/OrderItem.test.tsx
// Tests pour le composant OrderItem

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OrderItem as OrderItemType } from './types';
import { OrderItem } from './OrderItem';

const createMockItem = (overrides?: Partial<OrderItemType>): OrderItemType => ({
  id: 1,
  name: 'Entrecôte Maturée 300g',
  description: 'Viande maturée 28 jours',
  price: 34.00,
  quantity: 2,
  customization: 'Cuisson: Saignant, Frites',
  ...overrides,
});

describe('OrderItem', () => {
  describe('Rendu de base', () => {
    it('devrait afficher le nom de l\'article', () => {
      const item = createMockItem({ name: 'Tartare de Saumon' });
      render(<OrderItem item={item} />);
      expect(screen.getByText('Tartare de Saumon')).toBeInTheDocument();
    });

    it('devrait afficher la personnalisation', () => {
      const item = createMockItem({ customization: 'Sans gluten' });
      render(<OrderItem item={item} />);
      expect(screen.getByText('Sans gluten')).toBeInTheDocument();
    });

    it('devrait afficher la description', () => {
      const item = createMockItem({ description: 'Description test' });
      render(<OrderItem item={item} />);
      expect(screen.getByText('Description test')).toBeInTheDocument();
    });

    it('devrait afficher le prix', () => {
      const item = createMockItem({ price: 42.50 });
      render(<OrderItem item={item} />);
      expect(screen.getByText('€42.50')).toBeInTheDocument();
    });

    it('devrait afficher la quantité avec format 02', () => {
      const item = createMockItem({ quantity: 2 });
      render(<OrderItem item={item} />);
      expect(screen.getByText('02')).toBeInTheDocument();
    });

    it('devrait afficher la quantité avec format 01', () => {
      const item = createMockItem({ quantity: 1 });
      render(<OrderItem item={item} />);
      expect(screen.getByText('01')).toBeInTheDocument();
    });
  });

  describe('Contrôles de quantité', () => {
    it('devrait afficher le bouton decrement', () => {
      const item = createMockItem();
      render(<OrderItem item={item} />);
      expect(screen.getByLabelText('Diminuer la quantité')).toBeInTheDocument();
    });

    it('devrait afficher le bouton increment', () => {
      const item = createMockItem();
      render(<OrderItem item={item} />);
      expect(screen.getByLabelText('Augmenter la quantité')).toBeInTheDocument();
    });

    it('devrait appeler onQuantityChange avec -1 au decrement', async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      const item = createMockItem({ id: 5 });
      render(<OrderItem item={item} onQuantityChange={onQuantityChange} />);
      
      await user.click(screen.getByLabelText('Diminuer la quantité'));
      expect(onQuantityChange).toHaveBeenCalledWith(5, -1);
    });

    it('devrait appeler onQuantityChange avec +1 au increment', async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      const item = createMockItem({ id: 5 });
      render(<OrderItem item={item} onQuantityChange={onQuantityChange} />);
      
      await user.click(screen.getByLabelText('Augmenter la quantité'));
      expect(onQuantityChange).toHaveBeenCalledWith(5, 1);
    });

    it('devrait désactiver le bouton decrement quand quantity = 0', () => {
      const item = createMockItem({ quantity: 0 });
      render(<OrderItem item={item} />);
      const decrementButton = screen.getByLabelText('Diminuer la quantité');
      expect(decrementButton).toBeDisabled();
    });

    it('devrait activer le bouton decrement quand quantity > 0', () => {
      const item = createMockItem({ quantity: 1 });
      render(<OrderItem item={item} />);
      const decrementButton = screen.getByLabelText('Diminuer la quantité');
      expect(decrementButton).toBeEnabled();
    });
  });

  describe('Mode lecture seule', () => {
    it('devrait masquer les contrôles de quantité en readOnly', () => {
      const item = createMockItem();
      render(<OrderItem item={item} readOnly />);
      expect(screen.queryByLabelText('Diminuer la quantité')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Augmenter la quantité')).not.toBeInTheDocument();
    });

    it('devrait afficher la quantité en lecture seule', () => {
      const item = createMockItem({ quantity: 3 });
      render(<OrderItem item={item} readOnly />);
      expect(screen.getByText('03')).toBeInTheDocument();
    });

    it('ne devrait pas appeler onQuantityChange en readOnly', async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      const item = createMockItem();
      render(<OrderItem item={item} onQuantityChange={onQuantityChange} readOnly />);
      
      // Les boutons ne devraient pas exister
      expect(screen.queryByLabelText('Augmenter la quantité')).not.toBeInTheDocument();
      expect(onQuantityChange).not.toHaveBeenCalled();
    });
  });

  describe('Styles', () => {
    it('devrait avoir un style bg-surface-container', () => {
      const item = createMockItem();
      render(<OrderItem item={item} />);
      const card = screen.getByText('Entrecôte Maturée 300g').closest('div');
      expect(card).toHaveClass('bg-surface-container');
    });

    it('devrait avoir un style rounded-lg', () => {
      const item = createMockItem();
      render(<OrderItem item={item} />);
      const card = screen.getByText('Entrecôte Maturée 300g').closest('div');
      expect(card).toHaveClass('rounded-lg');
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir des aria-labels sur les boutons', () => {
      const item = createMockItem();
      render(<OrderItem item={item} />);
      expect(screen.getByLabelText('Diminuer la quantité')).toBeInTheDocument();
      expect(screen.getByLabelText('Augmenter la quantité')).toBeInTheDocument();
    });
  });
});

// src/components/client/CartItem.test.tsx
// Tests de composants pour CartItem

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartItem } from './CartItem';
import type { CartItem as CartItemType } from '../../hooks/useCart';
import type { MenuItem } from '../../firebase/types';

const mockMenuItem: MenuItem = {
  id: 1,
  name: 'Burger de l\'Atelier',
  description: 'Boeuf charolais',
  price: 19.50,
  category: 'plat',
  isAvailable: 1,
};

const mockCartItem: CartItemType = {
  menuItem: mockMenuItem,
  quantity: 2,
  customizations: ['Saignant'],
  cookingLevel: 'Saignant',
  supplements: [{ name: 'Bacon Croustillant', price: 3.00 }],
  subtotal: 45.00, // (19.50 + 3.00) * 2
};

describe('CartItem', () => {
  const mockOnUpdateQuantity = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    mockOnUpdateQuantity.mockClear();
    mockOnRemove.mockClear();
  });

  const defaultProps = {
    item: mockCartItem,
    index: 0,
    onUpdateQuantity: mockOnUpdateQuantity,
    onRemove: mockOnRemove,
  };

  describe('Rendu de base', () => {
    it('devrait afficher le nom de l\'item', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });

    it('devrait afficher le sous-total', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByText('45.00€')).toBeInTheDocument();
    });

    it('devrait afficher la quantité', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Personnalisations', () => {
    it('devrait afficher le niveau de cuisson', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByText('Saignant')).toBeInTheDocument();
    });

    it('devrait afficher les suppléments', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByText('Bacon Croustillant (+3.00€)')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône de cuisson', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByText('local_fire_department')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône de supplément', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByText('add_circle')).toBeInTheDocument();
    });

    it('ne devrait pas afficher les personnalisations si absentes', () => {
      // Arrange
      const itemWithoutCustomization: CartItemType = {
        menuItem: mockMenuItem,
        quantity: 1,
        subtotal: 19.50,
      };

      // Act
      render(
        <CartItem
          item={itemWithoutCustomization}
          index={0}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      );

      // Assert
      expect(screen.queryByText('local_fire_department')).not.toBeInTheDocument();
      expect(screen.queryByText('add_circle')).not.toBeInTheDocument();
    });
  });

  describe('Contrôles de quantité', () => {
    it('devrait afficher le bouton diminuer', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByLabelText('Diminuer la quantité')).toBeInTheDocument();
    });

    it('devrait afficher le bouton augmenter', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByLabelText('Augmenter la quantité')).toBeInTheDocument();
    });

    it('devrait appeler onUpdateQuantity avec -1 au clic sur diminuer', async () => {
      // Arrange
      render(<CartItem {...defaultProps} />);

      // Act
      await userEvent.click(screen.getByLabelText('Diminuer la quantité'));

      // Assert
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith(0, -1);
    });

    it('devrait appeler onUpdateQuantity avec +1 au clic sur augmenter', async () => {
      // Arrange
      render(<CartItem {...defaultProps} />);

      // Act
      await userEvent.click(screen.getByLabelText('Augmenter la quantité'));

      // Assert
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith(0, 1);
    });
  });

  describe('Bouton supprimer', () => {
    it('devrait afficher le bouton supprimer', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByLabelText('Supprimer l\'article')).toBeInTheDocument();
    });

    it('devrait appeler onRemove au clic', async () => {
      // Arrange
      render(<CartItem {...defaultProps} />);

      // Act
      await userEvent.click(screen.getByLabelText('Supprimer l\'article'));

      // Assert
      expect(mockOnRemove).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir des aria-label sur les boutons', () => {
      // Arrange & Act
      render(<CartItem {...defaultProps} />);

      // Assert
      expect(screen.getByLabelText('Diminuer la quantité')).toBeInTheDocument();
      expect(screen.getByLabelText('Augmenter la quantité')).toBeInTheDocument();
      expect(screen.getByLabelText('Supprimer l\'article')).toBeInTheDocument();
    });
  });
});

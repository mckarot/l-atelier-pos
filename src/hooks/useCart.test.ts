// src/hooks/useCart.test.ts
// Tests unitaires pour le hook useCart

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';
import type { MenuItem } from '../db/types';

const mockMenuItem: MenuItem = {
  id: 1,
  name: 'Burger de l\'Atelier',
  description: 'Boeuf charolais, cheddar affiné',
  price: 19.50,
  category: 'Plats',
  isAvailable: 1,
  customizationOptions: {
    cooking: ['Bleu', 'Saignant', 'À Point', 'Bien Cuit'],
    supplements: [
      { name: 'Double Fromage', price: 2.50 },
      { name: 'Bacon Croustillant', price: 3.00 },
    ],
  },
};

describe('useCart', () => {
  describe('Initial state', () => {
    it('devrait initialiser avec un panier vide', () => {
      // Arrange & Act
      const { result } = renderHook(() => useCart());

      // Assert
      expect(result.current.cart).toEqual([]);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.tax).toBe(0);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.orderType).toBe('sur_place');
    });
  });

  describe('addToCart', () => {
    it('devrait ajouter un item au panier', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      // Act
      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Assert
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].menuItem).toBe(mockMenuItem);
      expect(result.current.cart[0].quantity).toBe(1);
      expect(result.current.cart[0].subtotal).toBe(19.50);
    });

    it('devrait incrémenter la quantité si l\'item existe déjà', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      // Act - Ajouter le même item deux fois
      act(() => {
        result.current.addToCart(mockMenuItem);
        result.current.addToCart(mockMenuItem);
      });

      // Assert
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(2);
      expect(result.current.cart[0].subtotal).toBe(39.00);
    });

    it('devrait ajouter un item avec des suppléments', () => {
      // Arrange
      const { result } = renderHook(() => useCart());
      const supplements = [{ name: 'Bacon Croustillant', price: 3.00 }];

      // Act
      act(() => {
        result.current.addToCart(mockMenuItem, undefined, supplements);
      });

      // Assert
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].supplements).toEqual(supplements);
      expect(result.current.cart[0].subtotal).toBe(22.50); // 19.50 + 3.00
    });

    it('devrait ajouter un item avec un niveau de cuisson', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      // Act
      act(() => {
        result.current.addToCart(mockMenuItem, 'Saignant');
      });

      // Assert
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].cookingLevel).toBe('Saignant');
      expect(result.current.cart[0].customizations).toContain('Saignant');
    });

    it('devrait calculer correctement le sous-total avec plusieurs items', () => {
      // Arrange
      const { result } = renderHook(() => useCart());
      const menuItem2: MenuItem = {
        ...mockMenuItem,
        id: 2,
        name: 'Item 2',
        price: 15.00,
      };

      // Act
      act(() => {
        result.current.addToCart(mockMenuItem);
        result.current.addToCart(menuItem2);
      });

      // Assert
      expect(result.current.subtotal).toBe(34.50); // 19.50 + 15.00
    });
  });

  describe('updateQuantity', () => {
    it('devrait incrémenter la quantité d\'un item', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Act
      act(() => {
        result.current.updateQuantity(mockMenuItem.name, 1);
      });

      // Assert
      expect(result.current.cart[0].quantity).toBe(2);
      expect(result.current.cart[0].subtotal).toBe(39.00);
    });

    it('devrait décrémenter la quantité d\'un item', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
        result.current.addToCart(mockMenuItem);
      });

      // Act
      act(() => {
        result.current.updateQuantity(mockMenuItem.name, -1);
      });

      // Assert
      expect(result.current.cart[0].quantity).toBe(1);
      expect(result.current.cart[0].subtotal).toBe(19.50);
    });

    it('devrait supprimer l\'item si la quantité atteint 0', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Act
      act(() => {
        result.current.updateQuantity(mockMenuItem.name, -1);
      });

      // Assert
      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('updateQuantityByIndex', () => {
    it('devrait incrémenter la quantité par index', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Act
      act(() => {
        result.current.updateQuantityByIndex(0, 1);
      });

      // Assert
      expect(result.current.cart[0].quantity).toBe(2);
    });

    it('devrait supprimer l\'item si la quantité atteint 0', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Act
      act(() => {
        result.current.updateQuantityByIndex(0, -1);
      });

      // Assert
      expect(result.current.cart).toHaveLength(0);
    });

    it('devrait ignorer les index invalides', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Act - Index invalide
      act(() => {
        result.current.updateQuantityByIndex(99, 1);
      });

      // Assert
      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('removeFromCart', () => {
    it('devrait supprimer un item par nom', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Act
      act(() => {
        result.current.removeFromCart(mockMenuItem.name);
      });

      // Assert
      expect(result.current.cart).toHaveLength(0);
    });

    it('devrait ne rien faire si l\'item n\'existe pas', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Act
      act(() => {
        result.current.removeFromCart('Item Inexistant');
      });

      // Assert
      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('removeItemByIndex', () => {
    it('devrait supprimer un item par index', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Act
      act(() => {
        result.current.removeItemByIndex(0);
      });

      // Assert
      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('devrait vider le panier', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
        result.current.addToCart({ ...mockMenuItem, id: 2, name: 'Item 2' });
      });

      // Assert - Avant
      expect(result.current.cart).toHaveLength(2);

      // Act
      act(() => {
        result.current.clearCart();
      });

      // Assert - Après
      expect(result.current.cart).toHaveLength(0);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.tax).toBe(0);
      expect(result.current.total).toBe(0);
    });
  });

  describe('Calculations', () => {
    it('devrait calculer la TVA à 10%', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
      });

      // Assert - Utiliser toBeCloseTo pour les flottants
      expect(result.current.subtotal).toBeCloseTo(19.50, 2);
      expect(result.current.tax).toBeCloseTo(1.95, 2); // 10% de 19.50
      expect(result.current.total).toBeCloseTo(21.45, 2); // 19.50 + 1.95
    });

    it('devrait calculer le nombre total d\'items', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockMenuItem);
        result.current.addToCart(mockMenuItem);
        result.current.addToCart({ ...mockMenuItem, id: 2, name: 'Item 2' });
      });

      // Assert
      expect(result.current.itemCount).toBe(3); // 2 + 1
    });

    it('devrait calculer correctement avec des suppléments', () => {
      // Arrange
      const { result } = renderHook(() => useCart());
      const supplements = [
        { name: 'Double Fromage', price: 2.50 },
        { name: 'Bacon Croustillant', price: 3.00 },
      ];

      // Act
      act(() => {
        result.current.addToCart(mockMenuItem, undefined, supplements);
      });

      // Assert
      expect(result.current.subtotal).toBe(25.00); // 19.50 + 2.50 + 3.00
      expect(result.current.tax).toBe(2.50); // 10% de 25.00
      expect(result.current.total).toBe(27.50); // 25.00 + 2.50
    });
  });

  describe('orderType', () => {
    it('devrait initialiser avec "sur_place"', () => {
      // Arrange & Act
      const { result } = renderHook(() => useCart());

      // Assert
      expect(result.current.orderType).toBe('sur_place');
    });

    it('devrait permettre de changer le type de commande', () => {
      // Arrange
      const { result } = renderHook(() => useCart());

      // Act
      act(() => {
        result.current.setOrderType('emporter');
      });

      // Assert
      expect(result.current.orderType).toBe('emporter');
    });
  });
});

// src/hooks/useServerCart.test.ts
// Tests pour le hook useServerCart

import { renderHook, act } from '@testing-library/react';
import { useServerCart } from './useServerCart';
import type { MenuItem } from '../db/types';

const mockMenuItem: MenuItem = {
  id: 1,
  name: 'Burger de l\'Atelier',
  description: 'Burger délicieux',
  price: 19.50,
  category: 'plat',
  isAvailable: 1,
};

const mockMenuItem2: MenuItem = {
  id: 2,
  name: 'Café Gourmand',
  description: 'Café et mignardises',
  price: 8.50,
  category: 'dessert',
  isAvailable: 1,
};

describe('useServerCart', () => {
  beforeEach(() => {
    // Reset IndexedDB avant chaque test
  });

  it('devrait initialiser avec un panier vide', () => {
    const { result } = renderHook(() => useServerCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('devrait ajouter un item au panier', () => {
    const { result } = renderHook(() => useServerCart());

    act(() => {
      result.current.addItem(mockMenuItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      menuItemId: 1,
      name: 'Burger de l\'Atelier',
      price: 19.50,
      quantity: 1,
    });
    expect(result.current.total).toBe(19.50);
    expect(result.current.itemCount).toBe(1);
  });

  it('devrait ajouter un item avec supplements', () => {
    const { result } = renderHook(() => useServerCart());
    const supplements = [
      { name: 'Double Fromage', price: 2.50 },
      { name: 'Bacon', price: 3.00 },
    ];

    act(() => {
      result.current.addItem(mockMenuItem, supplements);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].supplements).toEqual(supplements);
    expect(result.current.total).toBe(19.50 + 2.50 + 3.00);
  });

  it('devrait ajouter un item avec notes', () => {
    const { result } = renderHook(() => useServerCart());
    const notes = 'Sans oignons';

    act(() => {
      result.current.addItem(mockMenuItem, undefined, notes);
    });

    expect(result.current.items[0].notes).toBe('Sans oignons');
  });

  it('devrait incrémenter la quantité si l\'item existe déjà', () => {
    const { result } = renderHook(() => useServerCart());

    act(() => {
      result.current.addItem(mockMenuItem);
      result.current.addItem(mockMenuItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBe(39.00);
    expect(result.current.itemCount).toBe(2);
  });

  it('devrait supprimer un item du panier', () => {
    const { result } = renderHook(() => useServerCart());

    act(() => {
      result.current.addItem(mockMenuItem);
      result.current.addItem(mockMenuItem2);
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem(mockMenuItem.id);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].menuItemId).toBe(2);
    expect(result.current.total).toBe(8.50);
  });

  it('devrait mettre à jour la quantité avec delta positif', () => {
    const { result } = renderHook(() => useServerCart());

    act(() => {
      result.current.addItem(mockMenuItem);
    });

    act(() => {
      result.current.updateQuantity(mockMenuItem.id, 2);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.total).toBe(58.50);
  });

  it('devrait mettre à jour la quantité avec delta négatif', () => {
    const { result } = renderHook(() => useServerCart());

    act(() => {
      result.current.addItem(mockMenuItem);
      result.current.addItem(mockMenuItem);
    });

    act(() => {
      result.current.updateQuantity(mockMenuItem.id, -1);
    });

    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.total).toBe(19.50);
  });

  it('devrait supprimer l\'item si la quantité devient <= 0', () => {
    const { result } = renderHook(() => useServerCart());

    act(() => {
      result.current.addItem(mockMenuItem);
    });

    act(() => {
      result.current.updateQuantity(mockMenuItem.id, -1);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('devrait vider le panier', () => {
    const { result } = renderHook(() => useServerCart());

    act(() => {
      result.current.addItem(mockMenuItem);
      result.current.addItem(mockMenuItem2);
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('devrait calculer correctement le total avec plusieurs items', () => {
    const { result } = renderHook(() => useServerCart());

    act(() => {
      result.current.addItem(mockMenuItem);
      result.current.addItem(mockMenuItem2);
      result.current.addItem(mockMenuItem2);
    });

    // Burger: 19.50 x 1 = 19.50
    // Café: 8.50 x 2 = 17.00
    // Total: 36.50
    expect(result.current.total).toBe(36.50);
    expect(result.current.itemCount).toBe(3);
  });

  it('devrait calculer le total avec supplements', () => {
    const { result } = renderHook(() => useServerCart());
    const supplements = [{ name: 'Supplement', price: 2.00 }];

    act(() => {
      result.current.addItem(mockMenuItem, supplements);
      result.current.addItem(mockMenuItem, supplements);
    });

    // (19.50 + 2.00) x 2 = 43.00
    expect(result.current.total).toBe(43.00);
  });
});

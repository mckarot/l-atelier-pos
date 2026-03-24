// src/hooks/useServerCart.ts
// Hook pour la gestion du panier serveur (éphémère, non persisté en Dexie)

import { useState, useCallback, useMemo } from 'react';
import type { MenuItem, Supplement } from '../firebase/types';
import { SUPPLEMENT_PRICES } from '../firebase/types';

/** Item du panier serveur */
export interface ServerCartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  supplements?: Supplement[];
}

/** Retour du hook useServerCart */
export interface UseServerCartReturn {
  items: ServerCartItem[];
  total: number;
  itemCount: number;
  addItem: (menuItem: MenuItem, supplements?: Supplement[], notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
}

/**
 * Hook pour gérer le panier serveur (éphémère)
 * Le panier n'est pas persisté en Dexie - il est réinitialisé à chaque rafraîchissement
 * @returns État et méthodes du panier
 */
export function useServerCart(): UseServerCartReturn {
  const [items, setItems] = useState<ServerCartItem[]>([]);

  // Calcul du nombre total d'articles
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Calcul du total du panier
  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const supplementTotal = item.supplements?.reduce((sum, s) => sum + SUPPLEMENT_PRICES[s], 0) || 0;
      return sum + (item.price + supplementTotal) * item.quantity;
    }, 0);
  }, [items]);

  // Ajouter un item au panier
  const addItem = useCallback((
    menuItem: MenuItem,
    supplements?: Supplement[],
    notes?: string
  ) => {
    setItems((prev) => {
      // Vérifier si l'item existe déjà avec les mêmes supplements
      const existingIndex = prev.findIndex((item) => {
        if (item.menuItemId !== menuItem.id) return false;

        // Comparer les supplements
        const prevSupplements = item.supplements || [];
        const newSupplements = supplements || [];

        if (prevSupplements.length !== newSupplements.length) return false;

        const prevNames = prevSupplements.sort().join(',');
        const newNames = newSupplements.sort().join(',');

        return prevNames === newNames;
      });

      if (existingIndex >= 0) {
        // Incrémenter la quantité
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        };
        return newItems;
      }

      // Ajouter un nouvel item
      return [
        ...prev,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes,
          supplements,
        },
      ];
    });
  }, []);

  // Supprimer un item du panier
  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  }, []);

  // Mettre à jour la quantité d'un item
  const updateQuantity = useCallback((menuItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) {
              return null;
            }
            return {
              ...item,
              quantity: newQuantity,
            };
          }
          return item;
        })
        .filter((item): item is ServerCartItem => item !== null);
    });
  }, []);

  // Vider le panier
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}

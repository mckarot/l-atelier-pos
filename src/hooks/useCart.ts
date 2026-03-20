// src/hooks/useCart.ts
// Hook pour la gestion du panier client

import { useState, useCallback, useMemo } from 'react';
import type { MenuItem, Supplement, CookingLevel } from '../db/types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations?: string[];
  supplements?: Supplement[];
  cookingLevel?: CookingLevel;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
}

export type OrderType = 'sur_place' | 'emporter';

const TAX_RATE = 0.10; // TVA 10%

/**
 * Hook pour la gestion du panier
 * @returns État et méthodes du panier
 */
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('sur_place');

  // Calcul du sous-total
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  // Calcul de la TVA
  const tax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);

  // Calcul du total
  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  // Ajouter un item au panier
  const addToCart = useCallback((
    menuItem: MenuItem,
    cookingLevel?: CookingLevel,
    supplements?: Supplement[]
  ) => {
    setCart((prev) => {
      // Créer une clé unique basée sur l'item et ses personnalisations
      const itemKey = `${menuItem.id}-${cookingLevel || ''}-${supplements?.map(s => s.name).sort().join(',') || ''}`;
      
      // Vérifier si l'item existe déjà avec les mêmes personnalisations
      const existingIndex = prev.findIndex((item) => {
        const existingKey = `${item.menuItem.id}-${item.cookingLevel || ''}-${item.supplements?.map(s => s.name).sort().join(',') || ''}`;
        return existingKey === itemKey;
      });

      if (existingIndex >= 0) {
        // Incrémenter la quantité
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + 1,
          subtotal: (newCart[existingIndex].quantity + 1) * (menuItem.price + (supplements?.reduce((sum, s) => sum + s.price, 0) || 0)),
        };
        return newCart;
      }

      // Ajouter un nouvel item
      const supplementPrice = supplements?.reduce((sum, s) => sum + s.price, 0) || 0;
      const itemSubtotal = menuItem.price + supplementPrice;

      const customizations: string[] = [];
      if (cookingLevel) customizations.push(cookingLevel);
      if (supplements) supplements.forEach(s => customizations.push(s.name));

      return [
        ...prev,
        {
          menuItem,
          quantity: 1,
          customizations,
          supplements,
          cookingLevel,
          subtotal: itemSubtotal,
        },
      ];
    });
  }, []);

  // Mettre à jour la quantité d'un item
  const updateQuantity = useCallback((itemName: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.menuItem.name === itemName) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            return {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * (item.subtotal / item.quantity),
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, []);

  // Mettre à jour la quantité par index
  const updateQuantityByIndex = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      const newCart = [...prev];
      if (index >= 0 && index < newCart.length) {
        const item = newCart[index];
        const newQuantity = item.quantity + delta;
        
        if (newQuantity <= 0) {
          return newCart.filter((_, i) => i !== index);
        }
        
        newCart[index] = {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * (item.subtotal / item.quantity),
        };
      }
      return newCart;
    });
  }, []);

  // Supprimer un item du panier
  const removeFromCart = useCallback((itemName: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.name !== itemName));
  }, []);

  // Supprimer un item par index
  const removeItemByIndex = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Vider le panier
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Nombre total d'items
  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    subtotal,
    tax,
    total,
    itemCount,
    orderType,
    setOrderType,
    addToCart,
    updateQuantity,
    updateQuantityByIndex,
    removeFromCart,
    removeItemByIndex,
    clearCart,
  };
}

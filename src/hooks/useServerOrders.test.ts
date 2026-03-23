// src/hooks/useServerOrders.test.ts
// Tests pour le hook useServerOrders

import { renderHook, act } from '@testing-library/react';
import { useServerOrders } from './useServerOrders';
import { db } from '../db/database';
import type { TableRecord, Order } from '../db/types';

const mockTable: TableRecord = {
  id: 1,
  status: 'libre',
  capacity: 4,
  sector: 'Salle principale',
};

const mockCartItem = {
  menuItemId: 1,
  name: 'Burger de l\'Atelier',
  price: 19.50,
  quantity: 2,
  notes: 'Sans oignons',
  supplements: [{ name: 'Double Fromage', price: 2.50 }],
};

const mockCartItem2 = {
  menuItemId: 2,
  name: 'Café Gourmand',
  price: 8.50,
  quantity: 1,
};

describe('useServerOrders', () => {
  beforeEach(async () => {
    // Nettoyer la base avant chaque test
    await db.orders.clear();
    await db.restaurantTables.clear();
    
    // Créer une table de test
    await db.restaurantTables.add(mockTable);
  });

  describe('createOrder', () => {
    it('devrait créer une nouvelle commande pour une table libre', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      expect(orderId).toBeDefined();
      expect(orderId!).toBeGreaterThan(0);

      // Vérifier que la commande a été créée
      const order = await db.orders.get(orderId!);
      expect(order).toBeDefined();
      expect(order?.tableId).toBe(1);
      expect(order?.customerName).toBe('Commande');
      expect(order?.status).toBe('en_attente');
      expect(order?.items).toHaveLength(1);
      expect(order?.items[0].name).toBe('Burger de l\'Atelier');
      expect(order?.items[0].quantity).toBe(2);
    });

    it('devrait créer une commande avec un nom de client', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem], 'Jean Dupont');
      });

      const order = await db.orders.get(orderId!);
      expect(order?.customerName).toBe('Jean Dupont');
    });

    it('devrait calculer correctement le total avec supplements', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      const order = await db.orders.get(orderId!);
      // (19.50 + 2.50) * 2 = 44.00
      expect(order?.total).toBe(44.00);
    });

    it('devrait mettre à jour le statut de la table à "occupee"', async () => {
      const { result } = renderHook(() => useServerOrders());

      await act(async () => {
        await result.current.createOrder(1, [mockCartItem]);
      });

      const table = await db.restaurantTables.get(1);
      expect(table?.status).toBe('occupee');
      expect(table?.currentOrderId).toBeDefined();
    });

    it('devrait créer une commande avec plusieurs items', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem, mockCartItem2]);
      });

      const order = await db.orders.get(orderId!);
      expect(order?.items).toHaveLength(2);
      // (19.50 + 2.50) * 2 + 8.50 * 1 = 52.50
      expect(order?.total).toBe(52.50);
    });
  });

  describe('addItemsToOrder', () => {
    it('devrait ajouter des items à une commande existante', async () => {
      const { result } = renderHook(() => useServerOrders());

      // Créer une commande initiale
      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      // Ajouter un nouvel item
      await act(async () => {
        await result.current.addItemsToOrder(orderId!, [mockCartItem2]);
      });

      const order = await db.orders.get(orderId!);
      expect(order?.items).toHaveLength(2);
      expect(order?.items[1].name).toBe('Café Gourmand');
    });

    it('devrait recalculer le total après ajout', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      await act(async () => {
        await result.current.addItemsToOrder(orderId!, [mockCartItem2]);
      });

      const order = await db.orders.get(orderId!);
      // Ancien total: 44.00 + Nouveau: 8.50 = 52.50
      expect(order?.total).toBe(52.50);
    });

    it('devrait mettre à jour updatedAt après ajout', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      const beforeUpdate = await db.orders.get(orderId!);
      const beforeTimestamp = beforeUpdate?.updatedAt;

      await act(async () => {
        await result.current.addItemsToOrder(orderId!, [mockCartItem2]);
      });

      const afterUpdate = await db.orders.get(orderId!);
      expect(afterUpdate?.updatedAt).toBeDefined();
      expect(afterUpdate?.updatedAt!).toBeGreaterThanOrEqual(beforeTimestamp || 0);
    });

    it('devrait lancer une erreur si la commande n\'existe pas', async () => {
      const { result } = renderHook(() => useServerOrders());

      await expect(
        act(async () => {
          await result.current.addItemsToOrder(999, [mockCartItem]);
        })
      ).rejects.toThrow('Commande 999 introuvable');
    });
  });

  describe('removeItemFromOrder', () => {
    it('devrait supprimer un item par son index', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem, mockCartItem2]);
      });

      await act(async () => {
        await result.current.removeItemFromOrder(orderId!, 0);
      });

      const order = await db.orders.get(orderId!);
      expect(order?.items).toHaveLength(1);
      expect(order?.items[0].name).toBe('Café Gourmand');
    });

    it('devrait recalculer le total après suppression', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem, mockCartItem2]);
      });

      // Total initial: 52.50
      const orderBefore = await db.orders.get(orderId!);
      expect(orderBefore?.total).toBe(52.50);

      await act(async () => {
        await result.current.removeItemFromOrder(orderId!, 0);
      });

      const order = await db.orders.get(orderId!);
      // Total après suppression du burger: 8.50
      expect(order?.total).toBe(8.50);
    });

    it('devrait mettre à jour updatedAt après suppression', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem, mockCartItem2]);
      });

      const beforeUpdate = await db.orders.get(orderId!);

      await act(async () => {
        await result.current.removeItemFromOrder(orderId!, 0);
      });

      const afterUpdate = await db.orders.get(orderId!);
      expect(afterUpdate?.updatedAt).toBeDefined();
      expect(afterUpdate?.updatedAt!).toBeGreaterThan(beforeUpdate?.updatedAt || 0);
    });

    it('devrait lancer une erreur si l\'index est hors limites', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      await expect(
        act(async () => {
          await result.current.removeItemFromOrder(orderId!, 5);
        })
      ).rejects.toThrow('Index 5 hors limites');
    });

    it('devrait lancer une erreur si la commande n\'existe pas', async () => {
      const { result } = renderHook(() => useServerOrders());

      await expect(
        act(async () => {
          await result.current.removeItemFromOrder(999, 0);
        })
      ).rejects.toThrow('Commande 999 introuvable');
    });
  });

  describe('updateItemQuantity', () => {
    it('devrait incrémenter la quantité d\'un item', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      await act(async () => {
        await result.current.updateItemQuantity(orderId!, 0, 1);
      });

      const order = await db.orders.get(orderId!);
      expect(order?.items[0].quantity).toBe(3);
    });

    it('devrait supprimer l\'item si la quantité devient <= 0', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      await act(async () => {
        await result.current.updateItemQuantity(orderId!, 0, -2);
      });

      const order = await db.orders.get(orderId!);
      expect(order?.items).toHaveLength(0);
    });
  });

  describe('updateOrderNotes', () => {
    it('devrait mettre à jour les notes d\'une commande', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      await act(async () => {
        await result.current.updateOrderNotes(orderId!, 'Table près de la fenêtre');
      });

      const order = await db.orders.get(orderId!);
      expect(order?.notes).toBe('Table près de la fenêtre');
    });
  });

  describe('completePayment', () => {
    it('devrait marquer la commande comme payée', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      await act(async () => {
        await result.current.completePayment(orderId!, 1, 'cb');
      });

      const order = await db.orders.get(orderId!);
      expect(order?.status).toBe('paye');
      expect(order?.paymentMethod).toBe('cb');
    });

    it('devrait libérer la table après paiement', async () => {
      const { result } = renderHook(() => useServerOrders());

      let orderId: number | undefined;
      await act(async () => {
        orderId = await result.current.createOrder(1, [mockCartItem]);
      });

      await act(async () => {
        await result.current.completePayment(orderId!, 1, 'cb');
      });

      const table = await db.restaurantTables.get(1);
      expect(table?.status).toBe('libre');
      expect(table?.currentOrderId).toBeUndefined();
    });
  });
});

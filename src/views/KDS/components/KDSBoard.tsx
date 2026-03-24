// src/views/KDS/components/KDSBoard.tsx
// Board KDS avec 3 colonnes (À préparer, En préparation, Prêt)

import { type JSX, useCallback, useMemo, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { getDb } from '../../../firebase/config';
import type { Order } from '../../../firebase/types';
import { KDSColumn } from './KDSColumn';
import { OrderCard } from './OrderCard';
import { calculateAveragePrepTime } from '../../../utils/timer';

/**
 * Hook personnalisé pour récupérer les commandes actives triées
 * Sépare les commandes par statut pour les 3 colonnes du KDS
 */
interface UseKDSOrdersReturn {
  ordersEnAttente: Order[];
  ordersEnPreparation: Order[];
  ordersPret: Order[];
  avgPrepTime: number;
}

function useKDSOrders(): UseKDSOrdersReturn {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  // Commandes actives (attente, preparation, pret)
  useEffect(() => {
    const ordersRef = collection(getDb(), 'orders');
    const q = query(
      ordersRef,
      where('status', 'in', ['attente', 'preparation', 'pret'])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Order));
        setActiveOrders(orders);
      },
      (error) => {
        console.error('[KDSBoard] Error loading active orders:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Commandes terminées pour le calcul du temps moyen
  useEffect(() => {
    const ordersRef = collection(getDb(), 'orders');
    const q = query(
      ordersRef,
      where('status', 'in', ['pret', 'served', 'paid'])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Order));
        setCompletedOrders(orders);
      },
      (error) => {
        console.error('[KDSBoard] Error loading completed orders:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calcul du temps moyen avec la fonction utilitaire
  const avgPrepTime = useMemo(
    () => calculateAveragePrepTime(completedOrders),
    [completedOrders]
  );

  // Séparation par statut
  const ordersEnAttente = useMemo(
    () => activeOrders.filter((o) => o.status === 'attente'),
    [activeOrders]
  );

  const ordersEnPreparation = useMemo(
    () => activeOrders.filter((o) => o.status === 'preparation'),
    [activeOrders]
  );

  const ordersPret = useMemo(
    () => activeOrders.filter((o) => o.status === 'pret'),
    [activeOrders]
  );

  return { ordersEnAttente, ordersEnPreparation, ordersPret, avgPrepTime };
}

/**
 * Handlers pour les actions sur les commandes
 */
interface UseKDSActionsReturn {
  handleLaunch: (orderId: string) => Promise<void>;
  handleComplete: (orderId: string) => Promise<void>;
}

function useKDSActions(): UseKDSActionsReturn {
  const handleLaunch = useCallback(async (orderId: string) => {
    try {
      const orderRef = doc(getDb(), 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'preparation',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('[KDS] Error launching order:', error);
    }
  }, []);

  const handleComplete = useCallback(async (orderId: string) => {
    try {
      const orderRef = doc(getDb(), 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'pret',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('[KDS] Error completing order:', error);
    }
  }, []);

  return { handleLaunch, handleComplete };
}

/**
 * Board KDS principal avec 3 colonnes Kanban
 * Affiche les commandes actives et permet les transitions de statut
 */
export function KDSBoard(): JSX.Element {
  const { ordersEnAttente, ordersEnPreparation, ordersPret, avgPrepTime } = useKDSOrders();
  const { handleLaunch, handleComplete } = useKDSActions();

  return (
    <div
      className="h-full p-6 flex gap-6 overflow-x-auto"
      role="region"
      aria-label="Tableau des commandes KDS"
    >
      {/* Colonne 1 : À PRÉPARER */}
      <section className="flex-shrink-0 w-[420px]">
        <KDSColumn
          title="À PRÉPARER"
          indicatorColor="bg-amber-500"
          count={ordersEnAttente.length}
          averageTimeMinutes={avgPrepTime}
        >
          {ordersEnAttente.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              mode="attente"
              onLaunch={handleLaunch}
            />
          ))}
        </KDSColumn>
      </section>

      {/* Colonne 2 : EN COURS */}
      <section className="flex-shrink-0 w-[420px]">
        <KDSColumn
          title="EN COURS"
          indicatorColor="bg-blue-500"
          count={ordersEnPreparation.length}
        >
          {ordersEnPreparation.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              mode="preparation"
              onComplete={handleComplete}
            />
          ))}
        </KDSColumn>
      </section>

      {/* Colonne 3 : PRÊT / ENVOYÉ */}
      <section className="flex-shrink-0 w-[420px]">
        <KDSColumn
          title="PRÊT / ENVOYÉ"
          indicatorColor="bg-green-500"
          count={ordersPret.length}
        >
          {ordersPret.map((order) => (
            <OrderCard key={order.id} order={order} mode="pret" />
          ))}
        </KDSColumn>
      </section>
    </div>
  );
}

export default KDSBoard;

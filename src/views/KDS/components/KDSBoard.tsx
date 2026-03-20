// src/views/KDS/components/KDSBoard.tsx
// Board KDS avec 3 colonnes (À préparer, En préparation, Prêt)

import { type JSX, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/database';
import type { Order } from '../../../db/types';
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
  // Commandes actives (en_attente, en_preparation, pret)
  const activeOrders = useLiveQuery<Order[]>(
    () =>
      db.orders
        .where('status')
        .anyOf(['en_attente', 'en_preparation', 'pret'])
        .sortBy('createdAt'),
    []
  );

  // Commandes terminées pour le calcul du temps moyen
  const completedOrders = useLiveQuery<Order[]>(
    () =>
      db.orders
        .where('status')
        .anyOf(['pret', 'servi', 'paye'])
        .sortBy('createdAt'),
    []
  );

  // Calcul du temps moyen avec la fonction utilitaire
  const avgPrepTime = useMemo(
    () => calculateAveragePrepTime(completedOrders || []),
    [completedOrders]
  );

  // Séparation par statut - gérer le cas où activeOrders est undefined
  const ordersEnAttente = useMemo(
    () => (activeOrders || []).filter((o) => o.status === 'en_attente'),
    [activeOrders]
  );

  const ordersEnPreparation = useMemo(
    () => (activeOrders || []).filter((o) => o.status === 'en_preparation'),
    [activeOrders]
  );

  const ordersPret = useMemo(
    () => (activeOrders || []).filter((o) => o.status === 'pret'),
    [activeOrders]
  );

  return { ordersEnAttente, ordersEnPreparation, ordersPret, avgPrepTime };
}

/**
 * Handlers pour les actions sur les commandes
 */
interface UseKDSActionsReturn {
  handleLaunch: (orderId: number) => Promise<void>;
  handleComplete: (orderId: number) => Promise<void>;
}

function useKDSActions(): UseKDSActionsReturn {
  const handleLaunch = useCallback(async (orderId: number) => {
    try {
      await db.orders.update(orderId, {
        status: 'en_preparation',
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('[KDS] Error launching order:', error);
    }
  }, []);

  const handleComplete = useCallback(async (orderId: number) => {
    try {
      await db.orders.update(orderId, {
        status: 'pret',
        updatedAt: Date.now(),
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

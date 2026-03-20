// src/views/Admin/Orders.tsx
// Gestion des commandes en direct - Vue Live Orders

import { type JSX, useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Order, OrderStatus } from '../../db/types';
import { OrderFilters } from '../../components/admin/OrderFilters';
import { OrdersTable } from '../../components/admin/OrdersTable';
import { updateOrderStatus } from '../../hooks/useOrders';

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vue Live Orders - Tableau de bord des commandes actives
 * Affiche toutes les commandes en temps réel avec filtres, recherche et actions
 */
export function AdminOrders(): JSX.Element {
  // États locaux pour les filtres
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Récupération des commandes actives en temps réel avec useLiveQuery
  const activeOrders = useLiveQuery<Order[]>(
    () =>
      db.orders
        .where('status')
        .anyOf(['en_attente', 'en_preparation', 'pret'])
        .sortBy('createdAt'),
    []
  );

  // Gestionnaire de lancement de préparation
  const handleLaunch = useCallback(async (orderId: number) => {
    try {
      await updateOrderStatus({ id: orderId, status: 'en_preparation' });
    } catch (error) {
      console.error('[AdminOrders] Error launching order:', error);
    }
  }, []);

  // Gestionnaire de fin de commande (marquer comme prêt)
  const handleComplete = useCallback(async (orderId: number) => {
    try {
      await updateOrderStatus({ id: orderId, status: 'pret' });
    } catch (error) {
      console.error('[AdminOrders] Error completing order:', error);
    }
  }, []);

  // Gestionnaire de changement de statut
  const handleStatusChange = useCallback((status: OrderStatus | 'all') => {
    setSelectedStatus(status);
  }, []);

  // Gestionnaire de changement de recherche
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Compteur de commandes actives
  const ordersCount = activeOrders?.length ?? 0;

  return (
    <div>
      {/* En-tête de page */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold font-headline text-on-surface">
            Live Orders
          </h2>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">
              receipt_long
            </span>
            <span className="font-mono text-sm font-bold text-on-surface-variant">
              {ordersCount.toString().padStart(2, '0')} COMMANDES ACTIVES
            </span>
          </div>
        </div>
        <p className="font-label text-sm text-on-surface-variant">
          Suivez et gérez toutes les commandes en temps réel
        </p>
      </header>

      {/* Filtres et recherche */}
      <OrderFilters
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Tableau des commandes */}
      <OrdersTable
        orders={activeOrders || []}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        onLaunch={handleLaunch}
        onComplete={handleComplete}
      />
    </div>
  );
}

export default AdminOrders;

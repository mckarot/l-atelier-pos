// src/components/admin/OrdersTable.tsx
// Tableau des commandes pour la vue Live Orders

import { type JSX, useMemo } from 'react';
import type { Order, OrderStatus } from '../../firebase/types';
import { OrderRow } from './OrderRow';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface OrdersTableProps {
  /** Liste des commandes à afficher */
  orders: Order[];
  /** Statut sélectionné pour le filtre */
  selectedStatus: OrderStatus | 'all';
  /** Texte de recherche */
  searchQuery: string;
  /** Action quand on lance la préparation */
  onLaunch: (orderId: number) => void;
  /** Action quand on termine la commande */
  onComplete: (orderId: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tableau des commandes avec filtres et recherche intégrés
 * Affiche les commandes triées par date (plus récent en premier)
 */
export function OrdersTable({
  orders,
  selectedStatus,
  searchQuery,
  onLaunch,
  onComplete,
}: OrdersTableProps): JSX.Element {
  // Filtrage et tri des commandes
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filtrage par statut
    if (selectedStatus !== 'all') {
      result = result.filter((order) => order.status === selectedStatus);
    }

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order) => {
        const orderId = String(order.id);
        const tableId = String(order.tableId);
        const customerName = (order.customerName || '').toLowerCase();
        const itemsSummary = order.items
          .map((item) => item.name.toLowerCase())
          .join(' ');

        return (
          orderId.includes(query) ||
          tableId.includes(query) ||
          customerName.includes(query) ||
          itemsSummary.includes(query)
        );
      });
    }

    // Tri par date décroissante (plus récent en premier)
    result.sort((a, b) => b.createdAt - a.createdAt);

    return result;
  }, [orders, selectedStatus, searchQuery]);

  return (
    <div
      className="rounded-xl border border-outline-variant/10 bg-surface-container overflow-hidden"
      role="region"
      aria-label="Tableau des commandes"
    >
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Commandes en direct">
          {/* En-tête du tableau */}
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-low">
              <th
                scope="col"
                className="py-4 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                COMMANDE
              </th>
              <th
                scope="col"
                className="py-4 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                TABLE
              </th>
              <th
                scope="col"
                className="py-4 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                ITEMS
              </th>
              <th
                scope="col"
                className="py-4 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                TEMPS
              </th>
              <th
                scope="col"
                className="py-4 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                STATUT
              </th>
              <th
                scope="col"
                className="py-4 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                ACTIONS
              </th>
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onLaunch={onLaunch}
                  onComplete={onComplete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className="material-symbols-outlined text-on-surface-variant text-4xl mb-4"
                      aria-hidden="true"
                    >
                      receipt_long
                    </span>
                    <p className="font-label text-sm text-on-surface-variant">
                      {searchQuery || selectedStatus !== 'all'
                        ? 'Aucune commande ne correspond aux filtres'
                        : 'Aucune commande active'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pied de tableau avec compteur */}
      {filteredOrders.length > 0 && (
        <footer className="px-4 py-3 bg-surface-container-low border-t border-outline-variant/10">
          <p className="font-label text-xs text-on-surface-variant">
            {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} affichée
            {filteredOrders.length > 1 ? 's' : ''}
          </p>
        </footer>
      )}
    </div>
  );
}

export default OrdersTable;

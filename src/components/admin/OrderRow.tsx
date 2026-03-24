// src/components/admin/OrderRow.tsx
// Ligne de commande pour le tableau Live Orders

import { type JSX, useCallback, useMemo } from 'react';
import type { Order } from '../../firebase/types';
import { Timer } from '../../components/ui/Timer';
import { cn } from '../../utils/cn';
import { getTimerAlertStatus, type TimerAlertStatus } from '../../utils/timer';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderRowProps {
  /** Commande à afficher */
  order: Order;
  /** Action quand on lance la préparation */
  onLaunch: (orderId: string) => void;
  /** Action quand on termine la commande */
  onComplete: (orderId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  en_attente: 'EN ATTENTE',
  en_preparation: 'EN PRÉPARATION',
  pret: 'PRÊT',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  en_attente: 'bg-amber-500/15 text-amber-700',
  en_preparation: 'bg-blue-500/15 text-blue-700',
  pret: 'bg-green-500/15 text-green-700',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ligne de commande individuelle pour le tableau Live Orders
 * Affiche les informations de la commande, le timer et les boutons d'action
 */
export function OrderRow({
  order,
  onLaunch,
  onComplete,
}: OrderRowProps): JSX.Element {
  // Calcul du statut d'alerte pour les classes conditionnelles
  const alertStatus = useMemo<TimerAlertStatus>(
    () => getTimerAlertStatus(Date.now() - order.createdAt.toMillis()),
    [order.createdAt]
  );

  // Gestionnaire de lancement de préparation
  const handleLaunch = useCallback(() => {
    onLaunch(order.id);
  }, [onLaunch, order.id]);

  // Gestionnaire de fin de commande
  const handleComplete = useCallback(() => {
    onComplete(order.id);
  }, [onComplete, order.id]);

  // Classes de couleur du timer selon le statut d'alerte
  const timerColorClasses = useMemo(() => {
    switch (alertStatus) {
      case 'danger':
        return 'text-error';
      case 'warning':
        return 'text-secondary';
      default:
        return 'text-on-surface';
    }
  }, [alertStatus]);

  // Formatage des items en une chaîne lisible
  const itemsSummary = useMemo(() => {
    return order.items
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(', ');
  }, [order.items]);

  // Affichage du statut
  const statusLabel = STATUS_LABELS[order.status] || order.status;
  const statusBadgeClass = STATUS_BADGE_CLASSES[order.status] || 'bg-surface-variant text-on-surface';

  return (
    <tr
      className="border-b border-outline-variant/5 last:border-b-0 hover:bg-surface-container-highest/30 transition-colors"
      role="row"
      aria-label={`Commande ${order.id}, table ${order.tableId}`}
    >
      {/* Colonne COMMANDE */}
      <td className="py-4 px-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm font-bold text-primary">
            #ORD-{String(order.id).padStart(4, '0')}
          </span>
          <span className="font-label text-xs text-on-surface-variant">
            {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </td>

      {/* Colonne TABLE */}
      <td className="py-4 px-4">
        <div className="flex flex-col gap-1">
          <span className="font-label text-sm font-bold text-on-surface">
            Table {order.tableId}
          </span>
          <span className="font-label text-xs text-on-surface-variant">
            {order.customerName || 'Client'}
          </span>
        </div>
      </td>

      {/* Colonne ITEMS */}
      <td className="py-4 px-4">
        <div className="max-w-xs">
          <p className="font-label text-sm text-on-surface truncate" title={itemsSummary}>
            {itemsSummary}
          </p>
        </div>
      </td>

      {/* Colonne TEMPS */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Timer createdAt={order.createdAt} className={timerColorClasses} />
          {alertStatus === 'danger' && (
            <span
              className="material-symbols-outlined text-error text-sm animate-pulse"
              aria-label="Temps d'attente critique"
            >
              warning
            </span>
          )}
        </div>
      </td>

      {/* Colonne STATUT */}
      <td className="py-4 px-4">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
            statusBadgeClass
          )}
          role="status"
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              order.status === 'attente' && 'bg-amber-500',
              order.status === 'preparation' && 'bg-blue-500',
              order.status === 'pret' && 'bg-green-500'
            )}
            aria-hidden="true"
          />
          {statusLabel}
        </span>
      </td>

      {/* Colonne ACTIONS */}
      <td className="py-4 px-4">
        <div className="flex gap-2">
          {order.status === 'attente' && (
            <button
              onClick={handleLaunch}
              className="px-4 py-2 bg-primary-container text-on-primary-container font-headline font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 active:scale-[0.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              aria-label={`Lancer la préparation de la commande ${order.id}`}
            >
              Lancer
            </button>
          )}
          {order.status === 'preparation' && (
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-tertiary-container text-on-tertiary-container font-headline font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 active:scale-[0.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary"
              aria-label={`Marquer la commande ${order.id} comme prête`}
            >
              Terminer
            </button>
          )}
          {order.status === 'pret' && (
            <span className="font-label text-xs text-on-surface-variant italic">
              Complète
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default OrderRow;

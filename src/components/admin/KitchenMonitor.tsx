// src/components/admin/KitchenMonitor.tsx
// Tableau moniteur cuisine en direct pour le dashboard administrateur

import { useFormattedKitchenOrders, useKitchenOrdersCount } from '../../hooks/useKitchenMonitor';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface KitchenMonitorProps {
  /** Titre personnalisé */
  title?: string;
  /** Classe CSS personnalisée */
  className?: string;
  /** Nombre maximum de commandes à afficher */
  maxOrders?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** Seuils de couleur pour le timer (en secondes) */
const TIMER_THRESHOLDS = {
  warning: 10 * 60, // 10 minutes
  danger: 20 * 60,  // 20 minutes
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tableau moniteur cuisine en direct
 *
 * Design system conforme aux maquettes PNG:
 * - Titre: "MONITEUR CUISINE EN DIRECT" en font-mono text-sm font-bold uppercase tracking-widest
 * - Compteur: "X COMMANDES EN COURS" + "SYNC OK" (vert)
 * - Tableau avec 5 colonnes: COMMANDE, TABLE, ITEMS, TEMPS ÉCOULÉ, STATUT
 * - Timer couleur: vert si < 10min, orange si < 20min, rouge si > 20min
 * - Badges items en style "pill"
 * - Statut: "En préparation" (orange) ou "Retardé" (rouge)
 */
export function KitchenMonitor({
  title = 'MONITEUR CUISINE EN DIRECT',
  className = '',
  maxOrders = 10,
}: KitchenMonitorProps): JSX.Element {
  // Récupérer les commandes formatées
  const orders = useFormattedKitchenOrders();
  const ordersCount = useKitchenOrdersCount();

  // Limiter le nombre de commandes affichées
  const displayedOrders = orders?.slice(0, maxOrders) || [];

  // Obtenir la couleur du timer selon le temps écoulé (en secondes)
  const getTimerColor = (elapsedSeconds: number): string => {
    if (elapsedSeconds >= TIMER_THRESHOLDS.danger) {
      return 'text-error'; // Rouge
    }
    if (elapsedSeconds >= TIMER_THRESHOLDS.warning) {
      return 'text-secondary'; // Orange
    }
    return 'text-tertiary'; // Vert
  };

  // Obtenir le label de statut
  const getStatusLabel = (status: 'en_preparation' | 'retard'): string => {
    return status === 'retard' ? 'RETARDÉ' : 'EN PRÉPARATION';
  };

  // Obtenir la classe de style du badge de statut
  const getStatusBadgeClass = (status: 'en_preparation' | 'retard'): string => {
    if (status === 'retard') {
      return 'bg-error/20 text-error';
    }
    return 'bg-secondary/20 text-secondary';
  };

  return (
    <div
      className={`rounded-xl border border-outline-variant/10 bg-surface-container p-6 ${className}`}
      role="region"
      aria-label={title}
    >
      {/* En-tête avec titre et compteur */}
      <div className="flex items-center justify-between mb-4">
        {/* Titre */}
        <h3
          className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface-variant"
        >
          {title}
        </h3>

        {/* Compteur et indicateur SYNC */}
        <div className="flex items-center gap-4">
          {/* Nombre de commandes */}
          <span className="font-label text-xs font-bold text-on-surface-variant">
            {ordersCount} COMMANDE{ordersCount > 1 ? 'S' : ''} EN COURS
          </span>

          {/* Indicateur SYNC OK */}
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-tertiary/10">
            <span
              className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"
              aria-hidden="true"
            />
            <span className="font-label text-xs font-bold text-tertiary">
              SYNC OK
            </span>
          </span>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="overflow-x-auto">
        <table
          className="w-full"
          role="table"
          aria-label="Commandes cuisine en cours"
        >
          {/* En-tête du tableau */}
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th
                scope="col"
                className="py-3 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                COMMANDE
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                TABLE
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                ITEMS
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                TEMPS ÉCOULÉ
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-left font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                STATUT
              </th>
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {displayedOrders.length > 0 ? (
              displayedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-outline-variant/5 last:border-b-0"
                  role="row"
                  aria-label={`Commande ${order.orderIdDisplay}`}
                >
                  {/* Colonne COMMANDE */}
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm font-bold text-primary">
                      {order.orderIdDisplay}
                    </span>
                  </td>

                  {/* Colonne TABLE */}
                  <td className="py-4 px-4">
                    <span className="font-label text-sm font-bold text-on-surface">
                      {order.tableNameDisplay}
                    </span>
                  </td>

                  {/* Colonne ITEMS */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, index) => (
                        <span
                          key={`${order.id}-item-${index}`}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-surface-variant/50"
                          role="status"
                        >
                          <span className="font-mono text-xs font-bold text-primary mr-1">
                            {item.quantity}x
                          </span>
                          <span className="font-label text-xs text-on-surface">
                            {item.name}
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Colonne TEMPS ÉCOULÉ */}
                  <td className="py-4 px-4">
                    <span
                      className={`font-mono text-sm font-bold ${getTimerColor(order.elapsedTime)}`}
                    >
                      {order.timeDisplay}
                    </span>
                  </td>

                  {/* Colonne STATUT */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}
                    >
                      <span
                        className="material-symbols-outlined text-xs"
                        aria-hidden="true"
                      >
                        {order.status === 'retard' ? 'warning' : 'set_meal'}
                      </span>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 px-4 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className="material-symbols-outlined text-on-surface-variant text-4xl mb-4"
                      aria-hidden="true"
                    >
                      restaurant
                    </span>
                    <p className="font-label text-sm text-on-surface-variant">
                      Aucune commande en cours
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KitchenMonitor;

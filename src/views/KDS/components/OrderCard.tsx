// src/views/KDS/components/OrderCard.tsx
// Carte de commande pour le KDS

import { type JSX, useCallback, useMemo } from 'react';
import type { Order } from '../../../firebase/types';
import { Timer } from '../../../components/ui/Timer';
import { cn } from '../../../utils/cn';
import { getTimerAlertStatus, type TimerAlertStatus } from '../../../utils/timer';

export interface OrderCardProps {
  /** Commande à afficher */
  order: Order;
  /** Action quand on lance la préparation */
  onLaunch?: (orderId: number) => void;
  /** Action quand on termine la préparation */
  onComplete?: (orderId: number) => void;
  /** Mode de la carte (détermine les boutons affichés) */
  mode: 'attente' | 'preparation' | 'pret';
}

/**
 * Carte de commande individuelle pour le KDS
 * Affiche les informations de la commande, le timer et les actions
 */
export function OrderCard({
  order,
  onLaunch,
  onComplete,
  mode,
}: OrderCardProps): JSX.Element {
  // Calcul du statut d'alerte pour les classes conditionnelles
  const alertStatus = useMemo<TimerAlertStatus>(
    () => getTimerAlertStatus(Date.now() - order.createdAt),
    [order.createdAt]
  );

  // Gestionnaire de lancement de préparation
  const handleLaunch = useCallback(() => {
    if (onLaunch) {
      onLaunch(order.id);
    }
  }, [onLaunch, order.id]);

  // Gestionnaire de fin de préparation
  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete(order.id);
    }
  }, [onComplete, order.id]);

  // Classes de bordure gauche selon le statut d'alerte
  const borderClasses = useMemo(() => {
    const baseClass = 'border-l-4 ';
    switch (mode) {
      case 'attente':
        return baseClass + (alertStatus === 'danger'
          ? 'border-error'
          : alertStatus === 'warning'
            ? 'border-secondary'
            : 'border-on-surface-variant/20');
      case 'preparation':
        return baseClass + (alertStatus === 'danger'
          ? 'border-error'
          : 'border-primary/40');
      case 'pret':
        return baseClass + 'border-tertiary/20';
      default:
        return '';
    }
  }, [mode, alertStatus]);

  return (
    <article
      className={cn(
        'bg-surface-container-highest rounded-lg overflow-hidden shadow-lg',
        borderClasses
      )}
      aria-label={`Commande ${order.id}, table ${order.tableId}`}
    >
      {/* En-tête de la carte */}
      <header className="p-4 flex justify-between items-start">
        <div>
          <span className="font-mono text-xs font-bold text-primary">
            #ORD-{String(order.id).padStart(4, '0')}
          </span>
          <h3 className="font-headline font-bold text-lg mt-1">
            Table {order.tableId} — {order.customerName || 'Client'}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-on-surface/40 uppercase">
            REÇU À {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <Timer createdAt={order.createdAt} />
        </div>
      </header>

      {/* Liste des items */}
      <div className="px-4 pb-4 space-y-2">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 py-1.5 border-b border-outline-variant/5 last:border-0"
          >
            <span className="text-primary font-bold font-mono text-sm">
              x{item.quantity}
            </span>
            <div className="flex-1">
              <span className="text-sm font-medium">{item.name}</span>
              {item.customization && (
                <p className="text-xs text-secondary font-bold uppercase italic mt-1 border-l-2 border-secondary pl-2">
                  {item.customization}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bouton d'action */}
      <footer className="px-4 pb-4">
        {mode === 'attente' && onLaunch && (
          <div className="grid grid-cols-2 gap-2">
            <button
              className="h-12 bg-surface-variant text-on-surface font-headline font-black text-xs uppercase tracking-widest rounded-lg hover:bg-surface-bright active:scale-[0.98] transition-all"
              aria-label={`Voir les détails de la commande ${order.id}`}
            >
              DÉTAILS
            </button>
            <button
              onClick={handleLaunch}
              className="h-12 bg-primary-container text-on-primary-container font-headline font-black text-xs uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
              aria-label={`Lancer la préparation de la commande ${order.id}`}
            >
              LANCER
            </button>
          </div>
        )}
        {mode === 'preparation' && onComplete && (
          <div className="grid grid-cols-2 gap-2">
            <button
              className="h-12 bg-surface-variant text-on-surface font-headline font-black text-xs uppercase tracking-widest rounded-lg hover:bg-surface-bright active:scale-[0.98] transition-all"
              aria-label={`Demander de l'aide pour la commande ${order.id}`}
            >
              AIDE
            </button>
            <button
              onClick={handleComplete}
              className="h-12 bg-tertiary-container text-on-tertiary-container font-headline font-black text-xs uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
              aria-label={`Marquer la commande ${order.id} comme prête`}
            >
              TERMINER
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}

export default OrderCard;

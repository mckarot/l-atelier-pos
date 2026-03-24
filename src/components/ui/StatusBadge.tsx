// src/components/ui/StatusBadge.tsx
// Badge de statut pour les stations KDS

import { type JSX } from 'react';
import { cn } from '../../utils/cn';
import type { OrderStatus } from '../../firebase/types';

export interface StatusBadgeProps {
  /** Statut de la commande */
  status: OrderStatus;
  /** Taille du badge */
  size?: 'sm' | 'md' | 'lg';
  /** Classe CSS supplémentaire */
  className?: string;
}

/**
 * Mapping des statuts vers les couleurs et labels
 */
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; colorClass: string; icon: string }
> = {
  en_attente: {
    label: 'À préparer',
    colorClass: 'bg-on-surface-variant text-on-surface',
    icon: 'schedule',
  },
  en_preparation: {
    label: 'En préparation',
    colorClass: 'bg-primary text-on-primary-container',
    icon: 'set_meal',
  },
  pret: {
    label: 'Prêt',
    colorClass: 'bg-tertiary text-on-tertiary-container',
    icon: 'done_all',
  },
  servi: {
    label: 'Servi',
    colorClass: 'bg-surface-container-highest text-on-surface/60',
    icon: 'room_service',
  },
  paye: {
    label: 'Payé',
    colorClass: 'bg-surface-container-highest text-on-surface/40',
    icon: 'payment',
  },
  annule: {
    label: 'Annulé',
    colorClass: 'bg-error-container text-on-error-container',
    icon: 'cancel',
  },
};

/**
 * Badge de statut pour les commandes KDS
 * Affiche le statut avec une couleur sémantique et une icône
 */
export function StatusBadge({
  status,
  size = 'md',
  className,
}: StatusBadgeProps): JSX.Element {
  const config = STATUS_CONFIG[status];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-widest',
        config.colorClass,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={`Statut: ${config.label}`}
    >
      <span
        className="material-symbols-outlined text-xs"
        aria-hidden="true"
      >
        {config.icon}
      </span>
      {config.label}
    </span>
  );
}

export default StatusBadge;

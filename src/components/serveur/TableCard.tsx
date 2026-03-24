// src/components/serveur/TableCard.tsx
// Carte de table pour le plan de salle

import { cn } from '../../utils/cn';
import type { FloorTable } from './types';
import { useElapsedTime } from '../../hooks/useFloorPlan';

export interface TableCardProps {
  table: FloorTable;
  isSelected?: boolean;
  onClick?: (tableId: number) => void;
}

export function TableCard({ table, isSelected, onClick }: TableCardProps): JSX.Element {
  const elapsed = table.currentOrder ? useElapsedTime(table.currentOrder.startTime) : null;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'libre':
        return 'border-tertiary bg-tertiary/10 text-tertiary';
      case 'occupee':
        return 'border-primary bg-primary/10 text-primary';
      case 'pret':
        return 'border-blue-500 bg-blue-500/10 text-blue-500';
      case 'reservation':
        return 'border-purple-500 bg-purple-500/10 text-purple-500';
      default:
        return 'border-outline bg-surface-container text-on-surface-variant';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      libre: 'LIBRE',
      occupee: 'OCCUPÉE',
      pret: 'PRÊT',
      reserve: 'RÉSERVÉE',
    };
    return labels[status] || status;
  };

  const handleClick = () => {
    onClick?.(table.id);
  };

  const isOccupied = table.status === 'occupee' || table.status === 'pret';

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      className={cn(
        'group relative bg-surface-container-low p-5 rounded-xl border-l-4 transition-all cursor-pointer',
        'hover:scale-105 hover:shadow-lg active:scale-95',
        getStatusStyles(table.status),
        isSelected && 'ring-2 ring-primary scale-105 shadow-xl'
      )}
      aria-label={`Table ${table.name}, ${getStatusLabel(table.status)}`}
      aria-pressed={isSelected}
    >
      {/* Header - Table name + Status */}
      <div className="flex justify-between items-start mb-4">
        <span className="font-mono text-2xl font-bold">{table.name}</span>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter',
            getStatusStyles(table.status)
          )}
        >
          {getStatusLabel(table.status)}
        </span>
      </div>

      {/* Content based on status */}
      {isOccupied ? (
        <>
          <div className="space-y-1 mb-6">
            <p className="text-on-surface font-medium">
              {table.currentOrder?.customerName || 'Client'}
            </p>
            <p className="text-on-surface-variant text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">group</span>
              {table.capacity} pers.
            </p>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-lg font-bold">
              {(table.currentOrder?.total || 0).toFixed(2)}€
            </span>
            {elapsed && (
              <span className="text-xs font-mono">{elapsed.formatted}</span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1 mb-6">
            <p className="text-on-surface-variant italic text-sm">
              {table.status === 'reservation' ? 'Réservée' : 'Prête pour dressage'}
            </p>
            <p className="text-on-surface-variant text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">group</span>
              {table.capacity} pers.
            </p>
          </div>
          <div className="flex justify-between items-center opacity-40">
            <span className="font-mono text-lg font-bold">0.00€</span>
            <span className="text-xs text-on-surface-variant font-mono">--:--</span>
          </div>
        </>
      )}

      {/* Sector indicator */}
      <div className="absolute top-2 right-2">
        <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-wider">
          {table.sector}
        </span>
      </div>
    </div>
  );
}

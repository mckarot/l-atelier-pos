// src/components/serveur/TableOccupancy.tsx
// Composant de statistiques d'occupation des tables

import { cn } from '../../utils/cn';
import type { OccupancyStats } from './types';

export interface TableOccupancyProps {
  stats: OccupancyStats;
  compact?: boolean;
}

export function TableOccupancy({ stats, compact = false }: TableOccupancyProps): JSX.Element {
  if (compact) {
    return (
      <div className="bg-surface-container-low p-4 rounded-xl">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
          Occupation des Tables
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Libres</span>
            <span className="font-mono text-xl font-bold text-tertiary">T-{stats.free}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Occupées</span>
            <span className="font-mono text-xl font-bold text-primary">T-{stats.occupied}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Réservées</span>
            <span className="font-mono text-xl font-bold text-purple-500">T-{stats.reserved}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
      <div className="mb-6">
        <h3 className="font-headline text-xl font-bold text-on-surface mb-1">
          Occupation des Tables
        </h3>
        <p className="text-on-surface-variant text-sm">
          Vue en temps réel du flux de service
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-surface-container-highest/30 rounded-lg">
          <span className="block font-mono text-3xl font-bold text-tertiary mb-1">
            {stats.free}
          </span>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
            Libres
          </span>
        </div>
        <div className="text-center p-4 bg-surface-container-highest/30 rounded-lg">
          <span className="block font-mono text-3xl font-bold text-primary mb-1">
            {stats.occupied}
          </span>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
            Occupées
          </span>
        </div>
        <div className="text-center p-4 bg-surface-container-highest/30 rounded-lg">
          <span className="block font-mono text-3xl font-bold text-purple-500 mb-1">
            {stats.reserved}
          </span>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
            Réservées
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-on-surface-variant mb-2">
          <span>Taux d'occupation</span>
          <span>{Math.round(((stats.occupied + stats.reserved) / stats.total) * 100)}%</span>
        </div>
        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
          <div
            className="bg-tertiary h-full transition-all"
            style={{ width: `${(stats.free / stats.total) * 100}%` }}
            aria-label={`${stats.free} tables libres`}
          />
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${(stats.occupied / stats.total) * 100}%` }}
            aria-label={`${stats.occupied} tables occupées`}
          />
          <div
            className="bg-purple-500 h-full transition-all"
            style={{ width: `${(stats.reserved / stats.total) * 100}%` }}
            aria-label={`${stats.reserved} tables réservées`}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-tertiary"></span>
          <span className="text-xs text-on-surface-variant">Libres</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
          <span className="text-xs text-on-surface-variant">Occupées</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
          <span className="text-xs text-on-surface-variant">Réservées</span>
        </div>
      </div>
    </div>
  );
}

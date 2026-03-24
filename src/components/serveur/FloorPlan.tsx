// src/components/serveur/FloorPlan.tsx
// Plan de salle interactif

import { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { useFloorPlan } from '../../hooks/useFloorPlan';
import { TableCard } from './TableCard';
import type { FloorTable } from './types';

export interface FloorPlanProps {
  onTableSelect?: (table: FloorTable) => void;
  selectedTableId?: number | null;
}

export function FloorPlan({ onTableSelect, selectedTableId }: FloorPlanProps): JSX.Element {
  const { tables, sectors, allTables } = useFloorPlan();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Filtrer les tables par secteur
  const filteredTables = useMemo(() => {
    if (!selectedSector) return tables;
    return tables.filter((table) => table.sector === selectedSector);
  }, [tables, selectedSector]);

  // Calculer les stats
  const stats = useMemo(() => ({
    free: tables.filter((t) => t.status === 'libre').length,
    occupied: tables.filter((t) => t.status === 'occupee').length,
    reserved: tables.filter((t) => t.status === 'reservation').length,
    ready: tables.filter((t) => t.status === 'maintenance').length,
  }), [tables]);

  const handleTableClick = (tableId: number) => {
    const table = allTables.find((t) => t.id === tableId);
    if (table) {
      onTableSelect?.(table);
    }
  };

  return (
    <div className="p-6">
      {/* Section header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">
            Plan de Salle
          </h2>
          <p className="text-on-surface-variant font-medium">
            {selectedSector || 'Tous les secteurs'} • {filteredTables.length} Tables
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedSector(null)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedSector === null
                ? 'bg-primary-container text-on-primary-container font-bold shadow-lg'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            )}
          >
            Tous
          </button>
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedSector === sector
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-lg'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              )}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low p-4 rounded-xl border-l-4 border-tertiary">
          <span className="text-2xl font-mono font-bold text-tertiary">{stats.free}</span>
          <span className="text-xs text-on-surface-variant uppercase ml-2">Libres</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl border-l-4 border-primary">
          <span className="text-2xl font-mono font-bold text-primary">{stats.occupied}</span>
          <span className="text-xs text-on-surface-variant uppercase ml-2">Occupées</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl border-l-4 border-blue-500">
          <span className="text-2xl font-mono font-bold text-blue-500">{stats.ready}</span>
          <span className="text-xs text-on-surface-variant uppercase ml-2">Prêtes</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl border-l-4 border-purple-500">
          <span className="text-2xl font-mono font-bold text-purple-500">{stats.reserved}</span>
          <span className="text-xs text-on-surface-variant uppercase ml-2">Réservées</span>
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            isSelected={selectedTableId === table.id}
            onClick={handleTableClick}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredTables.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-6xl mb-4">
            table_restaurant
          </span>
          <p className="text-on-surface-variant text-lg">
            Aucune table dans ce secteur
          </p>
        </div>
      )}
    </div>
  );
}

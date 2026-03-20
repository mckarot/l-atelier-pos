// src/components/admin/MenuItemRow.tsx
// Composant pour afficher une ligne d'item du menu dans l'éditeur

import { useCallback } from 'react';
import { cn, iconFilled } from '../../utils/cn';
import type { MenuItem } from '../../db/types';

export interface MenuItemRowProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggleAvailability: (id: number, isAvailable: boolean) => void;
}

export function MenuItemRow({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
}: MenuItemRowProps): JSX.Element {
  const handleToggle = useCallback(() => {
    onToggleAvailability(item.id, item.isAvailable === 0);
  }, [item.id, item.isAvailable, onToggleAvailability]);

  const handleEdit = useCallback(() => {
    onEdit(item);
  }, [item, onEdit]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
      onDelete(item.id);
    }
  }, [item.id, item.name, onDelete]);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border',
        'bg-surface-container-low border-outline-variant/10',
        item.isAvailable === 0 && 'opacity-60'
      )}
      role="row"
      aria-rowindex={item.id}
    >
      {/* Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-highest flex-shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className={cn(iconFilled(), 'text-on-surface-variant text-2xl')}
              aria-hidden="true"
            >
              restaurant
            </span>
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-headline font-bold text-on-surface truncate">
            {item.name}
          </h3>
          {item.isAvailable === 1 ? (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
                'bg-tertiary-container text-tertiary'
              )}
              aria-label="Disponible"
            >
              Dispo
            </span>
          ) : (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
                'bg-error-container text-error'
              )}
              aria-label="Indisponible"
            >
              Indisponible
            </span>
          )}
        </div>
        <p className="text-sm text-on-surface-variant truncate mb-1">
          {item.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="font-mono">{item.category}</span>
          <span>•</span>
          <span className="font-mono">{item.station || 'N/A'}</span>
          {item.allergens && item.allergens.length > 0 && (
            <>
              <span>•</span>
              <span className="text-error">
                Allergènes: {item.allergens.join(', ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Prix */}
      <div className="w-24 text-right">
        <span className="text-lg font-bold text-primary font-mono">
          {item.price.toFixed(2)}€
        </span>
      </div>

      {/* Toggle disponibilité */}
      <button
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          item.isAvailable === 1
            ? 'bg-tertiary'
            : 'bg-on-surface-variant/30'
        )}
        role="switch"
        aria-checked={item.isAvailable === 1}
        aria-label={`Basculer la disponibilité de ${item.name}`}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-on-primary-container transition-transform',
            item.isAvailable === 1
              ? 'translate-x-6'
              : 'translate-x-1'
          )}
        />
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleEdit}
          className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
          aria-label={`Modifier ${item.name}`}
        >
          <span
            className={cn(iconFilled(), 'text-primary text-xl')}
            aria-hidden="true"
          >
            edit
          </span>
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg hover:bg-error-container/20 transition-colors"
          aria-label={`Supprimer ${item.name}`}
        >
          <span
            className={cn(iconFilled(), 'text-error text-xl')}
            aria-hidden="true"
          >
            delete
          </span>
        </button>
      </div>
    </div>
  );
}

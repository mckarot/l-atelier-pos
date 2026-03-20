// src/components/serveur/OrderItem.tsx
// Item de commande avec contrôles de quantité

import { cn } from '../../utils/cn';
import type { OrderItem as OrderItemType } from './types';

export interface OrderItemProps {
  item: OrderItemType;
  onQuantityChange?: (itemId: number, delta: number) => void;
  readOnly?: boolean;
}

export function OrderItem({ item, onQuantityChange, readOnly = false }: OrderItemProps): JSX.Element {
  const handleDecrement = () => {
    if (!readOnly && item.quantity > 0) {
      onQuantityChange?.(item.id, -1);
    }
  };

  const handleIncrement = () => {
    if (!readOnly) {
      onQuantityChange?.(item.id, 1);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/10">
      <div className="flex justify-between items-start gap-4">
        {/* Item details */}
        <div className="flex-1">
          <h4 className="text-on-surface font-bold text-base mb-1">
            {item.name}
          </h4>
          {item.customization && (
            <p className="text-on-surface-variant text-sm mb-2">
              {item.customization}
            </p>
          )}
          {item.description && (
            <p className="text-on-surface-variant/60 text-xs mb-2">
              {item.description}
            </p>
          )}
          <span className="text-primary font-mono text-sm font-bold">
            €{item.price.toFixed(2)}
          </span>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          {!readOnly ? (
            <>
              <button
                onClick={handleDecrement}
                disabled={item.quantity <= 0}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  item.quantity <= 0
                    ? 'bg-surface-container-high text-on-surface-variant/30 cursor-not-allowed'
                    : 'bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-on-primary-container'
                )}
                aria-label="Diminuer la quantité"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="w-8 text-center font-mono text-lg font-bold text-on-surface">
                {item.quantity.toString().padStart(2, '0')}
              </span>
              <button
                onClick={handleIncrement}
                className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-colors"
                aria-label="Augmenter la quantité"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </>
          ) : (
            <span className="w-12 text-center font-mono text-lg font-bold text-on-surface">
              {item.quantity.toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Item total (optional, for read-only view) */}
      {readOnly && itemTotal > 0 && (
        <div className="mt-3 pt-3 border-t border-outline-variant/10 flex justify-between items-center">
          <span className="text-on-surface-variant text-sm">Total</span>
          <span className="font-mono text-primary font-bold">€{itemTotal.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

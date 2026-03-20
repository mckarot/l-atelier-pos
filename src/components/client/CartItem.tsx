// src/components/client/CartItem.tsx
// Item individuel du panier

import { cn, iconFilled } from '../../utils/cn';
import type { CartItem as CartItemType } from '../../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
  index: number;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}

export function CartItem({
  item,
  index,
  onUpdateQuantity,
  onRemove,
}: CartItemProps): JSX.Element {
  const { menuItem, quantity, supplements, cookingLevel, subtotal } = item;

  return (
    <div className="flex gap-3 py-3 border-b border-outline-variant/10 last:border-0">
      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-on-surface truncate">
            {menuItem.name}
          </h4>
          <span className="font-mono font-bold text-primary shrink-0">
            {subtotal.toFixed(2)}€
          </span>
        </div>

        {/* Customizations */}
        {(cookingLevel || supplements?.length) && (
          <div className="mt-1 space-y-0.5">
            {cookingLevel && (
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <span
                  className={iconFilled()}
                  aria-hidden="true"
                >
                  local_fire_department
                </span>
                {cookingLevel}
              </p>
            )}
            {supplements?.map((supplement) => (
              <p
                key={supplement.name}
                className="text-xs text-on-surface-variant flex items-center gap-1"
              >
                <span
                  className={iconFilled()}
                  aria-hidden="true"
                >
                  add_circle
                </span>
                {supplement.name} (+{supplement.price.toFixed(2)}€)
              </p>
            ))}
          </div>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(index, -1)}
            className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant transition-colors"
            aria-label="Diminuer la quantité"
          >
            <span
              className="material-symbols-outlined text-sm"
              aria-hidden="true"
            >
              remove
            </span>
          </button>
          <span className="w-8 text-center font-mono font-bold">
            {quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(index, 1)}
            className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant transition-colors"
            aria-label="Augmenter la quantité"
          >
            <span
              className={iconFilled()}
              aria-hidden="true"
            >
              add
            </span>
          </button>
          <button
            onClick={() => onRemove(index)}
            className="ml-auto p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors"
            aria-label="Supprimer l'article"
          >
            <span
              className="material-symbols-outlined text-sm"
              aria-hidden="true"
            >
              delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

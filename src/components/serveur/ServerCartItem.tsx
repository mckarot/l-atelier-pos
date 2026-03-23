// src/components/serveur/ServerCartItem.tsx
// Composant ligne de panier pour le serveur

import type { ServerCartItem as ServerCartItemData } from '../../hooks/useServerCart';

export interface ServerCartItemProps {
  item: ServerCartItemData;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function ServerCartItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: ServerCartItemProps): JSX.Element {
  const supplementTotal = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
  const itemTotal = (item.price + supplementTotal) * item.quantity;

  return (
    <div className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-primary">
            {item.quantity}x
          </span>
          <h4 className="font-body text-base font-semibold text-on-surface truncate">
            {item.name}
          </h4>
        </div>
        
        {/* Supplements */}
        {item.supplements && item.supplements.length > 0 && (
          <div className="mt-1 ml-10">
            <ul className="text-xs text-on-surface-variant">
              {item.supplements.map((supplement, index) => (
                <li key={index}>
                  + {supplement.name} (+€{supplement.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Notes */}
        {item.notes && (
          <div className="mt-1 ml-10">
            <span className="text-xs text-on-surface-variant italic">
              Note: {item.notes}
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="mt-2 ml-10">
          <span className="font-mono text-sm font-medium text-on-surface-variant">
            €{itemTotal.toFixed(2).replace('.00', '.')}
          </span>
        </div>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          className="w-10 h-10 rounded-lg bg-surface-container-highest text-on-surface font-mono text-lg font-bold hover:bg-surface-container-high active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-container"
          aria-label={`Diminuer la quantité de ${item.name}`}
        >
          −
        </button>
        
        <span className="w-8 text-center font-mono text-lg font-bold text-on-surface">
          {item.quantity}
        </span>
        
        <button
          onClick={onIncrement}
          className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container font-mono text-lg font-bold hover:brightness-110 active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-container"
          aria-label={`Augmenter la quantité de ${item.name}`}
        >
          +
        </button>
        
        {/* Remove button */}
        <button
          onClick={onRemove}
          className="ml-2 p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-error"
          aria-label={`Supprimer ${item.name} du panier`}
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
    </div>
  );
}

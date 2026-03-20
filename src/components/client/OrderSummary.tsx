// src/components/client/OrderSummary.tsx
// Résumé de la commande avec totaux

import { cn } from '../../utils/cn';
import type { OrderType } from '../../hooks/useCart';

interface OrderSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  orderType: OrderType;
  onSetOrderType: (type: OrderType) => void;
}

export function OrderSummary({
  subtotal,
  tax,
  total,
  orderType,
  onSetOrderType,
}: OrderSummaryProps): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Order type toggle */}
      <div>
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          Type de commande
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSetOrderType('sur_place')}
            className={cn(
              'px-4 py-3 rounded-lg font-bold transition-all',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
              orderType === 'sur_place'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
            )}
            aria-pressed={orderType === 'sur_place'}
          >
            SUR PLACE
          </button>
          <button
            onClick={() => onSetOrderType('emporter')}
            className={cn(
              'px-4 py-3 rounded-lg font-bold transition-all',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
              orderType === 'emporter'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
            )}
            aria-pressed={orderType === 'emporter'}
          >
            À EMPORTER
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-surface-container-low rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Sous-total</span>
          <span className="font-mono text-on-surface">{subtotal.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">
            TVA (10%)
          </span>
          <span className="font-mono text-on-surface">{tax.toFixed(2)}€</span>
        </div>
        <div className="border-t border-outline-variant/10 pt-2 flex justify-between items-center">
          <span className="font-bold text-on-surface">Total</span>
          <span className="font-mono text-2xl font-bold text-primary">
            {total.toFixed(2)}€
          </span>
        </div>
      </div>
    </div>
  );
}

// src/components/client/Cart.tsx
// Panier latéral avec résumé et validation

import { cn, iconFilled } from '../../utils/cn';
import type { CartItem as CartItemType, OrderType } from '../../hooks/useCart';
import { CartItem } from './CartItem';
import { OrderSummary } from './OrderSummary';

interface CartProps {
  cart: CartItemType[];
  subtotal: number;
  tax: number;
  total: number;
  orderType: OrderType;
  onSetOrderType: (type: OrderType) => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onValidate: () => void;
}

export function Cart({
  cart,
  subtotal,
  tax,
  total,
  orderType,
  onSetOrderType,
  onUpdateQuantity,
  onRemoveItem,
  onValidate,
}: CartProps): JSX.Element | null {
  if (cart.length === 0) {
    return null;
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside
      className="fixed right-0 top-16 bottom-0 w-96 bg-surface-container border-l border-outline-variant/10 flex flex-col z-40"
      role="complementary"
      aria-label="Panier de commande"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-container/20 p-2 rounded-lg">
            <span
              className={iconFilled()}
              aria-hidden="true"
            >
              shopping_basket
            </span>
          </div>
          <div>
            <h2 className="font-bold font-headline">Votre Panier</h2>
            <p className="text-xs text-on-surface-variant">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-auto p-4">
        {cart.map((item, index) => (
          <CartItem
            key={`${item.menuItem.id}-${index}`}
            item={item}
            index={index}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Footer with summary and CTA */}
      <div className="border-t border-outline-variant/10 p-4 space-y-4 bg-surface-container">
        <OrderSummary
          subtotal={subtotal}
          tax={tax}
          total={total}
          orderType={orderType}
          onSetOrderType={onSetOrderType}
        />

        {/* Pay button */}
        <button
          onClick={onValidate}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3',
            'bg-primary text-on-primary',
            'hover:brightness-110 active:scale-[0.98] transition-all',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
            'shadow-xl shadow-primary/10'
          )}
        >
          <span
            className={iconFilled()}
            aria-hidden="true"
          >
            payment
          </span>
          <span>PAYER</span>
          <span className="font-mono">{total.toFixed(2)}€</span>
        </button>
      </div>
    </aside>
  );
}

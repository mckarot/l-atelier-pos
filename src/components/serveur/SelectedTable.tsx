// src/components/serveur/SelectedTable.tsx
// Panel de détail d'une table sélectionnée

import { useState } from 'react';
import { useServerOrders } from '../../hooks/useServerOrders';
import type { FloorTable } from './types';
import { OrderItem as OrderItemComponent } from './OrderItem';
import { useElapsedTime } from '../../hooks/useFloorPlan';

export interface SelectedTableProps {
  table: FloorTable;
  onClose: () => void;
  onCheckout?: () => void;
  onAddNote?: () => void;
  onSplit?: () => void;
}

export function SelectedTable({
  table,
  onClose,
  onCheckout,
  onAddNote,
  onSplit,
}: SelectedTableProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const { updateItemQuantity } = useServerOrders();
  const elapsed = table.currentOrder ? useElapsedTime(table.currentOrder.startTime) : null;

  const handleQuantityChange = async (itemIndex: number, delta: number) => {
    if (!table.currentOrder) return;
    await updateItemQuantity(table.currentOrder.id, itemIndex, delta);
  };

  const filteredItems = table.currentOrder?.items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="relative w-full max-w-md bg-surface-container-low h-full shadow-2xl overflow-y-auto"
        role="dialog"
        aria-label={`Détails de la table ${table.name}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-high border-b border-outline-variant/10 z-10">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono text-primary uppercase tracking-widest">
                  TABLE SÉLECTIONNÉE
                </span>
                <h3 className="font-headline text-6xl font-black text-on-surface">
                  {table.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
                aria-label="Fermer le panel"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Total and time */}
            <div className="flex justify-between items-end">
              <div>
                <span className="font-mono text-4xl font-bold text-primary">
                  €{(table.currentOrder?.total || 0).toFixed(2).replace('.00', '.')}
                </span>
              </div>
              {elapsed && (
                <div className="text-right">
                  <span className="text-xs font-mono text-on-surface-variant uppercase">
                    DEPUIS {elapsed.minutes}:
                  </span>
                  <span className="font-mono text-2xl font-bold text-on-surface">
                    {elapsed.seconds.toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="px-6 pb-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher article..."
                className="w-full bg-surface-container-highest text-on-surface placeholder-on-surface-variant/50 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container"
                aria-label="Rechercher un article"
              />
            </div>
          </div>
        </div>

        {/* Order notes */}
        {table.currentOrder?.notes && (
          <div className="px-6 py-4">
            <div className="rounded-lg bg-primary-container/10 border border-primary-container/20 p-4">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                  note_alt
                </span>
                <div>
                  <span className="text-xs font-medium text-primary uppercase tracking-widest block mb-1">
                    Notes
                  </span>
                  <p className="text-sm text-on-surface whitespace-pre-wrap">
                    {table.currentOrder.notes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="p-6 space-y-3">
          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <OrderItemComponent
                key={`${item.name}-${index}`}
                item={item}
                itemIndex={index}
                onQuantityChange={handleQuantityChange}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl mb-2">
                receipt_long
              </span>
              <p className="text-on-surface-variant text-sm">
                {table.currentOrder ? 'Aucun article ne correspond à votre recherche' : 'Aucune commande en cours'}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="sticky bottom-0 bg-surface-container-low border-t border-outline-variant/10 p-6 space-y-3">
          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onAddNote}
              className="px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold hover:bg-surface-container-high transition-colors"
              aria-label="Ajouter une note"
            >
              NOTE
            </button>
            <button
              onClick={onSplit}
              className="px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold hover:bg-surface-container-high transition-colors"
              aria-label="Diviser l'addition"
            >
              DIVISER
            </button>
          </div>

          {/* Primary action - Checkout */}
          <button
            onClick={onCheckout}
            className="w-full bg-primary-container text-on-primary-container font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all"
            aria-label="Encaisser"
          >
            <span className="material-symbols-outlined">payment</span>
            <span>ENCAISSER</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

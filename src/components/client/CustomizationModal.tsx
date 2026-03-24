// src/components/client/CustomizationModal.tsx
// Modal de personnalisation des plats

import { useState, useCallback } from 'react';
import { cn, iconFilled } from '../../utils/cn';
import type { MenuItem, Supplement, CookingLevel } from '../../firebase/types';
import { SUPPLEMENT_LABELS, SUPPLEMENT_PRICES } from '../../firebase/types';

interface CustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (cookingLevel: CookingLevel | undefined, supplements: Supplement[]) => void;
}

export function CustomizationModal({
  item,
  onClose,
  onConfirm,
}: CustomizationModalProps): JSX.Element {
  const [selectedCooking, setSelectedCooking] = useState<CookingLevel | undefined>();
  const [selectedSupplements, setSelectedSupplements] = useState<Supplement[]>([]);
  const [orderType, setOrderType] = useState<'sur_place' | 'emporter'>('sur_place');

  const cookingOptions: CookingLevel[] = item.customizationOptions?.cookingLevel ? [item.customizationOptions.cookingLevel] : [];
  const supplementOptions: Supplement[] = item.customizationOptions?.extra || [];

  const handleToggleSupplement = useCallback((supplement: Supplement) => {
    setSelectedSupplements((prev) => {
      const exists = prev.includes(supplement);
      if (exists) {
        return prev.filter((s) => s !== supplement);
      }
      return [...prev, supplement];
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedCooking, selectedSupplements);
  }, [selectedCooking, selectedSupplements, onConfirm]);

  const basePrice = item.price;
  const supplementsPrice = selectedSupplements.reduce((sum, s) => sum + SUPPLEMENT_PRICES[s], 0);
  const totalPrice = basePrice + supplementsPrice;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="bg-surface-container rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-container border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between">
          <h2
            id="modal-title"
            className="text-xl font-bold font-headline"
          >
            Personnalisation : {item.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-variant transition-colors"
            aria-label="Fermer"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              close
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cooking level section */}
          {cookingOptions.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                Cuisson
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {cookingOptions.map((cooking) => (
                  <button
                    key={cooking}
                    onClick={() => setSelectedCooking(cooking)}
                    className={cn(
                      'px-4 py-3 rounded-lg font-medium transition-all',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                      selectedCooking === cooking
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
                    )}
                    aria-pressed={selectedCooking === cooking}
                  >
                    {cooking}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Supplements section */}
          {supplementOptions.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                Suppléments
              </h3>
              <div className="space-y-2">
                {supplementOptions.map((supplement) => {
                  const isSelected = selectedSupplements.includes(supplement);
                  return (
                    <button
                      key={supplement}
                      onClick={() => handleToggleSupplement(supplement)}
                      className={cn(
                        'w-full px-4 py-3 rounded-lg flex items-center justify-between transition-all',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                        isSelected
                          ? 'bg-primary-container/20 border-2 border-primary-container'
                          : 'bg-surface-container-highest border-2 border-transparent hover:bg-surface-variant'
                      )}
                      aria-pressed={isSelected}
                    >
                      <span className={cn(
                        'font-medium',
                        isSelected ? 'text-primary' : 'text-on-surface-variant'
                      )}>
                        {SUPPLEMENT_LABELS[supplement]}
                      </span>
                      <span className={cn(
                        'font-mono font-bold',
                        isSelected ? 'text-primary' : 'text-on-surface-variant'
                      )}>
                        +{SUPPLEMENT_PRICES[supplement].toFixed(2)}€
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Order type */}
          <section>
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Type de commande
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderType('sur_place')}
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
                onClick={() => setOrderType('emporter')}
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
          </section>

          {/* Order summary */}
          <section className="bg-surface-container-low rounded-xl p-4">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Résumé du Paiement
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">
                  {item.name} x1
                </span>
                <span className="font-mono text-on-surface">
                  {basePrice.toFixed(2)}€
                </span>
              </div>
              {selectedSupplements.map((supplement) => (
                <div
                  key={supplement}
                  className="flex justify-between text-on-surface-variant"
                >
                  <span>└ {SUPPLEMENT_LABELS[supplement]}</span>
                  <span className="font-mono">+{SUPPLEMENT_PRICES[supplement].toFixed(2)}€</span>
                </div>
              ))}
              <div className="border-t border-outline-variant/10 pt-2 mt-2 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-mono text-2xl font-bold text-primary">
                  {totalPrice.toFixed(2)}€
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-surface-container border-t border-outline-variant/10 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-bold bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              'px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all',
              'bg-primary-container text-on-primary-container hover:brightness-110 active:scale-[0.98]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'
            )}
          >
            <span
              className={iconFilled()}
              aria-hidden="true"
            >
              add_shopping_cart
            </span>
            <span>Ajouter au Panier</span>
          </button>
        </div>
      </div>
    </div>
  );
}

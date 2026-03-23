// src/components/serveur/PaymentModal.tsx
// Modal d'encaissement avec 3 options de paiement

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: 'especes' | 'cb' | 'none') => Promise<void>;
  total: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  total,
}: PaymentModalProps): JSX.Element | null {
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'cb' | 'none'>('cb');
  const [amountGiven, setAmountGiven] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      setAmountGiven('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const amountGivenNum = parseFloat(amountGiven) || 0;
  const change = amountGivenNum - total;
  const hasSufficientAmount = amountGivenNum >= total && amountGiven !== '';

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(paymentMethod);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface-container-low p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="payment-modal-title"
            className="text-lg font-semibold text-on-surface"
          >
            Encaissement
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="rounded-md p-1 hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Total */}
        <div className="mb-6 rounded-lg bg-surface-container-highest p-4">
          <span className="text-sm text-on-surface-variant">Total à payer</span>
          <p className="text-3xl font-bold text-primary font-mono">
            €{total.toFixed(2).replace('.00', '.')}
          </p>
        </div>

        {/* Payment methods */}
        <div className="space-y-3 mb-6">
          <span className="text-sm font-medium text-on-surface-variant">
            Mode de paiement
          </span>

          <button
            onClick={() => setPaymentMethod('especes')}
            className={cn(
              'w-full rounded-lg border-2 p-4 text-left transition-colors',
              paymentMethod === 'especes'
                ? 'border-primary bg-primary-container/10'
                : 'border-outline-variant/20 hover:border-outline-variant/40'
            )}
            aria-pressed={paymentMethod === 'especes'}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">payments</span>
              <span className="font-bold text-on-surface">Espèces</span>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('cb')}
            className={cn(
              'w-full rounded-lg border-2 p-4 text-left transition-colors',
              paymentMethod === 'cb'
                ? 'border-primary bg-primary-container/10'
                : 'border-outline-variant/20 hover:border-outline-variant/40'
            )}
            aria-pressed={paymentMethod === 'cb'}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">credit_card</span>
              <span className="font-bold text-on-surface">Carte bancaire</span>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('none')}
            className={cn(
              'w-full rounded-lg border-2 p-4 text-left transition-colors',
              paymentMethod === 'none'
                ? 'border-primary bg-primary-container/10'
                : 'border-outline-variant/20 hover:border-outline-variant/40'
            )}
            aria-pressed={paymentMethod === 'none'}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">free_breakfast</span>
              <span className="font-bold text-on-surface">Offert / Sans paiement</span>
            </div>
          </button>
        </div>

        {/* Amount given (Espèces only) */}
        {paymentMethod === 'especes' && (
          <div className="mb-6">
            <label
              htmlFor="amount-given"
              className="block text-sm font-medium text-on-surface-variant mb-2"
            >
              Montant donné par le client
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-mono">
                €
              </span>
              <input
                id="amount-given"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amountGiven}
                onChange={(e) => setAmountGiven(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-container-highest text-on-surface placeholder-on-surface-variant/50 rounded-lg pl-8 pr-4 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                aria-describedby="change-amount"
              />
            </div>

            {/* Change to return */}
            {hasSufficientAmount && (
              <div
                id="change-amount"
                className="mt-3 rounded-lg bg-primary-container/10 p-3"
              >
                <span className="text-sm text-on-surface-variant">
                  Monnaie à rendre
                </span>
                <p className="text-2xl font-bold text-primary font-mono">
                  €{change.toFixed(2).replace('.00', '.')}
                </p>
              </div>
            )}

            {!hasSufficientAmount && amountGiven !== '' && (
              <p className="mt-2 text-sm text-error" role="alert">
                Montant insuffisant
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface font-bold hover:bg-surface-container-highest disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || (paymentMethod === 'especes' && !hasSufficientAmount)}
            className="flex-1 rounded-lg bg-primary-container text-on-primary-container font-bold px-4 py-3 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
          >
            {isProcessing ? 'Traitement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}

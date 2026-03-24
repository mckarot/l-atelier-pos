// src/components/serveur/SplitBillModal.tsx
// Modal de division d'addition avec sélection d'items

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import type { OrderItem } from '../../firebase/types';

export interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemIndices: number[], splitType: 'equal' | 'items') => Promise<void>;
  items: OrderItem[];
}

export function SplitBillModal({
  isOpen,
  onClose,
  onConfirm,
  items,
}: SplitBillModalProps): JSX.Element | null {
  const [splitType, setSplitType] = useState<'equal' | 'items'>('equal');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      setSelectedIndices([]);
      setSplitType('equal');
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

  const handleToggleIndex = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    setSelectedIndices(items.map((_, i) => i));
  };

  const handleDeselectAll = () => {
    setSelectedIndices([]);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(selectedIndices, splitType);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = selectedIndices.length;
  const canConfirmItems = splitType === 'equal' || selectedCount > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="split-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-surface-container-low p-6 shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="split-modal-title"
            className="text-lg font-semibold text-on-surface"
          >
            Diviser l'addition
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

        {/* Split type selection */}
        <div className="mb-6">
          <span className="text-sm font-medium text-on-surface-variant block mb-3">
            Type de division
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSplitType('equal')}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-colors',
                splitType === 'equal'
                  ? 'border-primary bg-primary-container/10'
                  : 'border-outline-variant/20 hover:border-outline-variant/40'
              )}
              aria-pressed={splitType === 'equal'}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-sm">
                  balance
                </span>
                <span className="font-bold text-on-surface">Équitable</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Diviser en 2 parts égales
              </p>
            </button>

            <button
              onClick={() => setSplitType('items')}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-colors',
                splitType === 'items'
                  ? 'border-primary bg-primary-container/10'
                  : 'border-outline-variant/20 hover:border-outline-variant/40'
              )}
              aria-pressed={splitType === 'items'}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-sm">
                  checklist
                </span>
                <span className="font-bold text-on-surface">Par items</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Sélectionner les articles
              </p>
            </button>
          </div>
        </div>

        {/* Items list (only for 'items' split type) */}
        {splitType === 'items' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-on-surface-variant">
                Articles à diviser
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Tout sélectionner
                </button>
                <span className="text-on-surface-variant">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs font-medium text-on-surface-variant hover:underline"
                >
                  Tout désélectionner
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-outline-variant/20 p-2">
              {items.map((item, index) => (
                <label
                  key={`${item.name}-${index}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    selectedIndices.includes(index)
                      ? 'bg-primary-container/10'
                      : 'hover:bg-surface-container-highest'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedIndices.includes(index)}
                    onChange={() => handleToggleIndex(index)}
                    className="w-4 h-4 rounded border-outline-variant/40 text-primary focus:ring-primary"
                    aria-label={`Sélectionner ${item.name}`}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-on-surface">
                      {item.name}
                    </span>
                    <span className="text-xs text-on-surface-variant ml-2">
                      × {item.quantity}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {selectedCount > 0 && (
              <p className="mt-2 text-xs text-on-surface-variant">
                {selectedCount} article{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Info message */}
        <div className="mb-6 rounded-lg bg-surface-container-highest p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-sm mt-0.5">
              info
            </span>
            <div>
              <p className="text-sm text-on-surface">
                {splitType === 'equal'
                  ? 'La commande sera divisée en deux parts égales. Deux nouvelles commandes seront créées.'
                  : 'Les articles sélectionnés seront transférés dans une nouvelle commande partagée.'}
              </p>
            </div>
          </div>
        </div>

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
            disabled={isProcessing || !canConfirmItems}
            className="flex-1 rounded-lg bg-primary-container text-on-primary-container font-bold px-4 py-3 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
          >
            {isProcessing ? 'Traitement...' : 'Diviser'}
          </button>
        </div>
      </div>
    </div>
  );
}

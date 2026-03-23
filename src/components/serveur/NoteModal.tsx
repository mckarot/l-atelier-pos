// src/components/serveur/NoteModal.tsx
// Modal d'ajout de note à une commande

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => Promise<void>;
  existingNotes?: string;
}

export function NoteModal({
  isOpen,
  onClose,
  onSave,
  existingNotes = '',
}: NoteModalProps): JSX.Element | null {
  const [notes, setNotes] = useState(existingNotes);
  const [isSaving, setIsSaving] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      setNotes(existingNotes);
      // Focus sur le textarea après ouverture
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, existingNotes]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(notes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setNotes('');
    textareaRef.current?.focus();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
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
            id="note-modal-title"
            className="text-lg font-semibold text-on-surface"
          >
            Notes de commande
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

        {/* Existing notes display */}
        {existingNotes && (
          <div className="mb-4 rounded-lg bg-surface-container-highest p-3">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
              Notes actuelles
            </span>
            <p className="mt-1 text-sm text-on-surface whitespace-pre-wrap">
              {existingNotes}
            </p>
          </div>
        )}

        {/* Notes textarea */}
        <div className="mb-6">
          <label
            htmlFor="notes-textarea"
            className="block text-sm font-medium text-on-surface-variant mb-2"
          >
            Ajouter ou modifier une note
          </label>
          <textarea
            id="notes-textarea"
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Allergies, préférences client, instructions spéciales..."
            rows={5}
            className={cn(
              'w-full rounded-lg bg-surface-container-highest text-on-surface placeholder-on-surface-variant/50 p-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none',
              'transition-colors'
            )}
            aria-describedby="notes-hint"
          />
          <p id="notes-hint" className="mt-2 text-xs text-on-surface-variant">
            Ces notes seront visibles par toute l'équipe
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface font-bold hover:bg-surface-container-highest disabled:opacity-50"
          >
            Annuler
          </button>
          {existingNotes && (
            <button
              onClick={handleClear}
              disabled={isSaving || !notes}
              className="px-4 py-3 rounded-lg border border-error/40 text-error font-bold hover:bg-error/10 disabled:opacity-50"
              aria-label="Effacer les notes"
            >
              Effacer
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 rounded-lg bg-primary-container text-on-primary-container font-bold px-4 py-3 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

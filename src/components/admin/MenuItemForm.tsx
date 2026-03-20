// src/components/admin/MenuItemForm.tsx
// Formulaire modal pour ajouter/modifier un item du menu

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn, iconFilled } from '../../utils/cn';
import type { MenuItem, MenuCategory, StationType } from '../../db/types';
import { CATEGORIES, STATIONS } from '../../hooks/useMenuEditor';

export interface MenuItemFormProps {
  item: MenuItem | null;
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    category: MenuCategory;
    image?: string;
    allergens?: string[];
    station?: StationType;
    isAvailable: 0 | 1;
  }) => Promise<void>;
  onClose: () => void;
}

const COMMON_ALLERGENS = [
  'gluten',
  'lait',
  'oeufs',
  'poisson',
  'crustacés',
  'fruits à coque',
  'céleri',
  'moutarde',
  'sésame',
  'soja',
  'sulfites',
  'lupin',
];

export function MenuItemForm({
  item,
  onSubmit,
  onClose,
}: MenuItemFormProps): JSX.Element {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [category, setCategory] = useState<MenuCategory>(
    item?.category || 'Entrées'
  );
  const [image, setImage] = useState(item?.image || '');
  const [station, setStation] = useState<StationType | ''>(
    item?.station || ''
  );
  const [allergens, setAllergens] = useState<string[]>(item?.allergens || []);
  const [isAvailable, setIsAvailable] = useState<0 | 1>(
    item?.isAvailable ?? 1
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus sur le champ nom à l'ouverture
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, []);

  const handleAllergenToggle = useCallback((allergen: string) => {
    setAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validation
      if (!name.trim()) {
        setError('Le nom est obligatoire');
        nameInputRef.current?.focus();
        return;
      }

      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        setError('Le prix doit être un nombre supérieur à 0');
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit({
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          category,
          image: image.trim() || undefined,
          station: station || undefined,
          allergens,
          isAvailable,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, description, price, category, image, station, allergens, isAvailable, onSubmit]
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-surface-container-low rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          'shadow-2xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <h2
            id="modal-title"
            className="text-xl font-bold font-headline text-on-surface"
          >
            {item ? `Modifier "${item.name}"` : 'Ajouter un article'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
            aria-label="Fermer"
          >
            <span
              className={cn(iconFilled(), 'text-on-surface-variant text-xl')}
              aria-hidden="true"
            >
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom et Prix */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-bold text-on-surface mb-2"
              >
                Nom de l'article *
              </label>
              <input
                ref={nameInputRef}
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  'w-full px-4 py-2 rounded-lg border bg-surface-container-highest',
                  'border-outline-variant/20 text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
                placeholder="Ex: Burger de l'Atelier"
                required
              />
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-bold text-on-surface mb-2"
              >
                Prix (€) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={cn(
                  'w-full px-4 py-2 rounded-lg border bg-surface-container-highest',
                  'border-outline-variant/20 text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
                placeholder="19.50"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-bold text-on-surface mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                'w-full px-4 py-2 rounded-lg border bg-surface-container-highest',
                'border-outline-variant/20 text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              placeholder="Décrivez l'article..."
            />
          </div>

          {/* Catégorie et Station */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-bold text-on-surface mb-2"
              >
                Catégorie
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuCategory)}
                className={cn(
                  'w-full px-4 py-2 rounded-lg border bg-surface-container-highest',
                  'border-outline-variant/20 text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="station"
                className="block text-sm font-bold text-on-surface mb-2"
              >
                Station
              </label>
              <select
                id="station"
                value={station}
                onChange={(e) => setStation(e.target.value as StationType | '')}
                className={cn(
                  'w-full px-4 py-2 rounded-lg border bg-surface-container-highest',
                  'border-outline-variant/20 text-on-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
              >
                <option value="">Aucune</option>
                {STATIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* URL Image */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-bold text-on-surface mb-2"
            >
              URL de l'image
            </label>
            <input
              id="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={cn(
                'w-full px-4 py-2 rounded-lg border bg-surface-container-highest',
                'border-outline-variant/20 text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              placeholder="https://..."
            />
          </div>

          {/* Allergènes */}
          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">
              Allergènes
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => handleAllergenToggle(allergen)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider',
                    'transition-colors',
                    allergens.includes(allergen)
                      ? 'bg-error-container text-error'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container'
                  )}
                  aria-pressed={allergens.includes(allergen)}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* Disponibilité */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAvailable(isAvailable === 1 ? 0 : 1)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                isAvailable === 1 ? 'bg-tertiary' : 'bg-on-surface-variant/30'
              )}
              role="switch"
              aria-checked={isAvailable === 1}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-on-primary-container transition-transform',
                  isAvailable === 1 ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span className="text-sm font-bold text-on-surface">
              Article disponible à la carte
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="p-4 rounded-lg bg-error-container/20 border border-error/30"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(iconFilled(), 'text-error text-xl')}
                  aria-hidden="true"
                >
                  error
                </span>
                <span className="text-sm text-error">{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-bold text-on-surface
                         hover:bg-surface-container-highest transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'px-6 py-2 rounded-lg font-bold text-on-primary-container',
                'bg-primary-container',
                'hover:brightness-110 active:scale-95 transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Enregistrement...' : item ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// src/components/serveur/AddItemModal.tsx
// Modal d'ajout d'items à une commande existante

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMenuItemsByCategory, useAvailableMenuItems } from '../../hooks/useMenu';
import { useServerCart } from '../../hooks/useServerCart';
import { useServerOrders } from '../../hooks/useServerOrders';
import { ServerCartItem } from './ServerCartItem';
import type { FloorTable } from './types';
import type { MenuCategory } from '../../db/types';

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: FloorTable;
  onItemsAdded?: () => void;
}

type CategoryFilter = 'Tous' | MenuCategory;

const CATEGORIES: CategoryFilter[] = ['Tous', 'Entrées', 'Plats', 'Desserts', 'Boissons'];

export function AddItemModal({
  isOpen,
  onClose,
  table,
  onItemsAdded,
}: AddItemModalProps): JSX.Element | null {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Tous');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { items, total, itemCount, addItem, removeItem, updateQuantity, clearCart } = useServerCart();
  const { addItemsToOrder } = useServerOrders();

  // Récupérer les items du menu
  const allMenuItems = useAvailableMenuItems();
  const entreesItems = useMenuItemsByCategory('Entrées');
  const platsItems = useMenuItemsByCategory('Plats');
  const dessertsItems = useMenuItemsByCategory('Desserts');
  const boissonsItems = useMenuItemsByCategory('Boissons');

  // Filtrer les items par catégorie
  const filteredItems = useCallback(() => {
    if (!allMenuItems) return [];

    switch (selectedCategory) {
      case 'Entrées':
        return entreesItems || [];
      case 'Plats':
        return platsItems || [];
      case 'Desserts':
        return dessertsItems || [];
      case 'Boissons':
        return boissonsItems || [];
      default:
        return allMenuItems;
    }
  }, [selectedCategory, allMenuItems, entreesItems, platsItems, dessertsItems, boissonsItems]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    // Focus premier élément à l'ouverture
    firstElement?.focus();

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Clear cart when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearCart();
    }
  }, [isOpen, clearCart]);

  const handleAddItem = (menuItemId: number) => {
    const menuItem = allMenuItems?.find((item) => item.id === menuItemId);
    if (menuItem) {
      addItem(menuItem);
    }
  };

  const handleIncrement = (menuItemId: number) => {
    updateQuantity(menuItemId, 1);
  };

  const handleDecrement = (menuItemId: number) => {
    updateQuantity(menuItemId, -1);
  };

  const handleRemove = (menuItemId: number) => {
    removeItem(menuItemId);
  };

  const handleSubmit = async () => {
    if (items.length === 0 || !table.currentOrder) return;

    setIsSubmitting(true);
    try {
      await addItemsToOrder(table.currentOrder.id, items);
      clearCart();
      onItemsAdded?.();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des items:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const menuItems = filteredItems();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-item-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-5xl rounded-xl bg-surface-container-low shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div>
            <span className="text-xs font-mono text-primary uppercase tracking-widest">
              AJOUTER À LA COMMANDE
            </span>
            <h2
              id="add-item-modal-title"
              className="text-2xl font-bold text-on-surface font-headline"
            >
              Table {table.name}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="rounded-md p-2 hover:bg-surface-container-highest focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Category filters */}
        <div className="px-6 py-4 border-b border-outline-variant/10">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-container
                  active:scale-95
                  ${
                    selectedCategory === category
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                  }
                `}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu items grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {menuItems.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl mb-2">
                restaurant
              </span>
              <p className="text-on-surface-variant text-sm">
                Aucun item disponible dans cette catégorie
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((menuItem) => (
                <button
                  key={menuItem.id}
                  onClick={() => handleAddItem(menuItem.id)}
                  className="text-left rounded-xl border border-outline-variant/10 bg-surface-container-highest overflow-hidden hover:brightness-110 active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-container"
                  aria-label={`Ajouter ${menuItem.name} à la commande`}
                >
                  {menuItem.image && (
                    <div className="h-32 bg-surface-container-high overflow-hidden">
                      <img
                        src={menuItem.image}
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-body text-base font-semibold text-on-surface mb-1">
                      {menuItem.name}
                    </h3>
                    {menuItem.description && (
                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
                        {menuItem.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold text-primary">
                        €{menuItem.price.toFixed(2).replace('.00', '.')}
                      </span>
                      <span className="material-symbols-outlined text-primary text-sm">
                        add_shopping_cart
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart summary (sticky) */}
        {items.length > 0 && (
          <div className="border-t border-outline-variant/10 bg-surface-container-high">
            {/* Cart items */}
            <div className="max-h-48 overflow-y-auto px-6 py-4 space-y-2">
              {items.map((item) => (
                <ServerCartItem
                  key={item.menuItemId}
                  item={item}
                  onIncrement={() => handleIncrement(item.menuItemId)}
                  onDecrement={() => handleDecrement(item.menuItemId)}
                  onRemove={() => handleRemove(item.menuItemId)}
                />
              ))}
            </div>

            {/* Summary bar */}
            <div className="px-6 py-4 bg-surface-container-highest">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-on-surface-variant">
                    {itemCount} article{itemCount > 1 ? 's' : ''}
                  </span>
                  <p className="text-2xl font-bold text-primary font-mono">
                    €{total.toFixed(2).replace('.00', '.')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface font-bold hover:bg-surface-container-highest disabled:opacity-50 transition-colors"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || items.length === 0}
                  className="flex-1 rounded-lg bg-primary-container text-on-primary-container font-bold px-4 py-3 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all active:scale-95"
                >
                  {isSubmitting ? 'Ajout...' : 'AJOUTER'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty cart message */}
        {items.length === 0 && (
          <div className="px-6 py-8 border-t border-outline-variant/10 bg-surface-container-high">
            <div className="text-center">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl mb-2">
                shopping_cart
              </span>
              <p className="text-on-surface-variant text-sm">
                Sélectionnez des items à ajouter à la commande
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

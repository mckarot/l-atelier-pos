// src/views/Admin/MenuEditor.tsx
// Page éditeur de menu - CRUD complet des articles

import { useCallback } from 'react';
import { cn, iconFilled } from '../../utils/cn';
import { useMenuEditor, CATEGORIES } from '../../hooks/useMenuEditor';
import { MenuItemRow } from '../../components/admin/MenuItemRow';
import { MenuItemForm } from '../../components/admin/MenuItemForm';
import type { MenuItem, MenuCategory } from '../../firebase/types';

export function MenuEditor(): JSX.Element {
  const {
    menuItems,
    isLoading,
    error,
    isModalOpen,
    editingItem,
    openAddModal,
    openEditModal,
    closeModal,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability,
  } = useMenuEditor();

  const handleAddSubmit = useCallback(
    async (data: {
      name: string;
      description: string;
      price: number;
      category: MenuCategory;
      image?: string;
      allergens?: string[];
      station?: string;
      isAvailable: 0 | 1;
    }) => {
      await addItem(data);
    },
    [addItem]
  );

  const handleEditSubmit = useCallback(
    async (data: {
      name: string;
      description: string;
      price: number;
      category: MenuCategory;
      image?: string;
      allergens?: string[];
      station?: string;
      isAvailable: 0 | 1;
    }) => {
      if (!editingItem) return;
      await updateItem(editingItem.id, data);
    },
    [editingItem, updateItem]
  );

  // Grouper les items par catégorie
  const groupedItems = useCallback(() => {
    if (!menuItems) return {};

    const groups: Record<string, MenuItem[]> = {};
    CATEGORIES.forEach((cat) => {
      groups[cat] = menuItems.filter((item) => item.category === cat);
    });

    return groups;
  }, [menuItems]);

  const itemsByCategory = groupedItems();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span
            className={cn(iconFilled(), 'text-primary text-4xl animate-spin')}
            aria-hidden="true"
          >
            progress_activity
          </span>
          <p className="mt-4 text-on-surface-variant font-medium">
            Chargement du menu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-headline text-on-surface">
            Éditeur de Menu
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Gérez les articles de votre carte
          </p>
        </div>
        <button
          onClick={openAddModal}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-lg',
            'bg-primary-container text-on-primary-container',
            'font-bold hover:brightness-110 active:scale-95 transition-all'
          )}
        >
          <span
            className={cn(iconFilled(), 'text-xl')}
            aria-hidden="true"
          >
            add_circle
          </span>
          <span>Ajouter un article</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
          <div className="text-2xl font-bold text-primary font-mono">
            {menuItems?.length || 0}
          </div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
            Total Articles
          </div>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
          <div className="text-2xl font-bold text-tertiary font-mono">
            {menuItems?.filter((i) => i.isAvailable === 1).length || 0}
          </div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
            Disponibles
          </div>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
          <div className="text-2xl font-bold text-error font-mono">
            {menuItems?.filter((i) => i.isAvailable === 0).length || 0}
          </div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
            Indisponibles
          </div>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
          <div className="text-2xl font-bold text-on-surface font-mono">
            {CATEGORIES.length}
          </div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">
            Catégories
          </div>
        </div>
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

      {/* Liste par catégorie */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const items = itemsByCategory[category] || [];
          if (items.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-3 flex items-center gap-2">
                <span className="text-primary">{category}</span>
                <span className="text-xs font-normal text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onEdit={openEditModal}
                    onDelete={deleteItem}
                    onToggleAvailability={toggleAvailability}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {(!menuItems || menuItems.length === 0) && (
        <div className="text-center py-12">
          <span
            className={cn(iconFilled(), 'text-on-surface-variant text-6xl')}
            aria-hidden="true"
          >
            restaurant_menu
          </span>
          <h3 className="text-xl font-bold font-headline text-on-surface mt-4">
            Aucun article dans le menu
          </h3>
          <p className="text-on-surface-variant mt-2">
            Commencez par ajouter votre premier article
          </p>
          <button
            onClick={openAddModal}
            className={cn(
              'mt-6 flex items-center gap-2 px-6 py-3 rounded-lg',
              'bg-primary-container text-on-primary-container',
              'font-bold hover:brightness-110 active:scale-95 transition-all'
            )}
          >
            <span
              className={cn(iconFilled(), 'text-xl')}
              aria-hidden="true"
            >
              add_circle
            </span>
            <span>Ajouter un article</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <MenuItemForm
          item={editingItem}
          onSubmit={editingItem ? handleEditSubmit : handleAddSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default MenuEditor;

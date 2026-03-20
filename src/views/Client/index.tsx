// src/views/Client/index.tsx
// Vue Client - Menu interactif et commande avec personnalisation

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { MenuItem, MenuCategory, Supplement, CookingLevel } from '../../db/types';
import { ClientLayout } from '../../components/layout/ClientLayout';
import { MenuFilters } from '../../components/client/MenuFilters';
import { MenuGrid } from '../../components/client/MenuGrid';
import { CustomizationModal } from '../../components/client/CustomizationModal';
import { Cart } from '../../components/client/Cart';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

const CATEGORIES: MenuCategory[] = ['Entrées', 'Plats', 'Desserts', 'Boissons'];

function ClientView(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'Tous'>('Tous');
  const [isCustomizing, setIsCustomizing] = useState<MenuItem | null>(null);
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, subtotal, tax, total, orderType, setOrderType } = useCart();
  const { showToast } = useToast();

  // Menu items depuis Dexie
  const menuItems = useLiveQuery<MenuItem[]>(
    () => db.menuItems.where('isAvailable').equals(1).toArray(),
    []
  );

  // Filtrage par catégorie
  const filteredItems = menuItems?.filter((item) => {
    if (selectedCategory === 'Tous') return true;
    return item.category === selectedCategory;
  });

  // Ajouter au panier (avec personnalisation optionnelle)
  const handleAddToCart = useCallback((item: MenuItem, cookingLevel?: CookingLevel, supplements?: Supplement[]) => {
    const hasCustomization = item.customizationOptions && (
      (item.customizationOptions.cooking && item.customizationOptions.cooking.length > 0) ||
      (item.customizationOptions.supplements && item.customizationOptions.supplements.length > 0)
    );

    if (hasCustomization && !cookingLevel && !supplements) {
      // Ouvrir le modal de personnalisation
      setIsCustomizing(item);
      return;
    }

    // Ajouter directement au panier
    addToCart(item, cookingLevel, supplements);
    showToast(`${item.name} ajouté au panier`);
  }, [addToCart, showToast]);

  // Valider la commande
  const handleValidateOrder = useCallback(async () => {
    if (cart.length === 0) return;

    try {
      const tableId = 1; // Table ID par défaut (en production, venir du contexte de session)

      const orderData = {
        tableId,
        customerName: 'Client',
        status: 'en_attente' as const,
        items: cart.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          customization: item.customizations?.join(', '),
          cookingLevel: item.cookingLevel,
          supplements: item.supplements,
          station: item.menuItem.station,
        })),
        total,
        notes: `COMMANDE CLIENT - ${orderType === 'sur_place' ? 'SUR PLACE' : 'À EMPORTER'}`,
      };

      await db.orders.add({
        ...orderData,
        createdAt: Date.now(),
      } as any);

      showToast('Commande envoyée en cuisine !');
      clearCart();
    } catch (error) {
      console.error('[Client] Error creating order:', error);
      showToast('Erreur lors de la commande');
    }
  }, [cart, total, orderType, clearCart, showToast]);

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <p className="text-primary font-mono text-xs uppercase tracking-widest mb-1">
            Menu du Jour
          </p>
          <h2 className="text-3xl font-bold font-headline tracking-tight">
            Nos Grillades de l'Atelier
          </h2>
        </div>

        {/* Category filters */}
        <MenuFilters
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Menu grid */}
        <MenuGrid
          items={filteredItems || []}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* Customization modal */}
      {isCustomizing && (
        <CustomizationModal
          item={isCustomizing}
          onClose={() => setIsCustomizing(null)}
          onConfirm={(cookingLevel, supplements) => {
            handleAddToCart(isCustomizing, cookingLevel, supplements);
            setIsCustomizing(null);
          }}
        />
      )}

      {/* Cart sidebar */}
      <Cart
        cart={cart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        orderType={orderType}
        onSetOrderType={setOrderType}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onValidate={handleValidateOrder}
      />
    </ClientLayout>
  );
}

export default ClientView;

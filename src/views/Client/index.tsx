// src/views/Client/index.tsx
// Vue Client - Menu interactif et commande avec personnalisation

import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { MenuItem, MenuCategory, Supplement, CookingLevel } from '../../firebase/types';
import { ClientLayout } from '../../components/layout/ClientLayout';
import { MenuFilters } from '../../components/client/MenuFilters';
import { MenuGrid } from '../../components/client/MenuGrid';
import { CustomizationModal } from '../../components/client/CustomizationModal';
import { Cart } from '../../components/client/Cart';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';

const CATEGORIES: MenuCategory[] = ['entree', 'plat', 'dessert', 'boisson'];

function ClientView(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'Tous'>('Tous');
  const [isCustomizing, setIsCustomizing] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, subtotal, tax, total, orderType, setOrderType } = useCart();
  const { showToast } = useToast();

  // Menu items depuis Firebase
  useEffect(() => {
    const menuItemsRef = collection(getDb(), 'menuItems');
    const q = query(menuItemsRef, where('isAvailable', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as MenuItem));
        setMenuItems(items);
      },
      (error) => {
        console.error('[Client] Error loading menu items:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtrage par catégorie
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory === 'Tous') return true;
    return item.category === selectedCategory;
  });

  // Ajouter au panier (avec personnalisation optionnelle)
  const handleAddToCart = useCallback((item: MenuItem, cookingLevel?: CookingLevel, supplements?: Supplement[]) => {
    const hasCustomization = item.customizationOptions && (
      (item.customizationOptions.cookingLevel && item.customizationOptions.cookingLevel.length > 0) ||
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
        status: 'attente' as const,
        items: cart.map((item) => ({
          id: crypto.randomUUID(),
          name: item.menuItem.name,
          quantity: item.quantity,
          customization: item.customizations?.join(', '),
          cookingLevel: item.cookingLevel,
          supplements: item.supplements?.map(s => s.name),
          station: item.menuItem.station,
          price: item.menuItem.price,
        })),
        total,
        notes: `COMMANDE CLIENT - ${orderType === 'sur_place' ? 'SUR PLACE' : 'À EMPORTER'}`,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(getDb(), 'orders'), orderData);

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
          items={filteredItems}
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

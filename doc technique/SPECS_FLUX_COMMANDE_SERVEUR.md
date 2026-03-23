# 📋 Spécifications Techniques — Flux de Commande Serveur

> **Version :** 1.0  
> **Date :** 23 mars 2026  
> **Statut :** À implémenter  
> **Module :** SERVEUR — Prise de commande et gestion des tables  
> **Priorité :** 🔴 **HAUTE** — Bloquant pour démo production

---

## 🎯 Objectif

Implémenter un **flux complet de prise de commande** pour le module Serveur, permettant de :

1. **Prendre une commande** sur une table libre
2. **Modifier une commande** en cours (ajouter/supprimer items)
3. **Ajuster les quantités** en temps réel
4. **Encaisser et libérer** la table

---

## 📊 État Actuel vs État Cible

### ❌ Flux Actuel (Cassé)

```
┌─────────────────────────────────────────────────────────────┐
│ TABLE LIBRE → Clic → Panel                                  │
│                                                              │
│ "Aucune commande en cours"                                  │
│                                                              │
│ [ENCAISSER] ← Inactif / Inapproprié                         │
└─────────────────────────────────────────────────────────────┘
```

**Problème :** Impossible de créer une commande depuis une table libre.

---

### ✅ Flux Cible (Complet)

```
┌─────────────────────────────────────────────────────────────┐
│ TABLE LIBRE → Clic → Panel                                  │
│                                                              │
│ "AUCUNE COMMANDE EN COURS"                                  │
│                                                              │
│ [PRENDRE COMMANDE] ← NOUVEAU                                │
│         ↓                                                    │
│   Menu Modal (sélection plats)                              │
│         ↓                                                    │
│   Panier → Valider                                          │
│         ↓                                                    │
│   Création Order + Table OCCUPÉE                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE OCCUPÉE → Clic → Panel                                │
│                                                              │
│ Liste des items commandés                                   │
│  - 2x Burger Classique           [-  +]                     │
│  - 1x Salade César             [-  +]                       │
│                                                              │
│ [AJOUTER] [NOTE] [DIVISER] [ENCAISSER]                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE PRÊTE → Clic → Panel                                  │
│                                                              │
│ Total: 67,00€                                               │
│                                                              │
│ [ENCAISSER] → Modal Paiement (Espèces / CB)                 │
│         ↓                                                    │
│   Table LIBÉRÉE + Order PAYÉE                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Technique

### 1. Nouveaux Composants à Créer

```
src/components/serveur/
├── NewOrderModal.tsx          🔴 Haute   6h
├── AddItemModal.tsx           🔴 Haute   4h
├── ServerCartItem.tsx         🟠 Moyenne 2h
└── QuickAccessMenu.tsx        🟡 Basse   2h
```

### 2. Hooks à Créer/Modifier

```
src/hooks/
├── useServerOrders.ts         🔴 Haute   (ajouter 3 fonctions)
├── useServerCart.ts           🔴 Haute   (nouveau hook panier)
└── useMenu.ts                 ✅ Existant (réutilisé)
```

### 3. Modifications de Composants Existants

```
src/components/serveur/
├── SelectedTable.tsx          🔴 Haute   (refonte logique)
└── FloorPlan.tsx              🟠 Moyenne (gestion clic table libre)
```

---

## 📝 Spécifications Détaillées

---

## COMPOSANT 1 : `NewOrderModal.tsx`

### Rôle

Modal de prise de commande pour une table libre. Permet de sélectionner des items du menu et de créer une nouvelle commande.

### Interface

```tsx
interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  tableName: string;
}
```

### Structure UI

```
┌─────────────────────────────────────────────────────────────┐
│  NOUVELLE COMMANDE — Table T-XX                     [✕]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tous] [Entrées] [Plats] [Desserts] [Boissons] ← Filtres   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   [Image]    │  │   [Image]    │  │   [Image]    │      │
│  │  Burger      │  │  Salade      │  │  Pizza       │      │
│  │  12,50€      │  │  10,00€      │  │  14,00€      │      │
│  │  [+ Ajouter] │  │  [+ Ajouter] │  │  [+ Ajouter] │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  PANIER (3 articles)                      Total: 37,00€     │
│                                                              │
│  [ANNULER]                              [VALIDER COMMANDE]  │
└─────────────────────────────────────────────────────────────┘
```

### Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Filtres catégorie** | Boutons toggle (Tous, Entrées, Plats, Desserts, Boissons) |
| **Grille des items** | 3 colonnes, responsive, avec image, nom, prix |
| **Bouton Ajouter** | Ajoute l'item au panier local (state) |
| **Panier en temps réel** | Nombre d'articles + total calculé |
| **Validation** | Crée l'Order en DB + ferme modal + refresh FloorPlan |
| **Annulation** | Ferme modal sans créer de commande |

### Logique Métier

```typescript
// État local du panier
interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  supplements?: Array<{ name: string; price: number }>;
}

// Création de la commande
const handleValidate = async () => {
  const order = {
    tableId,
    status: 'en_attente' as OrderStatus,
    items: cart.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
      supplements: item.supplements,
    })),
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: Date.now(),
    customerName: `Table ${tableName}`,
  };

  await db.orders.add(order as Order);
  await db.restaurantTables.update(tableId, {
    status: 'occupee',
    currentOrderId: orderId, // ID auto-généré
  });

  onClose();
  // Toast de confirmation
};
```

### Fichiers de Test

```
src/components/serveur/NewOrderModal.test.tsx
```

**Cas de test :**
- ✅ Modal ouvert/fermé
- ✅ Ajout d'item au panier
- ✅ Calcul du total
- ✅ Validation crée bien une Order
- ✅ Table passe à `occupee`
- ✅ Annulation ne crée rien

---

## COMPOSANT 2 : `AddItemModal.tsx`

### Rôle

Modal d'ajout d'items à une commande existante. Similaire à `NewOrderModal` mais ajoute au lieu de créer.

### Interface

```tsx
interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  existingItems: OrderItem[];
}
```

### Différences avec NewOrderModal

| Aspect | NewOrderModal | AddItemModal |
|--------|---------------|--------------|
| **Action** | Crée une Order | Met à jour une Order |
| **Statut** | Toujours `en_attente` | Conserve le statut actuel |
| **Items** | Remplace | Ajoute aux existants |
| **Total** | Calcul initial | Incrémental |

### Logique Métier

```typescript
const handleAddItems = async (newItems: OrderItem[]) => {
  const order = await db.orders.get(orderId);
  if (!order) return;

  const updatedItems = [...order.items, ...newItems];
  const newTotal = updatedItems.reduce((sum, item) => {
    const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
    return sum + ((item.price || 0) + supplementPrice) * item.quantity;
  }, 0);

  await db.orders.update(orderId, {
    items: updatedItems,
    total: newTotal,
  });

  onClose();
};
```

### Fichiers de Test

```
src/components/serveur/AddItemModal.test.tsx
```

---

## COMPOSANT 3 : `ServerCartItem.tsx`

### Rôle

Composant de ligne de panier pour le serveur. Similaire à `Client/CartItem.tsx` mais adapté au contexte serveur.

### Interface

```tsx
interface ServerCartItemProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}
```

### Structure UI

```
┌────────────────────────────────────────────────────────────┐
│  2x Burger Classique                    25,00€      [✕]    │
│     ───────────────────────────────────────────────────     │
│     [-  2  +]  ← Contrôle quantité                          │
└────────────────────────────────────────────────────────────┘
```

---

## HOOK 1 : `useServerOrders` (Extension)

### Fonctions à Ajouter

```typescript
export function useServerOrders() {
  // ... fonctions existantes ...

  /**
   * CRÉER UNE NOUVELLE COMMANDE
   * @param tableId - ID de la table
   * @param items - Items de la commande
   * @param customerName - Nom client (optionnel)
   * @returns ID de la commande créée
   */
  const createOrder = useCallback(async (
    tableId: number,
    items: OrderItem[],
    customerName?: string
  ): Promise<number> => {
    const total = items.reduce((sum, item) => {
      const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
      return sum + ((item.price || 0) + supplementPrice) * item.quantity;
    }, 0);

    const newOrder = {
      tableId,
      status: 'en_attente' as OrderStatus,
      items,
      total,
      createdAt: Date.now(),
      customerName: customerName || `Table ${tableId}`,
    };

    const orderId = await db.orders.add(newOrder as Order);

    // Mettre à jour la table
    await db.restaurantTables.update(tableId, {
      status: 'occupee',
      currentOrderId: orderId,
    });

    return orderId;
  }, []);

  /**
   * AJOUTER DES ITEMS À UNE COMMANDE EXISTANTE
   * @param orderId - ID de la commande
   * @param newItems - Nouveaux items à ajouter
   */
  const addItemsToOrder = useCallback(async (
    orderId: number,
    newItems: OrderItem[]
  ): Promise<void> => {
    const order = await db.orders.get(orderId);
    if (!order) return;

    const updatedItems = [...order.items, ...newItems];
    const newTotal = updatedItems.reduce((sum, item) => {
      const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
      return sum + ((item.price || 0) + supplementPrice) * item.quantity;
    }, 0);

    await db.orders.update(orderId, {
      items: updatedItems,
      total: newTotal,
    });
  }, []);

  /**
   * SUPPRIMER UN ITEM D'UNE COMMANDE
   * @param orderId - ID de la commande
   * @param itemIndex - Index de l'item à supprimer
   */
  const removeItemFromOrder = useCallback(async (
    orderId: number,
    itemIndex: number
  ): Promise<void> => {
    const order = await db.orders.get(orderId);
    if (!order) return;
    if (itemIndex < 0 || itemIndex >= order.items.length) return;

    const updatedItems = [...order.items];
    updatedItems.splice(itemIndex, 1);

    const newTotal = updatedItems.reduce((sum, item) => {
      const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
      return sum + ((item.price || 0) + supplementPrice) * item.quantity;
    }, 0);

    await db.orders.update(orderId, {
      items: updatedItems,
      total: newTotal,
    });
  }, []);

  return {
    // ... fonctions existantes ...
    createOrder,
    addItemsToOrder,
    removeItemFromOrder,
  };
}
```

### Tests à Ajouter

```typescript
// src/hooks/useServerOrders.test.ts

describe('createOrder', () => {
  it('crée une nouvelle commande avec status en_attente', async () => {
    // ...
  });

  it('met à jour la table à occupee', async () => {
    // ...
  });

  it('calcule correctement le total', async () => {
    // ...
  });
});

describe('addItemsToOrder', () => {
  it('ajoute des items à une commande existante', async () => {
    // ...
  });

  it('recalcule le total correctement', async () => {
    // ...
  });
});

describe('removeItemFromOrder', () => {
  it('supprime un item par son index', async () => {
    // ...
  });

  it('gère la suppression du dernier item', async () => {
    // ...
  });
});
```

---

## HOOK 2 : `useServerCart` (Nouveau)

### Rôle

Gérer l'état du panier local pendant la prise de commande (éphémère, non persisté).

### Interface

```typescript
interface UseServerCartReturn {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, delta: number) => void;
  clearCart: () => void;
}

export function useServerCart(): UseServerCartReturn;
```

### Implémentation

```typescript
// src/hooks/useServerCart.ts

import { useState, useCallback, useMemo } from 'react';
import type { MenuItem } from '../db/types';

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  supplements?: Array<{ name: string; price: number }>;
}

export function useServerCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((menuItemId: number) => {
    setItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  }, []);

  const updateQuantity = useCallback(
    (menuItemId: number, delta: number) => {
      setItems((prev) =>
        prev
          .map((item) =>
            item.menuItemId === menuItemId
              ? { ...item, quantity: Math.max(0, item.quantity + delta) }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
```

### Tests

```typescript
// src/hooks/useServerCart.test.ts

import { renderHook, act } from '@testing-library/react';
import { useServerCart } from './useServerCart';

describe('useServerCart', () => {
  it('initialise un panier vide', () => {
    const { result } = renderHook(() => useServerCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('ajoute un item au panier', () => {
    const { result } = renderHook(() => useServerCart());
    act(() => {
      result.current.addItem({
        id: 1,
        name: 'Burger',
        price: 12.5,
        category: 'Plats',
        isAvailable: true,
      });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(12.5);
  });

  it('incrémente la quantité d'un item existant', () => {
    // ...
  });

  it('supprime un item du panier', () => {
    // ...
  });

  it('vide le panier', () => {
    // ...
  });
});
```

---

## COMPOSANT : `SelectedTable.tsx` (Refonte)

### Modifications Requises

### 1. Gestion de l'état "Table Libre"

**Actuellement :**
```tsx
{!table.currentOrder && (
  <div className="text-center py-8">
    <p>Aucune commande en cours</p>
  </div>
)}
```

**Devient :**
```tsx
const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

// ...

{!table.currentOrder ? (
  // TABLE LIBRE
  <div className="text-center py-8">
    <span className="material-symbols-outlined text-on-surface-variant/40 text-6xl mb-4">
      restaurant
    </span>
    <p className="text-on-surface-variant text-lg mb-6">
      Aucune commande en cours
    </p>
    <button
      onClick={() => setIsNewOrderModalOpen(true)}
      className="w-full bg-primary-container text-on-primary-container font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all"
    >
      <span className="material-symbols-outlined">add_shopping_cart</span>
      <span>PRENDRE COMMANDE</span>
    </button>
  </div>
) : (
  // TABLE OCCUPÉE — Affichage normal
  // ...
)}

{/* Modals */}
<NewOrderModal
  isOpen={isNewOrderModalOpen}
  onClose={() => setIsNewOrderModalOpen(false)}
  tableId={table.id}
  tableName={table.name}
/>

<AddItemModal
  isOpen={isAddItemModalOpen}
  onClose={() => setIsAddItemModalOpen(false)}
  orderId={table.currentOrder?.id || 0}
  existingItems={table.currentOrder?.items || []}
/>
```

---

### 2. Bouton "AJOUTER" pour table occupée

**Dans la section des boutons d'action :**

```tsx
{/* Action buttons */}
<div className="sticky bottom-0 bg-surface-container-low border-t border-outline-variant/10 p-6 space-y-3">
  {/* Secondary actions */}
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={() => setIsAddItemModalOpen(true)}
      className="px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold hover:bg-surface-container-high transition-colors"
    >
      AJOUTER
    </button>
    <button
      onClick={onAddNote}
      className="px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold hover:bg-surface-container-high transition-colors"
    >
      NOTE
    </button>
  </div>

  {/* ... autres boutons ... */}
</div>
```

---

## 🔄 Workflows Complets

### Workflow 1 : Prise de Commande (Table Libre)

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 1 : Serveur clique sur table T-01 (LIBRE)             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 2 : SelectedTable s'ouvre                             │
│                                                              │
│ Affichage : "AUCUNE COMMANDE EN COURS"                      │
│ Bouton : [PRENDRE COMMANDE]                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 3 : Serveur clique "PRENDRE COMMANDE"                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 4 : NewOrderModal s'ouvre                             │
│                                                              │
│ - Filtres : [Tous] [Entrées] [Plats] [Desserts]             │
│ - Grille des items du menu                                  │
│ - Panier en temps réel (en bas)                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 5 : Serveur sélectionne les items                     │
│                                                              │
│ Clic sur [+ Ajouter] pour :                                 │
│   - 2x Burger Classique                                     │
│   - 1x Salade César                                         │
│   - 2x Coca Cola                                            │
│                                                              │
│ Panier : 5 articles — Total : 47,50€                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 6 : Serveur clique "VALIDER COMMANDE"                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 7 : Création en base de données                       │
│                                                              │
│ db.orders.add({                                             │
│   tableId: 1,                                               │
│   status: 'en_attente',                                     │
│   items: [...],                                             │
│   total: 47.50,                                             │
│   createdAt: Date.now(),                                    │
│   customerName: 'Table T-01'                                │
│ })                                                          │
│                                                              │
│ db.restaurantTables.update(1, {                             │
│   status: 'occupee',                                        │
│   currentOrderId: <id_retourné>                             │
│ })                                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 8 : Fermeture modal + Toast + Refresh                 │
│                                                              │
│ - NewOrderModal se ferme                                    │
│ - Toast : "Commande envoyée en cuisine !"                   │
│ - FloorPlan se rafraîchit (useLiveQuery)                    │
│ - T-01 passe de LIBRE → OCCUPÉE                             │
│ - KDS reçoit la commande (colonne "À PRÉPARER")             │
└─────────────────────────────────────────────────────────────┘
```

---

### Workflow 2 : Ajout d'Items (Table Occupée)

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 1 : Serveur clique sur table T-02 (OCCUPÉE)           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 2 : SelectedTable s'ouvre                             │
│                                                              │
│ Affichage :                                                 │
│   - 2x Burger Classique           [-  +]                    │
│   - 1x Salade César             [-  +]                      │
│                                                              │
│ Total : 35,00€                                              │
│                                                              │
│ Boutons : [AJOUTER] [NOTE] [DIVISER] [ENCAISSER]            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 3 : Serveur clique "AJOUTER"                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 4 : AddItemModal s'ouvre                              │
│                                                              │
│ - Même UI que NewOrderModal                                 │
│ - Titre : "AJOUTER À LA COMMANDE"                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 5 : Serveur sélectionne : 2x Dessert du Jour          │
│                                                              │
│ Panier : 2 articles — Total : 16,00€                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 6 : Serveur clique "AJOUTER À LA COMMANDE"            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 7 : Mise à jour de la commande                        │
│                                                              │
│ const order = await db.orders.get(orderId)                  │
│                                                              │
│ db.orders.update(orderId, {                                 │
│   items: [...order.items, ...newItems],                     │
│   total: order.total + 16.00                                │
│ })                                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 8 : Fermeture modal + Refresh                         │
│                                                              │
│ - AddItemModal se ferme                                     │
│ - SelectedTable se rafraîchit                               │
│ - Affiche maintenant :                                      │
│     - 2x Burger Classique                                   │
│     - 1x Salade César                                       │
│     - 2x Dessert du Jour ← NOUVEAU                          │
│   Total : 51,00€                                            │
└─────────────────────────────────────────────────────────────┘
```

---

### Workflow 3 : Modification Quantités

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 1 : Table T-02 (OCCUPÉE) ouverte                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 2 : Serveur clique "+" sur "2x Burger"                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 3 : updateItemQuantity() appelé                       │
│                                                              │
│ useServerOrders.updateItemQuantity(                         │
│   orderId: 5,                                               │
│   itemIndex: 0,  // Burger est le 1er item                  │
│   delta: +1                                                 │
│ )                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 4 : Mise à jour DB                                    │
│                                                              │
│ const order = await db.orders.get(orderId)                  │
│ order.items[0].quantity++  // 2 → 3                         │
│                                                              │
│ // Recalcul du total                                        │
│ const newTotal = recalculateTotal(order.items)              │
│                                                              │
│ db.orders.update(orderId, {                                 │
│   items: order.items,                                       │
│   total: newTotal                                           │
│ })                                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 5 : Rafraîchissement instantané                       │
│                                                              │
│ SelectedTable affiche maintenant :                          │
│   - 3x Burger Classique           [-  +]  ← MIS À JOUR      │
│   - 1x Salade César             [-  +]                      │
│                                                              │
│ Total : 47,50€  (au lieu de 35,00€)                         │
└─────────────────────────────────────────────────────────────┘
```

---

### Workflow 4 : Paiement (Table Prête)

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 1 : Serveur clique sur table T-03 (PRÊTE)             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 2 : SelectedTable s'ouvre                             │
│                                                              │
│ Affichage :                                                 │
│   - 1x Burger Classique                                     │
│   - 2x Salade César                                         │
│                                                              │
│ Total : 32,50€                                              │
│                                                              │
│ Bouton : [ENCAISSER] (visible et actif)                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 3 : Serveur clique "ENCAISSER"                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 4 : PaymentModal s'ouvre                              │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │  PAIEMENT — Table T-03                       [✕]    │    │
│ │                                                      │    │
│ │  Total : 32,50€                                     │    │
│ │                                                      │    │
│ │  Mode de paiement :                                 │    │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│ │  │ ESPÈCES  │  │   CB     │  │  SANS    │         │    │
│ │  │   [€]    │  │   [💳]   │  │ PAIEMENT │         │    │
│ │  └──────────┘  └──────────┘  └──────────┘         │    │
│ │                                                      │    │
│ │  [ANNULER]                      [CONFIRMER]         │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 5 : Serveur sélectionne "CB" puis "CONFIRMER"         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 6 : Mise à jour DB                                    │
│                                                              │
│ db.orders.update(orderId, {                                 │
│   status: 'paye',                                           │
│   paymentMethod: 'cb',                                      │
│   paidAt: Date.now()                                        │
│ })                                                          │
│                                                              │
│ db.restaurantTables.update(tableId, {                       │
│   status: 'libre',                                          │
│   currentOrderId: undefined                                 │
│ })                                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ÉTAPE 7 : Fermeture + Toast + Refresh                       │
│                                                              │
│ - PaymentModal se ferme                                     │
│ - SelectedTable se ferme                                    │
│ - Toast : "Paiement enregistré !"                           │
│ - FloorPlan se rafraîchit                                   │
│ - T-03 passe de PRÊTE → LIBRE                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 TODO LIST — Progress Tracker

### Phase 1 : Fondation (Tests + Hooks) — 6h

```
[ ] 1.1  Créer src/hooks/useServerCart.ts
     - Implémenter useState pour le panier
     - Fonctions : addItem, removeItem, updateQuantity, clearCart
     - Calculs : total, itemCount
     - Tests : useServerCart.test.ts (5 tests minimum)

[ ] 1.2  Étendre src/hooks/useServerOrders.ts
     - Ajouter createOrder()
     - Ajouter addItemsToOrder()
     - Ajouter removeItemFromOrder()
     - Tests : useServerOrders.test.ts (8 tests minimum)

[ ] 1.3  Vérifier src/db/types.ts
     - Confirmer que OrderItem a tous les champs requis
     - Ajouter champ 'notes' si manquant
     - Ajouter champ 'supplements' si manquant
```

---

### Phase 2 : Composants Modals — 10h

```
[ ] 2.1  Créer src/components/serveur/NewOrderModal.tsx
     - Structure : Header + Filtres + Grille menu + Panier + Footer
     - Utiliser useMenu() pour récupérer les items
     - Utiliser useServerCart() pour gérer le panier local
     - Utiliser createOrder() pour valider
     - Toast de confirmation
     - Tests : NewOrderModal.test.tsx (10 tests minimum)

[ ] 2.2  Créer src/components/serveur/AddItemModal.tsx
     - Similaire à NewOrderModal
     - Utiliser addItemsToOrder() pour valider
     - Tests : AddItemModal.test.tsx (8 tests minimum)

[ ] 2.3  Créer src/components/serveur/ServerCartItem.tsx
     - Affichage : nom, quantité, prix, contrôles +/-
     - Bouton supprimer
     - Tests : ServerCartItem.test.tsx (5 tests minimum)

[ ] 2.4  Créer src/components/serveur/QuickAccessMenu.tsx (Optionnel)
     - Menu simplifié pour accès rapide
     - Items populaires en premier
     - Tests : QuickAccessMenu.test.tsx
```

---

### Phase 3 : Intégration SelectedTable — 6h

```
[ ] 3.1  Modifier src/components/serveur/SelectedTable.tsx
     - Ajouter état isNewOrderModalOpen
     - Ajouter état isAddItemModalOpen
     - Conditionner l'affichage : table libre vs occupée
     - Ajouter bouton "PRENDRE COMMANDE" (table libre)
     - Ajouter bouton "AJOUTER" (table occupée)
     - Tests : SelectedTable.test.tsx (12 tests minimum)

[ ] 3.2  Gérer les états de bord
     - Table passe de libre → occupée → prête → libre
     - Rafraîchissement automatique via useLiveQuery
     - Gestion des erreurs (toast error si échec DB)

[ ] 3.3  Accessibilité
     - Focus trap dans les modals
     - Navigation clavier (Tab, Enter, Escape)
     - Labels ARIA à jour
```

---

### Phase 4 : Tests E2E — 4h

```
[ ] 4.1  Créer test E2E : Prise de commande
     e2e/serveur/prise-commande.spec.ts
     Scénario :
       - Login serveur
       - Clic sur table libre
       - Ouverture NewOrderModal
       - Ajout de 3 items
       - Validation
       - Vérification : table occupée + commande créée

[ ] 4.2  Créer test E2E : Ajout d'items
     e2e/serveur/ajout-items.spec.ts
     Scénario :
       - Login serveur
       - Clic sur table occupée
       - Ouverture AddItemModal
       - Ajout de 2 items
       - Validation
       - Vérification : items ajoutés + total mis à jour

[ ] 4.3  Créer test E2E : Paiement
     e2e/serveur/paiement.spec.ts
     Scénario :
       - Login serveur
       - Clic sur table prête
       - Clic sur ENCAISSER
       - Sélection CB
       - Confirmation
       - Vérification : table libre + order payée

[ ] 4.4  Créer test E2E : Modification quantités
     e2e/serveur/modification-quantites.spec.ts
     Scénario :
       - Login serveur
       - Clic sur table occupée
       - Clic sur "+" pour un item
       - Vérification : quantité +1 + total mis à jour
```

---

### Phase 5 : Polissage — 4h

```
[ ] 5.1  Gestion d'erreurs
     - Try/catch dans tous les callbacks
     - Toasts d'erreur explicites
     - Logs structurés (console.error avec contexte)

[ ] 5.2  Feedback utilisateur
     - Loading states pendant les mutations DB
     - Disabled states sur les boutons pendant chargement
     - Spinners ou skeletons

[ ] 5.3  Optimisation performance
     - useMemo sur les calculs de total
     - useCallback sur tous les handlers
     - Éviter re-renders inutiles

[ ] 5.4  Documentation
     - Commentaires JSDoc sur les nouvelles fonctions
     - README mis à jour avec le flux serveur
```

---

## 📊 Critères d'Acceptance

### Definition of Done (Par Tâche)

| Critère | Requis |
|---------|--------|
| **Code** | TypeScript strict, pas de `any` |
| **Tests** | Couverture > 80% sur nouveaux fichiers |
| **Lint** | `npm run lint` sans erreur |
| **Build** | `npm run build` sans erreur |
| **E2E** | Tests Playwright passants |
| **Accessibilité** | Labels ARIA, navigation clavier |
| **Responsive** | Testé tablette (768px+) |

---

### Validation du Flux Complet

```
[ ]  SCÉNARIO 1 : Table libre → Commande → Occupée
     - Serveur peut créer une commande
     - Table passe à status 'occupee'
     - KDS voit la commande dans "À PRÉPARER"
     - Timer démarre

[ ]  SCÉNARIO 2 : Table occupée → Ajout items
     - Serveur peut ajouter des items
     - Total recalculé correctement
     - Rafraîchissement instantané

[ ]  SCÉNARIO 3 : Table occupée → Modification quantités
     - Boutons +/- fonctionnels
     - Quantité mise à jour en DB
     - Total recalculé

[ ]  SCÉNARIO 4 : Table occupée → Suppression item
     - Serveur peut supprimer un item
     - Total recalculé
     - Gestion du dernier item (optionnel)

[ ]  SCÉNARIO 5 : Table prête → Paiement → Libre
     - Modal paiement fonctionnel
     - Choix : Espèces / CB / Sans
     - Order passe à 'paye'
     - Table repasse à 'libre'

[ ]  SCÉNARIO 6 : Gestion erreurs
     - Si DB échoue → toast erreur
     - Si réseau coupé → offline banner
     - Données sauvegardées localement
```

---

## 🔗 Impact sur les Autres Modules

### KDS (Kitchen Display System)

| Impact | Détail |
|--------|--------|
| **Aucun changement requis** | Les nouvelles commandes apparaissent automatiquement via `useLiveQuery` |
| **Comportement attendu** | Nouvelle commande → Colonne "À PRÉPARER" avec timer |

---

### Admin (Tableau de Bord)

| Impact | Détail |
|--------|--------|
| **Aucun changement requis** | Dashboard mis à jour automatiquement |
| **Comportement attendu** | CA en temps réel + statut tables mis à jour |

---

### Client (Interface Tactile)

| Impact | Détail |
|--------|--------|
| **Aucun** | Modules indépendants |

---

### Base de Données

| Impact | Détail |
|--------|--------|
| **Aucun changement de schéma** | Tables `orders` et `tables` déjà compatibles |
| **Nouvelles opérations** | `orders.add()`, `orders.update()`, `tables.update()` |

---

## 📈 Métriques de Succès

### Avant Implémentation

| Métrique | Valeur |
|----------|--------|
| **Flux serveur** | 33% (1/3 fonctionnel) |
| **Vues opérationnelles** | 2/6 (FloorPlan, Reservations) |
| **Tests module** | 5 fichiers |

---

### Après Implémentation

| Métrique | Cible |
|----------|-------|
| **Flux serveur** | 100% ✅ |
| **Vues opérationnelles** | 6/6 ✅ |
| **Tests module** | 15+ fichiers ✅ |
| **Couverture tests** | >80% ✅ |
| **Tests E2E** | 4 scénarios ✅ |

---

## 🚀 Commandes de Développement

```bash
# 1. Lancer le serveur de dev
npm run dev

# 2. Lancer les tests unitaires (watch mode)
npm run test

# 3. Lancer les tests avec coverage
npm run test:coverage

# 4. Lancer le linter
npm run lint

# 5. Build de production
npm run build

# 6. Tests E2E (navigateur)
npm run test:e2e

# 7. Tests E2E avec UI
npm run test:e2e:ui
```

---

## 📞 Points de Vigilance

### ⚠️ Attention

1. **Panier éphémère** : Le panier du serveur n'est **pas persisté** en DB (state local uniquement)
2. **Conflits d'écriture** : Si 2 serveurs modifient la même table → dernière écriture gagne (Dexie gère)
3. **Suppression d'item** : Utiliser l'**index** de l'item, pas un ID (les items n'ont pas d'ID natif dans le schéma)
4. **Rafraîchissement** : `useLiveQuery` gère la réactivité — pas besoin de `forceUpdate`

---

### ✅ Bonnes Pratiques

1. **Toujours utiliser `useCallback`** pour les handlers passés en props
2. **Toujours utiliser `useMemo`** pour les calculs de total
3. **Toujours tester les cas d'erreur** (DB vide, réseau coupé, etc.)
4. **Toujours fermer les modals proprement** (reset state + onClose)
5. **Toujours afficher un toast** après une action utilisateur

---

## 📚 Références

### Fichiers Existant à Réutiliser

| Fichier | Usage |
|---------|-------|
| `src/components/client/MenuCard.tsx` | Inspiration pour grille des items |
| `src/components/client/Cart.tsx` | Inspiration pour gestion panier |
| `src/components/client/CustomizationModal.tsx` | Inspiration pour modals |
| `src/hooks/useCart.ts` | Inspiration pour useServerCart |
| `src/hooks/useMenu.ts` | À réutiliser directement |

---

### Prototypes de Référence

| Prototype | Section |
|-----------|---------|
| `vue_serveur_polie_responsive_2/` | Plan de salle + panel |
| `l_atelier_pos_application_unifi_e/` | Navigation + layout |

---

## 🎯 Conclusion

Ce document spécifie l'implémentation complète du **flux de commande serveur**, permettant :

- ✅ **Prendre une commande** sur table libre
- ✅ **Ajouter/modifier** des items sur table occupée
- ✅ **Encaisser et libérer** la table

**Effort estimé :** 30 heures  
**Priorité :** 🔴 **HAUTE** — Bloquant pour démo production  
**Impact :** Module Serveur passe de 67% → 100% fonctionnel

---

**Document créé le 23 mars 2026**  
**L'Atelier POS v1.0 — Spécifications Techniques**

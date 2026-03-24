# 🔄 Migration Dexie.js → Firebase — Guide d'Exécution

**Version :** 1.0  
**Date :** 23 Mars 2026  
**Statut :** Prêt pour exécution  
**Effort Estimé :** 40 heures (5 jours)

---

## 📋 Vue d'Ensemble

Ce document guide la suppression **complète** de Dexie.js (IndexedDB) du projet L'Atelier POS après migration vers Firebase Emulator Suite (Firestore).

### Objectifs

1. ✅ Supprimer toutes les dépendances Dexie.js
2. ✅ Supprimer les fichiers obsolètes (`src/db/`)
3. ✅ Migrer les hooks utilisant `useLiveQuery` vers `onSnapshot`
4. ✅ Migrer les views/components utilisant `db` vers `getDb()`
5. ✅ Migrer les tests de `fake-indexeddb` vers Firebase Emulator
6. ✅ Nettoyer la documentation et la configuration

---

## 🎯 Périmètre de la Migration

### Fichiers à Supprimer (5 fichiers)

| Fichier | Raison | Action |
|---------|--------|--------|
| `src/db/database.ts` | Classe Dexie obsolète | 🔴 SUPPRIMER |
| `src/db/database.test.ts` | Tests Dexie obsolètes | 🔴 SUPPRIMER |
| `src/db/types.ts` | Types migrés vers Firebase | 🟡 SUPPRIMER (si doublons) |
| `architecture_de_donn_es_db.ts_dexie.js` | Doc obsolète | 🔴 SUPPRIMER |
| `stitch_kds_cran_cuisine/kds_persistance_dexie.js/` | Prototype archivé | 🔴 SUPPRIMER |

### Fichiers à Migrer (42 fichiers)

| Catégorie | Nombre | Priorité |
|-----------|--------|----------|
| **Hooks** | 7 fichiers | 🔴 Haute |
| **Views** | 7 fichiers | 🔴 Haute |
| **Components** | 3 fichiers | 🟡 Moyenne |
| **Tests** | 21 fichiers | 🔴 Haute |
| **Utils** | 1 fichier | 🟡 Moyenne |
| **Documentation** | 10 fichiers | 🟢 Basse |
| **Configuration** | 3 fichiers | 🔴 Haute |

---

## 🚀 Phase 1 — Nettoyage Initial (30 min)

### 1.1 Supprimer Dépendances

**Fichier :** `package.json`

```json
{
  "dependencies": {
    // ❌ SUPPRIMER CES LIGNES
    "dexie": "^4.0.8",
    "dexie-react-hooks": "^1.1.7",
    
    // ✅ GARDER
    "firebase": "^10.x.x",
    ...
  },
  
  "devDependencies": {
    // ❌ SUPPRIMER CETTE LIGNE
    "fake-indexeddb": "^5.0.0",
    
    // ✅ GARDER
    ...
  }
}
```

**Commandes :**
```bash
# Supprimer les dépendances
npm uninstall dexie dexie-react-hooks fake-indexeddb

# Nettoyer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller les dépendances
npm install
```

### 1.2 Supprimer Fichiers Obsolètes

```bash
# Supprimer dossier src/db/
rm -rf src/db/

# Supprimer documentation obsolète
rm architecture_de_donn_es_db.ts_dexie.js
rm -rf stitch_kds_cran_cuisine/kds_persistance_dexie.js/
```

### 1.3 Nettoyer Configuration

**Fichier :** `vite.config.ts`

```typescript
build: {
  outDir: 'dist',
  sourcemap: true,
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        // ❌ SUPPRIMER CETTE LIGNE
        'dexie-vendor': ['dexie', 'dexie-react-hooks'],
        // ✅ GARDER
        'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
      },
    },
  },
},
```

---

## 🔥 Phase 2 — Migration des Hooks (8h)

### 2.1 Hook: `useFloorPlan.ts` (2h)

**Fichier :** `src/hooks/useFloorPlan.ts`

**Avant (Dexie) :**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useFloorPlan() {
  const tables = useLiveQuery(() => 
    db.restaurantTables.orderBy('id').toArray()
  );
  
  const handleTableClick = async (tableId: number) => {
    const table = await db.restaurantTables.get(tableId);
    const order = await db.orders.get(table.currentOrderId);
    // ...
  };
}
```

**Après (Firebase) :**
```typescript
import { useState, useEffect } from 'react';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getDb } from '../firebase/config';
import type { TableRecord, Order } from '../firebase/types';

export function useFloorPlan() {
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = collection(getDb(), 'tables');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTables = snapshot.docs.map(doc => ({
          id: parseInt(doc.id),
          ...doc.data(),
        }) as TableRecord);
        setTables(fetchedTables);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useFloorPlan] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleTableClick = async (tableId: number) => {
    try {
      const tableRef = doc(getDb(), 'tables', tableId.toString());
      const tableSnap = await getDoc(tableRef);
      
      if (tableSnap.exists() && tableSnap.data().currentOrderId) {
        const orderRef = doc(getDb(), 'orders', tableSnap.data().currentOrderId.toString());
        const orderSnap = await getDoc(orderRef);
        // ...
      }
    } catch (err) {
      console.error('[handleTableClick] Error:', err);
      throw err;
    }
  };

  return { tables, isLoading, error, handleTableClick };
}
```

### 2.2 Hook: `useActiveTables.ts` (1h)

**Fichier :** `src/hooks/useActiveTables.ts`

**Avant :**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useActiveTables() {
  const activeTables = useLiveQuery(() => 
    db.restaurantTables.where('status').equals('occupee').toArray()
  );
  // ...
}
```

**Après :**
```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getDb } from '../firebase/config';
import type { TableRecord } from '../firebase/types';

export function useActiveTables() {
  const [activeTables, setActiveTables] = useState<TableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(getDb(), 'tables'),
      where('status', '==', 'occupee')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tables = snapshot.docs.map(doc => ({
          id: parseInt(doc.id),
          ...doc.data(),
        }) as TableRecord);
        setActiveTables(tables);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useActiveTables] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { activeTables, isLoading, error };
}
```

### 2.3 Hook: `useSyncStatus.ts` (1h)

**Fichier :** `src/hooks/useSyncStatus.ts`

**Avant :**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useSyncStatus() {
  const ordersCount = useLiveQuery(() => db.orders.count());
  const menuItemsCount = useLiveQuery(() => db.menuItems.count());
  const tablesCount = useLiveQuery(() => db.restaurantTables.count());
  const reservationsCount = useLiveQuery(() => db.reservations.count());
  
  return {
    ordersCount,
    menuItemsCount,
    tablesCount,
    reservationsCount,
  };
}
```

**Après :**
```typescript
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getDb } from '../firebase/config';

export function useSyncStatus() {
  const [counts, setCounts] = useState({
    ordersCount: 0,
    menuItemsCount: 0,
    tablesCount: 0,
    reservationsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const collections = ['orders', 'menuItems', 'tables', 'reservations'];
    const unsubscribes: (() => void)[] = [];

    collections.forEach((collectionName) => {
      const unsubscribe = onSnapshot(
        collection(getDb(), collectionName),
        (snapshot) => {
          setCounts(prev => ({
            ...prev,
            [`${collectionName}Count`]: snapshot.size,
          }));
          setIsLoading(false);
        },
        (err) => {
          console.error(`[useSyncStatus] Error for ${collectionName}:`, err);
          setError(err instanceof Error ? err : new Error('Erreur Firestore'));
          setIsLoading(false);
        }
      );
      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  return { ...counts, isLoading, error };
}
```

### 2.4 Hook: `useKitchenMonitor.ts` (2h)

**Fichier :** `src/hooks/useKitchenMonitor.ts`

**Migration similaire** — Remplacer `useLiveQuery` par `onSnapshot` avec query filtrée par statut.

### 2.5 Hook: `useDashboardData.ts` (1h)

**Fichier :** `src/hooks/useDashboardData.ts`

**Migration similaire** — Remplacer `useLiveQuery` par `onSnapshot`.

### 2.6 Hook: `useMenuEditor.ts` (1h)

**Fichier :** `src/hooks/useMenuEditor.ts`

**Migration similaire** — Remplacer `useLiveQuery` par `onSnapshot`.

### 2.7 Component: `AdminLayout.tsx` (30min)

**Fichier :** `src/components/layout/AdminLayout.tsx`

**Migration similaire** — Remplacer `useLiveQuery` par `onSnapshot`.

---

## 🎨 Phase 3 — Migration des Views (7h)

### 3.1 View: `Client/index.tsx` (2h)

**Fichier :** `src/views/Client/index.tsx`

**Avant :**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';

export default function ClientView() {
  const menuItems = useLiveQuery(() => 
    db.menuItems.where('isAvailable').equals(1).toArray()
  );

  const handleOrder = async (items: CartItem[]) => {
    const orderId = await db.orders.add({
      tableId,
      items,
      status: 'en_attente',
      createdAt: Date.now(),
    });
  };
}
```

**Après :**
```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { MenuItem, Order } from '../../firebase/types';

export default function ClientView() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(getDb(), 'menuItems'),
      where('isAvailable', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }) as MenuItem);
        setMenuItems(items);
        setIsLoading(false);
      },
      (err) => {
        console.error('[ClientView] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOrder = async (items: CartItem[]) => {
    try {
      await addDoc(collection(getDb(), 'orders'), {
        tableId,
        items,
        status: 'attente',
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('[handleOrder] Error:', err);
      throw err;
    }
  };
}
```

### 3.2 View: `Admin/Staff.tsx` (1h)

**Fichier :** `src/views/Admin/Staff.tsx`

**Avant :**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';

export default function StaffView() {
  const users = useLiveQuery(() => db.users.toArray());

  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    await db.users.update(userId, updates);
  };

  const handleDeleteUser = async (userId: number) => {
    await db.users.delete(userId);
  };
}
```

**Après :**
```typescript
import { useState, useEffect } from 'react';
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { User } from '../../firebase/types';

export default function StaffView() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(getDb(), 'users'),
      (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User));
        setIsLoading(false);
      },
      (err) => {
        console.error('[StaffView] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const userRef = doc(getDb(), 'users', userId);
      await updateDoc(userRef, updates);
    } catch (err) {
      console.error('[handleUpdateUser] Error:', err);
      throw err;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const userRef = doc(getDb(), 'users', userId);
      await deleteDoc(userRef);
    } catch (err) {
      console.error('[handleDeleteUser] Error:', err);
      throw err;
    }
  };
}
```

### 3.3 View: `Admin/Orders.tsx` (1h)

**Fichier :** `src/views/Admin/Orders.tsx`

**Migration similaire** — Remplacer `db.orders.where().toArray()` par `onSnapshot` avec query.

### 3.4 View: `Admin/Reports.tsx` (1h)

**Fichier :** `src/views/Admin/Reports.tsx`

**Migration similaire** — Remplacer `db.orders.toArray()` par `onSnapshot`.

### 3.5 View: `KDS/components/KDSBoard.tsx` (1h)

**Fichier :** `src/views/KDS/components/KDSBoard.tsx`

**Avant :**
```typescript
import { db } from '../../../db/database';

const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
  await db.orders.update(orderId, { status: newStatus });
};
```

**Après :**
```typescript
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '../../../firebase/config';

const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
  try {
    const orderRef = doc(getDb(), 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });
  } catch (err) {
    console.error('[handleStatusChange] Error:', err);
    throw err;
  }
};
```

### 3.6 View: `KDS/components/KDSHeader.tsx` (1h)

**Fichier :** `src/views/KDS/components/KDSHeader.tsx`

**Migration similaire** — Remplacer `useLiveQuery` par `onSnapshot`.

### 3.7 View: `KDS/components/KDSFooter.tsx` (1h)

**Fichier :** `src/views/KDS/components/KDSFooter.tsx`

**Migration similaire** — Remplacer `useLiveQuery` par `onSnapshot`.

---

## 🧪 Phase 4 — Migration des Tests (11h)

### 4.1 Mettre à Jour Test Helpers

**Fichier :** `src/test/helpers/seed.ts`

**Avant :**
```typescript
import { db } from '../../db/database';

export async function seedTestOrders() {
  await db.orders.bulkAdd([...]);
}
```

**Après :**
```typescript
import { collection, addDoc, writeBatch } from 'firebase/firestore';
import { getDb } from '../../firebase/config';

export async function seedTestOrders() {
  const db = getDb();
  const batch = writeBatch(db);
  
  ordersData.forEach(orderData => {
    const ref = doc(collection(db, 'orders'));
    batch.set(ref, orderData);
  });
  
  await batch.commit();
}
```

### 4.2 Migration des Tests de Hooks

**Template pour tous les tests de hooks :**

**Avant :**
```typescript
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';

vi.mocked(useLiveQuery).mockImplementation((queryFn) => {
  // Mock Dexie
});

beforeEach(async () => {
  await db.orders.clear();
});
```

**Après :**
```typescript
import { getDb } from '../../firebase/config';
import { collection, clearIndexedDbPersistence } from 'firebase/firestore';

beforeEach(async () => {
  // Nettoyer Firestore entre les tests
  const db = getDb();
  await clearFirestoreData();
});

async function clearFirestoreData() {
  const collections = ['orders', 'tables', 'menuItems', 'users'];
  for (const name of collections) {
    const snapshot = await getDocs(collection(getDb(), name));
    const batchPromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(batchPromises);
  }
}
```

### 4.3 Tests à Migrer (21 fichiers)

| Fichier | Effort | Action Principale |
|---------|--------|-------------------|
| `src/hooks/useServerOrders.test.ts` | 30min | Remplacer mocks Dexie par Firebase |
| `src/hooks/useDashboardData.test.ts` | 30min | Idem |
| `src/hooks/useActiveTables.test.ts` | 30min | Idem |
| `src/hooks/useKitchenMonitor.test.ts` | 30min | Idem |
| `src/hooks/useMenuEditor.test.ts` | 30min | Idem |
| `src/hooks/useTodayReservationsList.test.ts` | 30min | Déjà migré (Firebase) |
| `src/hooks/useReservations.test.ts` | 30min | Remplacer mocks Dexie |
| `src/hooks/useMenu.test.ts` | 30min | Idem |
| `src/hooks/useTables.test.ts` | 30min | Idem |
| `src/hooks/useOrders.test.ts` | 30min | Idem |
| `src/views/Admin/Kitchen.test.tsx` | 30min | Idem |
| `src/views/Admin/Dashboard.test.tsx` | 30min | Idem |
| `src/views/Admin/Orders.test.tsx` | 30min | Idem |
| `src/views/KDS/components/KDSLayout.test.tsx` | 30min | Supprimer mock `useLiveQuery` |
| `src/views/KDS/components/KDSFooter.test.tsx` | 30min | Idem |
| `src/views/KDS/components/KDSHeader.test.tsx` | 30min | Idem |
| `src/components/serveur/AddItemModal.test.tsx` | 30min | Remplacer `db` par Firebase |
| `src/components/serveur/NewOrderModal.test.tsx` | 30min | Idem |
| `src/components/serveur/ReservationList/index.test.tsx` | 30min | Idem |
| `src/components/serveur/FloorPlan.test.tsx` | 30min | Idem |
| `src/components/admin/ActiveServices.test.tsx` | 30min | Idem |
| `src/components/admin/KitchenMonitor.test.tsx` | 30min | Idem |

---

## 🧹 Phase 5 — Nettoyage Utils (30min)

### 5.1 Fichier: `errorUtils.ts`

**Fichier :** `src/utils/errorUtils.ts`

**Avant :**
```typescript
import { DexieError } from 'dexie';

export function isDexieError(error: unknown): error is DexieError {
  return error instanceof DexieError;
}

export function categorizeDexieError(error: unknown): string {
  // Logique Dexie-specific
}
```

**Après :**
```typescript
// ❌ SUPPRIMER ces fonctions
// import { DexieError } from 'dexie';
// export function isDexieError(...) { ... }
// export function categorizeDexieError(...) { ... }

// ✅ GARDER ces fonctions utilitaires
export function formatErrorMessage(error: Error): string {
  return error.message;
}

export function logError(error: unknown, context: string): void {
  console.error(`[${context}]`, error);
}
```

---

## 📚 Phase 6 — Documentation (3h)

### 6.1 Mettre à Jour `SPECS_TECHNIQUES.md`

**Fichier :** `doc technique/SPECS_TECHNIQUES.md`

**Sections à modifier :**

1. **Stack Technique**
   ```markdown
   ### Backend & Database
   - ❌ Dexie.js (IndexedDB) — OBSOLÈTE
   - ✅ Firebase Emulator Suite (Firestore + Auth)
   ```

2. **Patterns de Code**
   ```markdown
   ### Gestion des Données
   - ❌ `useLiveQuery` de Dexie
   - ✅ `onSnapshot` de Firestore avec unsubscribe
   ```

3. **Schéma de Données**
   ```markdown
   ### Base de Données
   - ❌ Schéma Dexie.js dans `src/db/database.ts`
   - ✅ Collections Firestore dans `src/firebase/config.ts`
   ```

### 6.2 Mettre à Jour `PIPELINE.md`

**Fichier :** `doc technique/PIPELINE.md`

**Sections à modifier :**

1. **Tests**
   ```markdown
   ### Configuration des Tests
   - ❌ `import 'fake-indexeddb/auto'`
   - ✅ Firebase Emulator setup dans `src/test/setup.ts`
   ```

### 6.3 Mettre à Jour `USER_STORIES.md`

**Fichier :** `doc technique/USER_STORIES.md`

**Sections à modifier :**

1. **Critères d'Acceptance**
   ```markdown
   - ❌ `db.reservations.add()` → `addDoc(collection(db, 'reservations'), ...)`
   - ❌ `useLiveQuery` → `onSnapshot` avec cleanup
   ```

### 6.4 Archiver Ancienne Documentation

```bash
# Créer dossier archive
mkdir -p doc technique/archive/

# Déplacer fichiers obsolètes
mv architecture_de_donn_es_db.ts_dexie.js doc technique/archive/
```

---

## ✅ Phase 7 — Validation (4h)

### 7.1 Tests Unitaires

```bash
# Lancer tous les tests
npm test

# Vérifier coverage
npm run test:coverage

# Tous les tests doivent passer (> 80% coverage)
```

### 7.2 Tests E2E

```bash
# Lancer les émulateurs
firebase emulators:start

# Dans un autre terminal, lancer les tests E2E
npm run test:e2e
```

### 7.3 Build Production

```bash
# Build de production
npm run build

# Vérifier aucune erreur de compilation
# Vérifier bundle size (Firebase au lieu de Dexie)
```

### 7.4 Test Manuel

**Checklist :**

- [ ] FloorPlan — Tables s'affichent et se mettent à jour
- [ ] KDS — Commandes apparaissent en temps réel
- [ ] Client — Menu et prise de commande fonctionnent
- [ ] Admin — Staff, Orders, Reports fonctionnent
- [ ] Réservations — Création et liste fonctionnent
- [ ] Auth — Login/Logout fonctionnent

---

## 📊 Checklist Finale

### Suppression

- [ ] `dexie` supprimé de `package.json`
- [ ] `dexie-react-hooks` supprimé de `package.json`
- [ ] `fake-indexeddb` supprimé de `package.json`
- [ ] `src/db/database.ts` supprimé
- [ ] `src/db/database.test.ts` supprimé
- [ ] `src/db/types.ts` supprimé (si doublons Firebase)
- [ ] `architecture_de_donn_es_db.ts_dexie.js` supprimé
- [ ] `vite.config.ts` — Chunk `dexie-vendor` supprimé

### Migration

- [ ] `useFloorPlan.ts` migré vers `onSnapshot`
- [ ] `useActiveTables.ts` migré vers `onSnapshot`
- [ ] `useSyncStatus.ts` migré vers `onSnapshot`
- [ ] `useKitchenMonitor.ts` migré vers `onSnapshot`
- [ ] `useDashboardData.ts` migré vers `onSnapshot`
- [ ] `useMenuEditor.ts` migré vers `onSnapshot`
- [ ] `AdminLayout.tsx` migré vers `onSnapshot`
- [ ] `Client/index.tsx` migré vers Firebase
- [ ] `Admin/Staff.tsx` migré vers Firebase
- [ ] `Admin/Orders.tsx` migré vers Firebase
- [ ] `Admin/Reports.tsx` migré vers Firebase
- [ ] `KDSBoard.tsx` migré vers Firebase
- [ ] `KDSHeader.tsx` migré vers Firebase
- [ ] `KDSFooter.tsx` migré vers Firebase
- [ ] `errorUtils.ts` nettoyé
- [ ] 21 fichiers de tests migrés

### Documentation

- [ ] `SPECS_TECHNIQUES.md` mis à jour
- [ ] `PIPELINE.md` mis à jour
- [ ] `USER_STORIES.md` mis à jour
- [ ] Ancienne documentation archivée

### Validation

- [ ] `npm test` passe (100% des tests)
- [ ] `npm run test:coverage` > 80%
- [ ] `npm run build` réussi
- [ ] Tests manuels FloorPlan, KDS, Client, Admin OK
- [ ] Tests E2E passent

---

## 🎯 Prochaines Étapes

1. **Exécuter Phase 1** — Nettoyage initial (30 min)
2. **Exécuter Phase 2** — Migration hooks (8h)
3. **Exécuter Phase 3** — Migration views (7h)
4. **Exécuter Phase 4** — Migration tests (11h)
5. **Exécuter Phase 5** — Nettoyage utils (30 min)
6. **Exécuter Phase 6** — Documentation (3h)
7. **Exécuter Phase 7** — Validation (4h)

**Total estimé : 40 heures (5 jours)**

---

**Document prêt pour exécution.** ✅

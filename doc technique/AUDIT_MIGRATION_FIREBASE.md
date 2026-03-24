# Audit Migration Firebase — L'Atelier POS

**Version :** 1.0  
**Date :** 23 Mars 2026  
**Auteur :** Audit Technique Automatisé  
**Statut :** Prêt pour implémentation

---

## Résumé Exécutif

### Contexte du Projet

L'Atelier POS est une application de gestion de restaurant développée en React/TypeScript utilisant actuellement **IndexedDB avec Dexie.js** comme solution de stockage local. L'application gère :

- **5 tables de données** (orders, tables, menuItems, reservations, users)
- **13 hooks personnalisés** pour la gestion des données
- **4 rôles utilisateurs** (admin, kds, serveur, client)
- **Un système d'authentification basé sur localStorage**

### Objectif de la Migration

Migrer vers **Firebase Emulator Suite** pour :
1. Bénéficier d'une synchronisation temps réel native
2. Permettre le multi-utilisateurs collaboratif
3. Disposer d'une infrastructure cloud scalable
4. Implémenter des règles de sécurité robustes
5. Faciliter le déploiement et la maintenance

### Métriques Clés du Projet Actuel

| Métrique | Valeur |
|----------|--------|
| Tables Dexie | 5 |
| Hooks personnalisés | 13 |
| Fonctions CRUD | 24 |
| Fichiers de tests | 18 |
| Types TypeScript | 15+ |
| Lignes de code (est.) | ~3500 |

### Estimation Globale

| Phase | Durée Estimée | Complexité |
|-------|---------------|------------|
| Phase 1 : Setup | 4h | Faible |
| Phase 2 : Migration DB | 8h | Moyenne |
| Phase 3 : Migration Hooks | 16h | Élevée |
| Phase 4 : Migration Mutations | 12h | Élevée |
| Phase 5 : Auth | 8h | Moyenne |
| Phase 6 : Tests | 12h | Moyenne |
| Phase 7 : Deploy | 4h | Faible |
| **TOTAL** | **64h (~8 jours)** | - |

---

## 1. État Actuel (Dexie.js)

### 1.1 Architecture de la Base de Données

#### Fichier de Configuration
**Chemin :** `src/db/database.ts`

```typescript
export class AtelierDatabase extends Dexie {
  orders!: Table<Order, number>;
  restaurantTables!: Table<TableRecord, number>;
  menuItems!: Table<MenuItem, number>;
  reservations!: Table<Reservation, number>;
  users!: Table<User, number>;
}
```

#### Schéma Dexie (Version 1)

```typescript
this.version(1).stores({
  orders: '++id, tableId, status, createdAt',
  tables: 'id, status',
  menuItems: '++id, name, category, isAvailable',
  reservations: '++id, date, time, status',
  users: '++id, &email, role, isActive',
});
```

### 1.2 Analyse Détaillée des 5 Tables

#### Table 1 : `orders` (Commandes)

| Propriété | Type | Index | Description |
|-----------|------|-------|-------------|
| `id` | `number` | `++id` (PK) | Auto-incrément, clé primaire |
| `tableId` | `number` | Indexé | Clé étrangère vers `tables` |
| `customerName` | `string` | - | Nom du client |
| `status` | `OrderStatus` | Indexé | Statut de la commande |
| `items` | `OrderItem[]` | - | Tableau des items (embedded) |
| `total` | `number` | - | Total de la commande |
| `notes` | `string` | - | Notes optionnelles |
| `createdAt` | `number` | Indexé | Timestamp de création |
| `updatedAt` | `number` | - | Timestamp de mise à jour |
| `servedAt` | `number` | - | Timestamp de service |
| `paymentMethod` | `'especes' \| 'cb' \| 'none'` | - | Méthode de paiement |
| `paidAt` | `number` | - | Timestamp de paiement |

**OrderStatus Union :**
```typescript
type OrderStatus = 'en_attente' | 'en_preparation' | 'pret' | 'servi' | 'paye' | 'annule';
```

**OrderItem Interface :**
```typescript
interface OrderItem {
  id?: number;
  name: string;
  quantity: number;
  customization?: string;
  done?: boolean;
  station?: StationType;
  supplements?: Supplement[];
  cookingLevel?: CookingLevel;
  price?: number;
}
```

**Relations :**
- `orders.tableId` → `tables.id` (Many-to-One)
- `orders.items` est un tableau embedded (pas de relation)

**Requêtes Courantes :**
```typescript
// Par statut (KDS)
db.orders.where('status').equals('en_attente').sortBy('createdAt')

// Par table
db.orders.where('tableId').equals(tableId).sortBy('createdAt')

// Toutes les commandes actives
db.orders.where('status').anyOf(['en_attente', 'en_preparation', 'pret', 'servi'])
```

---

#### Table 2 : `tables` (restaurantTables) (Tables du Restaurant)

| Propriété | Type | Index | Description |
|-----------|------|-------|-------------|
| `id` | `number` | `id` (PK) | Numéro de table (1-16) |
| `status` | `TableStatus` | Indexé | Statut de la table |
| `capacity` | `number` | - | Nombre de couverts |
| `sector` | `string` | - | Secteur (Salle, Terrasse, Bar) |
| `currentOrderId` | `number` | - | FK vers commande en cours |

**TableStatus Union :**
```typescript
type TableStatus = 'libre' | 'occupee' | 'pret' | 'reserve';
```

**Relations :**
- `tables.currentOrderId` → `orders.id` (One-to-Zero/One)

**Données Seed (16 tables) :**
```typescript
[
  { id: 1, status: 'libre', capacity: 2, sector: 'Salle principale' },
  { id: 2, status: 'occupee', capacity: 2, sector: 'Salle principale', currentOrderId: 1 },
  // ... 14 autres tables
]
```

---

#### Table 3 : `menuItems` (Articles du Menu)

| Propriété | Type | Index | Description |
|-----------|------|-------|-------------|
| `id` | `number` | `++id` (PK) | Auto-incrément |
| `name` | `string` | Indexé | Nom de l'article |
| `description` | `string` | - | Description détaillée |
| `price` | `number` | - | Prix en euros |
| `category` | `MenuCategory` | Indexé | Catégorie |
| `image` | `string` | - | URL de l'image |
| `allergens` | `string[]` | - | Tableau d'allergènes |
| `isAvailable` | `0 \| 1` | Indexé | Disponibilité (0/1 pour index) |
| `station` | `StationType` | - | Station cuisine |
| `customizationOptions` | `CustomizationOptions` | - | Options de personnalisation |

**MenuCategory Union :**
```typescript
type MenuCategory = 'Entrées' | 'Plats' | 'Desserts' | 'Boissons';
```

**StationType Union :**
```typescript
type StationType = 'GRILL' | 'FROID' | 'PATISSERIE';
```

**CustomizationOptions Interface :**
```typescript
interface CustomizationOptions {
  cooking?: CookingLevel[];
  supplements?: Supplement[];
}

interface Supplement {
  name: string;
  price: number;
}

type CookingLevel = 'Bleau' | 'Saignant' | 'À Point' | 'Bien Cuit';
```

**Requêtes Courantes :**
```typescript
// Par catégorie
db.menuItems.where('category').equals('Plats').sortBy('name')

// Items disponibles
db.menuItems.where('isAvailable').equals(1).sortBy('category')

// Recherche par nom
db.menuItems.where('name').startsWithIgnoreCase('tartare')
```

---

#### Table 4 : `reservations` (Réservations)

| Propriété | Type | Index | Description |
|-----------|------|-------|-------------|
| `id` | `number` | `++id` (PK) | Auto-incrément |
| `customerName` | `string` | - | Nom du client |
| `email` | `string` | - | Email du client |
| `phone` | `string` | - | Téléphone du client |
| `date` | `string` | Indexé | Date (YYYY-MM-DD) |
| `time` | `string` | Indexé | Heure (HH:mm) |
| `guests` | `number` | - | Nombre de couverts |
| `status` | `ReservationStatus` | Indexé | Statut |
| `tableId` | `number` | - | Table assignée (FK) |
| `notes` | `string` | - | Notes spéciales |
| `createdAt` | `number` | - | Timestamp de création |
| `referenceNumber` | `string` | - | Référence unique |

**ReservationStatus Union :**
```typescript
type ReservationStatus = 'confirme' | 'en_attente' | 'annule' | 'arrive';
```

**Relations :**
- `reservations.tableId` → `tables.id` (Optional Many-to-One)

**Requêtes Courantes :**
```typescript
// Par date
db.reservations.where('date').equals('2026-03-23').sortBy('time')

// Par statut
db.reservations.where('status').equals('confirme').toArray()

// Réservations du jour
const today = new Date().toISOString().split('T')[0];
db.reservations.where('date').equals(today)
```

---

#### Table 5 : `users` (Utilisateurs)

| Propriété | Type | Index | Description |
|-----------|------|-------|-------------|
| `id` | `number` | `++id` (PK) | Auto-incrément |
| `name` | `string` | - | Nom complet |
| `email` | `string` | `&email` (Unique) | Email unique |
| `role` | `UserRole` | Indexé | Rôle utilisateur |
| `isActive` | `0 \| 1` | Indexé | Statut actif/inactif |
| `createdAt` | `number` | - | Timestamp de création |

**UserRole Union :**
```typescript
type UserRole = 'admin' | 'kds' | 'serveur' | 'client';
```

**Données Seed (4 utilisateurs) :**
```typescript
[
  { id: 1, name: 'Jean Dupont', email: 'admin@latelier.pos', role: 'admin', isActive: 1 },
  { id: 2, name: 'Chef d\'Atelier', email: 'chef@latelier.pos', role: 'kds', isActive: 1 },
  { id: 3, name: 'Marie Laurent', email: 'serveur@latelier.pos', role: 'serveur', isActive: 1 },
  { id: 4, name: 'Client Test', email: 'client@latelier.pos', role: 'client', isActive: 1 },
]
```

**Authentification Actuelle :**
- Stockage du rôle dans `localStorage`
- Pas de mot de passe (rôle sélectionné manuellement)
- Utilitaire : `src/utils/roleGuard.ts`

---

### 1.3 Hooks Personnalisés (13 Fichiers)

| Hook | Fichier | Tables Utilisées | Complexité |
|------|---------|------------------|------------|
| `useOrders` | `src/hooks/useOrders.ts` | orders | Moyenne |
| `useMenu` | `src/hooks/useMenu.ts` | menuItems | Faible |
| `useTables` | `src/hooks/useTables.ts` | tables | Faible |
| `useReservations` | `src/hooks/useReservations.ts` | reservations | Moyenne |
| `useDashboardData` | `src/hooks/useDashboardData.ts` | orders | Élevée |
| `useKitchenMonitor` | `src/hooks/useKitchenMonitor.ts` | orders, menuItems | Moyenne |
| `useCart` | `src/hooks/useCart.ts` | Aucune (state) | Faible |
| `useActiveTables` | `src/hooks/useActiveTables.ts` | orders, tables | Élevée |
| `useMenuEditor` | `src/hooks/useMenuEditor.ts` | menuItems | Moyenne |
| `useFloorPlan` | `src/hooks/useFloorPlan.ts` | tables, orders | Moyenne |
| `useRole` | `src/hooks/useRole.ts` | localStorage | Faible |
| `useRoleGuard` | `src/hooks/useRoleGuard.ts` | localStorage | Faible |
| `useSyncStatus` | `src/hooks/useSyncStatus.ts` | Toutes | Moyenne |
| `useServerOrders` | `src/hooks/useServerOrders.ts` | orders, tables | Élevée |
| `useServerCart` | `src/hooks/useServerCart.ts` | Aucune (state) | Faible |
| `useReservationForm` | `src/hooks/useReservationForm.ts` | reservations | Moyenne |
| `useTodayReservationsList` | `src/hooks/useTodayReservationsList.ts` | reservations | Faible |
| `useReservationsPlanning` | `src/hooks/useReservationsPlanning.ts` | reservations, tables | Moyenne |

---

### 1.4 Système de Tests Actuel

#### Configuration
**Fichier :** `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

#### Setup de Tests
**Fichier :** `src/test/setup.ts`

```typescript
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Nettoyage DB avant chaque test
beforeEach(async () => {
  localStorage.clear();
  await db.orders.clear();
  await db.restaurantTables.clear();
  await db.menuItems.clear();
  await db.reservations.clear();
  await db.users.clear();
});
```

#### Couverture de Tests

| Fichier Test | Hook Testé | Status |
|--------------|------------|--------|
| `database.test.ts` | Database, seedDatabase | ✅ Complet |
| `useOrders.test.ts` | useOrders hooks | ✅ Complet |
| `useMenu.test.ts` | useMenu hooks | ✅ Complet |
| `useTables.test.ts` | useTables hooks | ✅ Complet |
| `useReservations.test.ts` | useReservations hooks | ✅ Partiel |
| `useKitchenMonitor.test.ts` | useKitchenMonitor | ✅ Partiel |
| `useDashboardData.test.ts` | useDashboardData | ✅ Partiel |
| `useActiveTables.test.ts` | useActiveTables | ✅ Partiel |
| `useMenuEditor.test.ts` | useMenuEditor | ✅ Partiel |
| `useCart.test.ts` | useCart | ✅ Complet |
| `useServerOrders.test.ts` | useServerOrders | ✅ Partiel |
| `useServerCart.test.ts` | useServerCart | ✅ Complet |
| `useReservationForm.test.ts` | useReservationForm | ✅ Partiel |
| `useTodayReservationsList.test.ts` | useTodayReservationsList | ✅ Partiel |
| `useSyncStatus.test.ts` | useSyncStatus | ✅ Partiel |
| `roleGuard.test.ts` | roleGuard utils | ✅ Complet |

---

## 2. Cible (Firebase Emulator Suite)

### 2.1 Architecture Firebase

#### Services Utilisés

| Service | Usage |替代 Dexie |
|---------|-------|-----------|
| **Firestore** | Base de données principale | ✅ Oui |
| **Firebase Auth** | Authentification utilisateurs | ✅ Oui |
| **Emulator Suite** | Développement local | N/A |
| **Firebase Hosting** | Hébergement | N/A |

#### Structure du Projet Firebase

```
firebase/
├── firebase.json              # Configuration émulateurs
├── firestore.rules            # Règles de sécurité
├── firestore.indexes.json     # Index composites
├── .firebaserc                # Configuration projet
└── functions/                 # Cloud Functions (optionnel)
    ├── package.json
    └── src/
        └── index.ts
```

### 2.2 Configuration des Émulateurs

#### firebase.json

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### .firebaserc

```json
{
  "projects": {
    "default": "latelier-pos-dev",
    "production": "latelier-pos-prod"
  }
}
```

---

## 3. Mapping Schéma Dexie → Firestore

### 3.1 Principes de Migration

#### Différences Clés

| Aspect | Dexie.js (IndexedDB) | Firestore |
|--------|---------------------|-----------|
| **Modèle** | Relationnel simplifié | Document + Collections |
| **Requêtes** | SQL-like | NoSQL (where, orderBy, limit) |
| **Transactions** | ACID complètes | Limitées (25 docs max) |
| **Temps réel** | Via liveQuery | Natif (onSnapshot) |
| **Index** | Automatiques + Composés | Automatiques + Manuels |
| **Taille doc** | Illimitée | 1MB max |
| **Nested data** | Limité | Supporté (maps, arrays) |

#### Stratégie de Mapping

1. **Collections Firestore** = Tables Dexie
2. **Documents** = Enregistrements
3. **Champs nested** = Objects/Arrays conservés
4. **Relations** = References (paths) ou denormalization
5. **IDs** = Strings auto-générés (ou custom)

---

### 3.2 Mapping Détaillé par Collection

#### Collection 1 : `orders`

**Nom Firestore :** `orders`

**Structure Document :**
```typescript
interface OrderDocument {
  // Champs directs (inchangés)
  tableId: number;                    // Conserve comme number
  customerName: string;
  status: OrderStatus;                // Union type conservé
  items: OrderItem[];                 // Array embedded (inchangé)
  total: number;
  notes?: string;
  createdAt: Timestamp;               // Changé: Date → Timestamp
  updatedAt?: Timestamp;
  servedAt?: Timestamp;
  paymentMethod?: 'especes' | 'cb' | 'none';
  paidAt?: Timestamp;

  // Champs ajoutés pour Firestore
  _createdBy?: string;                // UID utilisateur (Auth)
  _lastModifiedBy?: string;           // UID utilisateur (Auth)
}
```

**Index Requis :**

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tableId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "paidAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Règles de Sécurité :**

```javascript
// firestore.rules
match /orders/{orderId} {
  // Lecture : Admin, KDS, Serveur (pour leurs tables)
  allow read: if 
    isAdmin() || 
    isKDS() || 
    (isServeur() && resource.data.status != 'paye');
  
  // Création : Serveur, Admin uniquement
  allow create: if 
    isAdmin() || 
    isServeur() && request.auth != null;
  
  // Mise à jour : Admin, KDS (status seulement), Serveur
  allow update: if 
    isAdmin() ||
    (isKDS() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAt'])) ||
    (isServeur() && request.auth != null);
  
  // Suppression : Admin uniquement (soft delete via status)
  allow delete: if isAdmin();
}
```

**Requêtes Équivalentes :**

```typescript
// AVANT (Dexie)
const orders = await db.orders
  .where('status')
  .equals('en_attente')
  .sortBy('createdAt');

// APRÈS (Firestore)
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const db = getFirestore(app);
const q = query(
  collection(db, 'orders'),
  where('status', '==', 'en_attente'),
  orderBy('createdAt', 'desc')
);
const snapshot = await getDocs(q);
const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

---

#### Collection 2 : `tables`

**Nom Firestore :** `tables`

**Structure Document :**
```typescript
interface TableDocument {
  // Le ID du document sera le numéro de table (string)
  // Ex: /tables/1, /tables/2, ...
  
  status: TableStatus;
  capacity?: number;
  sector?: string;
  currentOrderId?: string;               // Changé: number → string (doc ID)
  
  // Champs ajoutés
  _lastModifiedAt?: Timestamp;
  _lastModifiedBy?: string;
}
```

**Index Requis :**

```json
{
  "indexes": [
    {
      "collectionGroup": "tables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "id", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "tables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sector", "order": "ASCENDING" },
        { "fieldPath": "id", "order": "ASCENDING" }
      ]
    }
  ]
}
```

**Règles de Sécurité :**

```javascript
match /tables/{tableId} {
  // Lecture : Tous les utilisateurs authentifiés
  allow read: if request.auth != null;
  
  // Création : Admin uniquement
  allow create: if isAdmin();
  
  // Mise à jour : Admin, Serveur (status seulement)
  allow update: if 
    isAdmin() ||
    (isServeur() && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
      'status', 'currentOrderId', '_lastModifiedAt', '_lastModifiedBy'
    ]));
  
  // Suppression : Admin uniquement
  allow delete: if isAdmin();
}
```

---

#### Collection 3 : `menuItems`

**Nom Firestore :** `menuItems`

**Structure Document :**
```typescript
interface MenuItemDocument {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  allergens?: string[];
  isAvailable: boolean;              // Changé: 0|1 → boolean
  station?: StationType;
  customizationOptions?: {
    cooking?: CookingLevel[];
    supplements?: { name: string; price: number }[];
  };
  
  // Champs ajoutés
  _createdAt?: Timestamp;
  _lastModifiedAt?: Timestamp;
  _lastModifiedBy?: string;
}
```

**Index Requis :**

```json
{
  "indexes": [
    {
      "collectionGroup": "menuItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "menuItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isAvailable", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "menuItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "station", "order": "ASCENDING" }
      ]
    }
  ]
}
```

**Règles de Sécurité :**

```javascript
match /menuItems/{itemId} {
  // Lecture : Public (menu visible par tous)
  allow read: if true;
  
  // Création, Modification, Suppression : Admin uniquement
  allow create, update, delete: if isAdmin();
}
```

---

#### Collection 4 : `reservations`

**Nom Firestore :** `reservations`

**Structure Document :**
```typescript
interface ReservationDocument {
  customerName: string;
  email?: string;
  phone?: string;
  date: string;                      // YYYY-MM-DD (string)
  time: string;                      // HH:mm (string)
  guests: number;
  status: ReservationStatus;
  tableId?: number;                  // Garde comme number (référence)
  notes?: string;
  createdAt: Timestamp;
  referenceNumber: string;
  
  // Champs ajoutés
  _createdBy?: string;
  _lastModifiedAt?: Timestamp;
  _lastModifiedBy?: string;
}
```

**Index Requis :**

```json
{
  "indexes": [
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "time", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "time", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

**Règles de Sécurité :**

```javascript
match /reservations/{reservationId} {
  // Lecture : Admin, Serveur
  allow read: if isAdmin() || isServeur();
  
  // Création : Admin, Serveur
  allow create: if 
    isAdmin() || 
    (isServeur() && request.auth != null);
  
  // Mise à jour : Admin, Serveur
  allow update: if 
    isAdmin() || 
    (isServeur() && request.auth != null);
  
  // Suppression : Admin uniquement
  allow delete: if isAdmin();
}
```

---

#### Collection 5 : `users`

**Nom Firestore :** `users`

**Structure Document :**
```typescript
interface UserDocument {
  // Le ID du document sera l'UID Firebase Auth
  // Ex: /users/{uid}
  
  name: string;
  email: string;                     // Doit correspondre à Auth email
  role: UserRole;
  isActive: boolean;                 // Changé: 0|1 → boolean
  createdAt: Timestamp;
  
  // Champs ajoutés
  lastLoginAt?: Timestamp;
  _lastModifiedAt?: Timestamp;
}
```

**Index Requis :**

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "role", "order": "ASCENDING" }
      ]
    }
  ]
}
```

**Règles de Sécurité :**

```javascript
match /users/{userId} {
  // Lecture : Utilisateur peut lire son propre profil, Admin peut tout lire
  allow read: if 
    request.auth != null && 
    (request.auth.uid == userId || isAdmin());
  
  // Création : Admin uniquement (ou self-registration si activé)
  allow create: if isAdmin();
  
  // Mise à jour : Utilisateur peut modifier son profil, Admin peut tout modifier
  allow update: if 
    (request.auth != null && request.auth.uid == userId) ||
    isAdmin();
  
  // Suppression : Admin uniquement
  allow delete: if isAdmin();
}
```

**Fonctions Helper dans les Rules :**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isKDS() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'kds';
    }
    
    function isServeur() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'serveur';
    }
    
    function isClient() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'client';
    }
    
    // Collections
    match /orders/{orderId} { ... }
    match /tables/{tableId} { ... }
    match /menuItems/{itemId} { ... }
    match /reservations/{reservationId} { ... }
    match /users/{userId} { 
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow create: if isAdmin();
      allow update: if (request.auth != null && request.auth.uid == userId) || isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

---

### 3.3 Sous-Collections Potentielles

#### Option : `orders/{orderId}/items`

**Pourquoi ?** Si les items deviennent complexes ou nécessitent un suivi individuel.

**Structure :**
```
orders/
  {orderId}/
    items/
      {itemId}: { name, quantity, status, station, ... }
```

**Recommandation :** **NE PAS UTILISER** pour ce projet. Garder `items` embedded dans le document `orders` car :
- Tableau de taille limitée (< 10 items typiquement)
- Pas de requêtes nécessaires sur les items individuellement
- Simplifie les lectures (single doc read)

---

### 3.4 Tableau Récapitulatif du Mapping

| Table Dexie | Collection Firestore | ID Strategy | Changements Majeurs |
|-------------|---------------------|-------------|---------------------|
| `orders` | `orders` | Auto-generated | `createdAt`: number → Timestamp |
| `tables` | `tables` | Custom (table number) | `currentOrderId`: number → string |
| `menuItems` | `menuItems` | Auto-generated | `isAvailable`: 0\|1 → boolean |
| `reservations` | `reservations` | Auto-generated | `createdAt`: number → Timestamp |
| `users` | `users` | Custom (Auth UID) | `isActive`: 0\|1 → boolean |

---

## 4. Migration des Hooks

### 4.1 Stratégie Générale

#### Patterns de Remplacement

| Dexie Pattern | Firestore Pattern |
|---------------|-------------------|
| `useLiveQuery()` | `useCollection()` / `useDocument()` |
| `db.collection.add()` | `addDoc(collection())` |
| `db.collection.update()` | `updateDoc(doc())` |
| `db.collection.delete()` | `deleteDoc(doc())` |
| `db.collection.get()` | `getDoc(doc())` / `getDocs(query())` |

#### Hook Custom pour Firestore

**Fichier à créer :** `src/hooks/useFirestore.ts`

```typescript
// src/hooks/useFirestore.ts
import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook pour écouter une collection en temps réel
 * Remplace useLiveQuery de Dexie
 */
export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  dependencies: any[] = []
): T[] | undefined {
  const [data, setData] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      setData(items);
    }, (error) => {
      console.error(`[useCollection] Error on ${collectionName}:`, error);
      setData(undefined);
    });

    return () => unsubscribe();
  }, [collectionName, ...dependencies]);

  return data;
}

/**
 * Hook pour écouter un document en temps réel
 */
export function useDocument<T>(
  collectionName: string,
  docId: string,
  dependencies: any[] = []
): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData({ id: snapshot.id, ...snapshot.data() } as T);
      } else {
        setData(undefined);
      }
    }, (error) => {
      console.error(`[useDocument] Error on ${collectionName}/${docId}:`, error);
      setData(undefined);
    });

    return () => unsubscribe();
  }, [collectionName, docId, ...dependencies]);

  return data;
}
```

---

### 4.2 Migration Hook par Hook

#### Hook 1 : `useOrders.ts`

**Fichier :** `src/hooks/useOrders.ts`

**AVANT (Dexie) :**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useActiveOrders(): Order[] | undefined {
  return useLiveQuery(
    () => db.orders
      .where('status')
      .anyOf(['en_attente', 'en_preparation', 'pret', 'servi'])
      .sortBy('createdAt'),
    []
  );
}

export async function createOrder(input: CreateOrderInput): Promise<number> {
  const orderData: Omit<Order, 'id'> = {
    ...input,
    createdAt: Date.now(),
  };
  const id = await db.orders.add(orderData as Order);
  return id;
}

export async function updateOrderStatus(input: UpdateOrderInput): Promise<void> {
  const { id, ...updates } = input;
  const existing = await db.orders.get(id);
  if (!existing) throw new Error(`Commande ${id} introuvable`);
  
  await db.orders.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}
```

**APRÈS (Firestore) :**
```typescript
// src/hooks/useOrders.ts
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCollection } from './useFirestore';

export function useActiveOrders(): OrderDocument[] | undefined {
  return useCollection<OrderDocument>(
    'orders',
    [
      where('status', 'in', ['en_attente', 'en_preparation', 'pret', 'servi']),
      orderBy('createdAt', 'desc')
    ],
    []
  );
}

export function useOrdersByTable(tableId: number): OrderDocument[] | undefined {
  return useCollection<OrderDocument>(
    'orders',
    [
      where('tableId', '==', tableId),
      orderBy('createdAt', 'desc')
    ],
    [tableId]
  );
}

export function useOrder(orderId: string): OrderDocument | undefined {
  return useDocument<OrderDocument>('orders', orderId, [orderId]);
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const orderData: Omit<OrderDocument, 'id'> = {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: null,
    servedAt: null,
  };

  const docRef = await addDoc(collection(db, 'orders'), orderData);
  return docRef.id;
}

export async function updateOrderStatus(input: UpdateOrderInput): Promise<void> {
  const { id, ...updates } = input;
  const orderRef = doc(db, 'orders', id);
  
  await updateDoc(orderRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    ...(updates.status === 'servi' && { servedAt: serverTimestamp() })
  });
}

export async function cancelOrder(orderId: string): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status: 'annule',
    updatedAt: serverTimestamp(),
  });
}
```

**Difficulté :** Moyenne  
**Temps Estimé :** 2h  
**Pièges :**
- `anyOf()` → `in` operator (max 10 valeurs)
- Auto-increment ID → string ID généré par Firestore
- `Date.now()` → `serverTimestamp()`
- `.get(id)` → `useDocument()` hook

---

#### Hook 2 : `useMenu.ts`

**Fichier :** `src/hooks/useMenu.ts`

**AVANT (Dexie) :**
```typescript
export function useAllMenuItems(): MenuItem[] | undefined {
  return useLiveQuery(
    () => db.menuItems.orderBy('category').toArray(),
    []
  );
}

export function useMenuItemsByCategory(category: MenuCategory): MenuItem[] | undefined {
  return useLiveQuery(
    () => db.menuItems
      .where('category')
      .equals(category)
      .sortBy('name'),
    [category]
  );
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<number> {
  const id = await db.menuItems.add(input as MenuItem);
  return id;
}

export async function toggleMenuItemAvailability(
  itemId: number,
  isAvailable: boolean
): Promise<void> {
  await db.menuItems.update(itemId, {
    isAvailable: isAvailable ? 1 : 0,
  });
}
```

**APRÈS (Firestore) :**
```typescript
// src/hooks/useMenu.ts
import { collection, query, where, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCollection } from './useFirestore';

export function useAllMenuItems(): MenuItemDocument[] | undefined {
  return useCollection<MenuItemDocument>(
    'menuItems',
    [orderBy('category', 'asc'), orderBy('name', 'asc')],
    []
  );
}

export function useMenuItemsByCategory(category: MenuCategory): MenuItemDocument[] | undefined {
  return useCollection<MenuItemDocument>(
    'menuItems',
    [
      where('category', '==', category),
      orderBy('name', 'asc')
    ],
    [category]
  );
}

export function useAvailableMenuItems(): MenuItemDocument[] | undefined {
  return useCollection<MenuItemDocument>(
    'menuItems',
    [
      where('isAvailable', '==', true),
      orderBy('category', 'asc')
    ],
    []
  );
}

export function useMenuItem(itemId: string): MenuItemDocument | undefined {
  return useDocument<MenuItemDocument>('menuItems', itemId, [itemId]);
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'menuItems'), {
    ...input,
    isAvailable: Boolean(input.isAvailable), // Convert 0|1 → boolean
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function toggleMenuItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<void> {
  const itemRef = doc(db, 'menuItems', itemId);
  await updateDoc(itemRef, {
    isAvailable,
    lastModifiedAt: serverTimestamp(),
  });
}

export function useMenuItemsSearch(searchTerm: string): MenuItemDocument[] | undefined {
  // NOTE: Firestore ne supporte pas startsWithIgnoreCase
  // Solution: Client-side filtering ou Algolia
  const allItems = useAllMenuItems();
  
  if (!searchTerm || !allItems) return allItems;
  
  return allItems.filter(item =>
    item.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );
}
```

**Difficulté :** Faible  
**Temps Estimé :** 1.5h  
**Pièges :**
- `isAvailable: 0|1` → `boolean`
- `startsWithIgnoreCase` non supporté par Firestore → filtrage client
- Index composite requis pour `category + name`

---

#### Hook 3 : `useTables.ts`

**AVANT (Dexie) :**
```typescript
export function useAllTables() {
  const [tables, setTables] = useState<TableRecord[]>([]);

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.restaurantTables.orderBy('id').toArray()
    ).subscribe({
      next: setTables,
      error: (err) => console.error('[useAllTables] liveQuery error:', err),
    });
    return () => subscription.unsubscribe();
  }, []);

  return tables;
}

export async function updateTableStatus(
  tableId: number,
  status: TableStatus,
  currentOrderId?: number
): Promise<void> {
  const updates: Partial<TableRecord> = { status };
  if (currentOrderId !== undefined) {
    updates.currentOrderId = currentOrderId;
  } else if (status === 'libre') {
    updates.currentOrderId = undefined;
  }
  await db.restaurantTables.update(tableId, updates);
}
```

**APRÈS (Firestore) :**
```typescript
// src/hooks/useTables.ts
import { doc, updateDoc, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCollection, useDocument } from './useFirestore';

export function useAllTables(): TableDocument[] | undefined {
  return useCollection<TableDocument>(
    'tables',
    [orderBy('id', 'asc')],
    []
  );
}

export function useTable(tableId: number): TableDocument | undefined {
  // tableId est utilisé comme document ID
  return useDocument<TableDocument>('tables', tableId.toString(), [tableId]);
}

export function useTablesByStatus(status: TableStatus): TableDocument[] | undefined {
  return useCollection<TableDocument>(
    'tables',
    [
      where('status', '==', status),
      orderBy('id', 'asc')
    ],
    [status]
  );
}

export async function createTable(input: CreateTableInput): Promise<string> {
  const tableRef = doc(db, 'tables', input.id.toString());
  await setDoc(tableRef, input);
  return input.id.toString();
}

export async function updateTableStatus(
  tableId: number,
  status: TableStatus,
  currentOrderId?: string
): Promise<void> {
  const tableRef = doc(db, 'tables', tableId.toString());
  const updates: Partial<TableDocument> = { 
    status,
    _lastModifiedAt: serverTimestamp()
  };
  
  if (currentOrderId !== undefined) {
    updates.currentOrderId = currentOrderId;
  } else if (status === 'libre') {
    updates.currentOrderId = null;
  }
  
  await updateDoc(tableRef, updates);
}
```

**Difficulté :** Faible  
**Temps Estimé :** 1h  
**Pièges :**
- ID personnalisé (numéro de table) → utiliser `setDoc(doc(), data)` au lieu de `addDoc()`
- `currentOrderId`: number → string (doc ID)

---

#### Hook 4 : `useReservations.ts`

**AVANT (Dexie) :**
```typescript
export function useReservationsByDate(date: string): Reservation[] | undefined {
  return useLiveQuery(
    () => db.reservations
      .where('date')
      .equals(date)
      .sortBy('time'),
    [date]
  );
}

export async function createReservation(input: CreateReservationInput): Promise<number> {
  const newReservation = {
    ...input,
    status: input.status || 'en_attente',
    createdAt: Date.now(),
    referenceNumber: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  const id = await db.reservations.add(newReservation as any);
  return id;
}
```

**APRÈS (Firestore) :**
```typescript
// src/hooks/useReservations.ts
import { collection, query, where, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCollection } from './useFirestore';

export function useAllReservations(): ReservationDocument[] | undefined {
  return useCollection<ReservationDocument>(
    'reservations',
    [orderBy('date', 'asc'), orderBy('time', 'asc')],
    []
  );
}

export function useReservationsByDate(date: string): ReservationDocument[] | undefined {
  return useCollection<ReservationDocument>(
    'reservations',
    [
      where('date', '==', date),
      orderBy('time', 'asc')
    ],
    [date]
  );
}

export function useTodayReservations(): ReservationDocument[] | undefined {
  const today = new Date().toISOString().split('T')[0];
  return useReservationsByDate(today);
}

export async function createReservation(input: CreateReservationInput): Promise<string> {
  const referenceNumber = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const docRef = await addDoc(collection(db, 'reservations'), {
    ...input,
    status: input.status || 'en_attente',
    createdAt: serverTimestamp(),
    referenceNumber,
  });
  
  return docRef.id;
}

export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus
): Promise<void> {
  const resRef = doc(db, 'reservations', reservationId);
  await updateDoc(resRef, {
    status,
    _lastModifiedAt: serverTimestamp(),
  });
}
```

**Difficulté :** Moyenne  
**Temps Estimé :** 1.5h  
**Pièges :**
- Index composite `date + time` requis
- Génération `referenceNumber` côté client (inchangé)

---

#### Hook 5 : `useDashboardData.ts`

**AVANT (Dexie) :**
```typescript
export function useDashboardData(): DashboardData | undefined {
  const allOrders = useLiveQuery(
    () => db.orders.orderBy('createdAt').toArray(),
    []
  );

  return useMemo(() => {
    if (!allOrders) return undefined;
    
    // ... calculs complexes
    const todayPaidOrders = allOrders.filter(order =>
      order.status === 'paye' &&
      order.createdAt >= startOfDay &&
      order.createdAt < endOfDay
    );
    
    return { revenue, ordersCount, avgPrepTime, ... };
  }, [allOrders]);
}
```

**APRÈS (Firestore) :**
```typescript
// src/hooks/useDashboardData.ts
import { collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCollection } from './useFirestore';

export function useDashboardData(): DashboardData | undefined {
  // Charger toutes les commandes (ou utiliser des Cloud Functions pour aggregations)
  const allOrders = useCollection<OrderDocument>(
    'orders',
    [orderBy('createdAt', 'desc')],
    []
  );

  return useMemo(() => {
    if (!allOrders) return undefined;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 86400000;

    // Filtrage client-side pour les calculs complexes
    const todayPaidOrders = allOrders.filter(order => {
      const orderTime = order.createdAt?.toMillis() || 0;
      return order.status === 'paye' &&
             orderTime >= startOfDay &&
             orderTime < endOfDay;
    });

    const revenue = todayPaidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // ... autres calculs identiques
    
    return { revenue, ordersCount, avgPrepTime, satisfaction, weeklyData, liveEvents };
  }, [allOrders]);
}
```

**Difficulté :** Élevée  
**Temps Estimé :** 2.5h  
**Pièges :**
- Timestamp Firestore → `.toMillis()` pour comparaison
- Calculs complexes restent côté client
- Optimisation possible : Cloud Functions pour aggregations quotidiennes

---

#### Hook 6 : `useKitchenMonitor.ts`

**AVANT (Dexie) :**
```typescript
export function useKitchenOrders(): KitchenOrder[] | undefined {
  const allOrders = useLiveQuery(
    () => db.orders.orderBy('createdAt').toArray(),
    []
  );

  return useMemo(() => {
    if (!allOrders) return undefined;
    
    const activeOrders = allOrders.filter(order =>
      ['en_attente', 'en_preparation', 'pret'].includes(order.status)
    );
    
    return activeOrders.map(order => ({
      id: order.id,
      tableId: order.tableId,
      items: order.items,
      elapsedTime: calculateElapsedTime(order),
      status: determineOrderStatus(order),
    }));
  }, [allOrders]);
}
```

**APRÈS (Firestore) :**
```typescript
// src/hooks/useKitchenMonitor.ts
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from './useFirestore';

export function useKitchenOrders(): KitchenOrder[] | undefined {
  // Optimisation: Filtrer par statut côté serveur
  const activeOrders = useCollection<OrderDocument>(
    'orders',
    [
      where('status', 'in', ['en_attente', 'en_preparation', 'pret']),
      orderBy('createdAt', 'asc')
    ],
    []
  );

  return useMemo(() => {
    if (!activeOrders) return undefined;
    
    return activeOrders.map(order => ({
      id: order.id,
      tableId: order.tableId,
      items: order.items,
      elapsedTime: calculateElapsedTime(order),
      status: determineOrderStatus(order),
    }));
  }, [activeOrders]);
}
```

**Difficulté :** Moyenne  
**Temps Estimé :** 1.5h  
**Pièges :**
- `in` operator pour filtrer multiple statuts
- Calcul temps réel (`elapsedTime`) reste côté client

---

#### Hook 7 : `useActiveTables.ts`

**AVANT (Dexie) :**
```typescript
export function useActiveTables(): TableService[] | undefined {
  const allOrders = useLiveQuery(
    () => db.orders.orderBy('createdAt').toArray(),
    []
  );
  
  const allTables = useLiveQuery(
    () => db.restaurantTables.toArray(),
    []
  );

  return useMemo(() => {
    if (!allOrders || !allTables) return undefined;
    
    const tableMap = new Map(allTables.map(t => [t.id, t]));
    
    const activeOrders = allOrders.filter(order =>
      ['en_attente', 'en_preparation', 'pret'].includes(order.status)
    );
    
    return activeOrders.map(order => {
      const table = tableMap.get(order.tableId);
      return {
        orderId: order.id,
        tableId: order.tableId,
        tableName: formatTableName(order.tableId),
        status: determineTableStatus(order),
        // ...
      };
    });
  }, [allOrders, allTables]);
}
```

**APRÈS (Firestore) :**
```typescript
// src/hooks/useActiveTables.ts
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from './useFirestore';

export function useActiveTables(): TableService[] | undefined {
  const activeOrders = useCollection<OrderDocument>(
    'orders',
    [
      where('status', 'in', ['en_attente', 'en_preparation', 'pret']),
      orderBy('createdAt', 'asc')
    ],
    []
  );
  
  const allTables = useCollection<TableDocument>('tables', [], []);

  return useMemo(() => {
    if (!activeOrders || !allTables) return undefined;
    
    const tableMap = new Map(allTables.map(t => [t.id, t]));
    
    return activeOrders.map(order => {
      const table = tableMap.get(order.tableId);
      return {
        orderId: order.id,
        tableId: order.tableId,
        tableName: `Table ${order.tableId.toString().padStart(2, '0')}`,
        status: determineTableStatus(order),
        guests: getGuestCount(order.tableId),
        server: getServerName(order.tableId),
        items: convertOrderItems(order.items),
        waitTime: calculateWaitTime(order),
        total: order.total || 0,
      };
    });
  }, [activeOrders, allTables]);
}
```

**Difficulté :** Élevée  
**Temps Estimé :** 2h  
**Pièges :**
- Jointure manuelle via `Map` (pas de JOIN dans Firestore)
- Deux collections à écouter en parallèle

---

#### Hooks 8-13 : Résumé

| Hook | Difficulté | Temps | Notes |
|------|------------|-------|-------|
| `useMenuEditor.ts` | Moyenne | 1.5h | CRUD complet avec validation |
| `useFloorPlan.ts` | Moyenne | 1.5h | Jointure tables + orders |
| `useServerOrders.ts` | Élevée | 2.5h | Transactions complexes |
| `useReservationForm.ts` | Faible | 1h | Wrapper autour de `createReservation` |
| `useTodayReservationsList.ts` | Faible | 0.5h | Simple wrapper |
| `useReservationsPlanning.ts` | Moyenne | 1h | Multiple queries |

---

### 4.3 Tableau Récapitulatif des Hooks

| Hook | Avant (Lignes) | Après (Lignes) | Difficulté | Temps |
|------|----------------|----------------|------------|-------|
| `useOrders` | 85 | 95 | Moyenne | 2h |
| `useMenu` | 75 | 85 | Faible | 1.5h |
| `useTables` | 90 | 80 | Faible | 1h |
| `useReservations` | 110 | 100 | Moyenne | 1.5h |
| `useDashboardData` | 180 | 160 | Élevée | 2.5h |
| `useKitchenMonitor` | 120 | 100 | Moyenne | 1.5h |
| `useActiveTables` | 130 | 110 | Élevée | 2h |
| `useMenuEditor` | 140 | 130 | Moyenne | 1.5h |
| `useFloorPlan` | 80 | 75 | Moyenne | 1.5h |
| `useServerOrders` | 250 | 220 | Élevée | 2.5h |
| `useReservationForm` | 120 | 110 | Faible | 1h |
| `useTodayReservationsList` | 40 | 35 | Faible | 0.5h |
| `useReservationsPlanning` | 100 | 90 | Moyenne | 1h |
| **TOTAL** | **1520** | **1390** | - | **20.5h** |

---

## 5. Migration des Mutations

### 5.1 CRUD Operations Mapping

#### Create (Ajouter)

| Dexie | Firestore |
|-------|-----------|
| `db.collection.add(data)` | `addDoc(collection(db, 'collection'), data)` |
| Retour: auto-increment ID | Retour: generated string ID |
| `db.doc.put(data)` | `setDoc(doc(db, 'collection', id), data)` |

**Exemple Orders :**
```typescript
// AVANT
const orderId = await db.orders.add({
  tableId: 5,
  customerName: 'Client',
  status: 'en_attente',
  items: [...],
  total: 45.00,
  createdAt: Date.now(),
});

// APRÈS
const docRef = await addDoc(collection(db, 'orders'), {
  tableId: 5,
  customerName: 'Client',
  status: 'en_attente',
  items: [...],
  total: 45.00,
  createdAt: serverTimestamp(),
});
const orderId = docRef.id;
```

---

#### Update (Mettre à jour)

| Dexie | Firestore |
|-------|-----------|
| `db.collection.update(id, data)` | `updateDoc(doc(db, 'collection', id), data)` |
| Merge automatique | Merge automatique |
| Throw si ID inexistant | Throw si ID inexistant |

**Exemple Tables :**
```typescript
// AVANT
await db.restaurantTables.update(tableId, {
  status: 'occupee',
  currentOrderId: orderId,
});

// APRÈS
const tableRef = doc(db, 'tables', tableId.toString());
await updateDoc(tableRef, {
  status: 'occupee',
  currentOrderId: orderId,
  _lastModifiedAt: serverTimestamp(),
});
```

---

#### Delete (Supprimer)

| Dexie | Firestore |
|-------|-----------|
| `db.collection.delete(id)` | `deleteDoc(doc(db, 'collection', id))` |
| Soft delete recommandée | Soft delete recommandée |

**Exemple (Soft Delete) :**
```typescript
// AVANT
await db.orders.update(orderId, {
  status: 'annule',
  updatedAt: Date.now(),
});

// APRÈS
const orderRef = doc(db, 'orders', orderId);
await updateDoc(orderRef, {
  status: 'annule',
  updatedAt: serverTimestamp(),
});
```

---

#### Read (Lire)

| Dexie | Firestore |
|-------|-----------|
| `db.collection.get(id)` | `getDoc(doc(db, 'collection', id))` |
| `db.collection.where().first()` | `getDocs(query(...))` |
| Réactif: `useLiveQuery` | Réactif: `onSnapshot` |

**Exemple :**
```typescript
// AVANT - One-time read
const order = await db.orders.get(orderId);

// APRÈS - One-time read
const orderRef = doc(db, 'orders', orderId);
const orderSnap = await getDoc(orderRef);
if (orderSnap.exists()) {
  const order = { id: orderSnap.id, ...orderSnap.data() };
}

// AVANT - Reactive
const order = useLiveQuery(() => db.orders.get(orderId), [orderId]);

// APRÈS - Reactive
const order = useDocument('orders', orderId, [orderId]);
```

---

### 5.2 Transactions et Batches

#### Limitations Firestore

| Aspect | Dexie | Firestore |
|--------|-------|-----------|
| **Transactions** | Illimitées | Max 25 documents |
| **Batch writes** | N/A | Max 500 opérations |
| **Atomicité** | ACID complète | Limitée aux docs concernés |

#### Migration des Transactions

**Exemple : Créer commande + Mettre à jour table**

```typescript
// AVANT (Dexie)
await db.transaction('rw', db.orders, db.restaurantTables, async () => {
  const orderId = await db.orders.add({
    tableId,
    customerName,
    status: 'en_attente',
    items,
    total,
    createdAt: Date.now(),
  });
  
  await db.restaurantTables.update(tableId, {
    status: 'occupee',
    currentOrderId: orderId,
  });
});

// APRÈS (Firestore) - Transaction
import { runTransaction, doc, collection } from 'firebase/firestore';

await runTransaction(db, async (transaction) => {
  const tableRef = doc(db, 'tables', tableId.toString());
  const tableDoc = await transaction.get(tableRef);
  
  if (!tableDoc.exists()) {
    throw new Error('Table inexistante');
  }
  
  // Créer la commande (nécessite une référence)
  const orderRef = doc(collection(db, 'orders'));
  transaction.set(orderRef, {
    tableId,
    customerName,
    status: 'en_attente',
    items,
    total,
    createdAt: serverTimestamp(),
  });
  
  // Mettre à jour la table
  transaction.update(tableRef, {
    status: 'occupee',
    currentOrderId: orderRef.id,
    _lastModifiedAt: serverTimestamp(),
  });
  
  return orderRef.id;
});
```

**Alternative : Batch Write (si pas de lecture requise)**

```typescript
import { writeBatch, doc, collection } from 'firebase/firestore';

const batch = writeBatch(db);

// Créer commande
const orderRef = doc(collection(db, 'orders'));
batch.set(orderRef, {
  tableId,
  customerName,
  status: 'en_attente',
  items,
  total,
  createdAt: serverTimestamp(),
});

// Mettre à jour table
const tableRef = doc(db, 'tables', tableId.toString());
batch.update(tableRef, {
  status: 'occupee',
  currentOrderId: orderRef.id,
  _lastModifiedAt: serverTimestamp(),
});

await batch.commit();
return orderRef.id;
```

---

### 5.3 Pièges à Éviter

#### 1. Timestamps

```typescript
// ❌ MAUVAIS
createdAt: Date.now()

// ✅ BON
createdAt: serverTimestamp()

// Pour comparaison client-side
const now = new Date();
const orderTime = order.createdAt?.toMillis() || 0;
if (orderTime >= startOfDay) { ... }
```

---

#### 2. Null vs Undefined

```typescript
// ❌ MAUVAIS - Firestore n'aime pas undefined
await updateDoc(ref, { notes: undefined });

// ✅ BON
await updateDoc(ref, { notes: null });

// Ou utiliser fieldToDelete
import { updateDoc, fieldToDelete } from 'firebase/firestore';
await updateDoc(ref, { notes: fieldToDelete() });
```

---

#### 3. IDs Personnalisés

```typescript
// Pour tables (ID = numéro de table)
// ❌ MAUVAIS
await addDoc(collection(db, 'tables'), { id: 5, ... });

// ✅ BON
const tableRef = doc(db, 'tables', '5');
await setDoc(tableRef, { id: 5, ... });
```

---

#### 4. Query Constraints

```typescript
// ❌ MAUVAIS - where après orderBy
query(
  collection(db, 'orders'),
  orderBy('createdAt', 'desc'),
  where('status', '==', 'en_attente')
);

// ✅ BON - where avant orderBy
query(
  collection(db, 'orders'),
  where('status', '==', 'en_attente'),
  orderBy('createdAt', 'desc')
);
```

---

#### 5. Limites de Requêtes

```typescript
// ❌ MAUVAIS - Plus de 10 valeurs dans 'in'
where('status', 'in', ['en_attente', 'en_preparation', 'pret', 'servi', 'paye', 'annule', ...])

// ✅ BON - Multiple queries ou 'array-contains'
const statuses = ['en_attente', 'en_preparation', 'pret', 'servi'];
where('status', 'in', statuses) // Max 10
```

---

## 6. Migration Auth

### 6.1 Système Actuel (Dexie + localStorage)

**Fichier :** `src/utils/roleGuard.ts`

```typescript
const STORAGE_KEY = 'atelier_role';

export function getUserRole(): UserRole | null {
  const role = localStorage.getItem(STORAGE_KEY);
  if (isValidRole(role)) {
    return role;
  }
  return null;
}

export function setUserRole(role: UserRole): void {
  localStorage.setItem(STORAGE_KEY, role);
}

export function clearUserRole(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

**Problèmes :**
- Pas de véritable authentification
- Rôle stocké en clair dans localStorage
- Pas de gestion de session
- Pas de mot de passe
- Vulnérable aux attaques XSS

---

### 6.2 Système Firebase Auth

#### Configuration

**Fichier à créer :** `src/firebase/config.ts`

```typescript
// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Auth et Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connecter aux émulateurs en développement
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export { app };
```

---

#### Variables d'Environnement

**Fichier à créer :** `.env`

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=latelier-pos-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=latelier-pos-dev
VITE_FIREBASE_STORAGE_BUCKET=latelier-pos-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Fichier à créer :** `.env.example`

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

### 6.3 Migration des Utilisateurs Existants

#### Script de Migration

**Fichier à créer :** `scripts/migrate-users.ts`

```typescript
// scripts/migrate-users.ts
// Script pour migrer les utilisateurs Dexie vers Firebase Auth

import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db as dexieDb } from '../src/db/database';

async function migrateUsers() {
  const auth = getAuth();
  const db = getFirestore();
  
  // Récupérer tous les utilisateurs Dexie
  const dexieUsers = await dexieDb.users.toArray();
  
  console.log(`Migration de ${dexieUsers.length} utilisateurs...`);
  
  for (const user of dexieUsers) {
    try {
      // Créer un mot de passe temporaire
      const tempPassword = `TempPass_${Math.random().toString(36).slice(-8)}`;
      
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        tempPassword
      );
      
      // Mettre à jour le profil avec le nom
      await updateProfile(userCredential.user, {
        displayName: user.name,
      });
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: Boolean(user.isActive),
        createdAt: serverTimestamp(),
        lastLoginAt: null,
        _lastModifiedAt: serverTimestamp(),
      });
      
      console.log(`✅ Utilisateur migré: ${user.email} (UID: ${userCredential.user.uid})`);
      console.log(`   Mot de passe temporaire: ${tempPassword}`);
      
    } catch (error) {
      console.error(`❌ Erreur migration ${user.email}:`, error);
    }
  }
  
  console.log('Migration terminée!');
}

migrateUsers().catch(console.error);
```

---

### 6.4 Nouveaux Hooks d'Authentification

#### Hook : `useAuth.ts`

**Fichier à créer :** `src/hooks/useAuth.ts`

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { UserRole } from '../db/types';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Charger le profil depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || userDoc.data().name,
            role: userDoc.data().role,
            isActive: userDoc.data().isActive,
          });
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    logout,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isKDS: profile?.role === 'kds',
    isServeur: profile?.role === 'serveur',
    isClient: profile?.role === 'client',
  };
}
```

---

#### Hook : `useLogin.ts`

**Fichier à créer :** `src/hooks/useLogin.ts`

```typescript
// src/hooks/useLogin.ts
import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInAnonymously,
} from 'firebase/auth';
import { auth } from '../firebase/config';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAnonymous = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loginAnonymous, loading, error };
}
```

---

### 6.5 Routes Protégées

#### Component : `ProtectedRoute.tsx`

**Fichier à créer :** `src/components/ProtectedRoute.tsx`

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../db/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { profile, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!profile?.isActive) {
    return <Navigate to="/account-disabled" replace />;
  }

  return <>{children}</>;
}
```

---

#### Mise à jour du Router

**Fichier à modifier :** `src/router.tsx`

```typescript
// AVANT (système actuel)
<Route 
  path="/admin" 
  element={<RoleGuard role="admin"><AdminDashboard /></RoleGuard>} 
/>

// APRÈS (Firebase Auth)
import { ProtectedRoute } from './components/ProtectedRoute';

<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/kds" 
  element={
    <ProtectedRoute allowedRoles={['admin', 'kds']}>
      <KitchenDisplay />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/serveur" 
  element={
    <ProtectedRoute allowedRoles={['admin', 'serveur']}>
      <ServeurDashboard />
    </ProtectedRoute>
  } 
/>
```

---

### 6.6 Page de Login

**Fichier à créer :** `src/views/LoginView.tsx`

```typescript
// src/views/LoginView.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useToast } from '../hooks/useToast';

export function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useLogin();
  const { showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      showError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">L'Atelier POS</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
```

---

### 6.7 Résumé Migration Auth

| Aspect | Avant | Après |
|--------|-------|-------|
| **Stockage** | localStorage | Firebase Auth + Firestore |
| **Sécurité** | Aucune | JWT + Rules Firestore |
| **Session** | Persistante (localStorage) | Gérée par Firebase |
| **Mot de passe** | Aucun | bcrypt (géré par Firebase) |
| **Rôles** | localStorage | Firestore `users/{uid}` |
| **Déconnexion** | `localStorage.clear()` | `signOut(auth)` |

**Temps Estimé :** 8h  
**Difficulté :** Moyenne

---

## 7. Migration des Tests

### 7.1 Setup Actuel vs Cible

#### Actuel (fake-indexeddb)

```typescript
// src/test/setup.ts
import 'fake-indexeddb/auto';
import { db } from '../db/database';

beforeEach(async () => {
  await db.orders.clear();
  await db.restaurantTables.clear();
  // ...
});
```

#### Cible (Firebase Emulator)

```typescript
// src/test/setup.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, clearIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

const testConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
};

const app = initializeApp(testConfig, 'test');
export const testDb = getFirestore(app);
export const testAuth = getAuth(app);

// Connecter aux émulateurs
connectFirestoreEmulator(testDb, 'localhost', 8080);
connectAuthEmulator(testAuth, 'http://localhost:9099');

beforeEach(async () => {
  // Nettoyer Firestore entre les tests
  const collections = ['orders', 'tables', 'menuItems', 'reservations', 'users'];
  for (const col of collections) {
    // Supprimer tous les documents de la collection
    // (nécessite une fonction utilitaire)
  }
});
```

---

### 7.2 Utilitaires de Test

**Fichier à créer :** `src/test/firestore-utils.ts`

```typescript
// src/test/firestore-utils.ts
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc,
  Firestore,
} from 'firebase/firestore';

/**
 * Supprime tous les documents d'une collection
 */
export async function clearCollection(db: Firestore, collectionName: string) {
  const snapshot = await getDocs(collection(db, collectionName));
  const promises = snapshot.docs.map(docSnap => 
    deleteDoc(doc(db, collectionName, docSnap.id))
  );
  await Promise.all(promises);
}

/**
 * Seed des données de test
 */
export async function seedTestDatabase(db: Firestore) {
  // Tables
  await seedTables(db);
  // Menu items
  await seedMenuItems(db);
  // Orders
  await seedOrders(db);
  // Reservations
  await seedReservations(db);
  // Users
  await seedUsers(db);
}

async function seedTables(db: Firestore) {
  // ... données seed identiques au seed Dexie
}

async function seedMenuItems(db: Firestore) {
  // ... données seed identiques
}

// etc.
```

---

### 7.3 Migration des Tests de Hooks

#### Exemple : `useOrders.test.ts`

**AVANT (Dexie) :**
```typescript
import { seedDatabase } from '../db/database';
import { db } from '../db/database';

describe('useOrders Hooks', () => {
  beforeEach(async () => {
    await seedDatabase();
  });

  it('devrait créer une nouvelle commande', async () => {
    const orderId = await createOrder({
      tableId: 5,
      customerName: 'Client Test',
      status: 'en_attente',
      items: [{ name: 'Test', quantity: 1 }],
      total: 25.00,
    });

    const createdOrder = await db.orders.get(orderId);
    expect(createdOrder).toBeDefined();
  });
});
```

**APRÈS (Firestore Emulator) :**
```typescript
import { testDb, testAuth } from '../test/setup';
import { clearCollection, seedTestDatabase } from '../test/firestore-utils';
import { collection, doc, getDoc } from 'firebase/firestore';

describe('useOrders Hooks', () => {
  beforeEach(async () => {
    await clearCollection(testDb, 'orders');
    await clearCollection(testDb, 'tables');
    await seedTestDatabase(testDb);
  });

  it('devrait créer une nouvelle commande', async () => {
    const orderId = await createOrder({
      tableId: 5,
      customerName: 'Client Test',
      status: 'en_attente',
      items: [{ name: 'Test', quantity: 1 }],
      total: 25.00,
    });

    const orderRef = doc(testDb, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    expect(orderSnap.exists()).toBe(true);
  });
});
```

---

### 7.4 Configuration Vitest Mise à Jour

**Fichier à modifier :** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    
    // Timeout plus long pour les émulateurs
    testTimeout: 10000,
    
    // Hook global pour démarrer les émulateurs
    globalSetup: ['./src/test/global-setup.ts'],
  },
});
```

**Fichier à créer :** `src/test/global-setup.ts`

```typescript
// src/test/global-setup.ts
import { spawn } from 'child_process';

export default async function setup() {
  // Démarrer les émulateurs Firebase
  const emulatorProcess = spawn('firebase', ['emulators:start'], {
    stdio: 'pipe',
  });

  // Attendre que les émulateurs soient prêts
  await new Promise(resolve => setTimeout(resolve, 5000));

  return async () => {
    // Arrêter les émulateurs après les tests
    emulatorProcess.kill();
  };
}
```

---

### 7.5 Tableau des Tests à Réécrire

| Fichier Test | Effort | Notes |
|--------------|--------|-------|
| `database.test.ts` | Élevé | Complètement à réécrire |
| `useOrders.test.ts` | Moyen | Adapter setup + assertions |
| `useMenu.test.ts` | Moyen | Adapter setup + assertions |
| `useTables.test.ts` | Moyen | Adapter setup + assertions |
| `useReservations.test.ts` | Moyen | Adapter setup |
| `useKitchenMonitor.test.ts` | Faible | Logique inchangée |
| `useDashboardData.test.ts` | Faible | Logique inchangée |
| `useActiveTables.test.ts` | Faible | Logique inchangée |
| `useMenuEditor.test.ts` | Moyen | CRUD à adapter |
| `useCart.test.ts` | Aucun | Pas de DB, inchangé |
| `useServerOrders.test.ts` | Moyen | Transactions à adapter |
| `useServerCart.test.ts` | Aucun | Pas de DB, inchangé |
| `useReservationForm.test.ts` | Faible | Wrapper inchangé |
| `useTodayReservationsList.test.ts` | Faible | Simple adaptation |
| `useSyncStatus.test.ts` | Moyen | Logique online/offline |
| `roleGuard.test.ts` | Élevé | Complètement à réécrire |

**Temps Estimé :** 12h

---

## 8. Rules & Security

### 8.1 firestore.rules Complet

**Fichier à créer :** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ────────────────────────────────────────────────────────────────────────
    // FONCTIONS HELPER
    // ────────────────────────────────────────────────────────────────────────
    
    // Vérifie si l'utilisateur est authentifié
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Récupère le rôle de l'utilisateur depuis Firestore
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Vérifie les rôles
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isKDS() {
      return isAuthenticated() && getUserRole() == 'kds';
    }
    
    function isServeur() {
      return isAuthenticated() && getUserRole() == 'serveur';
    }
    
    function isClient() {
      return isAuthenticated() && getUserRole() == 'client';
    }
    
    // Vérifie si l'utilisateur est actif
    function isActiveUser() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    // Valide les timestamps
    function isValidTimestamp() {
      return request.resource.data.keys().hasAll(['createdAt']) ||
             request.resource.data.keys().hasAll(['_lastModifiedAt']);
    }
    
    // ────────────────────────────────────────────────────────────────────────
    // COLLECTION: users
    // ────────────────────────────────────────────────────────────────────────
    
    match /users/{userId} {
      // Lecture: utilisateur peut lire son profil, admin peut tout lire
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      
      // Création: admin uniquement
      allow create: if isAdmin();
      
      // Mise à jour: utilisateur peut modifier son profil, admin peut tout modifier
      allow update: if isAuthenticated() && 
                    (request.auth.uid == userId || isAdmin()) &&
                    // L'utilisateur ne peut pas modifier son propre rôle
                    (request.auth.uid != userId || 
                     request.resource.data.diff(resource.data).affectedKeys().hasOnly([
                       'name', 'lastLoginAt', '_lastModifiedAt'
                     ]));
      
      // Suppression: admin uniquement
      allow delete: if isAdmin();
    }
    
    // ────────────────────────────────────────────────────────────────────────
    // COLLECTION: orders
    // ────────────────────────────────────────────────────────────────────────
    
    match /orders/{orderId} {
      // Lecture: admin, KDS, serveur (pour commandes non payées)
      allow read: if isAdmin() || isKDS() || 
                  (isServeur() && resource.data.status != 'paye');
      
      // Création: admin, serveur
      allow create: if isAdmin() || (isServeur() && isAuthenticated());
      
      // Mise à jour: 
      // - Admin: tous les champs
      // - KDS: status seulement (pour KDS)
      // - Serveur: champs limités
      allow update: if isAdmin() ||
                    (isKDS() && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
                      'status', 'updatedAt', 'servedAt'
                    ])) ||
                    (isServeur() && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
                      'items', 'total', 'notes', 'customerName', 'status', 'updatedAt'
                    ]));
      
      // Suppression: admin uniquement (soft delete via status)
      allow delete: if isAdmin();
    }
    
    // ────────────────────────────────────────────────────────────────────────
    // COLLECTION: tables
    // ────────────────────────────────────────────────────────────────────────
    
    match /tables/{tableId} {
      // Lecture: tous les utilisateurs authentifiés
      allow read: if isAuthenticated() && isActiveUser();
      
      // Création: admin uniquement
      allow create: if isAdmin();
      
      // Mise à jour:
      // - Admin: tous les champs
      // - Serveur: status et currentOrderId seulement
      allow update: if isAdmin() ||
                    (isServeur() && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
                      'status', 'currentOrderId', '_lastModifiedAt', '_lastModifiedBy'
                    ]));
      
      // Suppression: admin uniquement
      allow delete: if isAdmin();
    }
    
    // ────────────────────────────────────────────────────────────────────────
    // COLLECTION: menuItems
    // ────────────────────────────────────────────────────────────────────────
    
    match /menuItems/{itemId} {
      // Lecture: public (menu visible par tous)
      allow read: if true;
      
      // Création, Modification, Suppression: admin uniquement
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // ────────────────────────────────────────────────────────────────────────
    // COLLECTION: reservations
    // ────────────────────────────────────────────────────────────────────────
    
    match /reservations/{reservationId} {
      // Lecture: admin, serveur
      allow read: if isAdmin() || isServeur();
      
      // Création: admin, serveur
      allow create: if isAdmin() || (isServeur() && isAuthenticated());
      
      // Mise à jour: admin, serveur
      allow update: if isAdmin() || (isServeur() && isAuthenticated());
      
      // Suppression: admin uniquement
      allow delete: if isAdmin();
    }
    
    // ────────────────────────────────────────────────────────────────────────
    // COLLECTIONS PRIVÉES (logs, settings, etc.)
    // ────────────────────────────────────────────────────────────────────────
    
    match /settings/{settingId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    match /logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated(); // Tous les utilisateurs peuvent créer des logs
      allow update, delete: if false; // Logs immuables
    }
  }
}
```

---

### 8.2 firestore.indexes.json

**Fichier à créer :** `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tableId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "paidAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "id", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "tables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sector", "order": "ASCENDING" },
        { "fieldPath": "id", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "menuItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "menuItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isAvailable", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "menuItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "station", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "time", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "time", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "role", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 9. Roadmap Détaillée

### Phase 1 : Setup (4h)

#### Tâches

| # | Tâche | Durée | Statut |
|---|-------|-------|--------|
| 1.1 | Installer Firebase SDK (`npm install firebase`) | 15min | ⬜ |
| 1.2 | Créer projet Firebase Console | 30min | ⬜ |
| 1.3 | Configurer `.firebaserc` | 15min | ⬜ |
| 1.4 | Créer `firebase.json` | 30min | ⬜ |
| 1.5 | Créer `firestore.rules` | 1h | ⬜ |
| 1.6 | Créer `firestore.indexes.json` | 30min | ⬜ |
| 1.7 | Créer `src/firebase/config.ts` | 30min | ⬜ |
| 1.8 | Configurer variables d'environnement | 15min | ⬜ |
| 1.9 | Tester connexion émulateurs | 30min | ⬜ |

#### Commandes

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Installer SDK Firebase
npm install firebase

# Login Firebase
firebase login

# Initialiser projet
firebase init firestore
firebase init emulators
firebase init hosting

# Démarrer émulateurs
firebase emulators:start
```

#### Critères d'Acceptation

- [ ] Émulateurs Firestore et Auth fonctionnent
- [ ] UI des émulateurs accessible sur `http://localhost:4000`
- [ ] Connection depuis l'appli vérifiée

---

### Phase 2 : Migration DB (8h)

#### Tâches

| # | Tâche | Durée | Statut |
|---|-------|-------|--------|
| 2.1 | Créer types Firestore (`src/firebase/types.ts`) | 1h | ⬜ |
| 2.2 | Mapper schéma Dexie → Firestore | 1h | ⬜ |
| 2.3 | Créer index composites dans `firestore.indexes.json` | 30min | ⬜ |
| 2.4 | Déployer rules et indexes vers émulateurs | 30min | ⬜ |
| 2.5 | Script de migration des données seed | 2h | ⬜ |
| 2.6 | Tester avec émulateur | 2h | ⬜ |
| 2.7 | Valider toutes les requêtes | 2h | ⬜ |

#### Fichiers à Créer

- `src/firebase/types.ts` - Types TypeScript pour documents Firestore
- `scripts/seed-firestore.ts` - Script de seed pour Firestore

#### Critères d'Acceptation

- [ ] Toutes les collections créées
- [ ] Tous les index déployés
- [ ] Données seed identiques à Dexie
- [ ] Requêtes de base fonctionnelles

---

### Phase 3 : Migration Hooks (16h)

#### Ordre de Migration

1. **Hooks de base** (4h)
   - `useMenu.ts` (1.5h)
   - `useTables.ts` (1h)
   - `useFirestore.ts` (1.5h) - Hook utilitaire

2. **Hooks métiers** (8h)
   - `useOrders.ts` (2h)
   - `useReservations.ts` (1.5h)
   - `useKitchenMonitor.ts` (1.5h)
   - `useActiveTables.ts` (2h)
   - `useFloorPlan.ts` (1h)

3. **Hooks complexes** (4h)
   - `useDashboardData.ts` (2.5h)
   - `useMenuEditor.ts` (1.5h)

4. **Hooks wrappers** (2h)
   - `useServerOrders.ts` (2.5h)
   - `useReservationForm.ts` (1h)
   - `useTodayReservationsList.ts` (0.5h)
   - `useReservationsPlanning.ts` (1h)

#### Critères d'Acceptation par Hook

- [ ] Hook migré et fonctionnel
- [ ] Tests unitaires passants
- [ ] Tests E2E passants
- [ ] Performance équivalente ou meilleure

---

### Phase 4 : Migration Mutations (12h)

#### Tâches

| # | Tâche | Durée | Statut |
|---|-------|-------|--------|
| 4.1 | Migrer toutes les fonctions `create*` | 3h | ⬜ |
| 4.2 | Migrer toutes les fonctions `update*` | 3h | ⬜ |
| 4.3 | Migrer toutes les fonctions `delete*` | 2h | ⬜ |
| 4.4 | Implémenter transactions (batch writes) | 2h | ⬜ |
| 4.5 | Gérer les erreurs Firestore | 1h | ⬜ |
| 4.6 | Tester chaque mutation | 1h | ⬜ |

#### Points d'Attention

- Transactions limitées à 25 documents
- Batch writes limités à 500 opérations
- `serverTimestamp()` pour les timestamps
- Gérer `null` vs `undefined`

---

### Phase 5 : Auth (8h)

#### Tâches

| # | Tâche | Durée | Statut |
|---|-------|-------|--------|
| 5.1 | Configurer Firebase Auth | 30min | ⬜ |
| 5.2 | Créer `useAuth.ts` hook | 1h | ⬜ |
| 5.3 | Créer `useLogin.ts` hook | 30min | ⬜ |
| 5.4 | Créer `ProtectedRoute` component | 1h | ⬜ |
| 5.5 | Créer `LoginView` | 1h | ⬜ |
| 5.6 | Mettre à jour `router.tsx` | 1h | ⬜ |
| 5.7 | Script migration utilisateurs | 2h | ⬜ |
| 5.8 | Tester flux complet | 1h | ⬜ |

#### Critères d'Acceptation

- [ ] Login/Logout fonctionnels
- [ ] Routes protégées opérationnelles
- [ ] Rôles respectés
- [ ] Utilisateurs migrés

---

### Phase 6 : Tests (12h)

#### Tâches

| # | Tâche | Durée | Statut |
|---|-------|-------|--------|
| 6.1 | Mettre à jour `vitest.config.ts` | 30min | ⬜ |
| 6.2 | Créer `src/test/setup.ts` pour Firebase | 1h | ⬜ |
| 6.3 | Créer `src/test/firestore-utils.ts` | 1h | ⬜ |
| 6.4 | Créer `src/test/global-setup.ts` | 30min | ⬜ |
| 6.5 | Réécrire `database.test.ts` | 2h | ⬜ |
| 6.6 | Adapter tous les tests de hooks | 4h | ⬜ |
| 6.7 | Tests E2E avec émulateurs | 2h | ⬜ |
| 6.8 | Valider couverture de tests | 1h | ⬜ |

#### Commandes

```bash
# Lancer les tests avec émulateurs
firebase emulators:exec "npm test"
```

---

### Phase 7 : Deploy (4h)

#### Tâches

| # | Tâche | Durée | Statut |
|---|-------|-------|--------|
| 7.1 | Configurer Firebase Hosting | 30min | ⬜ |
| 7.2 | Créer script de build | 30min | ⬜ |
| 7.3 | Déployer vers environnement dev | 1h | ⬜ |
| 7.4 | Configurer CI/CD (GitHub Actions) | 1h | ⬜ |
| 7.5 | Déployer vers production | 30min | ⬜ |
| 7.6 | Tests post-deploy | 30min | ⬜ |

#### GitHub Actions Workflow

**Fichier à créer :** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: latelier-pos-prod
```

---

## 10. Checklist Validation

### 10.1 Checklist par Phase

#### Phase 1 : Setup

- [ ] Firebase CLI installé globalement
- [ ] Projet Firebase créé dans Console
- [ ] Fichier `firebase.json` configuré
- [ ] Émulateurs Firestore et Auth fonctionnels
- [ ] UI émulateurs accessible
- [ ] Variables d'environnement configurées
- [ ] Connection app → émulateurs vérifiée

#### Phase 2 : Migration DB

- [ ] Types Firestore définis
- [ ] Collections créées dans émulateurs
- [ ] Index composites déployés
- [ ] Rules déployées
- [ ] Script de seed fonctionnel
- [ ] Données seed vérifiées (count par collection)
- [ ] Requêtes de base testées

#### Phase 3 : Migration Hooks

- [ ] `useFirestore.ts` créé et testé
- [ ] `useMenu.ts` migré et testé
- [ ] `useTables.ts` migré et testé
- [ ] `useOrders.ts` migré et testé
- [ ] `useReservations.ts` migré et testé
- [ ] `useKitchenMonitor.ts` migré et testé
- [ ] `useActiveTables.ts` migré et testé
- [ ] `useDashboardData.ts` migré et testé
- [ ] `useMenuEditor.ts` migré et testé
- [ ] `useFloorPlan.ts` migré et testé
- [ ] `useServerOrders.ts` migré et testé
- [ ] `useReservationForm.ts` migré et testé
- [ ] `useTodayReservationsList.ts` migré et testé
- [ ] `useReservationsPlanning.ts` migré et testé

#### Phase 4 : Migration Mutations

- [ ] Toutes les fonctions `create*` migrées
- [ ] Toutes les fonctions `update*` migrées
- [ ] Toutes les fonctions `delete*` migrées
- [ ] Transactions implémentées
- [ ] Batch writes implémentés
- [ ] Gestion d'erreurs ajoutée
- [ ] Tests de mutations passants

#### Phase 5 : Auth

- [ ] Firebase Auth configuré
- [ ] Hook `useAuth.ts` créé
- [ ] Hook `useLogin.ts` créé
- [ ] Component `ProtectedRoute` créé
- [ ] Page de login créée
- [ ] Routes protégées configurées
- [ ] Utilisateurs migrés vers Firebase Auth
- [ ] Flux login/logout testé

#### Phase 6 : Tests

- [ ] Setup de test Firebase configuré
- [ ] Utilitaires de test créés
- [ ] Tests de database réécrits
- [ ] Tests de hooks adaptés
- [ ] Tests E2E fonctionnels
- [ ] Couverture de tests > 80%
- [ ] Tous les tests passants en CI

#### Phase 7 : Deploy

- [ ] Firebase Hosting configuré
- [ ] Script de build fonctionnel
- [ ] Déploiement dev réussi
- [ ] CI/CD configuré
- [ ] Déploiement production réussi
- [ ] Tests post-deploy passants

---

### 10.2 Checklist Fonctionnelle

#### Commandes (Orders)

- [ ] Créer une commande
- [ ] Mettre à jour le statut d'une commande
- [ ] Annuler une commande
- [ ] Voir les commandes actives
- [ ] Voir les commandes par table
- [ ] Voir les commandes par statut
- [ ] Ajouter des items à une commande
- [ ] Supprimer des items d'une commande
- [ ] Payer une commande

#### Tables

- [ ] Voir toutes les tables
- [ ] Voir une table spécifique
- [ ] Voir les tables par statut
- [ ] Créer une table
- [ ] Mettre à jour le statut d'une table
- [ ] Assigner une commande à une table

#### Menu

- [ ] Voir tous les items du menu
- [ ] Voir les items par catégorie
- [ ] Voir les items disponibles
- [ ] Rechercher un item par nom
- [ ] Créer un item
- [ ] Mettre à jour un item
- [ ] Supprimer un item
- [ ] Toggle disponibilité

#### Réservations

- [ ] Voir toutes les réservations
- [ ] Voir les réservations par date
- [ ] Voir les réservations du jour
- [ ] Voir les réservations par statut
- [ ] Créer une réservation
- [ ] Mettre à jour le statut d'une réservation
- [ ] Annuler une réservation

#### Authentification

- [ ] Se connecter
- [ ] Se déconnecter
- [ ] Accès protégé par rôle
- [ ] Redirection après login
- [ ] Profil utilisateur

---

## 11. Fichiers à Créer/Modifier

### 11.1 Fichiers à Créer

#### Configuration Firebase

| Chemin | Description | Priorité |
|--------|-------------|----------|
| `firebase.json` | Configuration émulateurs | 🔴 Haute |
| `.firebaserc` | Configuration projet | 🔴 Haute |
| `firestore.rules` | Règles de sécurité | 🔴 Haute |
| `firestore.indexes.json` | Index composites | 🔴 Haute |
| `.env` | Variables d'environnement | 🔴 Haute |
| `.env.example` | Template variables | 🟡 Moyenne |

#### Source Firebase

| Chemin | Description | Priorité |
|--------|-------------|----------|
| `src/firebase/config.ts` | Configuration Firebase | 🔴 Haute |
| `src/firebase/types.ts` | Types TypeScript Firestore | 🔴 Haute |

#### Hooks Auth

| Chemin | Description | Priorité |
|--------|-------------|----------|
| `src/hooks/useAuth.ts` | Hook authentification | 🔴 Haute |
| `src/hooks/useLogin.ts` | Hook login | 🔴 Haute |
| `src/hooks/useFirestore.ts` | Hook collection/document | 🔴 Haute |

#### Components Auth

| Chemin | Description | Priorité |
|--------|-------------|----------|
| `src/components/ProtectedRoute.tsx` | Route protégée | 🔴 Haute |
| `src/views/LoginView.tsx` | Page de login | 🔴 Haute |

#### Tests

| Chemin | Description | Priorité |
|--------|-------------|----------|
| `src/test/firestore-utils.ts` | Utilitaires de test | 🔴 Haute |
| `src/test/global-setup.ts` | Setup global tests | 🟡 Moyenne |

#### Scripts

| Chemin | Description | Priorité |
|--------|-------------|----------|
| `scripts/migrate-users.ts` | Migration utilisateurs | 🟡 Moyenne |
| `scripts/seed-firestore.ts` | Seed Firestore | 🟡 Moyenne |

#### CI/CD

| Chemin | Description | Priorité |
|--------|-------------|----------|
| `.github/workflows/deploy.yml` | Workflow déploiement | 🟢 Basse |

---

### 11.2 Fichiers à Modifier

#### Configuration

| Chemin | Modifications | Priorité |
|--------|---------------|----------|
| `package.json` | Ajouter dépendance `firebase` | 🔴 Haute |
| `vitest.config.ts` | Configurer setup Firebase | 🔴 Haute |
| `.gitignore` | Ajouter `.firebase`, `.env` | 🟡 Moyenne |

#### Source

| Chemin | Modifications | Priorité |
|--------|---------------|----------|
| `src/hooks/useOrders.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useMenu.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useTables.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useReservations.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useDashboardData.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useKitchenMonitor.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useActiveTables.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useMenuEditor.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useFloorPlan.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useServerOrders.ts` | Migration complète | 🔴 Haute |
| `src/hooks/useReservationForm.ts` | Migration complète | 🟡 Moyenne |
| `src/hooks/useTodayReservationsList.ts` | Migration complète | 🟡 Moyenne |
| `src/hooks/useReservationsPlanning.ts` | Migration complète | 🟡 Moyenne |
| `src/hooks/useRole.ts` | Remplacer par `useAuth` | 🔴 Haute |
| `src/hooks/useRoleGuard.ts` | Remplacer par `ProtectedRoute` | 🔴 Haute |
| `src/utils/roleGuard.ts` | Déprécier (garder pour compatibilité) | 🟡 Moyenne |
| `src/router.tsx` | Ajouter routes protégées | 🔴 Haute |
| `src/App.tsx` | Provider Auth | 🔴 Haute |
| `src/main.tsx` | Initialiser Firebase | 🔴 Haute |

#### Tests

| Chemin | Modifications | Priorité |
|--------|---------------|----------|
| `src/test/setup.ts` | Remplacer fake-indexeddb par Firebase | 🔴 Haute |
| `src/db/database.test.ts` | Réécrire pour Firestore | 🔴 Haute |
| `src/hooks/*.test.ts` | Adapter tous les tests | 🔴 Haute |
| `src/utils/roleGuard.test.ts` | Réécrire pour Firebase Auth | 🟡 Moyenne |

---

### 11.3 Fichiers à Supprimer

| Chemin | Raison | Priorité |
|--------|--------|----------|
| `src/db/database.ts` | Remplacé par Firebase | 🟢 Basse (après migration) |
| `src/db/types.ts` | Types déplacés vers `src/firebase/types.ts` | 🟢 Basse |
| `fake-indexeddb` (dependency) | Plus nécessaire | 🟢 Basse |

---

## 12. Annexes

### 12.1 Glossaire

| Terme | Définition |
|-------|------------|
| **Collection** | Équivalent Firestore d'une table Dexie |
| **Document** | Équivalent Firestore d'un enregistrement |
| **Emulator Suite** | Suite d'émulateurs locaux Firebase |
| **Rules** | Règles de sécurité Firestore |
| **Batch Write** | Écriture groupée (max 500 ops) |
| **Transaction** | Écriture atomique (max 25 docs) |
| **Snapshot** | Instantané de données Firestore |
| **onSnapshot** | Listener temps réel Firestore |

---

### 12.2 Ressources Utiles

#### Documentation Officielle

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

#### Outils

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Rules Playground](https://console.firebase.google.com/project/_/firestore/rules)
- [Emulator UI](http://localhost:4000)

#### Bibliothèques

- [firebase](https://www.npmjs.com/package/firebase) - SDK officiel
- [react-firebase-hooks](https://www.npmjs.com/package/react-firebase-hooks) - Hooks React (optionnel)

---

### 12.3 Dépannage

#### Problèmes Courants

**1. Erreur: "Missing index"**
```
Error: The query requires an index.
```
**Solution :** Déployer les indexes
```bash
firebase deploy --only firestore:indexes
```

---

**2. Erreur: "Permission denied"**
```
FirebaseError: Missing or insufficient permissions.
```
**Solution :** Vérifier les rules dans le Rules Playground

---

**3. Émulateurs ne démarrent pas**
```
Error: Port 8080 is already in use.
```
**Solution :** Changer les ports dans `firebase.json` ou tuer le processus
```bash
lsof -ti:8080 | xargs kill
```

---

**4. Timestamps incorrects**
```typescript
// Problème: comparaison avec number
if (order.createdAt >= startOfDay) { ... }

// Solution: convertir Timestamp → number
if (order.createdAt.toMillis() >= startOfDay) { ... }
```

---

**5. Tests échouent avec émulateurs**
```
Error: Could not connect to emulator.
```
**Solution :** Démarrer les émulateurs avant les tests
```bash
firebase emulators:exec "npm test"
```

---

## Conclusion

Cet audit fournit une roadmap complète pour migrer L'Atelier POS de Dexie.js vers Firebase Emulator Suite. La migration est estimée à **64 heures** (~8 jours de travail) réparties sur 7 phases.

### Points Clés

1. **Architecture** : Passage d'un modèle relationnel simplifié (IndexedDB) à un modèle document (Firestore)
2. **Temps réel** : Bénéfice natif de la synchronisation temps réel avec `onSnapshot`
3. **Sécurité** : Rules Firestore pour une sécurité granulaire par rôle
4. **Authentification** : Firebase Auth remplace le système localStorage
5. **Tests** : fake-indexeddb → Firebase Emulator Suite

### Prochaines Étapes

1. Valider cet audit avec l'équipe
2. Créer un branch Git dédié (`feature/firebase-migration`)
3. Commencer par la Phase 1 (Setup)
4. Suivre la roadmap phase par phase
5. Tester chaque hook avant de passer au suivant

### Risques Identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Perte de données | Élevé | Backup avant migration, tests approfondis |
| Performance dégradée | Moyen | Profiler les requêtes, ajouter des indexes |
| Rules trop permissives | Élevé | Tests de sécurité, Rules Playground |
| Downtime production | Moyen | Déploiement progressif, feature flags |

---

**Document généré automatiquement**  
**Date :** 23 Mars 2026  
**Version :** 1.0  
**Statut :** Prêt pour implémentation

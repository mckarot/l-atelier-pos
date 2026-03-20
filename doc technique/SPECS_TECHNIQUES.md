# L'Atelier POS — Spécifications Techniques
> Version 1.0 — Référence pour développement IA autonome (Claude Code / Cursor)

---

## Table des matières

1. [Stack technologique](#1-stack-technologique)
2. [Architecture générale](#2-architecture-générale)
3. [Structure du projet](#3-structure-du-projet)
4. [Base de données — Dexie.js](#4-base-de-données--dexiejs)
5. [Modèle de données complet](#5-modèle-de-données-complet)
6. [Gestion des statuts](#6-gestion-des-statuts)
7. [Synchronisation temps réel](#7-synchronisation-temps-réel)
8. [Routing & authentification par rôle](#8-routing--authentification-par-rôle)
9. [Architecture des composants](#9-architecture-des-composants)
10. [Contraintes techniques strictes](#10-contraintes-techniques-strictes)

---

## 1. Stack technologique

### Décision de stack

Le prototype a été construit en HTML/CSS/JS vanilla avec Tailwind CDN et React via CDN (Babel standalone). Pour le projet réel, on adopte une stack de production équivalente mais proprement bundlée.

### Stack retenue

| Couche | Technologie | Version | Justification |
|---|---|---|---|
| Framework UI | **React** | 18.x | Utilisé dans le prototype (KDS avec `useLiveQuery`) |
| Build tool | **Vite** | 5.x | Rapide, HMR natif, support React out-of-the-box |
| Styling | **Tailwind CSS** | 3.x | Utilisé dans tout le prototype, tokens déjà définis |
| Persistance locale | **Dexie.js** | 3.x | Utilisé dans tous les modules, schéma validé |
| Hooks Dexie | **dexie-react-hooks** | 1.x | `useLiveQuery` pour la réactivité temps réel |
| Routing | **React Router** | 6.x | Navigation par rôle entre les 4 interfaces |
| Icônes | **Material Symbols Outlined** | latest | Utilisé dans tout le prototype via Google Fonts CDN |
| Typographie | **Google Fonts** | — | Space Grotesk + Inter + JetBrains Mono |
| Langage | **TypeScript** | 5.x | Typage strict pour fiabilité en développement IA |

### Dépendances npm

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "dexie": "^3.0.0",
    "dexie-react-hooks": "^1.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

### Ce qui n'est PAS dans la stack

- ❌ Pas de Redux / Zustand / Jotai — Dexie.js est la seule source de vérité
- ❌ Pas de backend serveur en v1.0 — architecture 100% client-side offline-first
- ❌ Pas de GraphQL / REST API maison — tout passe par Dexie.js localement
- ❌ Pas de Next.js / Nuxt — app SPA pure, pas de SSR nécessaire
- ❌ Pas de bibliothèque de composants externe (MUI, Shadcn) — design system custom

---

## 2. Architecture générale

### Principe fondamental : Offline-First

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATEUR (Client)                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Admin   │  │   KDS    │  │ Serveur  │  │ Client │ │
│  │  View    │  │  View    │  │  View    │  │  View  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │              │             │      │
│       └──────────────┴──────────────┴─────────────┘     │
│                          │                               │
│                ┌─────────▼──────────┐                   │
│                │     Dexie.js       │                   │
│                │  (IndexedDB)       │                   │
│                │  Source de vérité  │                   │
│                └─────────┬──────────┘                   │
│                          │  useLiveQuery                 │
│                          │  (réactivité automatique)     │
└──────────────────────────┼──────────────────────────────┘
                           │
                  (futur) API REST
                  pour multi-device
```

### Flux de données

1. **Une action utilisateur** (ex : cuisinier clique "TERMINER") appelle une fonction Dexie (`db.orders.update(id, { status: 'pret' })`).
2. **Dexie met à jour IndexedDB** de façon synchrone.
3. **`useLiveQuery` détecte le changement** et re-render automatiquement tous les composants abonnés à cette donnée — y compris dans d'autres onglets ouverts sur la même machine.
4. **Pas d'event bus, pas de WebSocket en v1.0** — la réactivité est assurée par Dexie nativement.

### Multi-onglets

Dexie.js avec `useLiveQuery` est réactif **entre onglets du même navigateur** via les événements `storage` natifs de l'IndexedDB. Sur un réseau multi-postes (cuisine + caisse + salle), une synchronisation serveur sera nécessaire en v1.1.

---

## 3. Structure du projet

```
l-atelier-pos/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                  # Point d'entrée React
│   ├── App.tsx                   # Router principal + garde d'authentification
│   │
│   ├── db/
│   │   ├── database.ts           # Instance Dexie + schéma + seed
│   │   └── types.ts              # Types TypeScript de toutes les entités
│   │
│   ├── views/
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx   # Layout avec sidebar admin
│   │   │   ├── Dashboard.tsx     # Vue principale dashboard
│   │   │   ├── LiveOrders.tsx    # Commandes en cours
│   │   │   ├── KitchenMonitor.tsx# Moniteur cuisine embarqué
│   │   │   ├── MenuEditor.tsx    # CRUD menu
│   │   │   ├── StaffManagement.tsx
│   │   │   └── Reports.tsx
│   │   │
│   │   ├── kds/
│   │   │   ├── KDSLayout.tsx     # Layout plein écran KDS
│   │   │   ├── KDSBoard.tsx      # Colonnes À préparer / En cours / Prêt
│   │   │   ├── OrderCard.tsx     # Carte commande individuelle
│   │   │   └── KDSHeader.tsx     # Header avec compteurs live
│   │   │
│   │   ├── serveur/
│   │   │   ├── ServeurLayout.tsx
│   │   │   ├── PlanDeSalle.tsx   # Plan interactif des tables
│   │   │   ├── TableDetail.tsx   # Détail d'une table sélectionnée
│   │   │   └── Reservations.tsx  # Planning réservations
│   │   │
│   │   └── client/
│   │       ├── ClientLayout.tsx
│   │       ├── MenuCarte.tsx     # Carte du menu avec images
│   │       ├── Panier.tsx        # Panier et validation commande
│   │       ├── CommandeStatut.tsx# Suivi temps réel commande client
│   │       └── Reservation.tsx   # Formulaire réservation
│   │
│   ├── components/               # Composants réutilisables entre vues
│   │   ├── ui/
│   │   │   ├── StatusBadge.tsx   # Badge de statut (OCCUPÉE, URGENT, PRÊT…)
│   │   │   ├── Timer.tsx         # Timer JetBrains Mono avec alerte
│   │   │   ├── SyncIndicator.tsx # Indicateur connexion Dexie
│   │   │   ├── Toast.tsx         # Notification toast
│   │   │   └── Button.tsx        # Bouton avec variants (primary, ghost)
│   │   │
│   │   └── layout/
│   │       ├── Sidebar.tsx       # Sidebar navigation (variante par rôle)
│   │       └── TopBar.tsx        # Barre du haut (recherche, profil)
│   │
│   ├── hooks/
│   │   ├── useOrders.ts          # Hooks Dexie pour les commandes
│   │   ├── useTables.ts          # Hooks Dexie pour les tables
│   │   ├── useMenu.ts            # Hooks Dexie pour le menu
│   │   └── useReservations.ts    # Hooks Dexie pour les réservations
│   │
│   ├── utils/
│   │   ├── timer.ts              # Calcul et formatage des timers
│   │   ├── status.ts             # Helpers de statuts (couleurs, labels)
│   │   └── format.ts             # Formatage prix, dates
│   │
│   ├── i18n/
│   │   └── fr.json               # Tous les libellés en français
│   │
│   └── styles/
│       └── index.css             # Import Tailwind + custom CSS minimal
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts            # Config tokens couleur extraite du prototype
├── tsconfig.json
└── docs/                         # ← Dossier des documents de projet
    ├── PRD.md
    ├── SPECS_TECHNIQUES.md       # Ce fichier
    ├── DESIGN_SYSTEM.md
    └── USER_STORIES.md
```

---

## 4. Base de données — Dexie.js

### Instance unique

```typescript
// src/db/database.ts
import Dexie, { Table } from 'dexie';
import { Order, TableRecord, MenuItem, Reservation } from './types';

export class AtelierDatabase extends Dexie {
  orders!: Table<Order>;
  tables!: Table<TableRecord>;
  menuItems!: Table<MenuItem>;
  reservations!: Table<Reservation>;

  constructor() {
    super('AtelierPOSDatabase');
    this.version(1).stores({
      orders:       '++id, tableId, status, createdAt',
      tables:       'id, status',
      menuItems:    '++id, name, category, isAvailable',
      reservations: '++id, date, time, status',
    });
  }
}

export const db = new AtelierDatabase();
```

> **Règle absolue :** Il n'existe qu'une seule instance `db` dans toute l'application, exportée depuis `src/db/database.ts`. Ne jamais instancier `new Dexie()` ailleurs.

### Seed de développement

La base doit se remplir automatiquement au premier lancement avec des données réalistes (voir section 5 pour les structures). La seed ne s'exécute que si les tables sont vides.

---

## 5. Modèle de données complet

### 5.1 `Order` — Commande

```typescript
interface OrderItem {
  name: string;           // Nom du plat
  quantity: number;       // Quantité commandée
  customization?: string; // Ex: "SANS OIGNONS", "BLEU", "FRITES BIEN CUITES"
  done?: boolean;         // Item marqué comme terminé individuellement (KDS)
  station?: 'GRILL' | 'FROID' | 'PATISSERIE'; // Station de préparation
}

interface Order {
  id?: number;            // Auto-incrémenté par Dexie
  tableId: number;        // Référence à Table.id (ou 0 pour emporter)
  status: OrderStatus;    // Voir section 6
  items: OrderItem[];     // Liste des plats commandés
  total?: number;         // Total en euros (calculé côté client)
  notes?: string;         // Ex: "EMPORTER", note globale de commande
  createdAt: Date;        // Horodatage de création
  updatedAt?: Date;       // Horodatage de dernière mise à jour de statut
  servedAt?: Date;        // Horodatage de service (passage à 'servi')
}
```

### 5.2 `TableRecord` — Table

```typescript
interface TableRecord {
  id: number;             // Numéro de table (1-N, défini à la création)
  status: TableStatus;    // Voir section 6
  capacity?: number;      // Nombre de couverts max
  sector?: string;        // Ex: "Salle principale", "Terrasse"
  currentOrderId?: number;// Référence à l'Order actif sur cette table
}
```

### 5.3 `MenuItem` — Article du menu

```typescript
interface MenuItem {
  id?: number;
  name: string;
  description: string;
  price: number;          // En euros, ex: 19.50
  category: MenuCategory; // 'Entrées' | 'Plats' | 'Desserts' | 'Boissons'
  image?: string;         // URL de l'image du plat
  allergens?: string[];   // Liste des allergènes
  isAvailable: boolean;   // Affiché/masqué dans la carte client
  station?: 'GRILL' | 'FROID' | 'PATISSERIE'; // Station par défaut pour le KDS
}

type MenuCategory = 'Entrées' | 'Plats' | 'Desserts' | 'Boissons';
```

### 5.4 `Reservation` — Réservation

```typescript
interface Reservation {
  id?: number;
  customerName: string;
  email?: string;
  phone?: string;
  date: string;           // Format ISO: "2024-03-15"
  time: string;           // Format: "19:30"
  guests: number;         // Nombre de couverts
  status: ReservationStatus;
  tableId?: number;       // Table assignée (optionnel à la création)
  notes?: string;         // Demandes spéciales
}

type ReservationStatus = 'confirme' | 'en_attente' | 'annule' | 'arrive';
```

---

## 6. Gestion des statuts

### 6.1 Statuts de commande (`OrderStatus`)

```typescript
type OrderStatus = 'en_attente' | 'en_preparation' | 'pret' | 'servi' | 'paye' | 'annule';
```

| Statut | Label KDS | Colonne KDS | Couleur | Déclencheur |
|---|---|---|---|---|
| `en_attente` | À PRÉPARER | Colonne 1 | Blanc | Création de la commande |
| `en_preparation` | EN COURS | Colonne 2 | Orange (`#FFC174`) | Clic "LANCER" |
| `pret` | PRÊT | Colonne 3 | Vert (`#51e77b`) | Clic "TERMINER" |
| `servi` | SERVI | Archivé | Gris | Serveur confirme le service |
| `paye` | PAYÉ | Archivé | Gris | Paiement validé |
| `annule` | ANNULÉ | Archivé | Rouge | Admin / Serveur annule |

### 6.2 Statuts de table (`TableStatus`)

```typescript
type TableStatus = 'libre' | 'occupee' | 'pret' | 'reserve';
```

| Statut | Label | Couleur badge | Déclencheur |
|---|---|---|---|
| `libre` | LIBRE | Vert (`#51e77b`) | Table libérée / au démarrage |
| `occupee` | OCCUPÉE | Orange (`#FFC174`) | Commande active sur la table |
| `pret` | PRÊT | Bleu (`#60a5fa`) | Au moins un plat marqué `pret` |
| `reserve` | RÉSERVÉE | Violet | Réservation confirmée pour ce soir |

### 6.3 Seuils d'alerte timer (KDS)

```typescript
// src/utils/timer.ts
export const ALERT_THRESHOLDS = {
  warning: 10 * 60 * 1000,  // 10 minutes → timer passe en orange
  danger:  20 * 60 * 1000,  // 20 minutes → badge RETARD + bande rouge
} as const;
```

---

## 7. Synchronisation temps réel

### Pattern `useLiveQuery`

Tous les composants qui affichent des données Dexie utilisent **obligatoirement** `useLiveQuery`. Ne jamais charger une donnée Dexie dans un `useEffect` + `useState`.

```typescript
// ✅ CORRECT — réactivité automatique
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

function KDSBoard() {
  const activeOrders = useLiveQuery(
    () => db.orders
      .where('status')
      .anyOf(['en_attente', 'en_preparation', 'pret'])
      .sortBy('createdAt'),
    []
  );
  // activeOrders se met à jour automatiquement quand Dexie change
}

// ❌ INCORRECT — ne pas faire
function KDSBoard() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    db.orders.toArray().then(setOrders); // pas réactif
  }, []);
}
```

### Hooks personnalisés

Créer un hook par entité dans `src/hooks/` pour encapsuler les queries Dexie :

```typescript
// src/hooks/useOrders.ts
export function useActiveOrders() {
  return useLiveQuery(
    () => db.orders
      .where('status')
      .anyOf(['en_attente', 'en_preparation', 'pret'])
      .sortBy('createdAt'),
    []
  );
}

export function useOrdersByTable(tableId: number) {
  return useLiveQuery(
    () => db.orders.where({ tableId }).toArray(),
    [tableId]
  );
}
```

### Mutations Dexie

Toutes les mutations (création, mise à jour) sont des fonctions async simples :

```typescript
// src/hooks/useOrders.ts
export async function updateOrderStatus(id: number, status: OrderStatus) {
  await db.orders.update(id, {
    status,
    updatedAt: new Date(),
  });
  // useLiveQuery se met à jour automatiquement — pas d'autre action nécessaire
}

export async function createOrder(tableId: number, items: OrderItem[]) {
  await db.orders.add({
    tableId,
    status: 'en_attente',
    items,
    createdAt: new Date(),
  });
}
```

---

## 8. Routing & authentification par rôle

### Routes

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Routes publiques
// /login           → Page de sélection de rôle (dev) / login (prod)

// Routes par rôle
// /admin/*         → Vue Admin (Dashboard, Orders, KDS, Menu, Staff, Reports)
// /kds             → Vue KDS plein écran
// /serveur/*       → Vue Serveur (Plan de salle, Réservations)
// /client          → Vue Client (Menu, Panier, Statut)
```

### Garde de route

```typescript
// Rôles disponibles
type UserRole = 'admin' | 'kds' | 'serveur' | 'client';

// Chaque route vérifie le rôle dans localStorage (v1.0 simplifié)
// En v1.1 : JWT côté serveur
function ProtectedRoute({ role, children }: { role: UserRole, children: ReactNode }) {
  const currentRole = localStorage.getItem('atelier_role') as UserRole;
  if (currentRole !== role) return <Navigate to="/login" />;
  return <>{children}</>;
}
```

### Sélection de rôle (v1.0)

En v1.0, la page `/login` est un sélecteur de rôle simple (4 boutons). L'authentification complète par email/mot de passe est planifiée en v1.1.

---

## 9. Architecture des composants

### Règles de composition

1. **Un composant = un fichier** — pas de composants définis inline dans un autre composant.
2. **Les vues** (`src/views/`) n'ont pas de logique Dexie directe — elles délèguent aux hooks.
3. **Les composants UI** (`src/components/ui/`) sont purement présentationnels — ils reçoivent des props, n'accèdent jamais à Dexie.
4. **Les hooks** (`src/hooks/`) encapsulent toute la logique Dexie — queries et mutations.

### Composant `OrderCard` (référence)

```typescript
// src/views/kds/OrderCard.tsx
interface OrderCardProps {
  order: Order;
  onLancer: (id: number) => void;
  onTerminer: (id: number) => void;
}

export function OrderCard({ order, onLancer, onTerminer }: OrderCardProps) {
  // Ce composant ne touche pas à Dexie directement
  // Les callbacks sont fournis par KDSBoard
}
```

### Composant `Timer` (référence)

```typescript
// src/components/ui/Timer.tsx
interface TimerProps {
  startDate: Date;
  warningMs?: number;  // défaut: ALERT_THRESHOLDS.warning
  dangerMs?: number;   // défaut: ALERT_THRESHOLDS.danger
}

// Affiche MM:SS en JetBrains Mono
// Change de couleur automatiquement selon les seuils
// Se met à jour chaque seconde via setInterval interne
```

---

## 10. Contraintes techniques strictes

Ces règles sont non-négociables pour l'IA de développement.

### Code

- **TypeScript strict** — `"strict": true` dans `tsconfig.json`. Pas de `any` implicite.
- **Un seul fichier de config Tailwind** — `tailwind.config.ts` à la racine, contenant tous les tokens du prototype.
- **Pas de CSS-in-JS** — uniquement des classes Tailwind ou du CSS global minimal dans `src/styles/index.css`.
- **Pas de `useEffect` pour charger des données Dexie** — utiliser exclusivement `useLiveQuery`.

### Design

- **Les tokens couleur du prototype sont la référence** — les valeurs hexadécimales de `tailwind.config.ts` ne doivent pas être modifiées.
- **Aucune bibliothèque de composants externe** — tout composant UI est codé depuis zéro en suivant le `DESIGN_SYSTEM.md`.
- **Le KDS est en dark mode uniquement** — ne pas implémenter de toggle light/dark sur la vue KDS.
- **La vue Client supporte les deux modes** — dark/light commutable via un toggle en sidebar.

### Performance

- **Code splitting par route** — utiliser `React.lazy()` + `Suspense` pour chaque vue principale.
- **Images du menu** — toujours servies avec un `loading="lazy"` et des dimensions explicites pour éviter le layout shift.
- **Pas de polling** — ne jamais utiliser `setInterval` pour rafraîchir des données Dexie. `useLiveQuery` suffit.

### Tailwind config (extrait du prototype)

```typescript
// tailwind.config.ts — tokens extraits du prototype, à copier tel quel
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary':                    '#ffc174',  // Safran — accent principal
        'primary-container':          '#f59e0b',  // Hover bouton primaire
        'on-primary':                 '#472a00',
        'on-primary-container':       '#613b00',
        'secondary':                  '#ffb690',
        'secondary-container':        '#ec6a06',
        'tertiary':                   '#51e77b',  // Vert — statut PRÊT
        'background':                 '#131313',  // Fond principal dark
        'surface':                    '#131313',
        'surface-dim':                '#131313',
        'surface-container-lowest':   '#0e0e0e',
        'surface-container-low':      '#1c1b1b',  // Sidebar
        'surface-container':          '#201f1f',
        'surface-container-high':     '#2a2a2a',
        'surface-container-highest':  '#353534',  // Éléments interactifs
        'surface-variant':            '#353534',
        'surface-bright':             '#3a3939',
        'on-surface':                 '#e5e2e1',
        'on-surface-variant':         '#d8c3ad',
        'on-background':              '#e5e2e1',
        'outline':                    '#a08e7a',
        'outline-variant':            '#534434',
        'error':                      '#ffb4ab',  // Rouge alerte retard
        'error-container':            '#93000a',
        'on-error':                   '#690005',
        'on-error-container':         '#ffdad6',
      },
      fontFamily: {
        'headline': ['Space Grotesk', 'sans-serif'],
        'body':     ['Inter', 'sans-serif'],
        'label':    ['Inter', 'sans-serif'],
        'mono':     ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '0.125rem',  // 2px — Industrial, pas de coins ronds
        'lg':      '0.25rem',   // 4px
        'xl':      '0.5rem',    // 8px — maximum autorisé
        'full':    '0.75rem',   // 12px — réservé aux badges de notification
      },
    },
  },
};
```

---

*L'Atelier POS — SPECS_TECHNIQUES v1.0 — Document destiné au développement IA autonome*

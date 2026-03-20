# 🍽️ L'Atelier POS

**Point of Sale System** — Application de restauration complète pour la gestion de restaurant.

---

## 🎯 Vue d'ensemble

L'Atelier POS est un système de caisse enregistreuse moderne conçu pour les restaurants. Il offre 4 interfaces distinctes pour couvrir tous les aspects du service :

| Rôle | Description |
|------|-------------|
| **👨‍ Admin** | Tableau de bord complet avec métriques, gestion des tables, menu et rapports |
| **👨‍🍳 KDS** | Kitchen Display System pour la cuisine avec 3 colonnes (À préparer, En cours, Prêt) |
| **🤵 Serveur** | Plan de salle interactif et gestion des réservations |
| **👤 Client** | Interface tactile pour commander directement depuis la table |

---

## ✨ Fonctionnalités

### Module KDS (Kitchen Display System)
- ✅ 3 colonnes Kanban (À PRÉPARER, EN COURS, PRÊT)
- ✅ Timer avec alertes couleur (vert/orange/rouge)
- ✅ Actions LANCER / TERMINER
- ✅ Compteur live des commandes
- ✅ Moyenne de temps de préparation

### Module Admin
- ✅ Dashboard avec 4 KPI cards (Revenu, Commandes, Temps prep., Satisfaction)
- ✅ Graphique de performance hebdomadaire
- ✅ Flux live timeline
- ✅ Statut des tables (Services Actifs)
- ✅ Moniteur cuisine en direct
- ✅ Éditeur de menu CRUD

### Module Serveur
- ✅ Plan de salle interactif
- ✅ Détail des commandes par table
- ✅ Planning des réservations
- ✅ Stats d'occupation

### Module Client
- ✅ Carte du menu avec filtres
- ✅ Personnalisation des plats (cuisson, suppléments)
- ✅ Panier avec validation de commande
- ✅ Toast de confirmation
- ✅ Module de réservation

### Transversal
- ✅ Indicateur de synchronisation (Dexie.js)
- ✅ Gestion du mode hors-ligne
- ✅ Navigation entre vues (changement de rôle)

---

## 🛠️ Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.x | UI Library |
| **TypeScript** | 5.x | Typage strict |
| **Vite** | 5.x | Build tool |
| **Tailwind CSS** | 3.x | Styling |
| **Dexie.js** | 4.x | Base de données locale (IndexedDB) |
| **React Router** | 6.x | Routing |
| **Playwright** | Latest | Tests E2E |
| **Vitest** | Latest | Tests unitaires |

---

## 📦 Installation

### Prérequis
- Node.js >= 18.x
- npm >= 9.x

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/YOUR_USERNAME/l-atelier-pos.git
cd l-atelier-pos

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

## 🚀 Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run test` | Lancer les tests unitaires |
| `npm run test:coverage` | Tests avec coverage |
| `npm run test:e2e` | Tests E2E avec Playwright |
| `npm run lint` | Linter le code |

---

## 📊 Structure du Projet

```
src/
├── components/
│   ├── admin/          # Composants Admin (KPICard, MenuEditor, etc.)
│   ├── client/         # Composants Client (MenuCard, Cart, etc.)
│   ├── layout/         # Layouts (Sidebars, TopBars, etc.)
│   ├── serveur/        # Composants Serveur (FloorPlan, etc.)
│   └── ui/             # Composants UI réutilisables
├── context/            # Contextes React (ToastContext, etc.)
├── db/                 # Base de données Dexie
├── hooks/              # Hooks personnalisés
├── utils/              # Utilitaires (timer, roleGuard, etc.)
├── views/              # Vues principales
│   ├── Admin/
│   ├── Client/
│   ├── KDS/
│   └── Serveur/
├── App.tsx             # Composant racine
├── router.tsx          # Configuration des routes
└── main.tsx            # Point d'entrée
```

---

##  Design System

### Typographie
- **Titres** : Space Grotesk
- **Body** : Inter
- **Timers/Prix** : JetBrains Mono

### Couleurs (Tailwind)
- `primary`, `secondary`, `tertiary` — Couleurs principales
- `surface-container-low`, `surface-container`, `surface-container-high` — Surfaces
- `error`, `error-container` — Erreurs
- `on-surface`, `on-surface-variant` — Texte

### Icônes
- Material Symbols Outlined (Google Fonts)

---

## 🧪 Tests

### Coverage Actuel
- **Lines** : ~87%
- **Functions** : ~90%
- **Branches** : ~83%
- **Statements** : ~87%

### Tests Unitaires
```bash
npm run test
```

### Tests E2E
```bash
npm run test:e2e
```

---

## 📱 Routes

| Route | Rôle | Description |
|-------|------|-------------|
| `/login` | Tous | Sélection de rôle |
| `/admin` | Admin | Dashboard + sous-routes |
| `/admin/orders` | Admin | Live Orders |
| `/admin/kitchen` | Admin | Kitchen Display |
| `/admin/menu` | Admin | Menu Editor |
| `/kds` | KDS | Kitchen Display System |
| `/serveur` | Serveur | Plan de salle |
| `/serveur/reservations` | Serveur | Réservations |
| `/client` | Client | Menu client |

---

## 🔐 Authentification

En v1.0, l'authentification est simplifiée :
- Sélection de rôle via `localStorage`
- 4 rôles disponibles : `admin`, `kds`, `serveur`, `client`
- Bouton "Changer de rôle" dans chaque sidebar

> ⚠️ **Note** : Cette version n'est pas destinée à la production sans authentification renforcée.

---

## 💾 Base de Données

**Dexie.js** (IndexedDB) — Stockage local, fonctionne hors-ligne.

### Tables
- `orders` — Commandes
- `tables` — Tables
- `menuItems` — Articles du menu
- `reservations` — Réservations

### Seed
Au premier lancement, la base est peuplée avec :
- 8+ commandes
- 16 tables
- 6+ articles de menu
- 2 réservations

---

## 📈 Progress Projet

### Version 1.0 — ✅ TERMINÉE

| Module | US | Statut |
|--------|----|--------|
| Setup | 3/3 | ✅ |
| KDS | 6/6 | ✅ |
| Admin | 7/7 | ✅ |
| Serveur | 3/3 | ✅ |
| Client | 5/5 | ✅ |
| Transversal | 2/2 | ✅ |
| Auth | 2/2 | ✅ |
| **TOTAL** | **28/28** | ✅ **100%** |

---

## 🚧 Roadmap v2.0

- [ ] Authentification JWT
- [ ] Paiement en ligne (Stripe)
- [ ] Impression (additions, bons cuisine)
- [ ] Multi-site / multi-restaurant
- [ ] Gestion des stocks avancée
- [ ] Rapports détaillés
- [ ] Notifications push
- [ ] Application mobile native

---

## 📄 License

MIT License — Voir [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 Développement

### Contributeurs
- Développé avec ❤️ par une équipe IA autonome

### Stack complète
React 18 • TypeScript 5 • Vite 5 • Tailwind CSS 3 • Dexie.js 4 • React Router 6 • Playwright • Vitest

---

## 🎯 Démo

Après installation :
1. `npm run dev`
2. Ouvrir `http://localhost:5173`
3. Sélectionner un rôle (Admin, KDS, Serveur, Client)
4. Explorer les différentes interfaces

---

**L'Atelier POS v1.0** — Système de caisse enregistreuse moderne pour restaurants.

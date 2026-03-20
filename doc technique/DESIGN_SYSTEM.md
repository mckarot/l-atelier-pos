# L'Atelier POS — Design System
> Version 1.0 — "L'Atelier Numérique" — Référence visuelle pour développement IA autonome

Ce document est la **référence absolue** pour toute décision visuelle. L'IA de développement doit le consulter avant de coder n'importe quel composant UI.

---

## Table des matières

1. [Vision & philosophie](#1-vision--philosophie)
2. [Palette de couleurs](#2-palette-de-couleurs)
3. [Typographie](#3-typographie)
4. [Espacement & layout](#4-espacement--layout)
5. [Élévation & profondeur](#5-élévation--profondeur)
6. [Règles visuelles fondamentales](#6-règles-visuelles-fondamentales)
7. [Composants — Référence complète](#7-composants--référence-complète)
8. [Icônes](#8-icônes)
9. [Animations & transitions](#9-animations--transitions)
10. [Do's and Don'ts](#10-dos-and-donts)
11. [Adaptation par vue](#11-adaptation-par-vue)

---

## 1. Vision & philosophie

### L'Atelier Numérique

Le design de L'Atelier POS s'inspire de **l'ingénierie haut de gamme industrielle** : atelier de mécanique de précision, tableau de bord d'avion, interface de contrôle. L'esthétique est dark, dense en information, mais jamais chaotique.

**Trois mots clés :**
- **Efficace** — chaque pixel a une raison d'être, pas de décoration gratuite.
- **Autoritaire** — la typographie impose immédiatement la hiérarchie.
- **Respirant** — le vide est une décision, pas une absence.

### Principe de "calque thermique"

La couleur n'est pas de la décoration. Elle encode l'urgence. Une interface qui devient orange/rouge indique une action requise. Une interface grise/neutre indique un état stable.

---

## 2. Palette de couleurs

### Fondations dark (mode principal)

| Token | Valeur hex | Usage |
|---|---|---|
| `background` | `#131313` | Fond de toute l'application |
| `surface` | `#131313` | Alias de background |
| `surface-container-lowest` | `#0e0e0e` | Zones ultra-profondes, footers techniques |
| `surface-container-low` | `#1c1b1b` | **Sidebar navigation** |
| `surface-container` | `#201f1f` | Cartes secondaires |
| `surface-container-high` | `#2a2a2a` | Inputs, champs de formulaire |
| `surface-container-highest` | `#353534` | **Éléments interactifs flottants**, cartes KDS |
| `surface-variant` | `#353534` | Alias de surface-container-highest |
| `surface-bright` | `#3a3939` | Hover sur éléments de surface |

### Couleurs sémantiques

| Token | Valeur hex | Usage |
|---|---|---|
| `primary` | `#ffc174` | **Safran** — Accent principal, CTA, nav active |
| `primary-container` | `#f59e0b` | Fond bouton primaire, hover |
| `on-primary` | `#472a00` | Texte sur fond primary |
| `on-primary-container` | `#613b00` | Texte sur fond primary-container |
| `secondary` | `#ffb690` | Accents secondaires, timers en alerte |
| `tertiary` | `#51e77b` | **Vert** — Statut PRÊT, succès, connexion OK |
| `error` | `#ffb4ab` | **Rouge** — Retard, urgence, alerte |
| `error-container` | `#93000a` | Fond badge RETARD |

### Textes sur fond dark

| Token | Valeur hex | Usage |
|---|---|---|
| `on-surface` | `#e5e2e1` | **Texte principal** — blanc cassé chaud |
| `on-background` | `#e5e2e1` | Alias de on-surface |
| `on-surface-variant` | `#d8c3ad` | Texte secondaire, labels |
| `outline` | `#a08e7a` | Bordures visibles (utilisation limitée) |
| `outline-variant` | `#534434` | Ghost border — max 15% opacité |

### Règle d'opacité pour le texte secondaire

Quand une couleur de texte secondaire est créée à partir de `on-surface`, utiliser des classes Tailwind d'opacité :
- Texte principal : `text-on-surface` (100%)
- Texte secondaire : `text-on-surface/60`
- Texte tertiaire / hint : `text-on-surface/30`
- Texte désactivé : `text-on-surface/20`

---

## 3. Typographie

### Polices

| Rôle | Police | Import Google Fonts |
|---|---|---|
| Titres & headlines | **Space Grotesk** | `family=Space+Grotesk:wght@300;400;500;600;700` |
| Corps & labels | **Inter** | `family=Inter:wght@300;400;500;600;700` |
| Données & timers | **JetBrains Mono** | `family=JetBrains+Mono:wght@400;500;700` |

```html
<!-- À inclure dans index.html -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
```

### Échelle typographique

| Rôle | Classe Tailwind | Taille | Graisse | Police | Usage |
|---|---|---|---|---|---|
| Display LG | `font-headline text-5xl font-bold` | 3rem | 700 | Space Grotesk | Totaux CA, écrans de bienvenue |
| Display MD | `font-headline text-4xl font-bold` | 2.25rem | 700 | Space Grotesk | Numéros de table KDS |
| Headline | `font-headline text-2xl font-bold` | 1.5rem | 700 | Space Grotesk | Titres de sections |
| Title | `font-headline text-lg font-medium` | 1.125rem | 500 | Space Grotesk | Noms des plats, sous-titres |
| Body | `font-body text-sm` | 0.875rem | 400 | Inter | Descriptions, contenu courant |
| Label | `font-label text-xs font-semibold` | 0.75rem | 600 | Inter | Statuts, badges |
| Caption | `font-label text-xs` | 0.75rem | 400 | Inter | Notes, metadata |
| Data/Timer | `font-mono text-2xl font-bold` | 1.5rem | 700 | JetBrains Mono | Timers KDS |
| Code/ID | `font-mono text-xs font-bold` | 0.75rem | 700 | JetBrains Mono | Numéros de commande (#ORD-2841) |

### Règle des timers

**Toujours utiliser JetBrains Mono pour les valeurs numériques qui changent** (timers, prix, quantités, compteurs). La chasse fixe empêche le layout shift lors de la mise à jour des chiffres.

---

## 4. Espacement & layout

### Grille principale

L'application utilise un layout **sidebar fixe + contenu principal scrollable** :

```
┌──────────────────────────────────────────────────────────┐
│ Sidebar (256px fixe) │ Zone de contenu (flex-1, scroll) │
└──────────────────────────────────────────────────────────┘
```

- Sidebar : `w-64` (256px), `fixed`, `h-full`, `bg-surface-container-low`
- Contenu : `ml-64`, `flex-1`, `overflow-y-auto`, `bg-background`

### Tokens d'espacement

Utiliser les tokens Tailwind standard. Références clés :

| Valeur | Tailwind | Usage fréquent |
|---|---|---|
| 4px | `p-1`, `gap-1` | Espacement interne badges |
| 8px | `p-2`, `gap-2` | Espacement interne items liste |
| 12px | `p-3`, `gap-3` | Padding navigation sidebar |
| 16px | `p-4`, `gap-4` | Padding carte standard |
| 24px | `p-6`, `gap-6` | Padding section, sidebar header |
| 32px | `p-8` | Padding page principale |

### Padding de la sidebar

```
Sidebar header : px-6 py-6
Éléments de navigation : px-3 py-3 (zone cliquable), px-6 (texte)
Section bas sidebar : px-6 pt-4 (border-top)
```

---

## 5. Élévation & profondeur

### Principe de superposition tonale

L'élévation est créée par des changements de teinte, **pas par des ombres ou des bordures**. Les surfaces plus claires semblent "plus hautes".

```
surface-container-lowest (#0e0e0e)  ← Le plus bas
surface-container-low    (#1c1b1b)  ← Sidebar
surface-container        (#201f1f)  ← Fond de carte
surface-container-high   (#2a2a2a)  ← Inputs
surface-container-highest (#353534) ← Éléments flottants, cartes KDS
surface-bright           (#3a3939)  ← État hover
```

### Ombres

N'utiliser les ombres **que** pour les éléments réellement flottants (modales, dropdowns, tooltips) :

```css
/* Ombre pour éléments flottants uniquement */
box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.4);
```

Classe Tailwind : `shadow-[0px_8px_24px_rgba(0,0,0,0.4)]`

### Glassmorphism

Réservé aux éléments de priorité maximale (modales de paiement, alertes critiques) :

```css
background: rgba(53, 53, 52, 0.6);  /* surface-variant à 60% */
backdrop-filter: blur(12px);
```

---

## 6. Règles visuelles fondamentales

### ❌ LA RÈGLE DU "SANS LIGNE" — Non-négociable

**Interdiction formelle** d'utiliser `border` ou `border-b` de 1px pour séparer des sections.

La séparation se fait **uniquement** par les changements de teinte de fond :

```tsx
// ✅ CORRECT — séparation par fond différent
<aside className="bg-surface-container-low">  {/* sidebar */}
<main className="bg-background">              {/* contenu */}

// ✅ CORRECT — séparation dans une liste par alternance très subtile
<div className="bg-surface-container">        {/* item 1 */}
<div className="bg-surface-container-low">    {/* item 2 */}

// ❌ INTERDIT
<div className="border-b border-gray-700">    {/* jamais */}
<hr />                                         {/* jamais */}
```

**Exception unique** : `border-r-2 border-primary` pour l'indicateur de navigation active dans la sidebar.

### Ghost border (si une limite est absolument nécessaire)

```tsx
// Seulement si requis pour l'accessibilité, jamais pour le design
<div className="border border-outline-variant/15">
```

### ❌ Pas de `#000000` pur

Utiliser `surface-container-lowest` (`#0e0e0e`) comme noir maximal.

### ❌ Pas de coins ronds > 8px

```tsx
// ✅
className="rounded-xl"     // 8px — maximum standard
className="rounded-lg"     // 4px
className="rounded"        // 2px — style "Industrial"

// ❌ Jamais pour les boutons et cartes
className="rounded-full"   // Pills — réservé aux badges de notification uniquement
className="rounded-2xl"    // Trop mou, casse l'esthétique Industrial
```

### ❌ Pas d'icônes remplies

```tsx
// ✅ Icônes filaires (style outlined)
<span className="material-symbols-outlined">dashboard</span>

// Configuration globale dans index.css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}

// ✅ Exception : icônes dans les boutons CTA (fill = 1 pour l'emphase)
style={{ fontVariationSettings: "'FILL' 1" }}
```

---

## 7. Composants — Référence complète

### 7.1 Bouton Primaire (CTA)

```tsx
// Fond primary-container, texte on-primary-container
// Coins xl (8px), jamais pill
<button className="
  bg-primary-container text-on-primary-container
  font-headline font-bold
  px-6 py-3 rounded-xl
  flex items-center gap-2
  hover:brightness-110
  active:scale-[0.98]
  transition-all duration-200
">
  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
    add_circle
  </span>
  Créer une commande
</button>
```

### 7.2 Bouton Ghost / Tertiaire

```tsx
// Pas de fond, texte primary, soulignement au hover
<button className="
  text-primary font-label font-semibold text-sm
  hover:underline
  transition-all duration-200
">
  Voir tout
</button>
```

### 7.3 Bouton Secondaire (KDS — LANCER / TERMINER)

```tsx
// LANCER — fond surface-variant, texte on-surface
<button className="
  w-full bg-surface-variant text-on-surface
  font-mono font-bold text-sm tracking-widest uppercase
  py-3 rounded-lg
  hover:bg-surface-bright
  active:scale-[0.98]
  transition-all duration-150
">
  LANCER
</button>

// TERMINER — fond tertiary (vert), texte dark
<button className="
  w-full bg-tertiary text-[#003915]
  font-mono font-bold text-sm tracking-widest uppercase
  py-3 rounded-lg
  hover:brightness-110
  active:scale-[0.98]
  transition-all duration-150
">
  TERMINER
</button>
```

### 7.4 Badge de statut

```tsx
// Composant StatusBadge.tsx
type BadgeVariant = 'occupee' | 'urgent' | 'pret' | 'libre' | 'retard' | 'preparation';

const variantClasses: Record<BadgeVariant, string> = {
  occupee:     'bg-primary/20 text-primary border border-primary/30',
  urgent:      'bg-error/20 text-error border border-error/30',
  pret:        'bg-tertiary/20 text-tertiary border border-tertiary/30',
  libre:       'bg-tertiary/10 text-tertiary/60 border border-tertiary/20',
  retard:      'bg-error-container text-on-error-container',
  preparation: 'bg-primary/10 text-primary',
};

// Rendu
<span className={`
  font-mono font-bold text-xs px-2 py-0.5 rounded
  ${variantClasses[variant]}
`}>
  {label}
</span>
```

### 7.5 Carte de commande KDS

```tsx
// Structure d'une carte KDS — respecter cette hiérarchie exacte
<div className={`
  bg-surface-container-highest rounded-xl p-4
  flex flex-col gap-3
  relative overflow-hidden
  ${isRetard ? 'border-l-4 border-error' : ''}  // Bande rouge si retard
`}>
  {/* Header de carte */}
  <div className="flex justify-between items-start">
    <div>
      <span className="font-mono text-xs text-on-surface/30 font-bold">
        #{order.id}
      </span>
      <h4 className="font-headline font-black text-2xl text-on-surface">
        Table {order.tableId}
      </h4>
    </div>
    <div className="text-right">
      <span className="font-mono text-xs text-on-surface/40 uppercase tracking-wider">
        REÇU À {formatTime(order.createdAt)}
      </span>
      <Timer startDate={order.createdAt} className="text-2xl font-bold font-mono" />
    </div>
  </div>

  {/* Liste des items — PAS de séparateur, espacement seul */}
  <div className="flex flex-col gap-2">
    {order.items.map((item, i) => (
      <div key={i} className="flex items-start gap-3">
        <span className="font-mono font-bold text-on-surface text-sm w-6">
          x{item.quantity}
        </span>
        <div className="flex-1">
          <span className="font-body text-sm text-on-surface">{item.name}</span>
          {item.customization && (
            <p className="font-mono text-xs text-primary uppercase tracking-wide mt-0.5">
              {item.customization}
            </p>
          )}
        </div>
        {item.station && <StationBadge station={item.station} />}
      </div>
    ))}
  </div>

  {/* Actions */}
  <div className="flex gap-2 mt-1">
    {/* Boutons selon le statut de la commande */}
  </div>
</div>
```

### 7.6 Élément de navigation sidebar

```tsx
// Actif
<a className="
  flex items-center gap-3 px-3 py-3 rounded-lg
  text-primary font-bold
  border-r-2 border-primary         // ← Indicateur actif
  bg-surface-container-highest/30
  transition-colors duration-200
  font-headline
">

// Inactif
<a className="
  flex items-center gap-3 px-3 py-3 rounded-lg
  text-on-surface/60 font-medium
  hover:text-on-surface hover:bg-surface-container-highest
  transition-colors duration-200 active:scale-95
  font-headline
">
```

### 7.7 Indicateur de synchronisation Dexie

```tsx
// Barre d'état en haut du contenu principal
<div className="flex items-center gap-3 px-4 py-2 border-l-2 border-tertiary">
  <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
  <span className="font-mono text-xs text-tertiary font-bold uppercase tracking-wider">
    DEXIE.JS CONNECTÉ
  </span>
  <span className="text-on-surface/40 text-xs">
    Synchronisation locale active • Dernière mise à jour : il y a 2s
  </span>
</div>

// Mode hors-ligne
<div className="flex items-center gap-3 px-4 py-2 border-l-2 border-error">
  <div className="w-2 h-2 rounded-full bg-error" />
  <span className="font-mono text-xs text-error font-bold uppercase tracking-wider">
    HORS LIGNE
  </span>
</div>
```

### 7.8 Toast de notification

```tsx
// Toast "Produit ajouté" — apparaît en bas, disparaît après 3s
<div className="
  fixed bottom-6 left-1/2 -translate-x-1/2
  flex items-center gap-3
  bg-surface-container-highest
  rounded-xl px-4 py-3
  shadow-[0px_8px_24px_rgba(0,0,0,0.4)]
  animate-in slide-in-from-bottom-4 duration-300
">
  <span className="material-symbols-outlined text-primary text-xl">
    shopping_cart
  </span>
  <div>
    <p className="font-headline font-bold text-sm text-on-surface">
      Produit ajouté !
    </p>
    <p className="font-body text-xs text-on-surface/60">
      Votre panier a été mis à jour.
    </p>
  </div>
</div>
```

### 7.9 Input / Champ de saisie

```tsx
// Fond surface-container-high, pas de bordure sauf au focus
<div className="flex flex-col gap-1">
  {/* Label TOUJOURS au-dessus, jamais de placeholder seul */}
  <label className="font-label text-xs font-semibold text-on-surface/60 uppercase tracking-wider">
    Nom du client
  </label>
  <input
    className="
      bg-surface-container-high text-on-surface
      rounded-lg px-4 py-3
      border-2 border-transparent
      focus:border-primary focus:outline-none
      font-body text-sm
      placeholder:text-on-surface/30
      transition-colors duration-200
    "
    placeholder="Ex: Dupont"
  />
</div>
```

---

## 8. Icônes

### Bibliothèque : Material Symbols Outlined

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### Configuration globale (à mettre dans `index.css`)

```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
  font-size: 24px;
  line-height: 1;
  vertical-align: middle;
}
```

### Icônes utilisées dans le prototype (référence)

| Écran | Icône | Clé Material |
|---|---|---|
| Dashboard | Tableau de bord | `dashboard` |
| Admin | Commandes live | `receipt_long` |
| Admin | KDS | `soup_kitchen` |
| Admin | Menu | `menu_book` |
| Admin | Staff | `group` |
| Admin | Rapports | `analytics` |
| Admin | Paramètres | `settings` |
| Admin | Support | `help` |
| Général | Nouvelle commande | `add_circle` |
| Général | Restaurant (logo) | `restaurant_menu` |
| KDS | Tables | `table_restaurant` |
| Serveur | Plan de salle | `chair` |
| Général | Notifications | `notifications` |
| Général | Profil | `account_circle` |
| Général | Recherche | `search` |
| Général | Urgence | `warning` |
| Général | Thème sombre | `light_mode` / `dark_mode` |
| Client | Panier | `shopping_cart` |
| Client | Réservation | `calendar_month` |

---

## 9. Animations & transitions

### Durées standard

```css
/* Navigation, hover states */
transition-duration: 200ms;

/* Scale sur click */
transition-duration: 150ms;

/* Apparition d'éléments (toast, modal) */
transition-duration: 300ms;
```

### Timer KDS — clignotement d'alerte

```css
/* Quand une commande est en retard — animation lente et non-agressive */
@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.7; }
}

.timer-danger {
  animation: pulse-danger 2s ease-in-out infinite;
  color: var(--color-error); /* #ffb4ab */
}
```

### Scroll de la sidebar KDS

Le KDS utilise un layout **sans scroll** — toutes les commandes visibles en même temps. Si le nombre de commandes dépasse la hauteur d'écran, activer un scroll uniquement dans chaque colonne.

### Règle générale

- **Pas d'animations décoratives** — uniquement les transitions qui renforcent la compréhension de l'état.
- **`prefers-reduced-motion`** — toujours respecter en désactivant les animations non-essentielles.

---

## 10. Do's and Don'ts

### ✅ À faire

- **Utiliser `font-mono` pour toutes les données changeantes** (timers, prix, IDs, compteurs).
- **Aérer plutôt que séparer** — si l'interface semble dense, augmenter le `gap` ou le `padding`, ne pas ajouter de `border`.
- **Asymétrie intentionnelle** — aligner les titres à gauche, mais positionner les CTA dans des zones de confort du pouce (bas à droite sur mobile, fixe en bas sur KDS).
- **Respecter la hiérarchie chromatique** — Safran = action, Vert = succès, Rouge = urgence, Blanc cassé = information.
- **Indiquer l'état de connexion** dans toutes les vues critiques (KDS, Admin, Serveur).

### ❌ À ne jamais faire

- **Jamais de `border` de 1px** pour séparer des sections de contenu.
- **Jamais de `#000000` pur** comme fond ou texte — utiliser les tokens.
- **Jamais de `rounded-full` sur les boutons** — uniquement sur les badges de notification.
- **Jamais de `border-radius` > 8px** (`rounded-xl` est le maximum).
- **Jamais d'icônes remplies** sauf dans les boutons CTA primaires.
- **Jamais de `useEffect` + `useState`** pour charger des données Dexie — utiliser `useLiveQuery`.
- **Jamais de couleurs en dur dans les composants** — uniquement les tokens Tailwind.
- **Jamais de texte `#FFFFFF` pur** sur fond dark — utiliser `on-surface` (`#e5e2e1`) pour éviter l'agression visuelle.

---

## 11. Adaptation par vue

### Vue KDS — Règles spécifiques

- **Dark mode uniquement** — pas de toggle, pas de light mode.
- **Typographie plus grande que les autres vues** — lisibilité à 2 mètres.
- **Numéros de table en Display MD** (`text-4xl font-black`) — information la plus critique.
- **Timer toujours visible** même quand la carte est petite.
- **Colonnes de largeur égale** — pas de colonne dominante, chaque statut a le même espace.
- **Footer technique** en bas : `DATABASE LINKED • PRINTER ONLINE • VERSION • HORLOGE` en `font-mono text-xs text-on-surface/30`.

### Vue Admin — Règles spécifiques

- **Hero section** avec image de fond et overlay sombre (`bg-black/40`) — la seule vue avec une image de fond.
- **Cards métriques** alignées sur une grille — le CA principal en `text-5xl font-black`.
- **Indicateur de sync** visible en permanence sous le header.
- **Moniteur cuisine** en bas de dashboard — tableau compact, pas de cartes comme le KDS.

### Vue Serveur — Règles spécifiques

- **Plan de salle interactif** — les tables sont des rectangles de taille variable selon la capacité.
- **Statut des tables par couleur ET texte** — jamais par couleur seule (accessibilité).
- **FAB "NOUVELLE COMMANDE"** fixe en bas de la sidebar, toujours visible.

### Vue Client — Règles spécifiques

- **Light mode par défaut** — l'inverse des autres vues, plus accessible et accueillant.
- **Dark mode commutable** via toggle en sidebar.
- **Images des plats** — grandes, en ratio 16:9 ou 4:3, jamais cropées en portrait.
- **Panier toujours accessible** — drawer ou colonne fixe selon la résolution.
- **Taille de police +2px par rapport aux autres vues** — tablette utilisée par des clients non-professionnels.

---

*L'Atelier POS — DESIGN_SYSTEM v1.0 — Document destiné au développement IA autonome*

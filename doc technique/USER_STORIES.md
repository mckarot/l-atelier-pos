# L'Atelier POS — User Stories & Tickets
> Version 1.0 — Formaté pour développement IA autonome (Claude Code / Cursor)

## Comment utiliser ce document

Chaque user story est un **ticket autonome**. L'IA peut prendre un ticket, lire ses critères d'acceptance, et coder la fonctionnalité sans avoir besoin de poser de questions — à condition d'avoir également lu `PRD.md`, `SPECS_TECHNIQUES.md` et `DESIGN_SYSTEM.md`.

**Priorités MoSCoW :**
- 🔴 **Must Have** — bloquant, le projet ne peut pas livrer sans
- 🟠 **Should Have** — important, à faire dès que les Must sont terminés
- 🟡 **Could Have** — confort, si le temps le permet
- ⚪ **Won't Have (v1)** — explicitement hors périmètre v1.0

**Format de chaque ticket :**
```
### [ID] Titre
> Priorité | Module | Rôle concerné

En tant que [rôle], je veux [action] afin de [bénéfice].

**Critères d'acceptance :**
- [ ] Critère précis et testable
- [ ] ...

**Notes techniques :**
- Indication de fichier, hook, ou pattern à utiliser
```

---

## Table des matières

- [SETUP — Infrastructure](#setup--infrastructure)
- [MODULE KDS — Écran de cuisine](#module-kds--écran-de-cuisine)
- [MODULE ADMIN — Tableau de bord](#module-admin--tableau-de-bord)
- [MODULE SERVEUR — Vue salle](#module-serveur--vue-salle)
- [MODULE CLIENT — Interface tactile](#module-client--interface-tactile)
- [TRANSVERSAL — Persistance & sync](#transversal--persistance--sync)
- [TRANSVERSAL — Authentification & routing](#transversal--authentification--routing)

---

## SETUP — Infrastructure

---

### US-001 Initialisation du projet Vite + React + TypeScript
> 🔴 Must Have | Setup | Tous

En tant que développeur IA, je veux un projet correctement configuré afin de pouvoir commencer à coder sans friction.

**Critères d'acceptance :**
- [ ] `npm create vite@latest` avec template `react-ts`.
- [ ] Tailwind CSS installé et configuré avec le fichier `tailwind.config.ts` extrait de `SPECS_TECHNIQUES.md` (tokens couleur complets).
- [ ] `dexie` et `dexie-react-hooks` installés.
- [ ] `react-router-dom` v6 installé.
- [ ] Google Fonts (Space Grotesk, Inter, JetBrains Mono, Material Symbols Outlined) importées dans `index.html`.
- [ ] `.material-symbols-outlined` configuré en mode filaire (`FILL 0, wght 300`) dans `src/styles/index.css`.
- [ ] `npm run dev` démarre sans erreur.

**Notes techniques :**
- Respecter la structure de dossiers définie dans `SPECS_TECHNIQUES.md` section 3.
- Le fichier `tailwind.config.ts` doit contenir **tous** les tokens couleur listés, aucun ne doit manquer.

---

### US-002 Initialisation de la base de données Dexie
> 🔴 Must Have | Setup | Système

En tant que système, je veux une base de données locale initialisée au premier lancement afin que l'application fonctionne sans serveur.

**Critères d'acceptance :**
- [ ] Fichier `src/db/database.ts` avec la classe `AtelierDatabase` et instance unique exportée `db`.
- [ ] Schéma v1 : tables `orders`, `tables`, `menuItems`, `reservations` avec les index définis dans `SPECS_TECHNIQUES.md` section 4.
- [ ] Fichier `src/db/types.ts` avec les interfaces TypeScript : `Order`, `OrderItem`, `TableRecord`, `MenuItem`, `Reservation` et tous les types union (`OrderStatus`, `TableStatus`, `MenuCategory`, `ReservationStatus`).
- [ ] Fonction `seedDatabase()` qui peuple la BDD si les tables sont vides : minimum 8 commandes, 16 tables, 6 items de menu (2 Entrées, 3 Plats, 1 Dessert), 2 réservations.
- [ ] `seedDatabase()` est appelée automatiquement au montage de l'app.

**Notes techniques :**
- Utiliser le modèle de données exact de `SPECS_TECHNIQUES.md` section 5.
- Les statuts des commandes de seed doivent couvrir les 3 états KDS : `en_attente`, `en_preparation`, `pret`.

---

### US-003 Routing principal et sélection de rôle
> 🔴 Must Have | Setup | Tous

En tant qu'utilisateur, je veux choisir mon rôle au démarrage afin d'accéder à l'interface adaptée à ma fonction.

**Critères d'acceptance :**
- [ ] Page `/login` : 4 boutons — Admin, KDS, Serveur, Client. Design dark, logo "L'Atelier POS" en Space Grotesk.
- [ ] Le rôle sélectionné est sauvegardé dans `localStorage` sous la clé `atelier_role`.
- [ ] Routes protégées : `/admin/*`, `/kds`, `/serveur/*`, `/client` redirigent vers `/login` si le rôle ne correspond pas.
- [ ] Bouton "Changer de rôle" visible dans chaque sidebar pour revenir à `/login`.
- [ ] La route `/` redirige vers `/login` si pas de rôle, ou vers la vue du rôle actuel sinon.

**Notes techniques :**
- Utiliser le composant `ProtectedRoute` décrit dans `SPECS_TECHNIQUES.md` section 8.
- En v1.0, pas d'authentification par mot de passe — le sélecteur de rôle suffit.

---

## MODULE KDS — Écran de cuisine

---

### US-010 Layout plein écran KDS
> 🔴 Must Have | KDS | Chef de cuisine

En tant que cuisinier, je veux un écran qui occupe tout l'espace disponible afin de voir un maximum de commandes sans scroll.

**Critères d'acceptance :**
- [ ] Layout `h-screen overflow-hidden` — pas de scroll sur la page principale.
- [ ] Header fixe avec : logo "L'ATELIER POS", titre "KDS — FLUX TEMPS-RÉEL", compteur "LIVE: N COMMANDES", bouton refresh, toggle thème.
- [ ] Sidebar gauche (256px) avec navigation : Menu, Commandes (actif), Tables, Tableau de bord, Paramètres. FAB "NOUVELLE COMMANDE" en bas.
- [ ] Zone principale : 3 colonnes de hauteur pleine (`h-full overflow-y-auto` par colonne).
- [ ] Footer fixe en bas : `DATABASE LINKED • PRINTER ONLINE • VERSION 4.2.0-STABLE • [horloge temps réel]` en `font-mono text-xs text-on-surface/30`.
- [ ] Dark mode uniquement — pas de toggle light/dark sur cette vue.

**Notes techniques :**
- Référence prototype : `kds_polissage_senior_2/`.
- L'horloge du footer se met à jour chaque seconde via `setInterval` (seul cas autorisé pour `setInterval` — le reste utilise `useLiveQuery`).

---

### US-011 Colonnes KDS avec commandes live
> 🔴 Must Have | KDS | Chef de cuisine

En tant que cuisinier, je veux voir les commandes organisées en 3 colonnes selon leur statut afin de gérer mes priorités en un coup d'œil.

**Critères d'acceptance :**
- [ ] Colonne 1 **"À PRÉPARER"** : commandes avec `status === 'en_attente'`, triées par `createdAt` ascendant (plus vieille en premier).
- [ ] Colonne 2 **"EN COURS"** : commandes avec `status === 'en_preparation'`.
- [ ] Colonne 3 **"PRÊT / ENVOYÉ"** : commandes avec `status === 'pret'`.
- [ ] Compteur de commandes en header de chaque colonne (ex: `04`, `05`, `03`).
- [ ] Colonne 1 affiche la moyenne de préparation (`MOY: 8 MIN`) en `font-mono text-xs`.
- [ ] Les colonnes se mettent à jour en temps réel via `useLiveQuery` sans rechargement.
- [ ] Si une colonne est vide, elle reste visible (pas de collapse) avec un message discret.

**Notes techniques :**
- Hook : `useActiveOrders()` dans `src/hooks/useOrders.ts` — query Dexie `where('status').anyOf([...])`.
- Le calcul de la moyenne est fait côté client depuis les `createdAt` des commandes terminées aujourd'hui.

---

### US-012 Carte de commande KDS
> 🔴 Must Have | KDS | Chef de cuisine

En tant que cuisinier, je veux lire chaque commande clairement afin de préparer les bons plats pour la bonne table.

**Critères d'acceptance :**
- [ ] Numéro de commande en `font-mono text-xs text-on-surface/30` (ex: `#ORD-2841`).
- [ ] Numéro de table en `font-headline text-4xl font-black` (ex: `Table 14 — Pierre D.`).
- [ ] Heure de réception en `font-mono text-xs` à droite (ex: `REÇU À 12:42`).
- [ ] Timer depuis réception en `font-mono text-2xl font-bold` à droite — voir US-013.
- [ ] Liste des items : `x[quantité]` en `font-mono font-bold`, nom du plat en `font-body`.
- [ ] Customisation du plat en `font-mono text-xs text-primary uppercase` sous le nom (ex: `SANS OIGNONS, FRITES BIEN CUITES`).
- [ ] Badge de station (`GRILL`, `FROID`) à droite de l'item si défini — voir design `StatusBadge`.
- [ ] Fond `bg-surface-container-highest`, coins `rounded-xl`, padding `p-4`.
- [ ] Pas de ligne séparatrice entre les items — espacement `gap-3` uniquement.

**Notes techniques :**
- Composant : `src/views/kds/OrderCard.tsx` — props : `order`, `onLancer`, `onTerminer`.
- Respecter la structure exacte définie dans `DESIGN_SYSTEM.md` section 7.5.

---

### US-013 Timer avec système d'alerte
> 🔴 Must Have | KDS | Chef de cuisine

En tant que cuisinier, je veux que les commandes en retard soient visuellement distinctes afin de prioriser mes actions.

**Critères d'acceptance :**
- [ ] Timer affiché en `MM:SS` en `font-mono`, se met à jour chaque seconde.
- [ ] 0 → 10 min : timer en `text-on-surface` (blanc cassé — état normal).
- [ ] 10 → 20 min : timer en `text-secondary` (`#ffb690` — alerte modérée).
- [ ] > 20 min : timer en `text-error` avec animation `pulse-danger` (clignotement lent 2s), badge `RETARD` visible, bande gauche `border-l-4 border-error`.
- [ ] Le badge `RETARD` est en `font-mono text-xs` sur fond `bg-error-container text-on-error-container`.
- [ ] L'animation respecte `prefers-reduced-motion` (désactivée si l'utilisateur a cette préférence).

**Notes techniques :**
- Composant : `src/components/ui/Timer.tsx`.
- Seuils dans `src/utils/timer.ts` : `ALERT_THRESHOLDS.warning = 10 * 60 * 1000`, `ALERT_THRESHOLDS.danger = 20 * 60 * 1000`.
- Utiliser `setInterval` dans un `useEffect` avec cleanup — seul usage autorisé de `setInterval` dans un composant.

---

### US-014 Actions LANCER et TERMINER
> 🔴 Must Have | KDS | Chef de cuisine

En tant que cuisinier, je veux pouvoir changer le statut d'une commande en un seul tap afin de ne pas ralentir le service.

**Critères d'acceptance :**
- [ ] Commande `en_attente` → bouton **LANCER** seul, full-width, fond `bg-surface-variant`.
- [ ] Commande `en_preparation` → boutons **AIDE** (ghost, moitié) + **TERMINER** (vert, moitié).
- [ ] Commande `pret` → aucun bouton d'action, marquée comme "envoyée".
- [ ] Clic sur LANCER : `db.orders.update(id, { status: 'en_preparation', updatedAt: new Date() })`.
- [ ] Clic sur TERMINER : `db.orders.update(id, { status: 'pret', updatedAt: new Date() })`.
- [ ] La carte se déplace instantanément dans la bonne colonne après l'action (réactivité `useLiveQuery`).
- [ ] Les boutons ont un état `active:scale-[0.98]` pour le feedback tactile.
- [ ] Taille minimale des boutons : 44px de hauteur (accessibilité tactile).

**Notes techniques :**
- Fonction : `updateOrderStatus()` dans `src/hooks/useOrders.ts`.
- Les callbacks `onLancer` et `onTerminer` sont passés depuis `KDSBoard` vers `OrderCard` via props.

---

### US-015 Compteur live en header KDS
> 🟠 Should Have | KDS | Chef de cuisine

En tant que chef de cuisine, je veux voir le nombre de commandes actives en permanence afin de gérer le flux du service.

**Critères d'acceptance :**
- [ ] Badge `LIVE: N COMMANDES` en `font-mono font-bold text-sm` avec indicateur vert pulsant.
- [ ] N est le nombre de commandes avec status `en_attente` ou `en_preparation` — mis à jour en temps réel.
- [ ] Affichage de l'heure actuelle en `font-mono` dans le header, se met à jour chaque seconde.

---

## MODULE ADMIN — Tableau de bord

---

### US-020 Layout Admin avec sidebar
> 🔴 Must Have | Admin | Administrateur

En tant qu'administrateur, je veux un layout stable avec navigation complète afin d'accéder à tous les modules de gestion.

**Critères d'acceptance :**
- [ ] Sidebar 256px, fond `bg-surface-container-low`, fixe à gauche.
- [ ] Logo "Atelier Admin" + icône `restaurant_menu` (fill=1, couleur primary) en haut.
- [ ] Sous-titre station en `font-mono text-xs text-on-surface/40 uppercase tracking-widest`.
- [ ] Navigation : Dashboard (actif), Live Orders, Kitchen Display, Menu Editor, Staff Management, Reports.
- [ ] Item actif : `text-primary font-bold border-r-2 border-primary bg-surface-container-highest/30`.
- [ ] FAB "Create Order" en bas de sidebar : fond `primary-container`, texte `on-primary-container`.
- [ ] Toggle Mode Sombre + liens Settings et Support tout en bas.
- [ ] TopBar droite : barre de recherche (`font-mono text-sm`), icône notification, icône profil avec nom et rôle.
- [ ] Indicateur Dexie.js en bandeau sous le TopBar.

**Notes techniques :**
- Référence prototype : `l_atelier_pos_application_unifi_e/` et `admin_tableau_de_bord_refactoris_2/`.
- Composants : `src/components/layout/Sidebar.tsx` (variante admin) + `src/components/layout/TopBar.tsx`.

---

### US-021 Dashboard — Hero et métriques
> 🔴 Must Have | Admin | Administrateur

En tant qu'administrateur, je veux voir en un coup d'œil l'état du service et le chiffre d'affaires du jour afin de prendre des décisions rapidement.

**Critères d'acceptance :**
- [ ] Hero section à gauche (60%) : image de fond avec overlay `bg-black/40`, badge `TABLEAU DE BORD` en `font-mono uppercase`, titre "Bienvenue à L'Atelier" en Space Grotesk, sous-titre contextuel (ex: "4 réservations confirmées pour les 30 prochaines minutes"), boutons "Lancer le service" et "Statistiques".
- [ ] Métrique CA à droite (40%) : label "Chiffre d'Affaires", montant en `text-5xl font-black font-headline`, variation J-1 en vert/rouge, indicateur objectif journalier.
- [ ] Le CA est calculé depuis `db.orders.where('status').equals('paye').toArray()` du jour.
- [ ] Sous-titre contextuel est dynamique selon les réservations à venir dans les 30 prochaines minutes.

---

### US-022 Dashboard — Statut des tables
> 🔴 Must Have | Admin | Administrateur

En tant qu'administrateur, je veux voir le statut de toutes les tables actives afin de surveiller le service en salle.

**Critères d'acceptance :**
- [ ] Grille de cartes de tables (3-4 colonnes) pour les tables avec commandes actives.
- [ ] Chaque carte affiche : numéro de table, statut (badge), nombre de personnes, timer depuis création de commande, montant en cours, serveur assigné.
- [ ] Statut OCCUPÉE : badge `text-primary bg-primary/20`.
- [ ] Statut URGENT (retard > 20 min) : badge `text-error bg-error/20`, bordure gauche rouge.
- [ ] Statut PRÊT : badge `text-tertiary bg-tertiary/20`.
- [ ] Carte "+ NOUVELLE TABLE" à la fin de la grille.
- [ ] Les cartes se mettent à jour via `useLiveQuery` sur `db.tables` et `db.orders`.

---

### US-023 Dashboard — Moniteur cuisine
> 🔴 Must Have | Admin | Administrateur

En tant qu'administrateur, je veux un tableau compact de toutes les commandes en cours afin de monitorer la cuisine sans quitter mon dashboard.

**Critères d'acceptance :**
- [ ] Section "MONITEUR CUISINE EN DIRECT" en bas du dashboard, fond `bg-surface-container`, coins `rounded-xl`.
- [ ] Header : titre en `font-mono uppercase`, compteur "N COMMANDES EN COURS", indicateur `SYNC OK`.
- [ ] Tableau avec colonnes : COMMANDE, TABLE, ITEMS, TEMPS ÉCOULÉ, STATUT.
- [ ] COMMANDE : `#ORD-XXXX` en `font-mono`.
- [ ] ITEMS : badges pills pour chaque item (ex: `2x Burger Classique` `1x Salade César`).
- [ ] TEMPS ÉCOULÉ : en `font-mono`, couleur verte si < 10min, orange si < 20min, rouge si > 20min.
- [ ] STATUT : badge coloré (`En préparation` / `Retardé`).
- [ ] Données depuis `useActiveOrders()`.

---

### US-024 Éditeur de menu CRUD
> 🟠 Should Have | Admin | Administrateur

En tant qu'administrateur, je veux créer, modifier et supprimer des articles du menu afin de maintenir la carte à jour.

**Critères d'acceptance :**
- [ ] Liste de tous les `menuItems` avec nom, catégorie, prix, disponibilité, vignette image.
- [ ] Toggle `isAvailable` directement dans la liste (mise à jour Dexie immédiate).
- [ ] Bouton "Ajouter un article" ouvre un formulaire (modal ou page dédiée).
- [ ] Formulaire : nom, description, prix, catégorie (select), URL image, allergènes, station, disponibilité.
- [ ] Validation : nom et prix obligatoires, prix > 0, catégorie parmi les 4 valeurs autorisées.
- [ ] Bouton "Supprimer" avec confirmation (dialog natif ou modal).
- [ ] Toutes les mutations via `db.menuItems.add()`, `db.menuItems.update()`, `db.menuItems.delete()`.

---

## MODULE SERVEUR — Vue salle

---

### US-030 Layout Vue Serveur
> 🔴 Must Have | Serveur | Serveur

En tant que serveur, je veux un layout adapté à ma mobilité afin d'accéder rapidement aux informations dont j'ai besoin.

**Critères d'acceptance :**
- [ ] Sidebar avec profil serveur (avatar, nom, service actif).
- [ ] Navigation : Menu, Commandes, Tables (actif), Tableau de bord, Paramètres.
- [ ] FAB "NOUVELLE COMMANDE" en bas de sidebar, full-width, fond `primary-container`.
- [ ] Zone principale : titre de section (ex: "PLAN INTERACTIF"), sous-titre (secteur, heure).
- [ ] Dark mode par défaut, toggle disponible.

**Notes techniques :**
- Référence prototype : `vue_serveur_polie_responsive_2/`.

---

### US-031 Plan de salle interactif
> 🔴 Must Have | Serveur | Serveur

En tant que serveur, je veux voir toutes les tables et leur statut sur un plan afin de gérer ma section efficacement.

**Critères d'acceptance :**
- [ ] Grille de tables affichant : numéro (`T-01`, `T-02`…), statut textuel (`LIBRE`, `OCCUPÉE`…), capacité si applicable.
- [ ] Couleur de fond de la carte selon statut : `bg-tertiary/10` (libre), `bg-primary/10` (occupée), `bg-error/10` (urgent), `bg-blue-500/10` (prêt).
- [ ] Clic sur une table → affiche un panel latéral (ou modal) avec le détail des commandes de cette table.
- [ ] Indicateur "SÉLECTIONNÉE" en bas de page pour la table active.
- [ ] Les statuts se mettent à jour en temps réel via `useLiveQuery` sur `db.tables`.

---

### US-032 Planning des réservations
> 🟠 Should Have | Serveur | Serveur

En tant que serveur, je veux voir les réservations du jour afin d'anticiper l'attribution des tables.

**Critères d'acceptance :**
- [ ] Vue liste des réservations du jour courant, triées par heure.
- [ ] Chaque réservation : nom client, heure, nombre de couverts, statut, table assignée (si définie).
- [ ] Bouton "Marquer comme arrivé" → `db.reservations.update(id, { status: 'arrive' })`.
- [ ] Formulaire "Nouvelle réservation" : nom, date, heure, couverts, notes.
- [ ] Les réservations depuis `useReservations()` avec filtre sur la date du jour.

---

## MODULE CLIENT — Interface tactile

---

### US-040 Layout Vue Client
> 🔴 Must Have | Client | Client

En tant que client, je veux une interface accueillante et simple afin de passer commande sans aide.

**Critères d'acceptance :**
- [ ] Light mode par défaut (fond blanc, texte dark).
- [ ] Sidebar avec logo "L'Atelier", navigation simple (Menu, Commandes, Tables, Tableau de bord).
- [ ] Toggle thème sombre en bas de sidebar.
- [ ] Bouton "Urgence" (icône `warning`) en bas de sidebar pour appeler un serveur.
- [ ] Zone principale : contenu scrollable, header avec nom de la section et statut de la cuisine (`CUISINE OUVERTE • TABLE 12`).
- [ ] Police body légèrement plus grande (+2px) que les autres vues pour le confort client.

**Notes techniques :**
- Référence prototype : `vue_client_polie_tactile_1/`.

---

### US-041 Carte du menu avec filtres
> 🔴 Must Have | Client | Client

En tant que client, je veux parcourir le menu et filtrer par catégorie afin de trouver rapidement ce qui m'intéresse.

**Critères d'acceptance :**
- [ ] Filtres de catégorie en haut : Entrées, Plats, Desserts, Boissons — boutons toggle.
- [ ] "Tous" actif par défaut.
- [ ] Catégorie active : fond `primary-container`, texte `on-primary-container`.
- [ ] Articles en grille 2-3 colonnes selon la largeur d'écran.
- [ ] Chaque article : image (ratio 4:3, `loading="lazy"`), nom, description courte, prix en `font-mono font-bold`.
- [ ] Articles `isAvailable: false` : grisés avec badge "Indisponible", non-cliquables.
- [ ] Clic sur un article → ouvre un drawer ou modal de détail avec ajout au panier.
- [ ] Données depuis `useMenu()` avec filtre local sur la catégorie sélectionnée.

---

### US-042 Panier et validation de commande
> 🔴 Must Have | Client | Client

En tant que client, je veux composer et valider ma commande afin de la transmettre à la cuisine sans intervention du serveur.

**Critères d'acceptance :**
- [ ] Panier accessible en permanence (drawer latéral ou colonne fixe).
- [ ] Chaque ligne du panier : nom, quantité (- / +), prix unitaire, prix total de la ligne.
- [ ] Sous-total, TVA (10% pour restauration), total en `font-mono font-bold`.
- [ ] Bouton "Valider la commande" : crée un `Order` dans Dexie avec les items du panier, `status: 'en_attente'`, `tableId` depuis le contexte de session.
- [ ] Toast "Commande envoyée en cuisine !" après validation, panier vidé.
- [ ] Champ "Notes / instructions spéciales" (optionnel) avant validation.
- [ ] Pas de paiement en v1.0 — la commande est validée sans paiement.

**Notes techniques :**
- État du panier : `useState` local dans `ClientLayout` (le panier n'est pas persisté en Dexie, il est éphémère).
- `tableId` : stocké dans `localStorage` à la sélection de la table lors du login client.

---

### US-043 Toast de confirmation panier
> 🟠 Should Have | Client | Client

En tant que client, je veux un retour visuel immédiat quand j'ajoute un article afin d'être certain que mon action a été prise en compte.

**Critères d'acceptance :**
- [ ] Toast apparaît en bas au centre après chaque ajout au panier.
- [ ] Contenu : icône `shopping_cart` (primary), titre "Produit ajouté !", sous-titre "Votre panier a été mis à jour."
- [ ] Durée : 3 secondes, puis disparition avec animation `slide-out-to-bottom`.
- [ ] Si plusieurs ajouts rapides, le toast se réinitialise (pas d'empilement).

**Notes techniques :**
- Composant : `src/components/ui/Toast.tsx`.
- Utiliser un `setTimeout` avec cleanup dans `useEffect`.

---

### US-044 Module de réservation client
> 🟠 Should Have | Client | Client

En tant que client, je veux réserver une table à l'avance afin de garantir ma place.

**Critères d'acceptance :**
- [ ] Formulaire : nom (obligatoire), date (date picker), heure (select : créneaux de 30min de 12h à 22h), nombre de couverts (1-10), email (optionnel), téléphone (optionnel), notes.
- [ ] Validation : nom et date obligatoires, date >= aujourd'hui.
- [ ] Soumission → `db.reservations.add({ ..., status: 'en_attente' })`.
- [ ] Confirmation affichée avec résumé de la réservation et numéro de référence (l'`id` Dexie).
- [ ] Design : fond `bg-surface-container`, sections séparées par espacement (pas de `border`).

---

## TRANSVERSAL — Persistance & sync

---

### US-050 Indicateur de statut de synchronisation
> 🔴 Must Have | Transversal | Tous

En tant qu'utilisateur, je veux savoir si l'application est synchronisée afin de faire confiance aux données affichées.

**Critères d'acceptance :**
- [ ] Composant `SyncIndicator` visible dans les vues Admin, KDS et Serveur (pas Client).
- [ ] État connecté : point vert pulsant, texte `DEXIE.JS CONNECTÉ`, timestamp de dernière mise à jour.
- [ ] État hors-ligne : point rouge, texte `HORS LIGNE — Données sauvegardées localement`.
- [ ] Le timestamp se met à jour à chaque mutation Dexie réussie.
- [ ] Bordure gauche verte (`border-l-2 border-tertiary`) en connecté, rouge en hors-ligne.

**Notes techniques :**
- Composant : `src/components/ui/SyncIndicator.tsx`.
- Détecter le statut réseau via `window.addEventListener('online'/'offline')`.

---

### US-051 Gestion du mode hors-ligne
> 🟠 Should Have | Transversal | Tous

En tant qu'utilisateur, je veux pouvoir continuer à utiliser l'application sans connexion réseau afin de ne pas bloquer le service.

**Critères d'acceptance :**
- [ ] Toutes les mutations Dexie fonctionnent sans connexion réseau (IndexedDB est local).
- [ ] Une bannière "Mode hors-ligne — vos données sont sauvegardées" apparaît quand `navigator.onLine === false`.
- [ ] À la reconnexion, la bannière disparaît et le timestamp de sync se met à jour.
- [ ] Aucune perte de données entre la déconnexion et la reconnexion.

---

## TRANSVERSAL — Authentification & routing

---

### US-060 Page de sélection de rôle
> 🔴 Must Have | Auth | Tous

En tant qu'utilisateur, je veux choisir mon rôle simplement afin d'accéder à la bonne interface.

**Critères d'acceptance :**
- [ ] Page `/login` : fond dark, logo centré, 4 cartes de rôle cliquables.
- [ ] Chaque carte : icône Material Symbols, titre du rôle, description en 1 ligne.
- [ ] Clic → sauvegarde `atelier_role` dans `localStorage` → redirection vers la vue correspondante.
- [ ] Design respecte le Design System : fond `bg-background`, cartes `bg-surface-container-highest`, texte `on-surface`.
- [ ] Pas de formulaire de connexion en v1.0.

---

### US-061 Navigation entre vues (changement de rôle)
> 🟠 Should Have | Auth | Tous

En tant qu'utilisateur, je veux pouvoir changer de rôle sans fermer l'application afin de passer facilement d'une station à l'autre.

**Critères d'acceptance :**
- [ ] Lien "Changer de rôle" visible dans toutes les sidebars (bas de page, discret).
- [ ] Clic → efface `atelier_role` de `localStorage` → redirige vers `/login`.
- [ ] La base de données Dexie n'est pas effacée lors du changement de rôle.

---

## Récapitulatif des priorités

| ID | Titre | Priorité | Module |
|---|---|---|---|
| US-001 | Initialisation Vite + React + TypeScript | 🔴 Must | Setup |
| US-002 | Base de données Dexie | 🔴 Must | Setup |
| US-003 | Routing et sélection de rôle | 🔴 Must | Setup |
| US-010 | Layout KDS plein écran | 🔴 Must | KDS |
| US-011 | Colonnes KDS avec commandes live | 🔴 Must | KDS |
| US-012 | Carte de commande KDS | 🔴 Must | KDS |
| US-013 | Timer avec alertes | 🔴 Must | KDS |
| US-014 | Actions LANCER et TERMINER | 🔴 Must | KDS |
| US-015 | Compteur live header | 🟠 Should | KDS |
| US-020 | Layout Admin avec sidebar | 🔴 Must | Admin |
| US-021 | Dashboard — Hero et métriques | 🔴 Must | Admin |
| US-022 | Dashboard — Statut des tables | 🔴 Must | Admin |
| US-023 | Dashboard — Moniteur cuisine | 🔴 Must | Admin |
| US-024 | Éditeur de menu CRUD | 🟠 Should | Admin |
| US-030 | Layout Vue Serveur | 🔴 Must | Serveur |
| US-031 | Plan de salle interactif | 🔴 Must | Serveur |
| US-032 | Planning réservations | 🟠 Should | Serveur |
| US-040 | Layout Vue Client | 🔴 Must | Client |
| US-041 | Carte du menu avec filtres | 🔴 Must | Client |
| US-042 | Panier et validation | 🔴 Must | Client |
| US-043 | Toast confirmation panier | 🟠 Should | Client |
| US-044 | Module réservation client | 🟠 Should | Client |
| US-050 | Indicateur de synchronisation | 🔴 Must | Transversal |
| US-051 | Mode hors-ligne | 🟠 Should | Transversal |
| US-060 | Page sélection de rôle | 🔴 Must | Auth |
| US-061 | Changement de rôle | 🟠 Should | Auth |

**Total Must Have : 17 tickets**
**Total Should Have : 9 tickets**

---

*L'Atelier POS — USER_STORIES v1.0 — Document destiné au développement IA autonome*

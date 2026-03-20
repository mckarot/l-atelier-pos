# L'Atelier POS — Product Requirements Document (PRD)
> Version 1.0 — Prototype validé, prêt pour développement IA autonome

| Champ | Valeur |
|---|---|
| Document | Product Requirements Document (PRD) |
| Version | 1.0 |
| Statut | Prototype validé — Prêt pour développement IA |
| Plateforme cible | Web app (navigateur, tablette) |
| Persistance | Offline-first avec Dexie.js (IndexedDB) |
| Développement | IA autonome (Claude Code / Cursor) |

---

## Table des matières

1. [Vision produit](#1-vision-produit)
2. [Personas & rôles utilisateurs](#2-personas--rôles-utilisateurs)
3. [Périmètre fonctionnel](#3-périmètre-fonctionnel)
4. [Cas d'usage critiques](#4-cas-dusage-critiques)
5. [Hors périmètre v1.0](#5-hors-périmètre-v10)
6. [Contraintes & exigences non-fonctionnelles](#6-contraintes--exigences-non-fonctionnelles)
7. [Inventaire du prototype](#7-inventaire-du-prototype)
8. [Critères de succès (Definition of Done)](#8-critères-de-succès-definition-of-done)

---

## 1. Vision produit

### 1.1 Résumé exécutif

L'Atelier POS est un système de gestion de restaurant complet, pensé pour les établissements de restauration à service rapide ou semi-gastronomique. Il unifie en une seule plateforme web le point de vente (POS), l'écran de cuisine (KDS), la vue serveur, la vue client tactile et le tableau de bord administrateur.

Le prototype a été conçu et validé avec Stitch (outil de génération de prototypes IA). Toutes les vues principales ont été itérées et polies. Ce PRD formalise ce qui a été prototypé et définit le périmètre exact du développement à réaliser.

### 1.2 Étoile polaire

> **"L'Atelier Numérique"** — Transformer un outil de gestion de restaurant d'un simple logiciel en un instrument de haute précision.

L'esthétique s'inspire de l'ingénierie haut de gamme : efficace, brute mais raffinée. Chaque interaction doit être rapide, claire et sans friction, même dans l'effervescence d'un service.

### 1.3 Problèmes résolus

- Les cuisines travaillent encore avec des bons papier ou des écrans KDS peu lisibles sous stress.
- Les serveurs jonglent entre plusieurs outils pour voir l'état des tables, prendre des commandes et communiquer avec la cuisine.
- Les gérants n'ont pas de vue en temps réel sur le chiffre d'affaires, les retards et la performance du service.
- Les clients en self-service ne disposent pas d'une interface tactile agréable pour passer commande.

---

## 2. Personas & rôles utilisateurs

Le système comprend 4 rôles distincts, chacun avec sa propre interface dédiée.

| Rôle | Interface | Contexte d'usage | Appareil principal |
|---|---|---|---|
| Administrateur / Gérant | Admin Dashboard | Bureau ou comptoir, gestion globale du service | Tablette / Desktop |
| Chef de cuisine / Cuisinier | KDS Cuisine | En cuisine, debout, mains occupées | Écran mural tactile |
| Serveur / Chef d'atelier | Vue Serveur | En salle, déplacement constant | Tablette ou terminal dédié |
| Client (self-service) | Vue Client | Table ou borne, commande autonome | Tablette fixe sur table |

### 2.1 Persona — Administrateur

- **Besoin principal :** Vue macro du service en cours et des KPIs financiers.
- **Frustration actuelle :** Doit se déplacer pour obtenir l'état réel de la cuisine.
- **Attentes :** Tableau de bord live, alertes retards, gestion du menu, rapports journaliers.

### 2.2 Persona — Chef de cuisine

- **Besoin principal :** Voir les commandes arriver dans l'ordre, gérer les priorités, signaler quand un plat est prêt.
- **Frustration actuelle :** Bons papier illisibles, pas de gestion des temps de préparation.
- **Attentes :** Interface haute lisibilité, timers par commande, colonnes À préparer / En cours / Prêt.

### 2.3 Persona — Serveur

- **Besoin principal :** Voir l'état de ses tables, prendre les commandes, être notifié quand la cuisine est prête.
- **Frustration actuelle :** Va-et-vient cuisine/salle pour savoir si les plats sont prêts.
- **Attentes :** Plan de salle interactif, statut temps réel, module réservations, prise de commande rapide.

### 2.4 Persona — Client

- **Besoin principal :** Parcourir le menu, composer sa commande, payer ou valider.
- **Frustration actuelle :** Attente longue, difficulté à personnaliser les plats.
- **Attentes :** Interface tactile fluide, images des plats, panier intégré, statut de commande en temps réel.

---

## 3. Périmètre fonctionnel

Le système est organisé en 5 modules principaux, tous accessibles depuis une application web unifiée avec navigation par rôle.

### 3.1 Module Admin — Tableau de bord

**Fonctionnalités validées dans le prototype**

- Hero section avec message de bienvenue contextuel (ex : réservations dans les 30 prochaines minutes).
- Widget Chiffre d'affaires journalier avec comparaison J-1 (+12.4% vs hier).
- Cartes de statut des tables en temps réel : `OCCUPÉE`, `URGENT`, `PRÊT`, `LIBRE`.
- Moniteur cuisine en direct : liste des commandes en cours avec temps écoulé et statut.
- Navigation latérale avec accès à Live Orders, Kitchen Display, Menu Editor, Staff Management, Reports.
- Indicateur de synchronisation Dexie.js (`DEXIE.JS CONNECTÉ / Dernière MAJ il y a 2s`).
- Bouton "Créer une commande" toujours visible.

**Fonctionnalités à implémenter (hors prototype)**

- Authentification administrateur par email/mot de passe.
- Rapports exportables (PDF/CSV) sur la période sélectionnée.
- Gestion du personnel (ajout, rôles, plannings).
- Éditeur de menu CRUD complet (plats, catégories, prix, disponibilité, images).

### 3.2 Module KDS — Écran de cuisine

**Fonctionnalités validées dans le prototype**

- Vue 3 colonnes : `À PRÉPARER` / `EN COURS` / `PRÊT & ENVOYÉ`.
- Cartes de commande avec : numéro de commande, numéro de table, liste des items, quantités, customisations (ex : `SANS OIGNONS`, `FRITES BIEN CUITES`), timer depuis réception.
- Timer en `JetBrains Mono`, couleur en alerte si dépassement du seuil défini.
- Bande d'alerte rouge sur le bord gauche des commandes en retard (`RETARD`).
- Boutons `LANCER` (commencer préparation) et `TERMINER` (plat prêt).
- Badges de station (`GRILL`, `FROID`) sur les items.
- Compteur global en header : `LIVE: 12 COMMANDES` et moyenne de préparation (`MOY: 8 MIN`).
- Statut en pied de page : `DATABASE LINKED`, `PRINTER ONLINE`, version, horloge.
- Mode sombre exclusif — interface conçue pour l'éclairage de cuisine.

**Fonctionnalités à implémenter**

- Son d'alerte configurable à la réception d'une nouvelle commande.
- Impression automatique des bons de commande (imprimante thermique via API).
- Filtrage par station (Grill, Froid, Pâtisserie).

### 3.3 Module Serveur — Vue salle

**Fonctionnalités validées dans le prototype**

- Plan de salle interactif avec tables repositionnables (Terrasse, Salle principale).
- Statut visuel par table : `LIBRE` (vert), `OCCUPÉE` (orange), `URGENT` (rouge), `PRÊT` (bleu).
- Sélection d'une table pour voir le détail des commandes en cours.
- Bouton `NOUVELLE COMMANDE` fixe en bas de sidebar.
- Planning des réservations avec vue calendrier.
- Indicateur "Serveur Connecté" avec nom et service actif.

**Fonctionnalités à implémenter**

- Notifications push quand un plat est prêt pour une de ses tables.
- Prise de commande directe depuis la vue serveur (liaison avec le menu).
- Impression de l'addition depuis la vue serveur.

### 3.4 Module Client — Interface tactile

**Fonctionnalités validées dans le prototype**

- Carte du menu avec images, nom, description et prix des plats.
- Filtrage par catégorie (Entrées, Plats, Desserts, Boissons).
- Ajout au panier avec toast de confirmation (`Produit ajouté !`).
- Panier intégré avec sous-total, TVA et total.
- Module de réservation (date, heure, nombre de couverts, nom).
- Personnalisation des plats (champ notes/instructions spéciales).
- Statut de commande en temps réel.
- Mode sombre / clair commutable.

**Fonctionnalités à implémenter**

- Paiement en ligne intégré (Stripe ou équivalent).
- QR code par table pour accès direct à la vue client de cette table.
- Historique des commandes de la session.

### 3.5 Synchronisation & persistance

- **Base de données locale :** Dexie.js (IndexedDB) — offline-first.
- **Schéma validé dans le prototype :** `tables`, `orders`, `menuItems`, `reservations`.
- Synchronisation en temps réel entre les vues (KDS, Admin, Serveur) via événements.
- Indicateur de statut de connexion visible dans toutes les vues critiques.
- Mode hors-ligne : les commandes sont créées localement et synchronisées à la reconnexion — aucune perte de données.

---

## 4. Cas d'usage critiques

Ces scénarios sont non-négociables. L'IA de développement doit les couvrir en priorité absolue.

### UC-01 — Flux principal d'une commande

| Étape | Acteur | Action |
|---|---|---|
| 1 | Serveur / Client | Création d'une commande depuis la vue serveur ou client |
| 2 | Système | Commande enregistrée en Dexie.js avec statut `en_attente` |
| 3 | KDS | La commande apparaît dans la colonne `À PRÉPARER` avec timer |
| 4 | Cuisinier | Clique `LANCER` → statut passe à `en_preparation` |
| 5 | KDS | La commande se déplace dans la colonne `EN COURS` |
| 6 | Cuisinier | Clique `TERMINER` → statut passe à `pret` |
| 7 | Serveur / Admin | Alerte reçue — plat prêt à être servi |
| 8 | Serveur | Marque la table comme servie |

### UC-02 — Gestion d'une commande en retard

Si le timer d'une commande dépasse le seuil configuré (défaut : 15 min entrées, 25 min plats) :

- La carte KDS affiche le badge `RETARD` en rouge.
- La bande latérale gauche de la carte s'illumine avec `#FFB4AB`.
- Le timer clignote lentement (opacité 100% → 70%, cycle lent).
- L'admin voit la table correspondante en statut `URGENT` sur son dashboard.

### UC-03 — Déconnexion réseau en cours de service

- L'indicateur de sync passe en mode dégradé (icône rouge, message `Hors ligne`).
- Les nouvelles commandes sont sauvegardées localement en IndexedDB.
- À la reconnexion : synchronisation automatique dans l'ordre chronologique.
- Aucune perte de données — toutes les commandes créées offline sont transmises.

### UC-04 — Service client self-service

- Le client accède à la vue client via tablette de table ou QR code.
- Parcourt la carte, ajoute des plats au panier.
- Valide la commande → création automatique dans le système avec son numéro de table.
- Reçoit une confirmation avec numéro de commande et suivi en temps réel.

---

## 5. Hors périmètre v1.0

Les éléments suivants sont explicitement exclus de la première version.

| Fonctionnalité | Raison | Version cible |
|---|---|---|
| Application mobile native (iOS/Android) | La web app tablette couvre le besoin | v2.0 |
| Paiement en ligne intégré (Stripe) | Complexité réglementaire | v1.1 |
| Multi-restaurant / multi-site | Hors scope initial | v2.0 |
| Module de fidélité client | Hors scope initial | v2.0 |
| Intégration comptable (Sage, Cegid) | Besoin d'étude | v1.1 |

---

## 6. Contraintes & exigences non-fonctionnelles

### 6.1 Performance

- Temps de chargement initial < 3 secondes sur connexion 4G.
- Mise à jour temps réel des statuts KDS < 500ms après action utilisateur.
- L'interface KDS doit rester utilisable même si la connexion est instable.

### 6.2 Compatibilité

- Support obligatoire : Chrome et Safari (2 dernières versions majeures).
- Résolutions cibles : `1024×768` (tablette paysage), `1280×800`, `1920×1080` (desktop/écran mural).
- Le KDS est optimisé pour les écrans muraux 1080p — lisible à 2 mètres.
- La vue client est optimisée pour les tablettes portrait (largeur ≥ 768px).

### 6.3 Accessibilité

- Contraste minimum WCAG AA sur tous les éléments interactifs.
- Taille minimale des zones tactiles : 44×44px.
- Aucune information critique transmise par la couleur seule.

### 6.4 Sécurité

- Authentification par rôle — chaque vue est protégée selon le rôle de l'utilisateur connecté.
- Pas de données sensibles stockées en clair dans IndexedDB.
- Toutes les communications avec le serveur en HTTPS.

### 6.5 Internationalisation

- Langue principale : Français.
- Les libellés métier (statuts, messages d'erreur) doivent être externalisés dans un fichier de traduction (`i18n/fr.json`) pour permettre une extension future.

---

## 7. Inventaire du prototype

Le prototype Stitch contient les vues suivantes, toutes validées. L'IA de développement doit s'en inspirer comme référence visuelle et fonctionnelle.

| Dossier prototype | Vue correspondante | Statut | Notes |
|---|---|---|---|
| `l_atelier_pos_application_unifi_e/` | App unifiée — version de référence | **Référence principale** | Point d'entrée pour l'IA |
| `kds_polissage_senior_2/` | KDS Cuisine — version finale | Validé | Version la plus aboutie du KDS |
| `kds_flux_temps_r_el/` | KDS avec flux temps réel | Validé | Logique de synchronisation |
| `admin_tableau_de_bord_refactoris_2/` | Admin Dashboard — version finale | Validé | Version la plus aboutie de l'admin |
| `admin_dashboard_live_data/` | Admin avec données live | Validé | Logique Dexie.js côté admin |
| `vue_serveur_polie_responsive_2/` | Vue Serveur — version finale | Validé | Plan de salle interactif |
| `vue_serveur_planning_r_servations/` | Serveur — Planning réservations | Validé | Module réservations |
| `vue_client_polie_tactile_1/` | Vue Client — version finale | Validé | Interface tactile self-service |
| `vue_client_menu_commande_refactoris/` | Client — Menu & commande | Validé | Panier intégré |
| `vue_client_module_r_servation/` | Client — Module réservation | Validé | Formulaire réservation |
| `kds_persistance_dexie.js/` | KDS — Persistance Dexie.js | Validé | Schéma BDD côté cuisine |
| `admin_persistance_dexie.js/` | Admin — Persistance Dexie.js | Validé | Schéma BDD côté admin |
| `l_ardoise_noire/DESIGN.md` | Design System complet | **Référence design** | Tokens, typographie, règles visuelles |

---

## 8. Critères de succès (Definition of Done)

Une fonctionnalité est considérée "Done" quand elle remplit l'ensemble de ces critères.

### 8.1 Critères fonctionnels

- Tous les cas d'usage de la section 4 fonctionnent de bout en bout.
- La synchronisation entre KDS, Admin et Vue Serveur est inférieure à 500ms.
- Le mode offline fonctionne et les données sont réconciliées à la reconnexion sans perte.
- Les 4 rôles (Admin, Cuisinier, Serveur, Client) sont isolés et protégés par authentification.

### 8.2 Critères de qualité visuelle

- L'interface respecte le Design System défini dans `l_ardoise_noire/DESIGN.md`.
- Aucune bordure `1px solid` ne sépare les sections (règle No-Line du Design System).
- Tous les éléments interactifs ont un état `hover` et `active` visible.
- Le KDS est lisible à 2 mètres de distance sur un écran 1080p.

### 8.3 Critères techniques

- Le code est organisé en composants réutilisables (un composant par entité UI).
- Dexie.js est la seule source de vérité locale — pas de state management dupliqué.
- Aucune dépendance externe non listée dans les spécifications techniques (`SPECS_TECHNIQUES.md`).

---

*L'Atelier POS — PRD v1.0 — Document destiné au développement IA autonome*

# L'Atelier POS — Pipeline de développement IA
> Version 1.1 — Orchestration des agents pour Claude Code / Cursor

Ce fichier définit l'ordre d'exécution des agents pour chaque user story. **Respecter cette séquence sans exception.** Un agent ne doit jamais démarrer sans que le précédent ait terminé et validé son livrable.

---

## Vue d'ensemble

```
US-XXX (user story)
  │
  ▼
[0] audit-png              → Lire les PNG Stitch AVANT tout code ← NOUVEAU
  │
  ▼
[1] react-architect        → Plan complet avant tout code
  │
  ▼
[2] dexie-database-expert  → Schéma DB avant tout composant
  │
  ▼
[3] react-developer        → Implémentation selon le plan ET les PNG
  │
  ▼
[4] react-ts-dexie-reviewer → Audit code + conformité visuelle PNG
  │
  ▼

  ▼
[5] ui-animator            → Animations UNIQUEMENT si US le demande
```

---

## Étape 0 — Audit PNG *(OBLIGATOIRE — jamais sauter)*

**Quand :** Avant toute autre étape, dès qu'une nouvelle US est lancée.

**Règle absolue :** L'IA ne doit jamais écrire une seule ligne de code avant d'avoir lu et analysé les PNG du prototype Stitch correspondant à la US en cours.

**Prompt type à donner à l'agent :**
```
Avant de commencer US-XXX, lis les PNG de référence suivants et fais un audit visuel :
[liste des PNG ci-dessous]

Pour chaque PNG, liste :
1. Les éléments UI critiques visibles (couleurs, typographie, layout, composants)
2. Les écarts potentiels avec ce qui pourrait être codé sans référence
3. Les détails non-documentés dans DESIGN_SYSTEM.md

Ne commence le pipeline qu'après avoir produit cet audit.
```

**Correspondance US → PNG de référence :**

| US | PNG à lire obligatoirement |
|---|---|
| US-003 | `stitch_kds_cran_cuisine/l_atelier_pos_application_unifi_e/screen.png` |
| US-010 à US-015 | `kds_polissage_senior_2/screen.png` + `kds_flux_temps_r_el/screen.png` |
| US-020 à US-024 | `admin_tableau_de_bord_refactoris_2/screen.png` + `admin_dashboard_live_data/screen.png` |
| US-030 à US-032 | `vue_serveur_polie_responsive_2/screen.png` + `vue_serveur_plan_interactif/screen.png` + `vue_serveur_planning_r_servations/screen.png` |
| US-040 à US-044 | `vue_client_polie_tactile_1/screen.png` + `vue_client_menu_commande_refactoris/screen.png` + `vue_client_menu_panier_int_gr_s/screen.png` + `vue_client_module_r_servation/screen.png` |
| US-050 à US-051 | Tous les PNG des modules concernés |

**Format de l'audit PNG attendu :**
```
## Audit PNG — US-XXX

### PNG analysés
- [nom du fichier] ✓

### Éléments critiques identifiés
1. [élément] — [valeur exacte observée dans le PNG]
2. ...

### Détails non couverts par DESIGN_SYSTEM.md
1. [détail] — à implémenter exactement comme dans le PNG
2. ...

### Écarts à surveiller pendant le développement
1. [risque] — [comment l'éviter]
```

**Condition de passage à l'étape 1 :** L'audit PNG est produit avec au moins 5 éléments critiques identifiés par PNG lu.

> **Leçon apprise (US-010) :** Sans cette étape, le developer a codé le bouton LANCER en gris au lieu d'orange, le timer en `text-xl` au lieu de `text-3xl`, et les colonnes en grid fixe au lieu de scroll horizontal — tous des détails visibles immédiatement dans le PNG mais absents des docs texte. L'audit PNG est la seule source de vérité pour les détails visuels fins.

---

## Étape 1 — `react-architect`

**Quand :** Au début de chaque user story, avant d'écrire une seule ligne de code.

**Prompt type à donner à l'agent :**
```
Lis les fichiers docs/PRD.md, docs/SPECS_TECHNIQUES.md et docs/USER_STORIES.md.
Puis conçois l'architecture complète pour la user story [US-XXX] : [titre].
```

**Livrables attendus (les 7 sections obligatoires) :**
- [ ] Structure de dossiers avec rôle de chaque fichier
- [ ] Interfaces TypeScript (entités, inputs, unions discriminées)
- [ ] Schéma Dexie.js avec justification de chaque index
- [ ] Plan de routing avec loaders React Router v6.4+
- [ ] Error Boundaries (QuotaExceededError, InvalidStateError, VersionError)
- [ ] Plan des composants avec props typées
- [ ] Signatures complètes des hooks

**Règle :** L'architecte ne produit **aucun code d'implémentation**. Uniquement des plans et interfaces.

**Condition de passage à l'étape 2 :** Les 7 sections sont présentes et cohérentes avec `SPECS_TECHNIQUES.md`.

---

## Étape 2 — `dexie-database-expert`

**Quand :** Après validation du plan de l'architecte, avant toute implémentation React.

**Prompt type :**
```
Sur la base du plan de l'architecte pour US-XXX, écris le fichier src/db/database.ts
complet avec le schéma Dexie, les types, les index justifiés et la seed de développement.
```

**Livrables attendus :**
- [ ] `src/db/database.ts` complet avec classe `AtelierDatabase`
- [ ] `src/db/types.ts` avec toutes les interfaces TypeScript
- [ ] Justification de chaque index (quelle query il optimise)
- [ ] Fonctions utilitaires de queries communes
- [ ] Seed de développement si la table est vide

**Points de vigilance automatiques de l'agent :**
- Booleans indexés en `0 | 1`, jamais `boolean`
- Chaque `version(N > 1)` a son `.upgrade()`
- Zéro `.filter()` JS sur les collections — uniquement des index Dexie
- `liveQuery` avec `subscription.unsubscribe()` dans le cleanup

**Condition de passage à l'étape 3 :** La checklist interne de l'agent est cochée. Aucun `boolean` indexé. Aucune version sans migration.

---

## Étape 3 — `react-developer`

**Quand :** Après validation du schéma Dexie par l'expert DB.

**Prompt type :**
```
Implémente la user story US-XXX en suivant exactement :
- L'audit PNG de l'étape 0 (référence visuelle absolue)
- Le plan de l'architecte (étape 1)
- Le schéma Dexie validé (étape 2)
- Le design system dans docs/DESIGN_SYSTEM.md

En cas de conflit entre les docs texte et le PNG, le PNG a toujours raison.
```

**Livrables attendus :**
- [ ] Fichiers créés au format `// chemin/complet/fichier.tsx` en en-tête
- [ ] Diffs pour les fichiers existants modifiés
- [ ] Composants < 100 lignes (sinon décomposer)
- [ ] `try/catch` sur toutes les opérations Dexie
- [ ] Attributs ARIA sur tous les éléments interactifs
- [ ] `useLiveQuery` pour toutes les lectures Dexie (jamais `useEffect` + `useState`)
- [ ] Loaders React Router pour les données initiales

**Interdictions absolues pour cet agent :**
- Zéro `any` TypeScript
- Zéro `style={{}}` ou fichier `.css` custom
- Zéro `useEffect` pour charger des données Dexie
- Zéro invention de structure non définie par l'architecte

**Condition de passage à l'étape 4 :** Tous les fichiers listés dans le plan de l'architecte sont produits.

---

## Étape 4 — `react-ts-dexie-reviewer`

**Quand :** Immédiatement après la livraison du developer. **Jamais sauter cette étape.**

**Prompt type :**
```
Audite le code produit pour US-XXX. Vérifie TypeScript strict, patterns Dexie,
accessibilité WCAG 2.1 AA, et conformité visuelle aux PNG de l'étape 0.
Produis le rapport JSON structuré avec une section "design_conformity".
```

**L'agent produit un rapport JSON avec :**
```json
{
  "status": "PASS" | "FAIL",
  "critical": [],
  "major": [],
  "minor": [],
  "design_conformity": {
    "score": 95,
    "png_reference": "kds_polissage_senior_2/screen.png",
    "ecarts": []
  }
}
```

**Retour en étape 3 si :**
- `critical` non vide (any TypeScript, liveQuery sans unsubscribe, filter JS sur collection, boolean indexé)
- `major` non vide (accessibilité manquante sur CTA, try/catch absent sur mutation Dexie)

**Passage à l'étape 5 si :**
- `status: "PASS"` — aucun critical ni major

---

## Étape 5 — `test-automation-specialist`

**Quand :** Après `PASS` du reviewer.

**Prompt type :**
```
Écris les tests pour US-XXX. Stack : Vitest + React Testing Library + fake-indexeddb + Playwright.
Coverage minimum 80% sur lines, functions, branches, statements.
```

**Livrables attendus :**
- [ ] `src/test/setup.ts` si inexistant (avec `fake-indexeddb/auto` en premier import)
- [ ] Tests unitaires pour chaque hook et fonction utilitaire
- [ ] Tests de composant pour chaque composant UI (rendu, interactions, accessibilité)
- [ ] Au moins 1 test d'intégration couvrant le flux complet de la US
- [ ] Tests E2E Playwright avec seed via `page.evaluate()` avant navigation

**Configuration obligatoire :**
```typescript
// src/test/setup.ts — ordre des imports non-négociable
import 'fake-indexeddb/auto'; // ← TOUJOURS EN PREMIER
import '@testing-library/jest-dom';
```

**Condition de clôture de la US :** `npm run test` passe avec coverage ≥ 80%.

---

## Étape 6 — `ui-animator` *(optionnel)*

**Quand :** Uniquement si la user story contient explicitement une mention d'animation, de transition, ou de micro-interaction. **Ne pas déclencher par défaut.**

**US qui déclenchent cet agent :**
- US mentionnant "toast", "modal", "animation", "transition", "feedback visuel", "micro-interaction"
- US de polissage dédiées (ex: US-043 Toast de confirmation panier)

**Prompt type :**
```
Le code de US-XXX est validé. Ajoute les animations appropriées.
Tailwind pour les états hover/focus. Framer Motion pour les entrées/sorties du DOM.
Produis uniquement des diffs.
```

**Règles strictes de l'agent :**
- Diffs uniquement — jamais de fichier complet sur un fichier existant
- Zéro modification de logique métier, hooks, appels Dexie, types
- `useReducedMotion()` obligatoire sur toute animation Framer Motion
- Uniquement `transform` et `opacity` animés (pas `width`, `height`, `top`, `left`)

---

## Corrections inter-agents

### Quand le reviewer renvoie en étape 3

```
[4] react-ts-dexie-reviewer → FAIL
  │
  │  rapport JSON avec critical/major
  ▼
[3] react-developer (itération)
  │
  ▼
[4] react-ts-dexie-reviewer → re-audit
```

L'itération 3→4 peut se répéter jusqu'à `PASS`. Maximum recommandé : 3 itérations. Si toujours FAIL après 3 itérations, impliquer l'architecte pour revoir le plan.

### Quand les tests échouent

```
[5] test-automation-specialist → tests en échec
  │
  ▼
[3] react-developer → correction du bug
  │
  ▼
[4] react-ts-dexie-reviewer → re-audit rapide
  │
  ▼
[5] test-automation-specialist → re-run tests
```

---

## Ordre de traitement des user stories

Respecter l'ordre MoSCoW défini dans `USER_STORIES.md`. Ne jamais commencer une US `Should Have` si des US `Must Have` sont encore en cours.

**Sprint 1 recommandé (Must Have setup) :**
- US-001 → US-002 → US-003 (infrastructure complète avant tout module)

**Sprint 2 recommandé (Must Have KDS — le cœur du produit) :**
- US-010 → US-011 → US-012 → US-013 → US-014

**Sprint 3 recommandé (Must Have Admin) :**
- US-020 → US-021 → US-022 → US-023

Chaque US est traitée séquentiellement dans la pipeline — ne pas paralléliser les agents sur une même US.

---

## Correction du `db.ts` existant avant de commencer

> ⚠️ Le fichier `architecture_de_donnees_db_ts_dexie.js` issu de Stitch contient des problèmes que `dexie-database-expert` devra corriger dès l'étape 2 de US-002.

| Problème détecté | Correction requise |
|---|---|
| `isAvailable: boolean` indexé | → `isAvailable: 0 \| 1` |
| `id?: number` sur les entités | → `id: number` (jamais optionnel sur entité stockée) |
| `EntityTable` sans générique typé | → `Table<MenuItem, number>` |
| Instance `db` non encapsulée dans une classe | → Classe `AtelierDatabase extends Dexie` |

---

## Choix des icônes — décision à prendre avant US-001

> ⚠️ Désalignement détecté entre le `package.json` Stitch (`lucide-react`) et les docs (`Material Symbols Outlined`).

**Choisir une seule librairie et mettre à jour tous les docs :**

| Option | Pour | Contre |
|---|---|---|
| `lucide-react` | Déjà dans le package.json, composants React natifs, tree-shakeable | Icônes moins complètes que Material |
| `Material Symbols Outlined` | Utilisé dans tout le prototype Stitch, 2500+ icônes | Chargement via Google Fonts (réseau) |

**Recommandation :** Garder `lucide-react` pour la production (performance, bundle size). Mettre à jour `DESIGN_SYSTEM.md` section 8 en conséquence.

---

*L'Atelier POS — PIPELINE v1.0 — Document destiné au développement IA autonome*

# Système de Design : Industrial Chic & Performance

## 1. Vision et Étoile Polaire : "L'Atelier Numérique"
Ce système de design est conçu pour transformer l'outil de gestion de restaurant (POS/KDS) d'un simple logiciel en un instrument de haute précision. Notre "Étoile Polaire" créative est **L'Atelier Numérique**. 

Nous brisons les codes du SaaS générique pour adopter une esthétique inspirée de l'ingénierie haut de gamme : efficace, brute mais raffinée. Le design privilégie l'asymétrie intentionnelle pour diriger l'œil vers l'action urgente, tout en utilisant des échelles typographiques contrastées pour instaurer une autorité immédiate. Ici, le vide n'est pas une absence, c'est une respiration nécessaire dans l'effervescence de la cuisine.

---

## 2. Palette Chromatique & Textures
La couleur n'est pas une décoration, c'est un signal. Nous utilisons une approche de "calque thermique" pour hiérarchiser l'information.

### Les Fondations (Dark Mode)
*   **Background (`surface`) :** `#131313` — Une obscurité profonde pour réduire la fatigue oculaire en environnement sombre.
*   **On-Surface (`warm-white`) :** `#F5F0EB` — Un blanc cassé chaleureux qui évite l'agression visuelle du pur blanc.
*   **Accent Principal (`primary`) :** `#FFC174` (Saffron) — À utiliser pour les appels à l'action critiques.

### La Règle du "Sans Ligne" (No-Line Rule)
**Interdiction formelle d'utiliser des bordures solides de 1px pour sectionner l'interface.** La séparation doit être dictée par les changements de ton :
*   Utilisez `surface-container-low` (`#1C1B1B`) pour les zones de navigation latérale.
*   Utilisez `surface-container-highest` (`#353534`) pour les éléments interactifs flottants.

### Glassmorphism & Profondeur
Pour les éléments prioritaires (ex: Modales de paiement, alertes stock), appliquez un effet de verre dépoli :
*   **Background :** `surface-variant` à 60% d'opacité.
*   **Backdrop-blur :** 12px.
*   **Signature Texture :** Pour les boutons `primary`, utilisez un dégradé subtil de `primary` vers `primary-container` (`#F59E0B`) à 15° pour donner une sensation de volume physique (métal brossé).

---

## 3. Typographie Éditoriale
Le contraste entre la structure industrielle et la clarté moderne s'exprime par le choc des graisses.

*   **Display & Headlines (Space Grotesk) :** Utilisé pour les titres de sections et les montants totaux. C'est l'âme "Grotesque" du système. Elle doit être imposante et audacieuse.
*   **Body & Labels (Inter) :** La précision suisse. Utilisée pour toutes les descriptions et les formulaires.
*   **Data & Timers (JetBrains Mono) :** Pour les numéros de commande et les chronomètres de préparation. La chasse fixe garantit que les chiffres ne sautent pas lors du décompte.

| Rôle | Token | Taille | Graisse | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display LG** | `display-lg` | 3.5rem | Bold | Totaux, écrans de bienvenue |
| **Headline SM** | `headline-sm` | 1.5rem | Bold | Titres de catégories (Menu) |
| **Title MD** | `title-md` | 1.125rem | Medium | Noms des plats, Clients |
| **Label MD** | `label-md` | 0.75rem | Semibold | Statuts, badges (MONO) |

---

## 4. Élévation et Profondeur Tonal
L'interface n'est pas une grille plate, mais un empilement de plaques fonctionnelles.

*   **Principe de Superposition :** Une carte `surface-container-lowest` posée sur une section `surface-container-low` crée un relief naturel sans artifice.
*   **Ombres Ambiantes :** Pour les éléments "volants" (Tooltips, Dropdowns), utilisez une ombre ultra-diffuse : `0px 8px 24px rgba(0, 0, 0, 0.4)`. La couleur de l'ombre doit être une version sombre du `on-surface`, jamais un gris neutre.
*   **Le "Ghost Border" :** Si une limite physique est requise (accessibilité), utilisez le token `outline-variant` (`#534434`) à **15% d'opacité** maximum.

---

## 5. Composants Primitifs

### Boutons (Actions)
*   **Primaire :** Fond `primary-container`, texte `on-primary-container`. Rayon de 8px. État "Hover" : luminosité +5%.
*   **Tertiaire :** Pas de fond. Texte `primary`. Soulignement uniquement au survol.

### Cartes de Commande (KDS)
*   **Structure :** Pas de ligne de division entre l'en-tête et le contenu. Utilisez un espacement `spacing-4` (`0.9rem`) pour séparer les items.
*   **État :** En cas d'urgence (retard), le bord gauche de la carte s'illumine avec une bande de 4px de `error` (`#FFB4AB`).

### Champs de Saisie (Inputs)
*   **Style :** Fond `surface-container-high`. Pas de bordure, sauf au focus (bordure `primary` de 2px).
*   **Label :** Toujours en `label-sm` au-dessus du champ, jamais de placeholder seul.

### Listes & Dividers
*   **Interdiction des lignes :** Pour séparer deux articles dans une commande, utilisez un saut de ligne vertical de `0.4rem` (`spacing-2`) ou une alternance de teintes très subtile entre `surface-container-low` et `surface-container-lowest`.

---

## 6. Do’s and Don’ts (À faire et à éviter)

### ✅ À faire (Do)
*   **Prioriser le Monospace :** Utilisez `JetBrains Mono` pour TOUTES les données changeantes (quantités, prix, temps).
*   **Aérer :** Si l'interface semble complexe, augmentez l'espacement plutôt que d'ajouter des lignes de séparation.
*   **Asymétrie :** Alignez les titres à gauche, mais gardez les actions principales (Valider, Payer) dans des zones de confort accessibles au pouce/main dominante.

### ❌ À éviter (Don't)
*   **Éviter le "Pure Black" :** Ne jamais utiliser `#000000`. Utilisez `surface-container-lowest` (`#0E0E0E`) pour conserver de la texture.
*   **Pas de coins ronds excessifs :** Le système est "Industrial". Ne dépassez jamais `8px` (`xl`). Les boutons ronds ("pill") sont proscrits sauf pour les icônes de notification.
*   **Éviter les icônes remplies :** Préférez des icônes filaires (2px d'épaisseur) pour maintenir la légèreté visuelle face à la typographie grasse.

---

## 7. Contextualisation (Exemple KDS)
Pour une commande en cours depuis plus de 10 minutes :
1.  **Container :** `surface-container-highest`.
2.  **Timer :** `JetBrains Mono`, couleur `secondary` (`#FFB690`), clignotement lent (opacité 100% à 70%).
3.  **Action :** Bouton "Prêt" utilisant le Glassmorphism pour se détacher du flux.
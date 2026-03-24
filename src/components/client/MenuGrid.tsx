// src/components/client/MenuGrid.tsx
// Grille des plats du menu

import type { MenuItem } from '../../firebase/types';
import { MenuCard } from './MenuCard';
import type { Supplement, CookingLevel } from '../../firebase/types';

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, cookingLevel?: CookingLevel, supplements?: Supplement[]) => void;
}

export function MenuGrid({ items, onAddToCart }: MenuGridProps): JSX.Element {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <span
          className="material-symbols-outlined text-6xl mb-4 opacity-50"
          aria-hidden="true"
        >
          restaurant
        </span>
        <p className="text-lg font-medium">Aucun plat dans cette catégorie</p>
        <p className="text-sm">Essayez de sélectionner une autre catégorie</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="list"
      aria-label="Liste des plats du menu"
    >
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

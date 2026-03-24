// src/components/client/MenuFilters.tsx
// Filtres de catégorie pour le menu

import { cn } from '../../utils/cn';
import type { MenuCategory } from '../../firebase/types';

interface MenuFiltersProps {
  categories: MenuCategory[];
  selectedCategory: MenuCategory | 'Tous';
  onSelectCategory: (category: MenuCategory | 'Tous') => void;
}

export function MenuFilters({
  categories,
  selectedCategory,
  onSelectCategory,
}: MenuFiltersProps): JSX.Element {
  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-2" role="tablist" aria-label="Filtres de catégorie">
      {/* Filter: Tous */}
      <button
        onClick={() => onSelectCategory('Tous')}
        role="tab"
        aria-selected={selectedCategory === 'Tous'}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          selectedCategory === 'Tous'
            ? 'bg-primary-container text-on-primary-container font-bold'
            : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
        )}
      >
        Tous
      </button>

      {/* Category filters */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          role="tab"
          aria-selected={selectedCategory === category}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
            selectedCategory === category
              ? 'bg-primary-container text-on-primary-container font-bold'
              : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

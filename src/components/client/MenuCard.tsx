// src/components/client/MenuCard.tsx
// Carte de plat pour le menu

import { cn, iconFilled } from '../../utils/cn';
import type { MenuItem } from '../../db/types';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddToCart }: MenuCardProps): JSX.Element {
  const hasCustomization = item.customizationOptions && (
    (item.customizationOptions.cooking && item.customizationOptions.cooking.length > 0) ||
    (item.customizationOptions.supplements && item.customizationOptions.supplements.length > 0)
  );

  return (
    <article
      className={cn(
        'bg-surface-container-low rounded-xl overflow-hidden group',
        'border-l-4 border-transparent hover:border-primary',
        'transition-all duration-300'
      )}
    >
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-container-highest relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
            <span
              className="material-symbols-outlined text-6xl"
              aria-hidden="true"
            >
              restaurant
            </span>
          </div>
        )}

        {/* Allergens badges */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1">
            {item.allergens.map((allergen) => (
              <div
                key={allergen}
                className="bg-surface-container-lowest/80 backdrop-blur-md p-1.5 rounded-full"
                title={allergen}
              >
                <span
                  className={cn(iconFilled(), 'text-[16px] text-primary')}
                  aria-label={`Contient: ${allergen}`}
                >
                  warning
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Availability badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
            <span className="text-on-surface font-bold text-lg">Indisponible</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold font-headline">{item.name}</h3>
          <span className="font-mono font-bold text-primary">
            {item.price.toFixed(2)}€
          </span>
        </div>

        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
          {item.description}
        </p>

        {/* Customization indicator */}
        {hasCustomization && (
          <div className="flex items-center gap-1 mb-3 text-xs text-on-surface-variant">
            <span
              className={iconFilled()}
              aria-hidden="true"
            >
              tune
            </span>
            <span>Personnalisable</span>
          </div>
        )}

        {/* Add button */}
        <button
          onClick={() => onAddToCart(item)}
          disabled={!item.isAvailable}
          className={cn(
            'w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2',
            'transition-all active:scale-[0.98]',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
            item.isAvailable
              ? 'bg-primary-container text-on-primary-container hover:brightness-110'
              : 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed'
          )}
          aria-label={`Ajouter ${item.name} au panier`}
        >
          <span
            className={iconFilled()}
            aria-hidden="true"
          >
            add_shopping_cart
          </span>
          {item.isAvailable ? 'Ajouter' : 'Indisponible'}
        </button>
      </div>
    </article>
  );
}

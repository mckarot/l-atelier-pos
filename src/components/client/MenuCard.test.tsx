// src/components/client/MenuCard.test.tsx
// Tests de composants pour MenuCard

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuCard } from './MenuCard';
import type { MenuItem } from '../../db/types';

const mockMenuItem: MenuItem = {
  id: 1,
  name: 'Burger de l\'Atelier',
  description: 'Boeuf charolais, cheddar affiné, bacon croustillant, sauce maison',
  price: 19.50,
  category: 'Plats',
  image: 'https://example.com/burger.jpg',
  allergens: ['gluten', 'lait'],
  isAvailable: 1,
  station: 'GRILL',
};

describe('MenuCard', () => {
  const mockOnAddToCart = vi.fn();

  beforeEach(() => {
    mockOnAddToCart.mockClear();
  });

  describe('Rendu de base', () => {
    it('devrait afficher le nom du plat', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });

    it('devrait afficher la description du plat', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.getByText('Boeuf charolais, cheddar affiné, bacon croustillant, sauce maison')).toBeInTheDocument();
    });

    it('devrait afficher le prix formaté', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.getByText('19.50€')).toBeInTheDocument();
    });

    it('devrait afficher l\'image du plat', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      const img = screen.getByAltText('Burger de l\'Atelier');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/burger.jpg');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('devrait afficher une icône par défaut si pas d\'image', () => {
      // Arrange
      const itemWithoutImage = { ...mockMenuItem, image: undefined };

      // Act
      render(
        <MenuCard
          item={itemWithoutImage}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.getByText('restaurant')).toBeInTheDocument();
    });
  });

  describe('Allergènes', () => {
    it('devrait afficher les badges d\'allergènes', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      const warningIcons = screen.getAllByText('warning');
      expect(warningIcons).toHaveLength(2);
    });

    it('devrait avoir un title sur chaque badge d\'allergène', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      const allergenBadges = document.querySelectorAll('[title="gluten"], [title="lait"]');
      expect(allergenBadges).toHaveLength(2);
    });

    it('ne devrait pas afficher de badges si pas d\'allergènes', () => {
      // Arrange
      const itemWithoutAllergens = { ...mockMenuItem, allergens: undefined };

      // Act
      render(
        <MenuCard
          item={itemWithoutAllergens}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.queryByText('warning')).not.toBeInTheDocument();
    });
  });

  describe('Bouton Ajouter', () => {
    it('devrait afficher le bouton "Ajouter"', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.getByRole('button', { name: /Ajouter/ })).toBeInTheDocument();
    });

    it('devrait appeler onAddToCart au clic', async () => {
      // Arrange
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Act
      await userEvent.click(screen.getByRole('button', { name: /Ajouter/ }));

      // Assert
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockMenuItem);
    });

    it('devrait être disabled si l\'item n\'est pas disponible', () => {
      // Arrange
      const unavailableItem = { ...mockMenuItem, isAvailable: 0 };

      // Act
      const { container } = render(
        <MenuCard
          item={unavailableItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert - Vérifier que le bouton est disabled
      const button = container.querySelector('button[disabled]');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Indisponible');
    });

    it('devrait afficher "Indisponible" si l\'item n\'est pas disponible', () => {
      // Arrange
      const unavailableItem = { ...mockMenuItem, isAvailable: 0 };

      // Act
      const { container } = render(
        <MenuCard
          item={unavailableItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert - Vérifier que le texte "Indisponible" est présent dans le composant
      expect(container).toHaveTextContent('Indisponible');
    });
  });

  describe('Personnalisation', () => {
    it('devrait afficher l\'indicateur "Personnalisable" si options disponibles', () => {
      // Arrange
      const itemWithCustomization = {
        ...mockMenuItem,
        customizationOptions: {
          cooking: ['Bleu', 'Saignant'],
        },
      };

      // Act
      render(
        <MenuCard
          item={itemWithCustomization}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.getByText('Personnalisable')).toBeInTheDocument();
    });

    it('ne devrait pas afficher l\'indicateur si pas d\'options de personnalisation', () => {
      // Arrange
      const itemWithoutCustomization = {
        ...mockMenuItem,
        customizationOptions: undefined,
      };

      // Act
      render(
        <MenuCard
          item={itemWithoutCustomization}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.queryByText('Personnalisable')).not.toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un rôle article', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('devrait avoir un aria-label sur le bouton', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Ajouter Burger de l\'Atelier au panier');
    });

    it('devrait avoir focus-visible pour la navigation au clavier', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline');
    });
  });

  describe('Effets visuels', () => {
    it('devrait avoir une bordure gauche transparente par défaut', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border-transparent');
    });

    it('devrait avoir les classes hover pour la bordure', () => {
      // Arrange & Act
      render(
        <MenuCard
          item={mockMenuItem}
          onAddToCart={mockOnAddToCart}
        />
      );

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('hover:border-primary');
    });
  });
});

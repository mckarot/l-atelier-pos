// src/components/client/MenuFilters.test.tsx
// Tests de composants pour MenuFilters

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuFilters } from './MenuFilters';
import type { MenuCategory } from '../../db/types';

const categories: MenuCategory[] = ['Entrées', 'Plats', 'Desserts', 'Boissons'];

describe('MenuFilters', () => {
  const mockOnSelectCategory = vi.fn();

  beforeEach(() => {
    mockOnSelectCategory.mockClear();
  });

  describe('Rendu de base', () => {
    it('devrait afficher le bouton "Tous"', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      expect(screen.getByRole('tab', { name: 'Tous' })).toBeInTheDocument();
    });

    it('devrait afficher tous les boutons de catégorie', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      expect(screen.getByRole('tab', { name: 'Entrées' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Plats' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Desserts' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Boissons' })).toBeInTheDocument();
    });

    it('devrait avoir un rôle tablist', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  describe('État actif', () => {
    it('devrait appliquer la classe active au bouton "Tous" quand sélectionné', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      const tousButton = screen.getByRole('tab', { name: 'Tous' });
      expect(tousButton).toHaveClass('bg-primary-container');
      expect(tousButton).toHaveClass('text-on-primary-container');
      expect(tousButton).toHaveAttribute('aria-selected', 'true');
    });

    it('devrait appliquer la classe active à la catégorie sélectionnée', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Plats"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      const platsButton = screen.getByRole('tab', { name: 'Plats' });
      expect(platsButton).toHaveClass('bg-primary-container');
      expect(platsButton).toHaveAttribute('aria-selected', 'true');
    });

    it('devrait appliquer les classes non actives aux boutons non sélectionnés', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      const entreesButton = screen.getByRole('tab', { name: 'Entrées' });
      expect(entreesButton).toHaveClass('bg-surface-container-highest');
      expect(entreesButton).toHaveClass('text-on-surface-variant');
      expect(entreesButton).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Interactions', () => {
    it('devrait appeler onSelectCategory au clic sur "Tous"', async () => {
      // Arrange
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Plats"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Act
      await userEvent.click(screen.getByRole('tab', { name: 'Tous' }));

      // Assert
      expect(mockOnSelectCategory).toHaveBeenCalledWith('Tous');
    });

    it('devrait appeler onSelectCategory au clic sur une catégorie', async () => {
      // Arrange
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Act
      await userEvent.click(screen.getByRole('tab', { name: 'Desserts' }));

      // Assert
      expect(mockOnSelectCategory).toHaveBeenCalledWith('Desserts');
    });

    it('devrait être focusable au clavier', async () => {
      // Arrange
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Act
      await userEvent.tab();
      await userEvent.tab();

      // Assert
      expect(document.activeElement).toHaveAttribute('role', 'tab');
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir aria-label sur le tablist', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      expect(screen.getByRole('tablist')).toHaveAttribute(
        'aria-label',
        'Filtres de catégorie'
      );
    });

    it('devrait avoir aria-selected sur chaque tab', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('devrait avoir focus-visible pour la navigation au clavier', () => {
      // Arrange & Act
      render(
        <MenuFilters
          categories={categories}
          selectedCategory="Tous"
          onSelectCategory={mockOnSelectCategory}
        />
      );

      // Assert
      const tousButton = screen.getByRole('tab', { name: 'Tous' });
      expect(tousButton).toHaveClass('focus-visible:outline');
    });
  });
});

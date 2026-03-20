// src/components/admin/OrderFilters.test.tsx
// Tests unitaires pour le composant OrderFilters

import { type JSX, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderFilters, type OrderFiltersProps } from './OrderFilters';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE RENDER
// ─────────────────────────────────────────────────────────────────────────────

const renderOrderFilters = (
  propsOverrides: Partial<OrderFiltersProps> = {}
): RenderResult => {
  const defaultProps: OrderFiltersProps = {
    selectedStatus: 'all',
    onStatusChange: vi.fn(),
    searchQuery: '',
    onSearchChange: vi.fn(),
  };

  return render(
    <OrderFilters {...defaultProps} {...propsOverrides} />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('OrderFilters', () => {
  describe('Rendu initial', () => {
    it('devrait afficher le composant avec les labels Statut et Rechercher', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      expect(screen.getByText('Statut')).toBeInTheDocument();
      expect(screen.getByText('Rechercher')).toBeInTheDocument();
    });

    it('devrait afficher le select avec toutes les options de statut', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      const select = screen.getByRole('combobox', { name: /statut/i });
      expect(select).toBeInTheDocument();

      expect(screen.getByText('Toutes les commandes')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
      expect(screen.getByText('En préparation')).toBeInTheDocument();
      expect(screen.getByText('Prêt')).toBeInTheDocument();
    });

    it('devrait afficher le champ de recherche avec placeholder', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      const searchInput = screen.getByRole('textbox', {
        name: /rechercher/i,
      });
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'N° commande, table, client...'
      );
    });

    it('devrait avoir les attributs d\'accessibilité aria-label sur le conteneur', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      const region = screen.getByRole('search', { name: /filtres des commandes/i });
      expect(region).toBeInTheDocument();
    });
  });

  describe('Filtre par statut', () => {
    it('devrait afficher le statut sélectionné dans le select', () => {
      // Arrange & Act
      renderOrderFilters({ selectedStatus: 'en_attente' });

      // Assert
      const select = screen.getByRole('combobox', { name: /statut/i });
      expect(select).toHaveValue('en_attente');
    });

    it('devrait appeler onStatusChange quand on change le statut', async () => {
      // Arrange
      const user = userEvent.setup();
      const onStatusChange = vi.fn();
      renderOrderFilters({ onStatusChange });

      // Act
      const select = screen.getByRole('combobox', { name: /statut/i });
      await user.selectOptions(select, 'en_preparation');

      // Assert
      expect(onStatusChange).toHaveBeenCalledWith('en_preparation');
      expect(onStatusChange).toHaveBeenCalledTimes(1);
    });

    it('devrait appeler onStatusChange avec "all" quand on sélectionne toutes les commandes', async () => {
      // Arrange
      const user = userEvent.setup();
      const onStatusChange = vi.fn();
      renderOrderFilters({ selectedStatus: 'en_attente', onStatusChange });

      // Act
      const select = screen.getByRole('combobox', { name: /statut/i });
      await user.selectOptions(select, 'all');

      // Assert
      expect(onStatusChange).toHaveBeenCalledWith('all');
    });

    it('devrait appeler onStatusChange pour chaque option de statut', async () => {
      // Arrange
      const user = userEvent.setup();
      const onStatusChange = vi.fn();
      renderOrderFilters({ onStatusChange });

      // Act & Assert
      const select = screen.getByRole('combobox', { name: /statut/i });

      await user.selectOptions(select, 'en_attente');
      expect(onStatusChange).toHaveBeenCalledWith('en_attente');

      await user.selectOptions(select, 'en_preparation');
      expect(onStatusChange).toHaveBeenCalledWith('en_preparation');

      await user.selectOptions(select, 'pret');
      expect(onStatusChange).toHaveBeenCalledWith('pret');
    });
  });

  describe('Recherche', () => {
    it('devrait afficher la valeur de searchQuery dans le champ', () => {
      // Arrange & Act
      renderOrderFilters({ searchQuery: 'ORD-123' });

      // Assert
      const searchInput = screen.getByRole('textbox', { name: /rechercher/i });
      expect(searchInput).toHaveValue('ORD-123');
    });

    it('devrait appeler onSearchChange quand on tape dans le champ', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      renderOrderFilters({ onSearchChange });

      // Act
      const searchInput = screen.getByRole('textbox', { name: /rechercher/i });
      await user.type(searchInput, 'test');

      // Assert - onSearchChange est appelé pour chaque caractère tapé
      // Dans un composant contrôlé, chaque frappe appelle le callback avec le caractère
      expect(onSearchChange).toHaveBeenCalledTimes(4);
      expect(onSearchChange).toHaveBeenCalledWith('t');
      expect(onSearchChange).toHaveBeenCalledWith('e');
      expect(onSearchChange).toHaveBeenCalledWith('s');
      expect(onSearchChange).toHaveBeenCalledWith('t');
    });

    it('devrait afficher le bouton de réinitialisation quand il y a une recherche', () => {
      // Arrange & Act
      renderOrderFilters({ searchQuery: 'test' });

      // Assert
      const clearButton = screen.getByRole('button', { name: /effacer la recherche/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('ne devrait PAS afficher le bouton de réinitialisation quand la recherche est vide', () => {
      // Arrange & Act
      renderOrderFilters({ searchQuery: '' });

      // Assert
      const clearButton = screen.queryByRole('button', { name: /effacer la recherche/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('devrait appeler onSearchChange avec une chaîne vide au clic sur le bouton clear', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      renderOrderFilters({ searchQuery: 'test', onSearchChange });

      // Act
      const clearButton = screen.getByRole('button', { name: /effacer la recherche/i });
      await user.click(clearButton);

      // Assert
      expect(onSearchChange).toHaveBeenCalledWith('');
      expect(onSearchChange).toHaveBeenCalledTimes(1);
    });

    it('devrait avoir l\'icône de recherche visible', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      const searchIcon = screen.getByText('search', { exact: false });
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveClass('material-symbols-outlined');
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un label associé au select de statut', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      const label = screen.getByLabelText('Statut');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('id', 'status-filter');
    });

    it('devrait avoir un label associé au champ de recherche', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      const label = screen.getByLabelText('Rechercher');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('id', 'order-search');
    });

    it('devrait avoir des descriptions sr-only pour les filtres', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      expect(screen.getByText('Filtrer les commandes par statut')).toHaveClass('sr-only');
      expect(screen.getByText('Rechercher une commande par numéro, table ou nom de client')).toHaveClass('sr-only');
    });

    it('devrait avoir l\'icône de recherche avec aria-hidden', () => {
      // Arrange & Act
      renderOrderFilters();

      // Assert
      const searchIcon = screen.getByText('search', { exact: false });
      expect(searchIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Gestion des événements', () => {
    it('devrait gérer la saisie rapide sans erreur', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      renderOrderFilters({ onSearchChange });

      // Act
      const searchInput = screen.getByRole('textbox', { name: /rechercher/i });
      await user.type(searchInput, 'test');

      // Assert - onSearchChange est appelé, le composant est contrôlé donc la valeur
      // ne change pas visuellement sans state management, mais les callbacks sont appelés
      expect(onSearchChange).toHaveBeenCalled();
      expect(onSearchChange).toHaveBeenCalledWith('t');
    });

    it('devrait gérer les changements rapides de statut', async () => {
      // Arrange
      const user = userEvent.setup();
      const onStatusChange = vi.fn();
      renderOrderFilters({ onStatusChange });

      // Act
      const select = screen.getByRole('combobox', { name: /statut/i });
      await user.selectOptions(select, 'en_attente');
      await user.selectOptions(select, 'pret');

      // Assert
      expect(onStatusChange).toHaveBeenCalledTimes(2);
      expect(onStatusChange).toHaveBeenNthCalledWith(1, 'en_attente');
      expect(onStatusChange).toHaveBeenNthCalledWith(2, 'pret');
    });
  });
});

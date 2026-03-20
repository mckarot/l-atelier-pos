// src/components/layout/KDSSidebar.test.tsx
// Tests de composants pour KDSSidebar

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { KDSSidebar } from './KDSSidebar';

// Wrapper pour fournir le contexte de routing
function createWrapper(initialPath = '/kds') {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <div className="h-[600px]">
          <Routes>
            <Route path="*" element={children} />
          </Routes>
        </div>
      </MemoryRouter>
    );
  };
}

describe('KDSSidebar', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu de la sidebar', () => {
    it('devrait afficher le logo et le titre "L\'Atelier POS"', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('L\'Atelier POS')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Navigation principale KDS' })).toBeInTheDocument();
    });

    it('devrait afficher le sous-titre "Cuisine / KDS"', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('Cuisine / KDS')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône restaurant_menu dans le header', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const icons = screen.getAllByText('restaurant_menu');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Items de navigation', () => {
    it('devrait afficher 5 items de navigation', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('Menu')).toBeInTheDocument();
      expect(screen.getByText('Commandes')).toBeInTheDocument();
      expect(screen.getByText('Tables')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Paramètres')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Menu avec l\'icône menu_book', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink).toHaveAttribute('href', '/kds/menu');
      expect(screen.getByText('menu_book')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Commandes avec l\'icône receipt_long', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const commandesLink = screen.getByText('Commandes').closest('a');
      expect(commandesLink).toHaveAttribute('href', '/kds');
      expect(screen.getByText('receipt_long')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Tables avec l\'icône table_restaurant', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const tablesLink = screen.getByText('Tables').closest('a');
      expect(tablesLink).toHaveAttribute('href', '/kds/tables');
      expect(screen.getByText('table_restaurant')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Dashboard avec l\'icône dashboard', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/kds/dashboard');
      expect(screen.getByText('dashboard')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Paramètres avec l\'icône settings', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const parametresLink = screen.getByText('Paramètres').closest('a');
      expect(parametresLink).toHaveAttribute('href', '/kds/settings');
      expect(screen.getByText('settings')).toBeInTheDocument();
    });
  });

  describe('Item actif - styles', () => {
    it('devrait appliquer le style actif à l\'item Menu quand on est sur /kds/menu', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper('/kds/menu') });

      // Assert
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink).toHaveClass('border-r-2', 'border-primary');
      expect(menuLink).toHaveClass('font-bold');
    });

    it('devrait appliquer le style actif à l\'item Commandes quand on est sur /kds', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper('/kds') });

      // Assert
      const commandesLink = screen.getByText('Commandes').closest('a');
      expect(commandesLink).toHaveClass('border-r-2', 'border-primary');
      expect(commandesLink).toHaveClass('font-bold');
    });

    it('devrait appliquer le style actif à l\'item Dashboard quand on est sur /kds/dashboard', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper('/kds/dashboard') });

      // Assert
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('border-r-2', 'border-primary');
      expect(dashboardLink).toHaveClass('font-bold');
    });

    it('ne devrait pas appliquer le style actif aux items non actifs', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper('/kds') });

      // Assert
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink).not.toHaveClass('border-primary');
    });
  });

  describe('Bouton "Changer de rôle"', () => {
    it('devrait afficher le bouton "Changer de rôle"', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('Changer de rôle')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône logout sur le bouton', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('logout')).toBeInTheDocument();
    });

    it('devrait avoir un aria-label "Changer de rôle"', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByRole('button', { name: 'Changer de rôle' })).toBeInTheDocument();
    });

    it('devrait appeler onLogout au clic', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Act
      await user.click(screen.getByRole('button', { name: 'Changer de rôle' }));

      // Assert
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('devrait être cliquable', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Act & Assert
      const button = screen.getByRole('button', { name: 'Changer de rôle' });
      expect(button).toBeEnabled();
      await user.click(button);
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un rôle "navigation"', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByRole('navigation', { name: 'Navigation principale KDS' })).toBeInTheDocument();
    });

    it('devrait avoir un aria-label "Navigation principale KDS"', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByRole('navigation', { name: 'Navigation principale KDS' })).toBeInTheDocument();
    });

    it('devrait avoir des liens avec des href valides', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(5);
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Structure DOM', () => {
    it('devrait être un élément <aside>', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const navigation = screen.getByRole('navigation', { name: 'Navigation principale KDS' });
      expect(navigation.closest('aside')).toBeInTheDocument();
    });

    it('devrait avoir une classe de largeur w-64', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const navigation = screen.getByRole('navigation', { name: 'Navigation principale KDS' });
      expect(navigation.closest('aside')).toHaveClass('w-64');
    });

    it('devrait avoir un header avec border-b', () => {
      // Arrange & Act
      render(<KDSSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert - Le header contient la border-b
      const header = screen.getByText('L\'Atelier POS').closest('div');
      expect(header).toBeInTheDocument();
    });
  });
});

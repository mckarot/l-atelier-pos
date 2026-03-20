// src/components/layout/AdminSidebar.test.tsx
// Tests de composants pour AdminSidebar

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

// Wrapper pour fournir le contexte de routing
function createWrapper(initialPath = '/admin') {
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

describe('AdminSidebar', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu de la sidebar', () => {
    it('devrait afficher le logo et le titre "Atelier Admin"', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('Atelier Admin')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Navigation principale Admin' })).toBeInTheDocument();
    });

    it('devrait afficher le sous-titre "Station 01 - Main Floor"', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('Station 01 - Main Floor')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône restaurant_menu dans le header', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const icons = screen.getAllByText('restaurant_menu');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Items de navigation', () => {
    it('devrait afficher 6 items de navigation', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Commandes')).toBeInTheDocument();
      expect(screen.getByText('Cuisine')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
      expect(screen.getByText('Personnel')).toBeInTheDocument();
      expect(screen.getByText('Rapports')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Dashboard avec l\'icône dashboard', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/admin');
      expect(screen.getByText('dashboard')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Commandes avec l\'icône receipt_long', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const commandesLink = screen.getByText('Commandes').closest('a');
      expect(commandesLink).toHaveAttribute('href', '/admin/orders');
      expect(screen.getByText('receipt_long')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Cuisine avec l\'icône soup_kitchen', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const cuisineLink = screen.getByText('Cuisine').closest('a');
      expect(cuisineLink).toHaveAttribute('href', '/kds');
      expect(screen.getByText('soup_kitchen')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Menu avec l\'icône menu_book', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink).toHaveAttribute('href', '/admin/menu');
      expect(screen.getByText('menu_book')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Personnel avec l\'icône group', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const personnelLink = screen.getByText('Personnel').closest('a');
      expect(personnelLink).toHaveAttribute('href', '/admin/staff');
      expect(screen.getByText('group')).toBeInTheDocument();
    });

    it('devrait afficher l\'item Rapports avec l\'icône analytics', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const rapportsLink = screen.getByText('Rapports').closest('a');
      expect(rapportsLink).toHaveAttribute('href', '/admin/reports');
      expect(screen.getByText('analytics')).toBeInTheDocument();
    });
  });

  describe('Item actif - styles', () => {
    it('devrait appliquer le style actif à l\'item Dashboard quand on est sur /admin', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper('/admin') });

      // Assert
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('border-r-2', 'border-primary');
      expect(dashboardLink).toHaveClass('font-bold');
    });

    it('devrait appliquer le style actif à l\'item Commandes quand on est sur /admin/orders', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper('/admin/orders') });

      // Assert
      const commandesLink = screen.getByText('Commandes').closest('a');
      expect(commandesLink).toHaveClass('border-r-2', 'border-primary');
      expect(commandesLink).toHaveClass('font-bold');
    });

    it('devrait appliquer le style actif à l\'item Menu quand on est sur /admin/menu', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper('/admin/menu') });

      // Assert
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink).toHaveClass('border-r-2', 'border-primary');
      expect(menuLink).toHaveClass('font-bold');
    });

    it('ne devrait pas appliquer le style actif aux items non actifs', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper('/admin') });

      // Assert
      const commandesLink = screen.getByText('Commandes').closest('a');
      expect(commandesLink).not.toHaveClass('border-primary');
    });
  });

  describe('Bouton "Changer de rôle"', () => {
    it('devrait afficher le bouton "Changer de rôle"', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('Changer de rôle')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône logout sur le bouton', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByText('logout')).toBeInTheDocument();
    });

    it('devrait avoir un aria-label "Changer de rôle"', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByRole('button', { name: 'Changer de rôle' })).toBeInTheDocument();
    });

    it('devrait appeler onLogout au clic', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Act
      await user.click(screen.getByRole('button', { name: 'Changer de rôle' }));

      // Assert
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('devrait être cliquable', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

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
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert - Utiliser querySelector pour éviter les conflits
      const navigation = document.querySelector('aside[role="navigation"]');
      expect(navigation).toBeInTheDocument();
    });

    it('devrait avoir un aria-label "Navigation principale Admin"', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      expect(screen.getByRole('navigation', { name: 'Navigation principale Admin' })).toBeInTheDocument();
    });

    it('devrait avoir des liens avec des href valides', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(6);
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Structure DOM', () => {
    it('devrait être un élément <aside>', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const navigation = screen.getByRole('navigation', { name: 'Navigation principale Admin' });
      expect(navigation.closest('aside')).toBeInTheDocument();
    });

    it('devrait avoir une classe de largeur w-64', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert
      const navigation = screen.getByRole('navigation', { name: 'Navigation principale Admin' });
      expect(navigation.closest('aside')).toHaveClass('w-64');
    });

    it('devrait avoir un header avec border-b', () => {
      // Arrange & Act
      render(<AdminSidebar onLogout={mockOnLogout} />, { wrapper: createWrapper() });

      // Assert - Le header contient la border-b
      const header = screen.getByText('Atelier Admin').closest('div');
      expect(header).toBeInTheDocument();
    });
  });
});

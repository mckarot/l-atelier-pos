// src/components/layout/ClientSidebar.test.tsx
// Tests de composants pour ClientSidebar

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ClientSidebar } from './ClientSidebar';

describe('ClientSidebar', () => {
  const mockOnToggleTheme = vi.fn();

  beforeEach(() => {
    mockOnToggleTheme.mockClear();
    // Mock clearUserRole
    vi.mock('../../utils/roleGuard', () => ({
      clearUserRole: vi.fn(),
    }));
  });

  const renderWithRouter = (component: React.ReactElement, options?: { initialEntries?: string[] }) => {
    return render(
      <MemoryRouter initialEntries={options?.initialEntries || ['/']}>
        {component}
      </MemoryRouter>
    );
  };

  describe('Rendu de base', () => {
    it('devrait afficher le logo "L\'Atelier"', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByText('L\'Atelier')).toBeInTheDocument();
    });

    it('devrait afficher la version "SERVICE CLIENT V2.4"', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByText('SERVICE CLIENT V2.4')).toBeInTheDocument();
    });

    it('devrait afficher les 4 items de navigation', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByText('Menu')).toBeInTheDocument();
      expect(screen.getByText('Commandes')).toBeInTheDocument();
      expect(screen.getByText('Tables')).toBeInTheDocument();
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('devrait afficher l\'item actif avec la classe appropriée', () => {
      // Arrange & Act - Utiliser /client comme route initiale
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />,
        { initialEntries: ['/client'] }
      );

      // Assert - Le premier item (Menu) devrait être actif sur /client
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink).toHaveClass('border-primary');
      expect(menuLink).toHaveClass('bg-surface-container-highest');
    });

    it('devrait avoir des liens vers les bonnes routes', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByText('Menu').closest('a')).toHaveAttribute('href', '/client');
      expect(screen.getByText('Commandes').closest('a')).toHaveAttribute('href', '/client/orders');
      expect(screen.getByText('Tables').closest('a')).toHaveAttribute('href', '/client/tables');
      expect(screen.getByText('Tableau de bord').closest('a')).toHaveAttribute('href', '/client/dashboard');
    });
  });

  describe('Toggle thème', () => {
    it('devrait afficher "Thème Sombre" quand isDarkMode est false', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByText('Thème Sombre')).toBeInTheDocument();
    });

    it('devrait afficher "Mode Clair" quand isDarkMode est true', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={true}
        />
      );

      // Assert
      expect(screen.getByText('Mode Clair')).toBeInTheDocument();
    });

    it('devrait appeler onToggleTheme au clic', async () => {
      // Arrange
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Act
      await userEvent.click(screen.getByLabelText('Activer le mode sombre'));

      // Assert
      expect(mockOnToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Bouton Urgence', () => {
    it('devrait afficher le bouton "Urgence"', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByText('Urgence')).toBeInTheDocument();
    });

    it('devrait afficher l\'indicateur d\'urgence après clic', async () => {
      // Arrange
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Act
      await userEvent.click(screen.getByLabelText('Appeler un serveur en urgence'));

      // Assert
      expect(screen.getByText('URGENCE DEMANDÉE')).toBeInTheDocument();
    });
  });

  describe('Bouton Changer de rôle', () => {
    it('devrait afficher le bouton "Changer de rôle"', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByText('Changer de rôle')).toBeInTheDocument();
    });

    it('devrait avoir un aria-label "Se déconnecter"', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByLabelText('Se déconnecter')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un rôle navigation', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      expect(screen.getByRole('navigation', { name: 'Navigation principale Client' })).toBeInTheDocument();
    });

    it('devrait avoir aria-label sur la navigation', () => {
      // Arrange & Act
      renderWithRouter(
        <ClientSidebar
          onToggleTheme={mockOnToggleTheme}
          isDarkMode={false}
        />
      );

      // Assert
      const nav = screen.getByRole('navigation', { name: 'Navigation principale Client' });
      expect(nav).toHaveAttribute(
        'aria-label',
        'Navigation principale Client'
      );
    });
  });
});

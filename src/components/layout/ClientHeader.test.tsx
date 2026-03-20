// src/components/layout/ClientHeader.test.tsx
// Tests de composants pour ClientHeader

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientHeader } from './ClientHeader';

describe('ClientHeader', () => {
  const mockOnLogout = vi.fn();
  const mockCurrentTime = new Date('2024-01-15T14:30:00');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu du header', () => {
    it('devrait afficher le logo et le titre "L\'Atelier POS"', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      expect(screen.getByText('L\'Atelier POS')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône restaurant_menu dans le logo', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      expect(screen.getByText('restaurant_menu')).toBeInTheDocument();
    });
  });

  describe('Horloge temps réel', () => {
    it('devrait afficher l\'heure formatée HH:MM', () => {
      // Arrange
      const time = new Date('2024-01-15T14:30:00');

      // Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={time} />);

      // Assert - 14:30 en format français
      expect(screen.getByText('14:30')).toBeInTheDocument();
    });

    it('devrait afficher l\'heure avec zéro devant les minutes < 10', () => {
      // Arrange
      const time = new Date('2024-01-15T14:05:00');

      // Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={time} />);

      // Assert
      expect(screen.getByText('14:05')).toBeInTheDocument();
    });

    it('devrait afficher l\'heure avec zéro devant les heures < 10', () => {
      // Arrange
      const time = new Date('2024-01-15T09:30:00');

      // Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={time} />);

      // Assert
      expect(screen.getByText('09:30')).toBeInTheDocument();
    });

    it('devrait utiliser une balise <time> pour l\'horloge', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const timeElement = screen.getByText('14:30');
      expect(timeElement.tagName).toBe('TIME');
    });

    it('devrait avoir une classe font-mono pour l\'horloge', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const timeElement = screen.getByText('14:30');
      expect(timeElement).toHaveClass('font-mono');
    });
  });

  describe('Bouton de déconnexion', () => {
    it('devrait afficher le bouton logout', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      expect(screen.getByRole('button', { name: 'Se déconnecter' })).toBeInTheDocument();
    });

    it('devrait afficher l\'icône logout', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      expect(screen.getByLabelText('Se déconnecter').querySelector('.material-symbols-outlined')).toBeInTheDocument();
    });

    it('devrait avoir un aria-label "Se déconnecter"', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      expect(screen.getByRole('button', { name: 'Se déconnecter' })).toBeInTheDocument();
    });

    it('devrait appeler onLogout au clic', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Se déconnecter' }));

      // Assert
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('devrait être cliquable', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Act & Assert
      const button = screen.getByRole('button', { name: 'Se déconnecter' });
      expect(button).toBeEnabled();
      await user.click(button);
      expect(mockOnLogout).toHaveBeenCalled();
    });

    it('devrait avoir un effet hover avec bg-surface-container-highest', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const button = screen.getByRole('button', { name: 'Se déconnecter' });
      expect(button).toHaveClass('hover:bg-surface-container-highest');
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un rôle "banner"', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('devrait être un élément <header>', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      expect(screen.getByRole('banner').tagName).toBe('HEADER');
    });

    it('devrait avoir une structure flex', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Structure DOM', () => {
    it('devrait avoir une classe bg-surface-container-low', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-surface-container-low');
    });

    it('devrait avoir une border-b', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('border-b');
    });

    it('devrait avoir un padding px-6 py-4', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('px-6', 'py-4');
    });
  });

  describe('Layout', () => {
    it('devrait afficher le logo et l\'horloge + logout dans le header', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      expect(screen.getByText('restaurant_menu')).toBeInTheDocument();
      expect(screen.getByText('14:30')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Se déconnecter' })).toBeInTheDocument();
    });

    it('devrait avoir un gap-3 entre le logo et le titre', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const logoContainer = screen.getByText('restaurant_menu').closest('div');
      expect(logoContainer).toHaveClass('gap-3');
    });

    it('devrait avoir un gap-4 entre l\'horloge et le bouton logout', () => {
      // Arrange & Act
      render(<ClientHeader onLogout={mockOnLogout} currentTime={mockCurrentTime} />);

      // Assert
      const timeLogoutContainer = screen.getByText('14:30').closest('div');
      expect(timeLogoutContainer).toHaveClass('gap-4');
    });
  });
});

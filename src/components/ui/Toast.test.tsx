// src/components/ui/Toast.test.tsx
// Tests de composants pour Toast

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, ToastContainer } from './Toast';
import type { Toast as ToastType } from '../../context/ToastContext';

describe('Toast', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  describe('Rendu de base', () => {
    it('devrait afficher le message du toast', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Produit ajouté au panier',
        type: 'success',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByText('Produit ajouté au panier')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône de succès', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Succès',
        type: 'success',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByText('check_circle')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône d\'erreur', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Erreur',
        type: 'error',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByText('error')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône d\'avertissement', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Attention',
        type: 'warning',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByText('warning')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône d\'info', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Info',
        type: 'info',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByText('info')).toBeInTheDocument();
    });
  });

  describe('Bouton fermer', () => {
    it('devrait afficher le bouton fermer', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Test',
        type: 'info',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByLabelText('Fermer la notification')).toBeInTheDocument();
    });

    it('devrait appeler onDismiss au clic', async () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Test',
        type: 'info',
      };

      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Act
      await userEvent.click(screen.getByLabelText('Fermer la notification'));

      // Assert
      expect(mockOnDismiss).toHaveBeenCalledWith('1');
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir role="alert"', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Test',
        type: 'info',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('devrait avoir aria-live="polite"', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Test',
        type: 'info',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Styles par type', () => {
    it('devrait appliquer les classes success', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Succès',
        type: 'success',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('bg-tertiary-container');
    });

    it('devrait appliquer les classes error', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Erreur',
        type: 'error',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('bg-error-container');
    });

    it('devrait appliquer les classes warning', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Attention',
        type: 'warning',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('bg-primary-container');
    });

    it('devrait appliquer les classes info', () => {
      // Arrange
      const toast: ToastType = {
        id: '1',
        message: 'Info',
        type: 'info',
      };

      // Act
      render(
        <Toast
          toast={toast}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('bg-surface-container-highest');
    });
  });
});

describe('ToastContainer', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  describe('Rendu', () => {
    it('devrait retourner null si pas de toasts', () => {
      // Arrange & Act
      const { container } = render(
        <ToastContainer
          toasts={[]}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('devrait afficher un seul toast', () => {
      // Arrange
      const toasts: ToastType[] = [
        { id: '1', message: 'Test 1', type: 'info' },
      ];

      // Act
      render(
        <ToastContainer
          toasts={toasts}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    it('devrait afficher plusieurs toasts', () => {
      // Arrange
      const toasts: ToastType[] = [
        { id: '1', message: 'Test 1', type: 'info' },
        { id: '2', message: 'Test 2', type: 'success' },
        { id: '3', message: 'Test 3', type: 'error' },
      ];

      // Act
      render(
        <ToastContainer
          toasts={toasts}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByText('Test 1')).toBeInTheDocument();
      expect(screen.getByText('Test 2')).toBeInTheDocument();
      expect(screen.getByText('Test 3')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir role="region"', () => {
      // Arrange
      const toasts: ToastType[] = [
        { id: '1', message: 'Test', type: 'info' },
      ];

      // Act
      render(
        <ToastContainer
          toasts={toasts}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('devrait avoir aria-label="Notifications"', () => {
      // Arrange
      const toasts: ToastType[] = [
        { id: '1', message: 'Test', type: 'info' },
      ];

      // Act
      render(
        <ToastContainer
          toasts={toasts}
          onDismiss={mockOnDismiss}
        />
      );

      // Assert
      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-label',
        'Notifications'
      );
    });
  });
});

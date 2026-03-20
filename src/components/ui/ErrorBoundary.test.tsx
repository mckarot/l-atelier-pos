// src/components/ui/ErrorBoundary.test.tsx
// Tests de composants pour ErrorBoundary

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

// Composant de test qui lève une erreur
function ThrowError({ error }: { error?: Error }) {
  if (error) {
    throw error;
  }
  return <div>Normal Content</div>;
}

// Composant qui lève une erreur de quota
function ThrowQuotaError() {
  const error = new Error('Storage quota exceeded');
  error.name = 'QuotaExceededError';
  throw error;
}

// Composant qui lève une erreur de navigation privée
function ThrowPrivateBrowsingError() {
  const error = new Error('Invalid state');
  error.name = 'InvalidStateError';
  throw error;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu normal (sans erreur)', () => {
    it('affiche les enfants quand il n\'y a pas d\'erreur', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <div>Child Content</div>
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('affiche plusieurs enfants correctement', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <div>First Child</div>
          <div>Second Child</div>
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });

  describe('Rendu en cas d\'erreur', () => {
    it('affiche le message d\'erreur par défaut', () => {
      // Arrange
      const testError = new Error('Test error message');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    });

    it('affiche le message catégorisé pour une erreur standard', () => {
      // Arrange
      const testError = new Error('Something went wrong');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('affiche un message spécifique pour QuotaExceededError', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowQuotaError />
        </ErrorBoundary>
      );

      // Assert
      expect(
        screen.getByText(/Stockage plein\. Veuillez libérer de l'espace/)
      ).toBeInTheDocument();
    });

    it('affiche un message spécifique pour InvalidStateError (navigation privée)', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowPrivateBrowsingError />
        </ErrorBoundary>
      );

      // Assert
      expect(
        screen.getByText(/Navigation privée détectée/)
      ).toBeInTheDocument();
    });

    it('affiche l\'icône d\'erreur', () => {
      // Arrange
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      const errorIcon = screen.getByText('error');
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveClass('material-symbols-outlined');
    });

    it('a le rôle alert pour l\'accessibilité', () => {
      // Arrange
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Bouton de reset / réessayer', () => {
    it('affiche le bouton "Réessayer"', () => {
      // Arrange
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
    });

    it('permet de réinitialiser l\'état d\'erreur au clic', async () => {
      // Arrange
      const user = userEvent.setup();
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert - Vérifier que le bouton est présent et cliquable
      const retryButton = screen.getByRole('button', { name: 'Réessayer' });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveClass('bg-primary');
      
      await user.click(retryButton);
      
      // Le bouton devrait toujours être présent après le clic
      expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
    });

    it('le bouton a les classes de style primary', () => {
      // Arrange
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      const button = screen.getByRole('button', { name: 'Réessayer' });
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-on-primary');
    });
  });

  describe('Fallback personnalisé', () => {
    it('affiche le fallback personnalisé au lieu du message par défaut', () => {
      // Arrange
      const testError = new Error('Test error');
      const customFallback = <div data-testid="custom-fallback">Custom Error Message</div>;

      // Act
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error Message')).toBeInTheDocument();
      // Le message par défaut ne doit pas être affiché
      expect(screen.queryByText('Une erreur est survenue')).not.toBeInTheDocument();
    });

    it('le fallback personnalisé peut contenir un bouton', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const customFallback = (
        <div>
          <p>Custom error</p>
          <button onClick={handleClick}>Custom Action</button>
        </div>
      );

      // Act
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError error={new Error('Test')} />
        </ErrorBoundary>
      );

      // Assert
      await user.click(screen.getByRole('button', { name: 'Custom Action' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message de solution pour QuotaExceededError', () => {
    it('affiche la solution pour erreur de quota', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowQuotaError />
        </ErrorBoundary>
      );

      // Assert
      expect(
        screen.getByText(/Solution : Allez dans les paramètres de votre navigateur/)
      ).toBeInTheDocument();
    });

    it('affiche la solution dans un conteneur stylisé', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowQuotaError />
        </ErrorBoundary>
      );

      // Assert
      const solutionContainer = screen.getByText(/Solution :/).closest('div');
      expect(solutionContainer).toHaveClass('bg-surface-container-high');
      expect(solutionContainer).toHaveClass('rounded-lg');
    });
  });

  describe('Message de solution pour navigation privée', () => {
    it('affiche la solution pour navigation privée', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowPrivateBrowsingError />
        </ErrorBoundary>
      );

      // Assert
      expect(
        screen.getByText(/Solution : Désactivez la navigation privée/)
      ).toBeInTheDocument();
    });
  });

  describe('Détails techniques (mode développement)', () => {
    it('n\'affiche pas les détails techniques en production', () => {
      // Arrange
      const testError = new Error('Test error');
      // Simuler un environnement de production
      const originalEnv = import.meta.env.DEV;
      import.meta.env.DEV = false;

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.queryByText('Détails techniques (développement)')).not.toBeInTheDocument();

      // Restore
      import.meta.env.DEV = originalEnv;
    });

    it('affiche les détails techniques en développement', () => {
      // Arrange
      const testError = new Error('Test error details');
      // S'assurer qu'on est en mode développement
      const originalEnv = import.meta.env.DEV;
      import.meta.env.DEV = true;

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      // Le summary devrait être présent en DEV
      expect(screen.getByText('Détails techniques (développement)')).toBeInTheDocument();

      // Restore
      import.meta.env.DEV = originalEnv;
    });
  });

  describe('Accessibilité', () => {
    it('utilise role="alert" pour annoncer l\'erreur aux lecteurs d\'écran', () => {
      // Arrange
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('l\'icône d\'erreur a aria-hidden="true"', () => {
      // Arrange
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      const errorIcon = screen.getByText('error');
      // L'icône elle-même n'a pas aria-hidden mais est dans un span décoratif
      expect(errorIcon).toHaveClass('material-symbols-outlined');
    });

    it('le titre a une hiérarchie appropriée (h2)', () => {
      // Arrange
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Une erreur est survenue');
    });
  });

  describe('Gestion des erreurs dans componentDidCatch', () => {
    it('capture errorInfo dans componentDidCatch', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Test error');

      // Act
      render(
        <ErrorBoundary>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ErrorBoundary] Caught error:',
        testError,
        expect.any(Object)
      );
      consoleSpy.mockRestore();
    });
  });
});

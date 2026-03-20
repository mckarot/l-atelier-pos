// src/components/admin/StockAlert.test.tsx
// Tests unitaires pour le composant StockAlert

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { StockAlert } from '../../hooks/useKitchenMonitor';
import { StockAlert as StockAlertComponent } from './StockAlert';

// Helper pour créer une alerte de stock
function createStockAlert(overrides: Partial<StockAlert> = {}): StockAlert {
  return {
    depletedCount: 3,
    lowStockCount: 5,
    ...overrides,
  };
}

describe('StockAlert', () => {
  describe('Rendu de base', () => {
    it('affiche le titre "ALERTE STOCK CRITIQUE"', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('ALERTE STOCK CRITIQUE')).toBeInTheDocument();
    });

    it('affiche le message d\'alerte avec les counts', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 3, lowStockCount: 5 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText(/3 articles? sont épuisés/)).toBeInTheDocument();
      expect(screen.getByText(/5 articles? sont en dessous du seuil de sécurité/)).toBeInTheDocument();
    });

    it('utilise le rôle alert pour l\'accessibilité', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('affiche l\'icône warning', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('warning')).toBeInTheDocument();
    });
  });

  describe('Bouton "GÉRER LE STOCK"', () => {
    it('affiche le bouton "GÉRER LE STOCK"', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('GÉRER LE STOCK')).toBeInTheDocument();
    });

    it('affiche l\'icône inventory sur le bouton', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('inventory')).toBeInTheDocument();
    });

    it('appelle onManageStock quand on clique sur le bouton', () => {
      // Arrange
      const alert = createStockAlert();
      const onManageStock = vi.fn();

      // Act
      render(<StockAlertComponent alert={alert} onManageStock={onManageStock} />);
      screen.getByRole('button', { name: 'Gérer le stock' }).click();

      // Assert
      expect(onManageStock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message d\'alerte - Pluriel', () => {
    it('affiche "article" au singulier quand depletedCount = 1', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 1, lowStockCount: 0 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('1 article est épuisé')).toBeInTheDocument();
    });

    it('affiche "articles" au pluriel quand depletedCount > 1', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 2, lowStockCount: 0 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('2 articles sont épuisés')).toBeInTheDocument();
    });

    it('affiche "article" au singulier quand lowStockCount = 1', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 0, lowStockCount: 1 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('1 article est en dessous du seuil de sécurité')).toBeInTheDocument();
    });

    it('affiche "articles" au pluriel quand lowStockCount > 1', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 0, lowStockCount: 2 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('2 articles sont en dessous du seuil de sécurité')).toBeInTheDocument();
    });
  });

  describe('Affichage conditionnel', () => {
    it('n\'affiche pas l\'alerte quand depletedCount = 0 et lowStockCount = 0', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 0, lowStockCount: 0 });

      // Act
      const { container } = render(<StockAlertComponent alert={alert} />);

      // Assert - Le composant devrait être caché
      expect(container.querySelector('.hidden')).toBeInTheDocument();
    });

    it('affiche l\'alerte quand depletedCount > 0', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 1, lowStockCount: 0 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('affiche l\'alerte quand lowStockCount > 0', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 0, lowStockCount: 1 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('affiche seulement le message depleted quand lowStockCount = 0', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 3, lowStockCount: 0 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('3 articles sont épuisés')).toBeInTheDocument();
      expect(screen.queryByText(/sont en dessous du seuil de sécurité/)).not.toBeInTheDocument();
    });

    it('affiche seulement le message lowStock quand depletedCount = 0', () => {
      // Arrange
      const alert = createStockAlert({ depletedCount: 0, lowStockCount: 5 });

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByText('5 articles sont en dessous du seuil de sécurité')).toBeInTheDocument();
      expect(screen.queryByText(/sont épuisés/)).not.toBeInTheDocument();
    });
  });

  describe('Design system', () => {
    it('utilise bg-error-container pour le fond', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('bg-error-container');
    });

    it('utilise rounded-lg pour le border-radius', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('rounded-lg');
    });

    it('utilise font-label text-sm font-bold uppercase pour le titre', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert - Le titre devrait avoir les classes
      const title = screen.getByText('ALERTE STOCK CRITIQUE');
      expect(title).toHaveClass('font-label');
      expect(title).toHaveClass('text-sm');
      expect(title).toHaveClass('font-bold');
      expect(title).toHaveClass('uppercase');
    });

    it('utilise text-on-error-container pour le texte', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      const title = screen.getByText('ALERTE STOCK CRITIQUE');
      expect(title).toHaveClass('text-on-error-container');
    });
  });

  describe('Classes personnalisées', () => {
    it('fusionne les classes personnalisées avec les classes de base', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} className="custom-class" />);

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('custom-class');
      expect(screen.getByRole('alert')).toHaveClass('bg-error-container');
    });
  });

  describe('Accessibilité', () => {
    it('a un rôle alert', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('a aria-label "Alerte stock critique"', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert', { name: 'Alerte stock critique' })).toBeInTheDocument();
    });

    it('a aria-live="polite"', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('le bouton a aria-label "Gérer le stock"', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('button', { name: 'Gérer le stock' })).toBeInTheDocument();
    });
  });

  describe('Structure HTML', () => {
    it('a un layout flex avec justify-between', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('flex');
      expect(screen.getByRole('alert')).toHaveClass('justify-between');
    });

    it('a px-4 py-3 pour le padding', () => {
      // Arrange
      const alert = createStockAlert();

      // Act
      render(<StockAlertComponent alert={alert} />);

      // Assert
      expect(screen.getByRole('alert')).toHaveClass('px-4');
      expect(screen.getByRole('alert')).toHaveClass('py-3');
    });
  });
});

// src/components/client/OrderSummary.test.tsx
// Tests de composants pour OrderSummary

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderSummary } from './OrderSummary';

describe('OrderSummary', () => {
  const mockOnSetOrderType = vi.fn();

  beforeEach(() => {
    mockOnSetOrderType.mockClear();
  });

  const defaultProps = {
    subtotal: 50.00,
    tax: 5.00,
    total: 55.00,
    orderType: 'sur_place' as const,
    onSetOrderType: mockOnSetOrderType,
  };

  describe('Rendu de base', () => {
    it('devrait afficher le sous-total', () => {
      // Arrange & Act
      render(<OrderSummary {...defaultProps} />);

      // Assert
      expect(screen.getByText('Sous-total')).toBeInTheDocument();
      expect(screen.getByText('50.00€')).toBeInTheDocument();
    });

    it('devrait afficher la TVA', () => {
      // Arrange & Act
      render(<OrderSummary {...defaultProps} />);

      // Assert
      expect(screen.getByText('TVA (10%)')).toBeInTheDocument();
      expect(screen.getByText('5.00€')).toBeInTheDocument();
    });

    it('devrait afficher le total', () => {
      // Arrange & Act
      render(<OrderSummary {...defaultProps} />);

      // Assert
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('55.00€')).toBeInTheDocument();
    });

    it('devrait afficher les boutons de type de commande', () => {
      // Arrange & Act
      render(<OrderSummary {...defaultProps} />);

      // Assert
      expect(screen.getByRole('button', { name: 'SUR PLACE' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'À EMPORTER' })).toBeInTheDocument();
    });
  });

  describe('Type de commande', () => {
    it('devrait afficher "SUR PLACE" comme actif quand orderType est "sur_place"', () => {
      // Arrange & Act
      render(<OrderSummary {...defaultProps} />);

      // Assert
      const surPlaceButton = screen.getByRole('button', { name: 'SUR PLACE' });
      expect(surPlaceButton).toHaveClass('bg-primary');
      expect(surPlaceButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('devrait afficher "À EMPORTER" comme actif quand orderType est "emporter"', () => {
      // Arrange & Act
      render(
        <OrderSummary
          {...defaultProps}
          orderType="emporter"
        />
      );

      // Assert
      const emporterButton = screen.getByRole('button', { name: 'À EMPORTER' });
      expect(emporterButton).toHaveClass('bg-primary');
      expect(emporterButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('devrait appeler onSetOrderType au clic sur "SUR PLACE"', async () => {
      // Arrange
      render(
        <OrderSummary
          {...defaultProps}
          orderType="emporter"
        />
      );

      // Act
      await userEvent.click(screen.getByRole('button', { name: 'SUR PLACE' }));

      // Assert
      expect(mockOnSetOrderType).toHaveBeenCalledWith('sur_place');
    });

    it('devrait appeler onSetOrderType au clic sur "À EMPORTER"', async () => {
      // Arrange
      render(<OrderSummary {...defaultProps} />);

      // Act
      await userEvent.click(screen.getByRole('button', { name: 'À EMPORTER' }));

      // Assert
      expect(mockOnSetOrderType).toHaveBeenCalledWith('emporter');
    });
  });

  describe('Calculs', () => {
    it('devrait afficher les montants formatés avec 2 décimales', () => {
      // Arrange
      const props = {
        subtotal: 49.99,
        tax: 4.999,
        total: 54.989,
        orderType: 'sur_place' as const,
        onSetOrderType: mockOnSetOrderType,
      };

      // Act
      render(<OrderSummary {...props} />);

      // Assert
      expect(screen.getAllByText('49.99€')).toHaveLength(1);
      expect(screen.getAllByText('5.00€')).toHaveLength(1); // Arrondi
      expect(screen.getAllByText('54.99€')).toHaveLength(1); // Arrondi
    });

    it('devrait afficher 0.00€ pour un panier vide', () => {
      // Arrange
      const props = {
        subtotal: 0,
        tax: 0,
        total: 0,
        orderType: 'sur_place' as const,
        onSetOrderType: mockOnSetOrderType,
      };

      // Act
      render(<OrderSummary {...props} />);

      // Assert
      expect(screen.getAllByText('0.00€')).toHaveLength(3);
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir aria-pressed sur les boutons de type de commande', () => {
      // Arrange & Act
      render(<OrderSummary {...defaultProps} />);

      // Assert
      const surPlaceButton = screen.getByRole('button', { name: 'SUR PLACE' });
      const emporterButton = screen.getByRole('button', { name: 'À EMPORTER' });

      expect(surPlaceButton).toHaveAttribute('aria-pressed', 'true');
      expect(emporterButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('devrait avoir focus-visible pour la navigation au clavier', () => {
      // Arrange & Act
      render(<OrderSummary {...defaultProps} />);

      // Assert
      const surPlaceButton = screen.getByRole('button', { name: 'SUR PLACE' });
      expect(surPlaceButton).toHaveClass('focus-visible:outline');
    });
  });
});

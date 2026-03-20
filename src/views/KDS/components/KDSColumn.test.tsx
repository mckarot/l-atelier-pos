// src/views/KDS/components/KDSColumn.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KDSColumn } from './KDSColumn';

describe('KDSColumn component', () => {
  const defaultProps = {
    title: 'À PRÉPARER',
    indicatorColor: 'bg-amber-500',
    titleColor: 'text-on-surface/40',
    count: 3,
    children: <div data-testid="column-content">Content</div>,
  };

  describe('rendering', () => {
    it('devrait afficher le titre de la colonne', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByText('À PRÉPARER')).toBeInTheDocument();
    });

    it('devrait avoir un aria-label avec le titre de la colonne', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByLabelText('Colonne: À PRÉPARER')).toBeInTheDocument();
    });

    it('devrait avoir un rôle region', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('devrait afficher le compteur d\'items', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByText('03')).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('devrait avoir un point indicateur avec la couleur spécifiée', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert - Le point indicateur existe avec la bonne classe
      const container = screen.getByLabelText('Colonne: À PRÉPARER');
      const dot = container.querySelector('.bg-amber-500');
      expect(dot).toBeTruthy();
    });

    it('devrait avoir le titre en uppercase et font-bold', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const title = screen.getByText('À PRÉPARER');
      expect(title).toHaveClass('uppercase', 'font-bold');
    });

    it('devrait avoir le titre avec text-on-surface/40 par défaut', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const title = screen.getByText('À PRÉPARER');
      expect(title).toHaveClass('text-on-surface/40');
    });

    it('devrait avoir le compteur avec text-2xl et font-black', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const countElement = screen.getByText('03');
      expect(countElement).toHaveClass('text-2xl', 'font-black');
    });

    it('devrait avoir le compteur avec leading-none', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const countElement = screen.getByText('03');
      expect(countElement).toHaveClass('leading-none');
    });
  });

  describe('average time badge', () => {
    it('devrait afficher le badge MOY quand averageTimeMinutes est fourni', () => {
      // Arrange
      const props = {
        ...defaultProps,
        averageTimeMinutes: 8,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      expect(screen.getByText('MOY: 8 MIN')).toBeInTheDocument();
    });

    it('devrait avoir le badge avec bg-primary/10 et text-primary', () => {
      // Arrange
      const props = {
        ...defaultProps,
        averageTimeMinutes: 8,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      const badge = screen.getByText('MOY: 8 MIN');
      expect(badge).toHaveClass('bg-primary/10', 'text-primary');
    });

    it('devrait avoir le badge avec font-mono et text-xs', () => {
      // Arrange
      const props = {
        ...defaultProps,
        averageTimeMinutes: 8,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      const badge = screen.getByText('MOY: 8 MIN');
      expect(badge).toHaveClass('font-mono', 'text-xs');
    });

    it('devrait NE PAS afficher le badge quand averageTimeMinutes n\'est pas fourni', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.queryByText('MOY:')).not.toBeInTheDocument();
    });
  });

  describe('content rendering', () => {
    it('devrait afficher le contenu children quand count > 0', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('column-content')).toBeInTheDocument();
    });

    it('devrait afficher "Aucune commande" quand count = 0', () => {
      // Arrange
      const props = {
        ...defaultProps,
        count: 0,
        children: null,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      expect(screen.getByText('Aucune commande')).toBeInTheDocument();
    });

    it('devrait avoir un rôle status sur le message vide', () => {
      // Arrange
      const props = {
        ...defaultProps,
        count: 0,
        children: null,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      expect(screen.getByText('Aucune commande').closest('[role="status"]')).toBeInTheDocument();
    });

    it('devrait avoir aria-live="polite" sur le message vide', () => {
      // Arrange
      const props = {
        ...defaultProps,
        count: 0,
        children: null,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      const emptyMessage = screen.getByText('Aucune commande').parentElement;
      expect(emptyMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('devrait afficher un message personnalisé quand la colonne est vide', () => {
      // Arrange
      const props = {
        ...defaultProps,
        count: 0,
        children: null,
        emptyMessage: 'En attente de commandes...',
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      expect(screen.getByText('En attente de commandes...')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('devrait avoir bg-surface-container-low pour le fond', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('bg-surface-container-low');
    });

    it('devrait avoir rounded-xl pour les bords arrondis', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('rounded-xl');
    });

    it('devrait avoir shadow-2xl pour l\'ombre', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('shadow-2xl');
    });

    it('devrait avoir overflow-hidden', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('overflow-hidden');
    });

    it('devrait avoir flex flex-col h-full', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('flex', 'flex-col', 'h-full');
    });
  });

  describe('header styling', () => {
    it('devrait avoir une bordure inférieure sur l\'en-tête', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const header = screen.getByText('À PRÉPARER').closest('header');
      expect(header).toHaveClass('border-b');
    });

    it('devrait avoir p-4 pour le padding de l\'en-tête', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const header = screen.getByText('À PRÉPARER').closest('header');
      expect(header).toHaveClass('p-4');
    });
  });

  describe('body styling', () => {
    it('devrait avoir overflow-y-auto pour le corps', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const body = screen.getByTestId('column-content').parentElement;
      expect(body).toHaveClass('overflow-y-auto');
    });

    it('devrait avoir p-4 pour le padding du corps', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const body = screen.getByTestId('column-content').parentElement;
      expect(body).toHaveClass('p-4');
    });

    it('devrait avoir space-y-4 pour l\'espacement des items', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} />);

      // Assert
      const body = screen.getByTestId('column-content').parentElement;
      expect(body).toHaveClass('space-y-4');
    });
  });

  describe('className prop', () => {
    it('devrait appliquer une className supplémentaire', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} className="custom-class" />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('custom-class');
    });

    it('devrait conserver les classes par défaut', () => {
      // Arrange & Act
      render(<KDSColumn {...defaultProps} className="custom-class" />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('flex', 'flex-col', 'h-full');
    });
  });

  describe('count formatting', () => {
    it('devrait afficher "00" pour count=0', () => {
      // Arrange
      const props = {
        ...defaultProps,
        count: 0,
        children: null,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      expect(screen.getByText('00')).toBeInTheDocument();
    });

    it('devrait afficher "05" pour count=5', () => {
      // Arrange
      const props = {
        ...defaultProps,
        count: 5,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      expect(screen.getByText('05')).toBeInTheDocument();
    });

    it('devrait afficher "12" pour count=12', () => {
      // Arrange
      const props = {
        ...defaultProps,
        count: 12,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('devrait afficher "99" pour count=99', () => {
      // Arrange
      const props = {
        ...defaultProps,
        count: 99,
      };

      // Act
      render(<KDSColumn {...props} />);

      // Assert
      expect(screen.getByText('99')).toBeInTheDocument();
    });
  });
});

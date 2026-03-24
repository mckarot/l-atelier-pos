// src/views/KDS/components/OrderCard.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard } from './OrderCard';
import type { Order } from '../../../firebase/types';

describe('OrderCard component', () => {
  const mockOrder: Order = {
    id: 42,
    tableId: 7,
    customerName: 'Pierre D.',
    status: 'attente',
    items: [
      { name: 'Tartare de Saumon', quantity: 2, customization: 'Sans citron' },
      { name: 'Filet de Boeuf', quantity: 1 },
    ],
    total: 45.50,
    createdAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
    updatedAt: Date.now(),
  };

  const FIXED_TIME = 1700000000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('devrait afficher le numéro de commande', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByText('#ORD-0042')).toBeInTheDocument();
    });

    it('devrait afficher le nom de la table et du client', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByText('Table 7 — Pierre D.')).toBeInTheDocument();
    });

    it('devrait avoir un aria-label avec le numéro de commande et de table', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByLabelText('Commande 42, table 7')).toBeInTheDocument();
    });

    it('devrait avoir un rôle article', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('order items', () => {
    it('devrait afficher la liste des items de la commande', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByText('Tartare de Saumon')).toBeInTheDocument();
      expect(screen.getByText('Filet de Boeuf')).toBeInTheDocument();
    });

    it('devrait afficher la quantité avec "x" pour chaque item', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByText('x2')).toBeInTheDocument();
      expect(screen.getByText('x1')).toBeInTheDocument();
    });

    it('devrait afficher la personnalisation si présente', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByText('Sans citron')).toBeInTheDocument();
    });

    it('devrait avoir la personnalisation en italique avec border-l-2', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      const customization = screen.getByText('Sans citron');
      expect(customization).toHaveClass('italic', 'border-l-2', 'border-secondary', 'pl-2');
    });

    it('devrait avoir la personnalisation avec text-secondary font-bold uppercase', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      const customization = screen.getByText('Sans citron');
      expect(customization).toHaveClass('text-secondary', 'font-bold', 'uppercase');
    });

    it('devrait NE PAS afficher de personnalisation si absente', () => {
      // Arrange
      const orderWithoutCustomization: Order = {
        ...mockOrder,
        items: [{ name: 'Filet de Boeuf', quantity: 1 }],
      };

      // Act
      render(<OrderCard order={orderWithoutCustomization} mode="attente" />);

      // Assert
      expect(screen.queryByText(/bg-surface-container/)).not.toBeInTheDocument();
    });

    it('devrait avoir une bordure inférieure entre les items', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert - Vérifier qu'il y a des séparateurs entre les items
      const article = screen.getByRole('article');
      const separators = article.querySelectorAll('.border-b');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  describe('timer', () => {
    it('devrait afficher le Timer component', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('devrait passer createdAt au Timer', () => {
      // Arrange
      const createdAt = 1000000000000;
      const orderWithTime: Order = {
        ...mockOrder,
        createdAt,
      };

      // Act
      render(<OrderCard order={orderWithTime} mode="attente" />);

      // Assert
      // Le timer devrait afficher le temps écoulé
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('action buttons - mode attente', () => {
    it('devrait afficher le bouton "DÉTAILS" en mode attente', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      expect(screen.getByText('DÉTAILS')).toBeInTheDocument();
    });

    it('devrait afficher le bouton "LANCER" en mode attente', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      expect(screen.getByText('LANCER')).toBeInTheDocument();
    });

    it('devrait appeler onLaunch quand on clique sur LANCER', () => {
      // Arrange
      const onLaunch = vi.fn();

      // Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={onLaunch} />);
      fireEvent.click(screen.getByText('LANCER'));

      // Assert
      expect(onLaunch).toHaveBeenCalledWith(42);
    });

    it('devrait avoir un aria-label sur le bouton LANCER', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      const button = screen.getByText('LANCER').closest('button');
      expect(button).toHaveAttribute('aria-label', 'Lancer la préparation de la commande 42');
    });

    it('devrait avoir un aria-label sur le bouton DÉTAILS', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      const button = screen.getByText('DÉTAILS').closest('button');
      expect(button).toHaveAttribute('aria-label', 'Voir les détails de la commande 42');
    });

    it('devrait NE PAS afficher le bouton TERMINER en mode attente', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.queryByText('TERMINER')).not.toBeInTheDocument();
    });

    it('devrait NE PAS afficher de bouton si onLaunch n\'est pas fourni', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.queryByText('LANCER')).not.toBeInTheDocument();
      expect(screen.queryByText('DÉTAILS')).not.toBeInTheDocument();
    });
  });

  describe('action buttons - mode preparation', () => {
    const orderInPreparation: Order = {
      ...mockOrder,
      status: 'preparation',
    };

    it('devrait afficher le bouton "AIDE" en mode preparation', () => {
      // Arrange & Act
      render(<OrderCard order={orderInPreparation} mode="preparation" onComplete={vi.fn()} />);

      // Assert
      expect(screen.getByText('AIDE')).toBeInTheDocument();
    });

    it('devrait afficher le bouton "TERMINER" en mode preparation', () => {
      // Arrange & Act
      render(<OrderCard order={orderInPreparation} mode="preparation" onComplete={vi.fn()} />);

      // Assert
      expect(screen.getByText('TERMINER')).toBeInTheDocument();
    });

    it('devrait appeler onComplete quand on clique sur TERMINER', () => {
      // Arrange
      const onComplete = vi.fn();

      // Act
      render(<OrderCard order={orderInPreparation} mode="preparation" onComplete={onComplete} />);
      fireEvent.click(screen.getByText('TERMINER'));

      // Assert
      expect(onComplete).toHaveBeenCalledWith(42);
    });

    it('devrait avoir un aria-label sur le bouton TERMINER', () => {
      // Arrange & Act
      render(<OrderCard order={orderInPreparation} mode="preparation" onComplete={vi.fn()} />);

      // Assert
      const button = screen.getByText('TERMINER').closest('button');
      expect(button).toHaveAttribute('aria-label', 'Marquer la commande 42 comme prête');
    });

    it('devrait avoir un aria-label sur le bouton AIDE', () => {
      // Arrange & Act
      render(<OrderCard order={orderInPreparation} mode="preparation" onComplete={vi.fn()} />);

      // Assert
      const button = screen.getByText('AIDE').closest('button');
      expect(button).toHaveAttribute('aria-label', 'Demander de l\'aide pour la commande 42');
    });

    it('devrait NE PAS afficher le bouton LANCER en mode preparation', () => {
      // Arrange & Act
      render(<OrderCard order={orderInPreparation} mode="preparation" />);

      // Assert
      expect(screen.queryByText('LANCER')).not.toBeInTheDocument();
    });

    it('devrait NE PAS afficher de bouton si onComplete n\'est pas fourni', () => {
      // Arrange & Act
      render(<OrderCard order={orderInPreparation} mode="preparation" />);

      // Assert
      expect(screen.queryByText('TERMINER')).not.toBeInTheDocument();
      expect(screen.queryByText('AIDE')).not.toBeInTheDocument();
    });
  });

  describe('mode pret', () => {
    const orderReady: Order = {
      ...mockOrder,
      status: 'pret',
    };

    it('devrait NE PAS afficher de bouton en mode pret', () => {
      // Arrange & Act
      render(<OrderCard order={orderReady} mode="pret" />);

      // Assert
      expect(screen.queryByText('Commencer')).not.toBeInTheDocument();
      expect(screen.queryByText('Prêt')).not.toBeInTheDocument();
    });
  });

  describe('border-left styling based on mode and alert status', () => {
    it('devrait avoir border-l-4', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border-l-4');
    });

    it('devrait avoir border-on-surface-variant/20 en mode attente normal', () => {
      // Arrange - Commande récente (moins de 10 minutes)
      const recentOrder: Order = {
        ...mockOrder,
        createdAt: FIXED_TIME - 5 * 60 * 1000,
      };

      // Act
      render(<OrderCard order={recentOrder} mode="attente" />);

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border-on-surface-variant/20');
    });

    it('devrait avoir border-secondary en mode attente warning', () => {
      // Arrange - Commande entre 10 et 20 minutes
      const warningOrder: Order = {
        ...mockOrder,
        createdAt: FIXED_TIME - 15 * 60 * 1000,
      };

      // Act
      render(<OrderCard order={warningOrder} mode="attente" />);

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border-secondary');
    });

    it('devrait avoir border-error en mode attente danger', () => {
      // Arrange - Commande > 20 minutes
      const dangerOrder: Order = {
        ...mockOrder,
        createdAt: FIXED_TIME - 25 * 60 * 1000,
      };

      // Act
      render(<OrderCard order={dangerOrder} mode="attente" />);

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border-error');
    });

    it('devrait avoir border-primary/40 en mode preparation', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="preparation" />);

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border-primary/40');
    });

    it('devrait avoir border-error en mode preparation danger', () => {
      // Arrange
      const dangerOrder: Order = {
        ...mockOrder,
        createdAt: FIXED_TIME - 25 * 60 * 1000,
      };

      // Act
      render(<OrderCard order={dangerOrder} mode="preparation" />);

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border-error');
    });

    it('devrait avoir border-tertiary/20 en mode pret', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="pret" />);

      // Assert
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border-tertiary/20');
    });
  });

  describe('text color based on alert status', () => {
    it('devrait avoir text-primary pour le numéro de commande', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      const commandeText = screen.getByText('#ORD-0042');
      expect(commandeText).toHaveClass('text-primary');
    });

    it('devrait avoir font-mono et text-xs pour le numéro de commande', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      const commandeText = screen.getByText('#ORD-0042');
      expect(commandeText).toHaveClass('font-mono', 'text-xs');
    });

    it('devrait avoir font-bold pour le numéro de commande', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      const commandeText = screen.getByText('#ORD-0042');
      expect(commandeText).toHaveClass('font-bold');
    });
  });

  describe('button styling', () => {
    it('devrait avoir le bouton LANCER avec bg-primary-container text-on-primary-container', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      const button = screen.getByText('LANCER').closest('button');
      expect(button).toHaveClass('bg-primary-container', 'text-on-primary-container');
    });

    it('devrait avoir le bouton TERMINER avec bg-tertiary-container text-on-tertiary-container', () => {
      // Arrange
      const orderInPreparation: Order = {
        ...mockOrder,
        status: 'preparation',
      };

      // Act
      render(<OrderCard order={orderInPreparation} mode="preparation" onComplete={vi.fn()} />);

      // Assert
      const button = screen.getByText('TERMINER').closest('button');
      expect(button).toHaveClass('bg-tertiary-container', 'text-on-tertiary-container');
    });

    it('devrait avoir le bouton DÉTAILS avec bg-surface-variant text-on-surface', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      const button = screen.getByText('DÉTAILS').closest('button');
      expect(button).toHaveClass('bg-surface-variant', 'text-on-surface');
    });

    it('devrait avoir le bouton AIDE avec bg-surface-variant text-on-surface', () => {
      // Arrange
      const orderInPreparation: Order = {
        ...mockOrder,
        status: 'preparation',
      };

      // Act
      render(<OrderCard order={orderInPreparation} mode="preparation" onComplete={vi.fn()} />);

      // Assert
      const button = screen.getByText('AIDE').closest('button');
      expect(button).toHaveClass('bg-surface-variant', 'text-on-surface');
    });

    it('devrait avoir hover:brightness-110 sur les boutons', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      const button = screen.getByText('LANCER').closest('button');
      expect(button).toHaveClass('hover:brightness-110');
    });

    it('devrait avoir active:scale-[0.98] sur les boutons', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      const button = screen.getByText('LANCER').closest('button');
      expect(button).toHaveClass('active:scale-[0.98]');
    });
  });

  describe('common styling', () => {
    it('devrait avoir bg-surface-container-highest', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('bg-surface-container-highest');
    });

    it('devrait avoir rounded-lg', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('rounded-lg');
    });

    it('devrait avoir shadow-lg', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('shadow-lg');
    });

    it('devrait avoir overflow-hidden', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('overflow-hidden');
    });
  });

  describe('header and footer sections', () => {
    it('devrait avoir un header avec l\'ordre number', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" />);

      // Assert
      expect(screen.getByText('#ORD-0042')).toBeInTheDocument();
    });

    it('devrait avoir un footer avec les boutons en mode attente', () => {
      // Arrange & Act
      render(<OrderCard order={mockOrder} mode="attente" onLaunch={vi.fn()} />);

      // Assert
      expect(screen.getByText('DÉTAILS')).toBeInTheDocument();
      expect(screen.getByText('LANCER')).toBeInTheDocument();
    });

    it('devrait avoir un footer avec les boutons en mode preparation', () => {
      // Arrange
      const orderInPreparation: Order = {
        ...mockOrder,
        status: 'preparation',
      };

      // Act
      render(<OrderCard order={orderInPreparation} mode="preparation" onComplete={vi.fn()} />);

      // Assert
      expect(screen.getByText('AIDE')).toBeInTheDocument();
      expect(screen.getByText('TERMINER')).toBeInTheDocument();
    });
  });
});

// src/components/ui/Button.test.tsx
// Tests de composants pour le bouton Button

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendu de base', () => {
    it('affiche le bouton avec le texte enfant', () => {
      // Arrange
      const buttonText = 'Click me';

      // Act
      render(<Button>{buttonText}</Button>);

      // Assert
      expect(screen.getByRole('button', { name: buttonText })).toBeInTheDocument();
    });

    it('utilise le variant primary par défaut', () => {
      // Arrange & Act
      render(<Button>Default Button</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-on-primary');
    });

    it('utilise la taille md par défaut', () => {
      // Arrange & Act
      render(<Button>Default Size</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2.5');
      expect(button).toHaveClass('text-sm');
    });
  });

  describe('Variants', () => {
    it('applique les classes du variant primary', () => {
      // Arrange & Act
      render(<Button variant="primary">Primary</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-on-primary');
    });

    it('applique les classes du variant secondary', () => {
      // Arrange & Act
      render(<Button variant="secondary">Secondary</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
      expect(button).toHaveClass('text-on-secondary');
    });

    it('applique les classes du variant tertiary', () => {
      // Arrange & Act
      render(<Button variant="tertiary">Tertiary</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-tertiary');
      expect(button).toHaveClass('text-on-tertiary');
    });

    it('applique les classes du variant ghost', () => {
      // Arrange & Act
      render(<Button variant="ghost">Ghost</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-on-surface-variant');
    });

    it('applique les classes du variant danger', () => {
      // Arrange & Act
      render(<Button variant="danger">Danger</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-error');
      expect(button).toHaveClass('text-on-error');
    });
  });

  describe('Tailles', () => {
    it('applique les classes de taille sm', () => {
      // Arrange & Act
      render(<Button size="sm">Small</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-xs');
    });

    it('applique les classes de taille md', () => {
      // Arrange & Act
      render(<Button size="md">Medium</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2.5');
      expect(button).toHaveClass('text-sm');
    });

    it('applique les classes de taille lg', () => {
      // Arrange & Act
      render(<Button size="lg">Large</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-base');
    });
  });

  describe('État disabled', () => {
    it('applique l\'attribut disabled quand la prop disabled est true', () => {
      // Arrange & Act
      render(<Button disabled>Disabled</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applique les classes de style disabled', () => {
      // Arrange & Act
      render(<Button disabled>Disabled</Button>);

      // Assert
      const button = screen.getByRole('button');
      // Les classes disabled: sont des variantes conditionnelles dans Tailwind
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('désactive le bouton quand isLoading est true', () => {
      // Arrange & Act
      render(<Button isLoading>Loading</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('priorise disabled explicite sur isLoading', () => {
      // Arrange & Act
      render(<Button disabled={true} isLoading={false}>Disabled</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('État isLoading', () => {
    it('affiche le spinner de chargement quand isLoading est true', () => {
      // Arrange & Act
      render(<Button isLoading>Chargement…</Button>);

      // Assert
      expect(screen.getByText('Chargement…')).toBeInTheDocument();
      const spinner = document.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('n\'affiche pas le spinner quand isLoading est false', () => {
      // Arrange & Act
      render(<Button isLoading={false}>Normal</Button>);

      // Assert
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    it('affiche le texte "Chargement…" pendant le chargement', () => {
      // Arrange & Act
      render(<Button isLoading>Cliquez ici</Button>);

      // Assert
      expect(screen.queryByText('Cliquez ici')).not.toBeInTheDocument();
      expect(screen.getByText('Chargement…')).toBeInTheDocument();
    });
  });

  describe('Propriété fullWidth', () => {
    it('applique la classe w-full quand fullWidth est true', () => {
      // Arrange & Act
      render(<Button fullWidth>Full Width</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('n\'applique pas w-full quand fullWidth est false', () => {
      // Arrange & Act
      render(<Button fullWidth={false}>Normal Width</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Accessibilité', () => {
    it('a un rôle button', () => {
      // Arrange & Act
      render(<Button>Test</Button>);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('a une hauteur minimale de 44px pour l\'accessibilité tactile', () => {
      // Arrange & Act
      render(<Button>Accessible</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('a des styles focus-visible pour la navigation au clavier', () => {
      // Arrange & Act
      render(<Button>Keyboard</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline');
      expect(button).toHaveClass('focus-visible:outline-2');
    });
  });

  describe('Interactions', () => {
    it('appelle onClick au clic', async () => {
      // Arrange
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      // Act
      await userEvent.click(screen.getByRole('button'));

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('n\'appelle pas onClick quand disabled', async () => {
      // Arrange
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      // Act
      await userEvent.click(screen.getByRole('button'));

      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('n\'appelle pas onClick quand isLoading', async () => {
      // Arrange
      const handleClick = vi.fn();
      render(<Button isLoading onClick={handleClick}>Loading</Button>);

      // Act
      await userEvent.click(screen.getByRole('button'));

      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('applique l\'effet active:scale au clic', async () => {
      // Arrange
      render(<Button>Click</Button>);
      const button = screen.getByRole('button');

      // Act
      await userEvent.click(button);

      // Assert
      expect(button).toHaveClass('active:scale-[0.98]');
    });
  });

  describe('Classes personnalisées', () => {
    it('fusionne les classes personnalisées avec les classes de base', () => {
      // Arrange & Act
      render(<Button className="custom-class">Custom</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-primary'); // classe de base toujours présente
    });

    it('permet de surcharger certaines classes', () => {
      // Arrange & Act
      render(<Button className="bg-red-500">Red</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500');
    });
  });

  describe('Props HTML natives', () => {
    it('transmet les props HTML au bouton', () => {
      // Arrange & Act
      render(<Button type="submit" name="submit-btn">Submit</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submit-btn');
    });

    it('transmet aria-label au bouton', () => {
      // Arrange & Act
      render(<Button aria-label="Custom label">Test</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('transmet data-testid au bouton', () => {
      // Arrange & Act
      render(<Button data-testid="test-button">Test</Button>);

      // Assert
      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
    });
  });
});

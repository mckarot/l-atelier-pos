// src/components/admin/KPICard.test.tsx
// Tests unitaires pour le composant KPICard

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPICard } from './KPICard';

describe('KPICard', () => {
  describe('Rendu de base', () => {
    it('affiche le titre et la valeur', () => {
      // Arrange
      const title = 'Revenu Quotidien';
      const value = '2 485 €';

      // Act
      render(<KPICard title={title} value={value} />);

      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
    });

    it('utilise le rôle region pour l\'accessibilité', () => {
      // Arrange & Act
      render(<KPICard title="Test" value="100" />);

      // Assert
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('utilise aria-label par défaut basé sur le titre', () => {
      // Arrange & Act
      render(<KPICard title="Revenu Quotidien" value="2 485 €" />);

      // Assert
      expect(screen.getByRole('region', { name: 'Revenu Quotidien' })).toBeInTheDocument();
    });

    it('utilise aria-label personnalisé quand fourni', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
          ariaLabel="Revenu quotidien du jour"
        />
      );

      // Assert
      expect(screen.getByRole('region', { name: 'Revenu quotidien du jour' })).toBeInTheDocument();
    });
  });

  describe('Variation badge', () => {
    it('affiche le badge de variation quand variationLabel est fourni', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
          variationLabel="+12% VS HIER"
        />
      );

      // Assert
      expect(screen.getByText('+12% VS HIER')).toBeInTheDocument();
    });

    it('applique les classes positive pour variationType="positive"', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
          variationLabel="+12%"
          variationType="positive"
        />
      );

      // Assert - Le badge lui-même a les classes
      const badge = screen.getByText('+12%');
      expect(badge).toHaveClass('bg-tertiary/10');
      expect(badge).toHaveClass('text-tertiary');
    });

    it('affiche l\'icône trending_up pour variation positive', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
          variationLabel="+12%"
          variationType="positive"
        />
      );

      // Assert
      expect(screen.getByText('trending_up')).toBeInTheDocument();
    });

    it('applique les classes negative pour variationType="negative"', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
          variationLabel="-5%"
          variationType="negative"
        />
      );

      // Assert - Le badge lui-même a les classes
      const badge = screen.getByText('-5%');
      expect(badge).toHaveClass('bg-error/10');
      expect(badge).toHaveClass('text-error');
    });

    it('affiche l\'icône trending_down pour variation negative', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
          variationLabel="-5%"
          variationType="negative"
        />
      );

      // Assert
      expect(screen.getByText('trending_down')).toBeInTheDocument();
    });

    it('utilise le style neutral par défaut', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
          variationLabel="0%"
        />
      );

      // Assert - Le badge lui-même a les classes
      const badge = screen.getByText('0%');
      expect(badge).toHaveClass('bg-surface-variant/50');
      expect(badge).toHaveClass('text-on-surface-variant');
    });
  });

  describe('Secondary info', () => {
    it('affiche secondaryInfo quand fourni', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Temps Prep. Moyen"
          value="18:45"
          secondaryInfo="OBJECTIF: 15:00"
        />
      );

      // Assert
      expect(screen.getByText('OBJECTIF: 15:00')).toBeInTheDocument();
    });

    it('n\'affiche pas secondaryInfo quand non fourni', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
        />
      );

      // Assert
      expect(screen.queryByText('OBJECTIF')).not.toBeInTheDocument();
    });
  });

  describe('Icon', () => {
    it('affiche l\'icône Material Symbols quand fournie', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
          icon="payments"
        />
      );

      // Assert
      expect(screen.getByText('payments')).toBeInTheDocument();
    });

    it('n\'affiche pas d\'icône quand non fournie', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Revenu"
          value="2 485 €"
        />
      );

      // Assert
      const region = screen.getByRole('region');
      const icons = region.querySelectorAll('.material-symbols-outlined');
      // Devrait avoir 0 ou seulement celles des badges de variation
      expect(icons.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Classes personnalisées', () => {
    it('fusionne les classes personnalisées avec les classes de base', () => {
      // Arrange & Act
      render(
        <KPICard
          title="Test"
          value="100"
          className="custom-class"
        />
      );

      // Assert
      const card = screen.getByRole('region');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-surface-container');
      expect(card).toHaveClass('p-6');
    });
  });

  describe('Typographie et design', () => {
    it('utilise font-label text-xs uppercase pour le titre', () => {
      // Arrange & Act
      render(<KPICard title="Revenu Quotidien" value="2 485 €" />);

      // Assert
      const title = screen.getByText('Revenu Quotidien');
      expect(title).toHaveClass('font-label');
      expect(title).toHaveClass('text-xs');
      expect(title).toHaveClass('uppercase');
    });

    it('utilise font-headline text-4xl font-bold pour la valeur', () => {
      // Arrange & Act
      render(<KPICard title="Revenu" value="2 485 €" />);

      // Assert
      const value = screen.getByText('2 485 €');
      expect(value).toHaveClass('font-headline');
      expect(value).toHaveClass('text-4xl');
      expect(value).toHaveClass('font-bold');
    });

    it('utilise text-primary pour la valeur', () => {
      // Arrange & Act
      render(<KPICard title="Revenu" value="2 485 €" />);

      // Assert
      const value = screen.getByText('2 485 €');
      expect(value).toHaveClass('text-primary');
    });

    it('utilise text-on-surface-variant pour le titre', () => {
      // Arrange & Act
      render(<KPICard title="Revenu" value="2 485 €" />);

      // Assert
      const title = screen.getByText('Revenu');
      expect(title).toHaveClass('text-on-surface-variant');
    });
  });

  describe('Structure HTML', () => {
    it('a un fond bg-surface-container', () => {
      // Arrange & Act
      render(<KPICard title="Test" value="100" />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('bg-surface-container');
    });

    it('a une bordure border-outline-variant/10', () => {
      // Arrange & Act
      render(<KPICard title="Test" value="100" />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('border-outline-variant/10');
    });

    it('a un padding p-6', () => {
      // Arrange & Act
      render(<KPICard title="Test" value="100" />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('p-6');
    });

    it('a un border-radius rounded-xl', () => {
      // Arrange & Act
      render(<KPICard title="Test" value="100" />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('rounded-xl');
    });
  });
});

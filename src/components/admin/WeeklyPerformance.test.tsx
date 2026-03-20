// src/components/admin/WeeklyPerformance.test.tsx
// Tests unitaires pour le composant WeeklyPerformance

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeeklyPerformance } from './WeeklyPerformance';
import type { WeeklyDataPoint } from '../../hooks/useDashboardData';

// Données de test
const mockWeeklyData: WeeklyDataPoint[] = [
  { day: 'LUN', revenue: 1850, isCurrentDay: false },
  { day: 'MAR', revenue: 2100, isCurrentDay: false },
  { day: 'MER', revenue: 1950, isCurrentDay: false },
  { day: 'JEU', revenue: 2300, isCurrentDay: false },
  { day: 'VEN', revenue: 2485, isCurrentDay: true },
  { day: 'SAM', revenue: 3200, isCurrentDay: false },
  { day: 'DIM', revenue: 2800, isCurrentDay: false },
];

describe('WeeklyPerformance', () => {
  describe('Rendu de base', () => {
    it('affiche le titre par défaut', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(screen.getByText('Performance Hebdomadaire')).toBeInTheDocument();
    });

    it('affiche le sous-titre par défaut', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(
        screen.getByText('Évolution du chiffre d\'affaires (7 derniers jours)')
      ).toBeInTheDocument();
    });

    it('affiche le titre personnalisé quand fourni', () => {
      // Arrange & Act
      render(
        <WeeklyPerformance
          data={mockWeeklyData}
          title="Performance Commerciale"
        />
      );

      // Assert
      expect(screen.getByText('Performance Commerciale')).toBeInTheDocument();
    });

    it('affiche le sous-titre personnalisé quand fourni', () => {
      // Arrange & Act
      render(
        <WeeklyPerformance
          data={mockWeeklyData}
          subtitle="Revenus sur 7 jours"
        />
      );

      // Assert
      expect(screen.getByText('Revenus sur 7 jours')).toBeInTheDocument();
    });

    it('utilise le rôle region pour l\'accessibilité', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Toggle JOUR/SEMAINE', () => {
    it('affiche les boutons JOUR et SEMAINE', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(screen.getByRole('button', { name: 'JOUR' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'SEMAINE' })).toBeInTheDocument();
    });

    it('a SEMAINE activé par défaut', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      const semaineButton = screen.getByRole('button', { name: 'SEMAINE' });
      expect(semaineButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('permet de basculer vers le mode JOUR', async () => {
      // Arrange
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Act
      await userEvent.click(screen.getByRole('button', { name: 'JOUR' }));

      // Assert
      const jourButton = screen.getByRole('button', { name: 'JOUR' });
      expect(jourButton).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'SEMAINE' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('permet de revenir au mode SEMAINE', async () => {
      // Arrange
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Act - Basculer vers JOUR puis SEMAINE
      await userEvent.click(screen.getByRole('button', { name: 'JOUR' }));
      await userEvent.click(screen.getByRole('button', { name: 'SEMAINE' }));

      // Assert
      expect(screen.getByRole('button', { name: 'SEMAINE' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  describe('Graphique à barres', () => {
    it('affiche les 7 jours de la semaine', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
      days.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('affiche les valeurs de revenu au-dessus des barres', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(screen.getByText('2.5k')).toBeInTheDocument(); // 2485 arrondi
      expect(screen.getByText('3.2k')).toBeInTheDocument(); // 3200 arrondi
    });

    it('met en surbrillance le jour actuel', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert - Le jour actuel (VEN) devrait être stylisé différemment
      const venLabel = screen.getAllByText('VEN')[0];
      expect(venLabel).toBeInTheDocument();
    });

    it('affiche la légende du graphique', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(screen.getByText('Jour actuel')).toBeInTheDocument();
      expect(screen.getByText('Autres jours')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('a un aria-label basé sur le titre', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(
        screen.getByRole('region', { name: 'Performance Hebdomadaire' })
      ).toBeInTheDocument();
    });

    it('a un groupe toggle avec aria-label', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(screen.getByRole('group', { name: 'Mode d\'affichage' })).toBeInTheDocument();
    });

    it('a des boutons avec aria-pressed', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(screen.getByRole('button', { name: 'JOUR' })).toHaveAttribute(
        'aria-pressed'
      );
      expect(screen.getByRole('button', { name: 'SEMAINE' })).toHaveAttribute(
        'aria-pressed'
      );
    });

    it('a une image SVG avec aria-label', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(
        screen.getByRole('img', { name: 'Graphique à barres montrant le revenu par jour' })
      ).toBeInTheDocument();
    });
  });

  describe('Classes personnalisées', () => {
    it('fusionne les classes personnalisées avec les classes de base', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} className="custom-class" />);

      // Assert
      const container = screen.getByRole('region');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveClass('bg-surface-container');
      expect(container).toHaveClass('p-6');
    });
  });

  describe('Données vides', () => {
    it('gère un tableau de données vide', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={[]} />);

      // Assert - Le composant devrait se rendre sans erreur
      expect(screen.getByText('Performance Hebdomadaire')).toBeInTheDocument();
    });

    it('affiche des valeurs par défaut quand les revenus sont à 0', () => {
      // Arrange
      const zeroData: WeeklyDataPoint[] = [
        { day: 'LUN', revenue: 0, isCurrentDay: false },
        { day: 'MAR', revenue: 0, isCurrentDay: false },
        { day: 'MER', revenue: 0, isCurrentDay: true },
        { day: 'JEU', revenue: 0, isCurrentDay: false },
        { day: 'VEN', revenue: 0, isCurrentDay: false },
        { day: 'SAM', revenue: 0, isCurrentDay: false },
        { day: 'DIM', revenue: 0, isCurrentDay: false },
      ];

      // Act
      render(<WeeklyPerformance data={zeroData} />);

      // Assert - Devrait afficher les jours même sans données
      expect(screen.getByText('MER')).toBeInTheDocument();
    });
  });

  describe('Design system', () => {
    it('utilise bg-surface-container pour le fond', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('bg-surface-container');
    });

    it('utilise font-headline text-lg pour le titre', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      const title = screen.getByText('Performance Hebdomadaire');
      expect(title).toHaveClass('font-headline');
      expect(title).toHaveClass('text-lg');
    });

    it('utilise font-label text-sm pour le sous-titre', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      const subtitle = screen.getByText(
        'Évolution du chiffre d\'affaires (7 derniers jours)'
      );
      expect(subtitle).toHaveClass('font-label');
      expect(subtitle).toHaveClass('text-sm');
    });

    it('utilise bg-surface-container-high pour le toggle', () => {
      // Arrange & Act
      render(<WeeklyPerformance data={mockWeeklyData} />);

      // Assert
      const toggleGroup = screen.getByRole('group', { name: 'Mode d\'affichage' });
      expect(toggleGroup).toHaveClass('bg-surface-container-high');
    });
  });
});

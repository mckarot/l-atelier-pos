// src/views/KDS/components/KDSHeader.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KDSHeader } from './KDSHeader';
import { db } from '../../../db/database';

// Mock useLiveQuery de dexie-react-hooks
vi.mock('dexie-react-hooks', async () => {
  const actual = await vi.importActual('dexie-react-hooks');
  return {
    ...(actual as object),
    useLiveQuery: vi.fn(),
  };
});

const { useLiveQuery } = await import('dexie-react-hooks');

describe('KDSHeader component', () => {
  const FIXED_TIME = 1700000000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
    vi.mocked(useLiveQuery).mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('devrait afficher le titre par défaut "Écran de Production Cuisine"', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByText('Écran de Production Cuisine')).toBeInTheDocument();
    });

    it('devrait afficher un titre personnalisé', () => {
      // Arrange & Act
      render(<KDSHeader title="KDS — FLUX TEMPS-RÉEL" />);

      // Assert
      expect(screen.getByText('KDS — FLUX TEMPS-RÉEL')).toBeInTheDocument();
    });

    it('devrait avoir un rôle banner', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('devrait avoir la classe h-16 pour la hauteur fixe', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByRole('banner')).toHaveClass('h-16');
    });

    it('devrait avoir la classe sticky top-0 pour le positionnement fixe', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByRole('banner')).toHaveClass('sticky', 'top-0');
    });
  });

  describe('logo and title', () => {
    it('devrait avoir le titre avec la classe text-primary', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      const title = screen.getByText('Écran de Production Cuisine');
      expect(title).toHaveClass('text-primary');
    });

    it('devrait avoir le titre en uppercase et font-bold', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      const title = screen.getByText('Écran de Production Cuisine');
      expect(title).toHaveClass('uppercase', 'font-bold');
    });
  });

  describe('LIVE counter', () => {
    it('devrait afficher "LIVE: 00" quand il n\'y a aucune commande', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(0);

      // Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByText('00')).toBeInTheDocument();
    });

    it('devrait afficher "LIVE: 05" pour 5 commandes actives', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(5);

      // Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByText('05')).toBeInTheDocument();
    });

    it('devrait afficher "LIVE: 12" pour 12 commandes actives', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(12);

      // Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('devrait avoir un indicateur avec un rôle status', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(3);

      // Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
    });

    it('devrait avoir aria-live="polite" sur le compteur', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(3);

      // Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getAllByRole('status')[0]).toHaveAttribute('aria-live', 'polite');
    });

    it('devrait avoir un point indicateur qui pulse quand il y a des commandes', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(3);

      // Act
      render(<KDSHeader />);

      // Assert
      const counter = screen.getAllByRole('status')[0];
      expect(counter).toHaveClass('animate-pulse');
    });

    it('devrait NE PAS avoir de point indicateur qui pulse quand il n\'y a pas de commandes', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(0);

      // Act
      render(<KDSHeader />);

      // Assert
      const counter = screen.getAllByRole('status')[0];
      expect(counter).not.toHaveClass('animate-pulse');
    });

    it('devrait avoir un point bg-tertiary quand il y a des commandes', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(3);

      // Act
      render(<KDSHeader />);

      // Assert
      const counter = screen.getAllByRole('status')[0];
      const dot = counter.querySelector('span.w-2.h-2');
      expect(dot).toHaveClass('bg-tertiary');
    });

    it('devrait avoir un point bg-on-surface-variant quand il n\'y a pas de commandes', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(0);

      // Act
      render(<KDSHeader />);

      // Assert
      const counter = screen.getAllByRole('status')[0];
      const dot = counter.querySelector('span.w-2.h-2');
      expect(dot).toHaveClass('bg-on-surface-variant');
    });
  });

  describe('clock', () => {
    it('devrait afficher l\'heure au format HH:MM', () => {
      // Arrange
      // FIXED_TIME = 1700000000000 = Wed Nov 15 2023 00:53:20 GMT+0000
      // En France (UTC+1), cela donne 01:53

      // Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByRole('timer')).toBeInTheDocument();
    });

    it('devrait avoir un rôle timer', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByRole('timer')).toBeInTheDocument();
    });

    it('devrait avoir aria-live="polite" sur l\'horloge', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'polite');
    });

    it('devrait avoir une icône schedule', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      const clock = screen.getByRole('timer');
      const icon = clock.querySelector('.material-symbols-outlined');
      expect(icon).toBeInTheDocument();
    });

    it('devrait mettre à jour l\'horloge chaque seconde', () => {
      // Arrange
      render(<KDSHeader />);
      const initialTime = screen.getByRole('timer').textContent;

      // Act - Avancer de 1 seconde
      vi.advanceTimersByTime(1000);

      // Assert
      const newTime = screen.getByRole('timer').textContent;
      expect(newTime).not.toBe(initialTime);
    });
  });

  describe('connection indicator', () => {
    it('devrait afficher l\'indicateur de connexion par défaut', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByText('Serveur Connecté')).toBeInTheDocument();
    });

    it('devrait NE PAS afficher l\'indicateur de connexion quand showConnectionIndicator=false', () => {
      // Arrange & Act
      render(<KDSHeader showConnectionIndicator={false} />);

      // Assert
      expect(screen.queryByText('Serveur Connecté')).not.toBeInTheDocument();
    });

    it('devrait avoir un point vert qui pulse pour la connexion', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      const indicator = screen.getByLabelText('Serveur connecté');
      const dot = indicator.querySelector('.bg-tertiary');
      expect(dot).toHaveClass('animate-pulse');
    });

    it('devrait avoir un rôle status sur l\'indicateur', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByLabelText('Serveur connecté')).toHaveAttribute('role', 'status');
    });
  });

  describe('setInterval cleanup', () => {
    it('devrait nettoyer l\'intervalle lors du démontage', () => {
      // Arrange
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      // Act
      const { unmount } = render(<KDSHeader />);
      unmount();

      // Assert
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('devrait créer un intervalle lors du montage', () => {
      // Arrange
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      // Act
      render(<KDSHeader />);

      // Assert
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      setIntervalSpy.mockRestore();
    });
  });

  describe('z-index and layering', () => {
    it('devrait avoir z-30 pour être au-dessus du contenu', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByRole('banner')).toHaveClass('z-30');
    });
  });

  describe('border styling', () => {
    it('devrait avoir une bordure inférieure', () => {
      // Arrange & Act
      render(<KDSHeader />);

      // Assert
      expect(screen.getByRole('banner')).toHaveClass('border-b');
    });
  });
});

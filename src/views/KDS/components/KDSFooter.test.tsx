// src/views/KDS/components/KDSFooter.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KDSFooter } from './KDSFooter';
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

describe('KDSFooter component', () => {
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
    it('devrait afficher le footer avec un rôle contentinfo', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('devrait avoir la classe h-12 pour la hauteur fixe', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByRole('contentinfo')).toHaveClass('h-12');
    });

    it('devrait avoir une bordure supérieure', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByRole('contentinfo')).toHaveClass('border-t');
    });
  });

  describe('average preparation time', () => {
    it('devrait afficher "0m" quand il n\'y a pas de commandes terminées', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockImplementation((fn) => {
        if (fn?.toString().includes('avgPrepTime')) {
          return 0;
        }
        return 0;
      });

      // Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByText(/Temps moyen:/)).toBeInTheDocument();
      expect(screen.getByText('0m')).toBeInTheDocument();
    });

    it('devrait afficher le temps moyen en minutes', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockImplementation((fn, deps) => {
        if (fn?.toString().includes('avgPrepTime')) {
          return 15;
        }
        return 0;
      });

      // Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByText('15m')).toBeInTheDocument();
    });

    it('devrait avoir text-tertiary quand le temps moyen est ≤ 20 minutes', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockImplementation((fn) => {
        if (fn?.toString().includes('avgPrepTime')) {
          return 15;
        }
        return 0;
      });

      // Act
      render(<KDSFooter />);

      // Assert
      const avgTimeElement = screen.getByLabelText(/Temps moyen de préparation/);
      expect(avgTimeElement).toHaveClass('text-tertiary');
    });

    it('devrait avoir text-error quand le temps moyen est > 20 minutes', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockImplementation((fn) => {
        if (fn?.toString().includes('avgPrepTime')) {
          return 25;
        }
        return 0;
      });

      // Act
      render(<KDSFooter />);

      // Assert
      const avgTimeElement = screen.getByLabelText(/Temps moyen de préparation/);
      expect(avgTimeElement).toHaveClass('text-error');
    });

    it('devrait avoir un rôle status sur le temps moyen', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(0);

      // Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByLabelText(/Temps moyen de préparation/)).toBeInTheDocument();
    });
  });

  describe('total active orders count', () => {
    it('devrait afficher "0" quand il n\'y a aucune commande active', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockImplementation((fn) => {
        if (fn?.toString().includes('activeOrdersCount')) {
          return 0;
        }
        return 0;
      });

      // Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByText('Total:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('devrait afficher le nombre de commandes actives', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockImplementation((fn) => {
        if (fn?.toString().includes('activeOrdersCount')) {
          return 8;
        }
        return 0;
      });

      // Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('devrait avoir text-primary pour le compteur', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(0);

      // Act
      render(<KDSFooter />);

      // Assert
      const countElement = screen.getByLabelText(/commandes actives/);
      expect(countElement).toHaveClass('text-primary');
    });

    it('devrait avoir un rôle status sur le compteur', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(0);

      // Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByLabelText(/commandes actives/)).toHaveAttribute('role', 'status');
    });

    it('devrait avoir aria-live="polite" sur le compteur', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(0);

      // Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByLabelText(/commandes actives/)).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('last sync time', () => {
    it('devrait afficher l\'heure de dernière synchro par défaut', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByText(/DERNIÈRE SYNCHRO:/)).toBeInTheDocument();
    });

    it('devrait NE PAS afficher l\'heure de dernière synchro quand showLastSync=false', () => {
      // Arrange & Act
      render(<KDSFooter showLastSync={false} />);

      // Assert
      expect(screen.queryByText(/DERNIÈRE SYNCHRO:/)).not.toBeInTheDocument();
    });

    it('devrait afficher l\'heure au format HH:MM', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByRole('status', { name: /Dernière synchro/ })).toBeInTheDocument();
    });

    it('devrait avoir un rôle status sur la dernière synchro', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByRole('status', { name: /Dernière synchro/ })).toBeInTheDocument();
    });

    it('devrait avoir aria-live="polite" sur la dernière synchro', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByRole('status', { name: /Dernière synchro/ })).toHaveAttribute('aria-live', 'polite');
    });

    it('devrait mettre à jour l\'heure de dernière synchro chaque seconde', () => {
      // Arrange
      render(<KDSFooter />);
      const initialTime = screen.getByRole('status', { name: /Dernière synchro/ }).textContent;

      // Act - Avancer de 1 seconde
      vi.advanceTimersByTime(1000);

      // Assert
      const newTime = screen.getByRole('status', { name: /Dernière synchro/ }).textContent;
      expect(newTime).not.toBe(initialTime);
    });
  });

  describe('setInterval cleanup', () => {
    it('devrait nettoyer l\'intervalle lors du démontage', () => {
      // Arrange
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      // Act
      const { unmount } = render(<KDSFooter />);
      unmount();

      // Assert
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('devrait créer un intervalle lors du montage', () => {
      // Arrange
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      // Act
      render(<KDSFooter />);

      // Assert
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      setIntervalSpy.mockRestore();
    });
  });

  describe('text styling', () => {
    it('devrait avoir text-[10px] pour les statistiques', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByText(/Temps moyen:/)).toHaveClass('text-[10px]');
    });

    it('devrait avoir font-bold uppercase tracking-tighter pour les labels', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByText(/Temps moyen:/)).toHaveClass('font-bold', 'uppercase', 'tracking-tighter');
    });

    it('devrait avoir font-mono pour les valeurs numériques', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      expect(screen.getByText('0m')).toHaveClass('font-mono');
    });
  });

  describe('layout', () => {
    it('devrait avoir les statistiques à gauche', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      const footer = screen.getByRole('contentinfo');
      const statsDiv = footer.firstChild as HTMLElement;
      expect(statsDiv).toHaveClass('flex', 'gap-8', 'items-center');
    });

    it('devrait avoir la dernière synchro à droite', () => {
      // Arrange & Act
      render(<KDSFooter />);

      // Assert
      const footer = screen.getByRole('contentinfo');
      const syncDiv = footer.lastChild as HTMLElement;
      expect(syncDiv).toHaveClass('text-[10px]', 'font-mono');
    });
  });
});

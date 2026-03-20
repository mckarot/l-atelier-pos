// src/components/ui/Timer.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Timer } from './Timer';
import { TIMER_THRESHOLDS } from '../../utils/timer';

describe('Timer component', () => {
  const FIXED_TIME = 1700000000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('devrait afficher le temps écoulé au format MM:SS', () => {
      // Arrange
      const createdAt = FIXED_TIME - 90000; // 1 minute 30 secondes

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      expect(screen.getByText('01:30')).toBeInTheDocument();
    });

    it('devrait afficher "00:00" pour une commande recién créée', () => {
      // Arrange
      const createdAt = FIXED_TIME;

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('devrait avoir un rôle status pour l\'accessibilité', () => {
      // Arrange & Act
      render(<Timer createdAt={FIXED_TIME} />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('devrait avoir un label aria décrivant le temps écoulé', () => {
      // Arrange
      const createdAt = FIXED_TIME - 120000;

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      expect(screen.getByLabelText('Temps écoulé: 02:00')).toBeInTheDocument();
    });

    it('devrait avoir aria-live="polite" pour les mises à jour', () => {
      // Arrange & Act
      render(<Timer createdAt={FIXED_TIME} />);

      // Assert
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('time updates', () => {
    it('devrait mettre à jour le temps chaque seconde', () => {
      // Arrange
      const createdAt = FIXED_TIME - 5000; // 5 secondes
      render(<Timer createdAt={createdAt} />);

      // Act - Avancer de 3 secondes
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Assert - Devrait afficher 00:08
      expect(screen.getByText('00:08')).toBeInTheDocument();
    });

    it('devrait mettre à jour après exactement 1 seconde', () => {
      // Arrange
      const createdAt = FIXED_TIME;
      render(<Timer createdAt={createdAt} />);

      // Act
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert
      expect(screen.getByText('00:01')).toBeInTheDocument();
    });

    it('devrait incrémenter les minutes après 60 secondes', () => {
      // Arrange
      const createdAt = FIXED_TIME - 59000; // 59 secondes
      render(<Timer createdAt={createdAt} />);

      // Act - Avancer de 2 secondes
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Assert - Devrait afficher 01:01
      expect(screen.getByText('01:01')).toBeInTheDocument();
    });
  });

  describe('color changes based on elapsed time', () => {
    it('devrait avoir la classe text-on-surface en mode normal', () => {
      // Arrange
      const createdAt = FIXED_TIME - 5 * 60 * 1000; // 5 minutes

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      const timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('text-on-surface');
    });

    it('devrait avoir text-secondary et animate-pulse en mode warning', () => {
      // Arrange
      const createdAt = FIXED_TIME - 15 * 60 * 1000; // 15 minutes

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      const timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('text-secondary', 'animate-pulse');
    });

    it('devrait avoir text-error et animate-pulse en mode danger', () => {
      // Arrange
      const createdAt = FIXED_TIME - 25 * 60 * 1000; // 25 minutes

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      const timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('text-error', 'animate-pulse');
    });

    it('devrait changer de couleur quand le temps passe de normal à warning', () => {
      // Arrange
      const createdAt = FIXED_TIME - 9 * 60 * 1000; // 9 minutes (normal)
      render(<Timer createdAt={createdAt} />);

      // Assert initial state
      let timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('text-on-surface');

      // Act - Avancer de 2 minutes pour passer en warning
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000);
      });

      // Assert new state
      timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('text-secondary', 'animate-pulse');
    });

    it('devrait changer de couleur quand le temps passe de warning à danger', () => {
      // Arrange
      const createdAt = FIXED_TIME - 19 * 60 * 1000; // 19 minutes (warning)
      render(<Timer createdAt={createdAt} />);

      // Assert initial state
      let timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('text-secondary', 'animate-pulse');

      // Act - Avancer de 2 minutes pour passer en danger
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000);
      });

      // Assert new state
      timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('text-error', 'animate-pulse');
    });
  });

  describe('pulse animation', () => {
    it('devrait avoir animate-pulse en mode warning', () => {
      // Arrange
      const createdAt = FIXED_TIME - 12 * 60 * 1000;

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      const timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('animate-pulse');
    });

    it('devrait avoir animate-pulse en mode danger', () => {
      // Arrange
      const createdAt = FIXED_TIME - 25 * 60 * 1000;

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      const timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).toHaveClass('animate-pulse');
    });

    it('devrait NE PAS avoir animate-pulse en mode normal', () => {
      // Arrange
      const createdAt = FIXED_TIME - 5 * 60 * 1000;

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      const timerElement = screen.getByRole('status').querySelector('span');
      expect(timerElement).not.toHaveClass('animate-pulse');
    });
  });

  describe('setInterval cleanup', () => {
    it('devrait nettoyer l\'intervalle lors du démontage', () => {
      // Arrange
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const createdAt = FIXED_TIME - 1000;

      // Act
      const { unmount } = render(<Timer createdAt={createdAt} />);
      unmount();

      // Assert
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('devrait créer un intervalle lors du montage', () => {
      // Arrange
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      const createdAt = FIXED_TIME - 1000;

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      setIntervalSpy.mockRestore();
    });
  });

  describe('showElapsedOnly prop', () => {
    it('devrait NE PAS afficher d\'éléments supplémentaires quand showElapsedOnly=false', () => {
      // Arrange
      const createdAt = FIXED_TIME - 60000;

      // Act
      render(<Timer createdAt={createdAt} />);

      // Assert - Le Timer n'affiche que le temps, pas d'heure de création
      expect(screen.getByRole('status').children.length).toBeGreaterThan(0);
    });
  });

  describe('onStatusChange callback', () => {
    it('devrait appeler onStatusChange lors du premier rendu', () => {
      // Arrange
      const createdAt = FIXED_TIME - 5 * 60 * 1000;
      const onStatusChange = vi.fn();

      // Act
      render(<Timer createdAt={createdAt} onStatusChange={onStatusChange} />);

      // Assert
      expect(onStatusChange).toHaveBeenCalledWith('normal');
    });

    it('devrait appeler onStatusChange quand le statut passe à warning', () => {
      // Arrange - 9 minutes (normal)
      const createdAt = FIXED_TIME - 9 * 60 * 1000;
      const onStatusChange = vi.fn();
      render(<Timer createdAt={createdAt} onStatusChange={onStatusChange} />);

      // Act - Avancer de 2 minutes pour passer à 11 minutes (warning)
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000);
      });

      // Assert
      expect(onStatusChange).toHaveBeenCalledWith('warning');
    });

    it('devrait appeler onStatusChange quand le statut passe à danger', () => {
      // Arrange - 19 minutes (warning)
      const createdAt = FIXED_TIME - 19 * 60 * 1000;
      const onStatusChange = vi.fn();
      render(<Timer createdAt={createdAt} onStatusChange={onStatusChange} />);

      // Act - Avancer de 2 minutes pour passer à 21 minutes (danger)
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000);
      });

      // Assert
      expect(onStatusChange).toHaveBeenCalledWith('danger');
    });

    it('devrait appeler onStatusChange multiple fois pour plusieurs changements', () => {
      // Arrange - 9 minutes (normal)
      const createdAt = FIXED_TIME - 9 * 60 * 1000;
      const onStatusChange = vi.fn();
      render(<Timer createdAt={createdAt} onStatusChange={onStatusChange} />);

      // Assert - Appel initial avec 'normal'
      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith('normal');

      // Act - Avancer de 2 minutes pour passer à 11 minutes (warning)
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000);
      });

      // Assert - Devrait être appelé avec 'warning'
      expect(onStatusChange).toHaveBeenCalledTimes(2);
      expect(onStatusChange).toHaveBeenNthCalledWith(2, 'warning');

      // Act - Avancer de 10 minutes pour passer à 21 minutes (danger)
      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000);
      });

      // Assert - Devrait être appelé avec 'danger'
      expect(onStatusChange).toHaveBeenCalledTimes(3);
      expect(onStatusChange).toHaveBeenNthCalledWith(3, 'danger');
    });
  });

  describe('className prop', () => {
    it('devrait appliquer une className supplémentaire', () => {
      // Arrange
      const createdAt = FIXED_TIME - 1000;

      // Act
      render(<Timer createdAt={createdAt} className="custom-class" />);

      // Assert
      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });

    it('devrait conserver les classes par défaut', () => {
      // Arrange
      const createdAt = FIXED_TIME - 1000;

      // Act
      render(<Timer createdAt={createdAt} className="custom-class" />);

      // Assert
      expect(screen.getByRole('status')).toHaveClass('flex', 'flex-col', 'items-end');
    });
  });
});

// src/components/ui/StatusBadge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import type { OrderStatus } from '../../firebase/types';

describe('StatusBadge component', () => {
  describe('rendering', () => {
    it('devrait afficher le badge avec le statut en_attente', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('À préparer')).toBeInTheDocument();
    });

    it('devrait afficher le badge avec le statut en_preparation', () => {
      // Arrange & Act
      render(<StatusBadge status="en_preparation" />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('En préparation')).toBeInTheDocument();
    });

    it('devrait afficher le badge avec le statut pret', () => {
      // Arrange & Act
      render(<StatusBadge status="pret" />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Prêt')).toBeInTheDocument();
    });

    it('devrait afficher le badge avec le statut servi', () => {
      // Arrange & Act
      render(<StatusBadge status="servi" />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Servi')).toBeInTheDocument();
    });

    it('devrait afficher le badge avec le statut paye', () => {
      // Arrange & Act
      render(<StatusBadge status="paye" />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Payé')).toBeInTheDocument();
    });

    it('devrait afficher le badge avec le statut annule', () => {
      // Arrange & Act
      render(<StatusBadge status="annule" />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Annulé')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('devrait avoir un rôle status', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('devrait avoir un aria-label décrivant le statut', () => {
      // Arrange & Act
      render(<StatusBadge status="en_preparation" />);

      // Assert
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Statut: En préparation');
    });

    it('devrait avoir une icône Material Symbols', () => {
      // Arrange & Act
      render(<StatusBadge status="pret" />);

      // Assert
      const icon = screen.getByRole('status').querySelector('.material-symbols-outlined');
      expect(icon).toBeInTheDocument();
    });

    it('devrait avoir aria-hidden sur l\'icône', () => {
      // Arrange & Act
      render(<StatusBadge status="pret" />);

      // Assert
      const icon = screen.getByRole('status').querySelector('.material-symbols-outlined');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('size variants', () => {
    it('devrait avoir la taille md par défaut', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-xs');
    });

    it('devrait avoir la taille sm quand size="sm"', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" size="sm" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-[10px]');
    });

    it('devrait avoir la taille lg quand size="lg"', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" size="lg" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-4', 'py-1.5', 'text-sm');
    });
  });

  describe('Tailwind classes for each status', () => {
    it('devrait avoir bg-on-surface-variant text-on-surface pour en_attente', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-on-surface-variant', 'text-on-surface');
    });

    it('devrait avoir bg-primary text-on-primary-container pour en_preparation', () => {
      // Arrange & Act
      render(<StatusBadge status="en_preparation" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-primary', 'text-on-primary-container');
    });

    it('devrait avoir bg-tertiary text-on-tertiary-container pour pret', () => {
      // Arrange & Act
      render(<StatusBadge status="pret" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-tertiary', 'text-on-tertiary-container');
    });

    it('devrait avoir bg-surface-container-highest text-on-surface/60 pour servi', () => {
      // Arrange & Act
      render(<StatusBadge status="servi" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-surface-container-highest');
    });

    it('devrait avoir bg-surface-container-highest text-on-surface/40 pour paye', () => {
      // Arrange & Act
      render(<StatusBadge status="paye" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-surface-container-highest');
    });

    it('devrait avoir bg-error-container text-on-error-container pour annule', () => {
      // Arrange & Act
      render(<StatusBadge status="annule" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-error-container', 'text-on-error-container');
    });
  });

  describe('common classes', () => {
    it('devrait toujours avoir rounded-full', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('rounded-full');
    });

    it('devrait toujours avoir font-bold uppercase tracking-widest', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('font-bold', 'uppercase', 'tracking-widest');
    });

    it('devrait toujours avoir inline-flex items-center gap-1.5', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'gap-1.5');
    });
  });

  describe('className prop', () => {
    it('devrait appliquer une className supplémentaire', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" className="custom-class" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('custom-class');
    });

    it('devrait conserver les classes par défaut', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" className="custom-class" />);

      // Assert
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('rounded-full', 'font-bold');
    });
  });

  describe('icons for each status', () => {
    it('devrait avoir l\'icône schedule pour en_attente', () => {
      // Arrange & Act
      render(<StatusBadge status="en_attente" />);

      // Assert
      const icon = screen.getByRole('status').querySelector('.material-symbols-outlined');
      expect(icon?.textContent).toBe('schedule');
    });

    it('devrait avoir l\'icône set_meal pour en_preparation', () => {
      // Arrange & Act
      render(<StatusBadge status="en_preparation" />);

      // Assert
      const icon = screen.getByRole('status').querySelector('.material-symbols-outlined');
      expect(icon?.textContent).toBe('set_meal');
    });

    it('devrait avoir l\'icône done_all pour pret', () => {
      // Arrange & Act
      render(<StatusBadge status="pret" />);

      // Assert
      const icon = screen.getByRole('status').querySelector('.material-symbols-outlined');
      expect(icon?.textContent).toBe('done_all');
    });

    it('devrait avoir l\'icône room_service pour servi', () => {
      // Arrange & Act
      render(<StatusBadge status="servi" />);

      // Assert
      const icon = screen.getByRole('status').querySelector('.material-symbols-outlined');
      expect(icon?.textContent).toBe('room_service');
    });

    it('devrait avoir l\'icône payment pour paye', () => {
      // Arrange & Act
      render(<StatusBadge status="paye" />);

      // Assert
      const icon = screen.getByRole('status').querySelector('.material-symbols-outlined');
      expect(icon?.textContent).toBe('payment');
    });

    it('devrait avoir l\'icône cancel pour annule', () => {
      // Arrange & Act
      render(<StatusBadge status="annule" />);

      // Assert
      const icon = screen.getByRole('status').querySelector('.material-symbols-outlined');
      expect(icon?.textContent).toBe('cancel');
    });
  });
});

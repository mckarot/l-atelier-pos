// src/components/layout/ServeurHeader.test.tsx
// Tests pour le composant ServeurHeader

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServeurHeader } from './ServeurHeader';

describe('ServeurHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendu du header', () => {
    it('devrait afficher le titre par défaut "L\'ATELIER POS"', () => {
      render(<ServeurHeader />);
      expect(screen.getByText("L'ATELIER POS")).toBeInTheDocument();
    });

    it('devrait afficher un titre personnalisé', () => {
      render(<ServeurHeader title="Plan de Salle" />);
      expect(screen.getByText('Plan de Salle')).toBeInTheDocument();
    });

    it('devrait afficher le bouton menu', () => {
      render(<ServeurHeader />);
      expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    });

    it('devrait afficher "SYNC OK"', () => {
      render(<ServeurHeader />);
      expect(screen.getByText('SYNC OK')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône sync', () => {
      render(<ServeurHeader />);
      const syncSection = screen.getByText('SYNC OK').closest('div');
      expect(syncSection?.querySelector('.material-symbols-outlined')).toHaveTextContent('sync');
    });
  });

  describe('Indicateur de service', () => {
    it('devrait afficher "Service Midi"', () => {
      render(<ServeurHeader />);
      expect(screen.getByText('Service Midi')).toBeInTheDocument();
    });

    it('devrait afficher un point vert animé', () => {
      render(<ServeurHeader />);
      const dot = screen.getByText('Service Midi').previousSibling;
      expect(dot).toHaveClass('bg-tertiary', 'animate-pulse');
    });
  });

  describe('Horloge', () => {
    it('devrait afficher l\'heure courante', () => {
      render(<ServeurHeader />);
      expect(screen.getByText('12:30')).toBeInTheDocument();
    });
  });

  describe('Bouton menu', () => {
    it('devrait appeler onMenuClick au clic', () => {
      const onMenuClick = vi.fn();
      render(<ServeurHeader onMenuClick={onMenuClick} />);

      const menuButton = screen.getByRole('button', { name: 'Menu' });
      menuButton.click();

      expect(onMenuClick).toHaveBeenCalledTimes(1);
    });

    it('devrait être cliquable', () => {
      render(<ServeurHeader />);

      const menuButton = screen.getByRole('button', { name: 'Menu' });
      expect(menuButton).toBeEnabled();
    });
  });

  describe('Bouton profil', () => {
    it('devrait afficher l\'icône account_circle', () => {
      render(<ServeurHeader />);
      const profileButton = screen.getByRole('button', { name: 'Profil' });
      expect(profileButton.querySelector('.material-symbols-outlined')).toHaveTextContent('account_circle');
    });

    it('devrait être cliquable', () => {
      render(<ServeurHeader />);

      const profileButton = screen.getByRole('button', { name: 'Profil' });
      expect(profileButton).toBeEnabled();
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un bouton menu avec aria-label "Menu"', () => {
      render(<ServeurHeader />);
      expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    });

    it('devrait avoir un bouton profil avec aria-label "Profil"', () => {
      render(<ServeurHeader />);
      expect(screen.getByRole('button', { name: 'Profil' })).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('devrait être un élément header', () => {
      render(<ServeurHeader />);
      const header = screen.getByText("L'ATELIER POS").closest('header');
      expect(header).toBeInTheDocument();
    });

    it('devrait avoir une hauteur h-16', () => {
      render(<ServeurHeader />);
      const header = screen.getByText("L'ATELIER POS").closest('header');
      expect(header).toHaveClass('h-16');
    });

    it('devrait avoir un style sticky', () => {
      render(<ServeurHeader />);
      const header = screen.getByText("L'ATELIER POS").closest('header');
      expect(header).toHaveClass('sticky');
    });
  });
});

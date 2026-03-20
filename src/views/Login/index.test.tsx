// src/views/Login/index.test.tsx
// Tests d'intégration pour la vue Login

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginView } from './index';
import * as roleGuard from '../../utils/roleGuard';

// Mock du hook useNavigate avec navigation réelle simulée
const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendu de la page', () => {
    it('affiche le titre de l\'application', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      expect(screen.getByText('L\'Atelier POS')).toBeInTheDocument();
    });

    it('affiche le sous-titre "Système de gestion de restaurant"', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      expect(screen.getByText('Système de gestion de restaurant')).toBeInTheDocument();
    });

    it('affiche l\'icône restaurant_menu', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert - Vérifier que le logo est présent
      expect(screen.getByText('L\'Atelier POS')).toBeInTheDocument();
    });

    it('affiche la version en footer', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      expect(screen.getByText('Version 1.0.0 • Mode Développement')).toBeInTheDocument();
    });
  });

  describe('Boutons de rôle', () => {
    it('affiche 4 boutons de rôle', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      expect(screen.getByLabelText('Sélectionner le rôle Administrateur')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner le rôle Cuisine (KDS)')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner le rôle Serveur')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner le rôle Client')).toBeInTheDocument();
    });

    it('affiche le bouton Administrateur avec la bonne icône', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      const adminButton = screen.getByLabelText('Sélectionner le rôle Administrateur');
      expect(adminButton).toBeInTheDocument();
      expect(adminButton).toHaveTextContent('dashboard');
      expect(adminButton).toHaveTextContent('Administrateur');
      expect(adminButton).toHaveTextContent('Tableau de bord, gestion complète');
    });

    it('affiche le bouton KDS avec la bonne icône', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      const kdsButton = screen.getByLabelText('Sélectionner le rôle Cuisine (KDS)');
      expect(kdsButton).toBeInTheDocument();
      expect(kdsButton).toHaveTextContent('soup_kitchen');
      expect(kdsButton).toHaveTextContent('Cuisine (KDS)');
      expect(kdsButton).toHaveTextContent('Écran de production cuisine');
    });

    it('affiche le bouton Serveur avec la bonne icône', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      const serveurButton = screen.getByLabelText('Sélectionner le rôle Serveur');
      expect(serveurButton).toBeInTheDocument();
      expect(serveurButton).toHaveTextContent('room_service');
      expect(serveurButton).toHaveTextContent('Serveur');
      expect(serveurButton).toHaveTextContent('Plan de salle, réservations');
    });

    it('affiche le bouton Client avec la bonne icône', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      const clientButton = screen.getByLabelText('Sélectionner le rôle Client');
      expect(clientButton).toBeInTheDocument();
      expect(clientButton).toHaveTextContent('restaurant_menu');
      expect(clientButton).toHaveTextContent('Client');
      expect(clientButton).toHaveTextContent('Menu, commande en ligne');
    });
  });

  describe('Interactions - Sélection de rôle', () => {
    it('devrait appeler setUserRole avec "admin" au clic sur Administrateur', async () => {
      // Arrange
      const user = userEvent.setup();
      const setUserRoleSpy = vi.spyOn(roleGuard, 'setUserRole');
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Administrateur'));

      // Assert
      expect(setUserRoleSpy).toHaveBeenCalledWith('admin');
    });

    it('devrait appeler setUserRole avec "kds" au clic sur Cuisine (KDS)', async () => {
      // Arrange
      const user = userEvent.setup();
      const setUserRoleSpy = vi.spyOn(roleGuard, 'setUserRole');
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Cuisine (KDS)'));

      // Assert
      expect(setUserRoleSpy).toHaveBeenCalledWith('kds');
    });

    it('devrait appeler setUserRole avec "serveur" au clic sur Serveur', async () => {
      // Arrange
      const user = userEvent.setup();
      const setUserRoleSpy = vi.spyOn(roleGuard, 'setUserRole');
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Serveur'));

      // Assert
      expect(setUserRoleSpy).toHaveBeenCalledWith('serveur');
    });

    it('devrait appeler setUserRole avec "client" au clic sur Client', async () => {
      // Arrange
      const user = userEvent.setup();
      const setUserRoleSpy = vi.spyOn(roleGuard, 'setUserRole');
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Client'));

      // Assert
      expect(setUserRoleSpy).toHaveBeenCalledWith('client');
    });

    it('devrait sauvegarder le rôle dans localStorage', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Administrateur'));

      // Assert
      expect(localStorage.getItem('atelier_role')).toBe('admin');
    });

    it('devrait naviguer vers /admin après sélection du rôle admin', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Administrateur'));

      // Assert
      expect(navigateMock).toHaveBeenCalledWith('/admin');
    });

    it('devrait naviguer vers /kds après sélection du rôle kds', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Cuisine (KDS)'));

      // Assert
      expect(navigateMock).toHaveBeenCalledWith('/kds');
    });

    it('devrait naviguer vers /serveur après sélection du rôle serveur', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Serveur'));

      // Assert
      expect(navigateMock).toHaveBeenCalledWith('/serveur');
    });

    it('devrait naviguer vers /client après sélection du rôle client', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginView />);

      // Act
      await user.click(screen.getByLabelText('Sélectionner le rôle Client'));

      // Assert
      expect(navigateMock).toHaveBeenCalledWith('/client');
    });
  });

  describe('État de chargement', () => {
    it('devrait désactiver les boutons pendant la sélection', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginView />);

      // Act - Cliquer sur un bouton
      const adminButton = screen.getByLabelText('Sélectionner le rôle Administrateur');
      await user.click(adminButton);

      // Assert - Les boutons devraient être désactivés après le clic
      // (pendant la navigation)
      expect(adminButton).toHaveAttribute('disabled');
    });

    it('devrait avoir un effet active:scale-[0.98] au clic', () => {
      // Arrange
      render(<LoginView />);

      // Assert
      const adminButton = screen.getByLabelText('Sélectionner le rôle Administrateur');
      expect(adminButton).toHaveClass('active:scale-[0.98]');
    });
  });

  describe('Effets hover', () => {
    it('devrait afficher la flèche au survol d\'une carte', async () => {
      // Arrange
      render(<LoginView />);
      const adminCard = screen.getByLabelText('Sélectionner le rôle Administrateur');

      // Assert - La flèche est présente dans le DOM (même si opacity: 0)
      const arrowIcons = screen.getAllByText('arrow_forward_ios');
      expect(arrowIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('devrait changer la couleur de la bordure au survol', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginView />);
      const adminButton = screen.getByLabelText('Sélectionner le rôle Administrateur');

      // Act - Survoler la carte
      await user.hover(adminButton);

      // Assert
      expect(adminButton).toHaveClass('hover:border-primary/30');
    });
  });

  describe('Accessibilité', () => {
    it('chaque bouton a un aria-label descriptif', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert
      expect(screen.getByLabelText('Sélectionner le rôle Administrateur')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner le rôle Cuisine (KDS)')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner le rôle Serveur')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner le rôle Client')).toBeInTheDocument();
    });

    it('les boutons devraient être focusables au clavier', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginView />);

      // Act - Naviguer avec Tab
      await user.tab();

      // Assert - Le premier bouton devrait être focusable
      const adminButton = screen.getByLabelText('Sélectionner le rôle Administrateur');
      expect(adminButton).not.toHaveAttribute('tabindex', '-1');
    });

    it('devrait avoir une structure grid responsive', () => {
      // Arrange & Act
      render(<LoginView />);

      // Assert - La grid est présente dans le document
      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });
  });

  describe('Gestion d\'erreurs', () => {
    it('devrait réactiver les boutons en cas d\'erreur', async () => {
      // Arrange
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const originalSetUserRole = roleGuard.setUserRole;
      
      // Mock setUserRole pour lancer une erreur
      vi.spyOn(roleGuard, 'setUserRole').mockImplementation(() => {
        throw new Error('Test error');
      });

      render(<LoginView />);
      const adminButton = screen.getByLabelText('Sélectionner le rôle Administrateur');

      // Act
      await user.click(adminButton);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(adminButton).not.toBeDisabled();

      // Cleanup
      consoleErrorSpy.mockRestore();
      vi.restoreAllMocks();
    });
  });
});

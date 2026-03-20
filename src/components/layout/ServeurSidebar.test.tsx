// src/components/layout/ServeurSidebar.test.tsx
// Tests pour le composant ServeurSidebar

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ServeurSidebar } from './ServeurSidebar';

function renderWithRouter(ui: React.ReactElement, initialPath = '/serveur') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {ui}
    </MemoryRouter>
  );
}

describe('ServeurSidebar', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu du header', () => {
    it('devrait afficher le logo "L\'Atelier"', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText("L'Atelier")).toBeInTheDocument();
    });

    it('devrait afficher "GESTION SYSTÈME" sous le logo', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('GESTION SYSTÈME')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône restaurant pour le logo', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const header = screen.getByText("L'Atelier").closest('div')?.parentElement;
      expect(header?.querySelector('.material-symbols-outlined')).toHaveTextContent('restaurant');
    });
  });

  describe('Section profil', () => {
    it('devrait afficher "Chef d\'Atelier"', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('Chef d\'Atelier')).toBeInTheDocument();
    });

    it('devrait afficher "Service Midi"', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('Service Midi')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône account_circle pour le profil', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const profileSection = screen.getByText('Chef d\'Atelier').closest('div')?.parentElement;
      expect(profileSection?.querySelector('.material-symbols-outlined')).toHaveTextContent('account_circle');
    });

    it('devrait avoir un avatar rond', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const profileSection = screen.getByText('Chef d\'Atelier').closest('div')?.parentElement;
      const avatar = profileSection?.querySelector('.material-symbols-outlined')?.closest('div');
      expect(avatar).toHaveClass('rounded-full');
    });
  });

  describe('Items de navigation', () => {
    it('devrait afficher 5 items de navigation', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('Menu')).toBeInTheDocument();
      expect(screen.getByText('Commandes')).toBeInTheDocument();
      expect(screen.getByText('Tables')).toBeInTheDocument();
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      expect(screen.getByText('Paramètres')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône restaurant pour Menu', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink?.querySelector('.material-symbols-outlined')).toHaveTextContent('restaurant');
    });

    it('devrait afficher l\'icône receipt_long pour Commandes', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const commandesLink = screen.getByText('Commandes').closest('a');
      expect(commandesLink?.querySelector('.material-symbols-outlined')).toHaveTextContent('receipt_long');
    });

    it('devrait afficher l\'icône table_restaurant pour Tables', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const tablesLink = screen.getByText('Tables').closest('a');
      expect(tablesLink?.querySelector('.material-symbols-outlined')).toHaveTextContent('table_restaurant');
    });

    it('devrait afficher l\'icône dashboard pour Tableau de bord', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const dashboardLink = screen.getByText('Tableau de bord').closest('a');
      expect(dashboardLink?.querySelector('.material-symbols-outlined')).toHaveTextContent('dashboard');
    });

    it('devrait afficher l\'icône settings pour Paramètres', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const parametresLink = screen.getByText('Paramètres').closest('a');
      expect(parametresLink?.querySelector('.material-symbols-outlined')).toHaveTextContent('settings');
    });
  });

  describe('Item actif', () => {
    it('devrait appliquer le style actif à Tables sur /serveur', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />, '/serveur');
      const tablesLink = screen.getByText('Tables').closest('a');
      expect(tablesLink).toHaveClass('border-l-2', 'border-primary');
      expect(tablesLink).toHaveClass('font-bold');
    });

    it('devrait appliquer le style actif à Menu sur /serveur/menu', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur/menu" />, '/serveur/menu');
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink).toHaveClass('border-l-2', 'border-primary');
    });

    it('ne devrait pas appliquer le style actif aux items non actifs', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />, '/serveur');
      const menuLink = screen.getByText('Menu').closest('a');
      expect(menuLink).not.toHaveClass('border-primary');
    });
  });

  describe('Bouton Nouvelle Commande', () => {
    it('devrait afficher le bouton "Nouvelle Commande"', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('Nouvelle Commande')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône add sur le bouton', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('add')).toBeInTheDocument();
    });

    it('devrait avoir un style bg-primary-container', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const button = screen.getByText('Nouvelle Commande').closest('button');
      expect(button).toHaveClass('bg-primary-container');
    });

    it('devrait être cliquable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const button = screen.getByText('Nouvelle Commande').closest('button');
      expect(button).toBeEnabled();
      await user.click(button!);
    });
  });

  describe('Footer - Thème et Urgence', () => {
    it('devrait afficher le bouton "Thème"', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('Thème')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône dark_mode pour Thème', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const themeButton = screen.getByText('Thème').closest('button');
      expect(themeButton?.querySelector('.material-symbols-outlined')).toHaveTextContent('dark_mode');
    });

    it('devrait afficher le bouton "Urgence"', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('Urgence')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône emergency pour Urgence', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const urgencyButton = screen.getByText('Urgence').closest('button');
      expect(urgencyButton?.querySelector('.material-symbols-outlined')).toHaveTextContent('emergency');
    });

    it('devrait avoir un style text-error pour Urgence', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const urgencyButton = screen.getByText('Urgence').closest('button');
      expect(urgencyButton).toHaveClass('text-error/70');
    });
  });

  describe('Bouton Changer de rôle', () => {
    it('devrait afficher le bouton "Changer de rôle"', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByText('Changer de rôle')).toBeInTheDocument();
    });

    it('devrait afficher l\'icône logout', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const logoutButton = screen.getByText('Changer de rôle').closest('button');
      expect(logoutButton?.querySelector('.material-symbols-outlined')).toHaveTextContent('logout');
    });

    it('devrait appeler onLogout au clic', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      await user.click(screen.getByText('Changer de rôle').closest('button')!);
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un rôle navigation', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByRole('navigation', { name: 'Navigation principale Serveur' })).toBeInTheDocument();
    });

    it('devrait avoir un aria-label "Navigation principale Serveur"', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      expect(screen.getByRole('navigation', { name: 'Navigation principale Serveur' })).toBeInTheDocument();
    });

    it('devrait avoir des liens avec des href valides', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(5);
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Structure', () => {
    it('devrait être un élément aside', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const navigation = screen.getByRole('navigation', { name: 'Navigation principale Serveur' });
      expect(navigation.closest('aside')).toBeInTheDocument();
    });

    it('devrait avoir une largeur w-64', () => {
      renderWithRouter(<ServeurSidebar onLogout={mockOnLogout} currentPath="/serveur" />);
      const navigation = screen.getByRole('navigation', { name: 'Navigation principale Serveur' });
      expect(navigation.closest('aside')).toHaveClass('w-64');
    });
  });
});

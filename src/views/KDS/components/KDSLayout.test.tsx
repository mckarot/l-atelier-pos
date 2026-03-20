// src/views/KDS/components/KDSLayout.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { KDSLayout } from './KDSLayout';
import { db } from '../../../db/database';
import { seedOrder, seedTable } from '../../../test/helpers/seed';

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', async () => {
  const actual = await vi.importActual('dexie-react-hooks');
  return {
    ...(actual as object),
    useLiveQuery: vi.fn(),
  };
});

const { useLiveQuery } = await import('dexie-react-hooks');

describe('KDSLayout - Integration tests', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1700000000000);
    vi.mocked(useLiveQuery).mockReturnValue(0);

    // Clean database before each test
    await db.orders.clear();
    await db.restaurantTables.clear();
    await db.menuItems.clear();
    await db.reservations.clear();
    await db.users.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const renderWithRouter = () => {
    const router = createMemoryRouter(
      [
        {
          path: '/kds',
          element: <KDSLayout />,
        },
      ],
      {
        initialEntries: ['/kds'],
      }
    );
    return render(<RouterProvider router={router} />);
  };

  describe('layout structure', () => {
    it('devrait afficher le layout h-screen overflow-hidden', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const container = screen.getByRole('navigation').closest('.flex.h-screen');
      expect(container).toHaveClass('h-screen', 'overflow-hidden');
    });

    it('devrait avoir la Sidebar, Header, Board et Footer', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      // Sidebar
      expect(screen.getByRole('navigation', { name: 'Navigation principale KDS' })).toBeInTheDocument();

      // Header
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // Board
      expect(screen.getByRole('region', { name: 'Tableau des commandes KDS' })).toBeInTheDocument();

      // Footer
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('devrait avoir la sidebar avec largeur fixe de 256px (w-64)', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const sidebar = screen.getByRole('navigation', { name: 'Navigation principale KDS' });
      expect(sidebar).toHaveClass('w-64');
    });

    it('devrait avoir la sidebar en position fixe à gauche', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const sidebar = screen.getByRole('navigation', { name: 'Navigation principale KDS' });
      expect(sidebar).toHaveClass('fixed', 'left-0', 'top-0');
    });

    it('devrait avoir le contenu principal avec ml-64 pour compenser la sidebar', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const mainContent = screen.getByRole('banner').parentElement;
      expect(mainContent).toHaveClass('ml-64');
    });
  });

  describe('sidebar navigation', () => {
    it('devrait afficher le logo "L\'Atelier POS"', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('L\'Atelier POS')).toBeInTheDocument();
    });

    it('devrait afficher le sous-titre "Cuisine / KDS"', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Cuisine / KDS')).toBeInTheDocument();
    });

    it('devrait avoir un lien vers Menu', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByLabelText('Aller au menu')).toBeInTheDocument();
    });

    it('devrait avoir un lien vers Commandes (page actuelle)', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByLabelText('Voir les commandes (page actuelle)')).toBeInTheDocument();
      expect(screen.getByLabelText('Voir les commandes (page actuelle)')).toHaveAttribute('aria-current', 'page');
    });

    it('devrait avoir un lien vers Tables', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByLabelText('Aller aux tables')).toBeInTheDocument();
    });

    it('devrait avoir un lien vers Tableau de bord', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByLabelText('Aller au tableau de bord')).toBeInTheDocument();
    });

    it('devrait avoir un lien vers Paramètres', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByLabelText('Aller aux paramètres')).toBeInTheDocument();
    });
  });

  describe('user profile section', () => {
    it('devrait afficher "Chef d\'Atelier" comme nom d\'utilisateur', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Chef d\'Atelier')).toBeInTheDocument();
    });

    it('devrait afficher "Service Midi" comme contexte', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Service Midi')).toBeInTheDocument();
    });

    it('devrait avoir un bouton "Changer de rôle"', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByLabelText('Se déconnecter et changer de rôle')).toBeInTheDocument();
    });

    it('devrait appeler clearUserRole et naviguer vers /login lors du logout', async () => {
      // Arrange
      const { clearUserRole } = await import('../../../utils/roleGuard');
      const mockClearUserRole = vi.mocked(clearUserRole);
      const user = await import('@testing-library/user-event');

      // Act
      renderWithRouter();
      await user.default.click(screen.getByLabelText('Se déconnecter et changer de rôle'));

      // Assert
      await waitFor(() => {
        expect(mockClearUserRole).toHaveBeenCalled();
      });
    });
  });

  describe('scroll behavior', () => {
    it('devrait avoir overflow-hidden sur le layout principal', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const container = screen.getByRole('navigation').closest('.flex.h-screen');
      expect(container).toHaveClass('overflow-hidden');
    });

    it('devrait avoir overflow-y-auto uniquement dans les colonnes', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const board = screen.getByRole('region', { name: 'Tableau des commandes KDS' });
      const columns = board.querySelectorAll('section');
      columns.forEach((column) => {
        const scrollableBody = column.querySelector('.overflow-y-auto');
        expect(scrollableBody).toBeInTheDocument();
      });
    });
  });

  describe('dark mode', () => {
    it('devrait avoir bg-background pour le fond principal', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      const container = screen.getByRole('navigation').closest('.flex.h-screen');
      expect(container).toHaveClass('bg-background');
    });

    it('devrait NE PAS avoir de toggle dark mode (dark mode uniquement)', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.queryByText(/dark/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/light/i)).not.toBeInTheDocument();
    });
  });

  describe('KDSHeader integration', () => {
    it('devrait afficher le compteur LIVE dans le header', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(5);

      // Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByText('05')).toBeInTheDocument();
    });

    it('devrait afficher l\'horloge dans le header', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByRole('timer')).toBeInTheDocument();
    });

    it('devrait afficher "Serveur Connecté"', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Serveur Connecté')).toBeInTheDocument();
    });
  });

  describe('KDSBoard integration', () => {
    it('devrait afficher les 3 colonnes (À préparer, En préparation, Prêt)', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('À préparer')).toBeInTheDocument();
      expect(screen.getByText('En préparation')).toBeInTheDocument();
      expect(screen.getByText('Prêt')).toBeInTheDocument();
    });

    it('devrait afficher les compteurs pour chaque colonne', () => {
      // Arrange
      vi.mocked(useLiveQuery).mockReturnValue(0);

      // Act
      renderWithRouter();

      // Assert
      expect(screen.getAllByText('00')).toHaveLength(3);
    });

    it('devrait afficher "Aucune commande en attente" quand la colonne est vide', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Aucune commande en attente')).toBeInTheDocument();
    });

    it('devrait afficher "Aucune commande en préparation" quand la colonne est vide', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Aucune commande en préparation')).toBeInTheDocument();
    });

    it('devrait afficher "Aucune commande prête" quand la colonne est vide', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Aucune commande prête')).toBeInTheDocument();
    });
  });

  describe('KDSFooter integration', () => {
    it('devrait afficher "Temps moyen:" dans le footer', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Temps moyen:')).toBeInTheDocument();
    });

    it('devrait afficher "Total:" dans le footer', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });

    it('devrait afficher "DERNIÈRE SYNCHRO:" dans le footer', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByText(/DERNIÈRE SYNCHRO:/)).toBeInTheDocument();
    });
  });

  describe('with seeded data', () => {
    it('devrait afficher les commandes seedées dans les colonnes', async () => {
      // Arrange - Seed data
      await seedTable({ id: 1, status: 'occupee' });
      await seedOrder({ tableId: 1, status: 'en_attente' });
      await seedOrder({ tableId: 1, status: 'en_preparation' });
      await seedOrder({ tableId: 1, status: 'pret' });

      // Mock useLiveQuery to return seeded data
      vi.mocked(useLiveQuery).mockImplementation((fn) => {
        if (fn?.toString().includes('activeOrders')) {
          return [
            { id: 1, tableId: 1, status: 'en_attente', items: [], createdAt: Date.now() },
            { id: 2, tableId: 1, status: 'en_preparation', items: [], createdAt: Date.now() },
            { id: 3, tableId: 1, status: 'pret', items: [], createdAt: Date.now() },
          ] as any;
        }
        return 0;
      });

      // Act
      renderWithRouter();

      // Assert - Les compteurs devraient montrer 1 pour chaque colonne
      await waitFor(() => {
        expect(screen.getAllByText('01')).toHaveLength(3);
      });
    });
  });

  describe('accessibility', () => {
    it('devrait avoir des rôles ARIA appropriés pour tous les éléments principaux', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Sidebar
      expect(screen.getByRole('region')).toBeInTheDocument(); // Board
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    });

    it('devrait avoir aria-label sur la sidebar', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Navigation principale KDS');
    });

    it('devrait avoir aria-label sur le board', () => {
      // Arrange & Act
      renderWithRouter();

      // Assert
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Tableau des commandes KDS');
    });
  });
});

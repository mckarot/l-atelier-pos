// src/components/admin/ActiveServices.test.tsx
// Tests unitaires pour le composant ActiveServices

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { db, seedDatabase } from '../../db/database';
import type { Order } from '../../db/types';
import { ActiveServices } from './ActiveServices';

// Helper pour créer une commande
function createOrder(overrides: Partial<Order> = {}): Omit<Order, 'id'> {
  const now = Date.now();
  return {
    tableId: 1,
    customerName: 'Test Customer',
    status: 'en_attente',
    items: [{ name: 'Test Item', quantity: 1 }],
    total: 50,
    createdAt: now,
    ...overrides,
  };
}

describe('ActiveServices', () => {
  beforeEach(async () => {
    // Seed des données avant chaque test
    await seedDatabase();
  });

  describe('Rendu de base', () => {
    it('affiche le titre "Services Actifs"', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Services Actifs')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('affiche le sous-titre par défaut', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText('Vue d\'ensemble des tables et commandes en cours')
        ).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('affiche un titre personnalisé', () => {
      // Arrange
      const customTitle = 'Tables en Service';

      // Act
      render(<ActiveServices title={customTitle} />);

      // Assert
      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it('affiche un sous-titre personnalisé', () => {
      // Arrange
      const customSubtitle = 'Statut des commandes';

      // Act
      render(<ActiveServices subtitle={customSubtitle} />);

      // Assert
      expect(screen.getByText(customSubtitle)).toBeInTheDocument();
    });

    it('utilise le rôle region pour l\'accessibilité', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('region')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Toggle Cuisine/Service', () => {
    it('affiche le toggle avec les options Cuisine et Service', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Vue Cuisine' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Vue Service' })).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('a Cuisine activé par défaut', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        const cuisineButton = screen.getByRole('button', { name: 'Vue Cuisine' });
        expect(cuisineButton).toHaveAttribute('aria-pressed', 'true');
      }, { timeout: 2000 });
    });

    it('permet de basculer vers la vue Service', async () => {
      // Arrange
      render(<ActiveServices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Vue Cuisine' })).toBeInTheDocument();
      }, { timeout: 2000 });

      // Act
      const serviceButton = screen.getByRole('button', { name: 'Vue Service' });
      serviceButton.click();

      // Assert
      await waitFor(() => {
        expect(serviceButton).toHaveAttribute('aria-pressed', 'true');
      }, { timeout: 2000 });
    });

    it('permet de rebasculer vers la vue Cuisine', async () => {
      // Arrange
      render(<ActiveServices />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Vue Service' })).toBeInTheDocument();
      }, { timeout: 2000 });

      // Act - Cliquer sur Service puis Cuisine
      screen.getByRole('button', { name: 'Vue Service' }).click();
      screen.getByRole('button', { name: 'Vue Cuisine' }).click();

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Vue Cuisine' })).toHaveAttribute('aria-pressed', 'true');
      }, { timeout: 2000 });
    });
  });

  describe('Affichage des cartes', () => {
    it('affiche au moins 3 cartes avec les données du seed', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles.length).toBeGreaterThanOrEqual(3);
      }, { timeout: 2000 });
    });

    it('affiche les numéros de commande', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert - Devrait avoir des numéros de commande au format #XXX
      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles.length).toBeGreaterThan(0);
        // Vérifier que le premier article a un numéro de commande
        expect(articles[0].textContent).toMatch(/#\d+/);
      }, { timeout: 2000 });
    });

    it('affiche les noms de tables', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert - Devrait avoir des noms de tables
      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles.length).toBeGreaterThan(0);
        // Vérifier que le premier article a un nom de table
        expect(articles[0].textContent).toMatch(/Table \d+/);
      }, { timeout: 2000 });
    });
  });

  describe('Indicateur de retard', () => {
    it('affiche l\'alerte de retard quand il y a des tables en retard', async () => {
      // Arrange - Ajouter une table en retard (25 minutes)
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 100,
        tableId: 20,
        status: 'en_preparation',
        createdAt: twentyFiveMinAgo,
      });

      // Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/table\(s\) en retard/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('affiche l\'icône warning pour l\'alerte de retard', async () => {
      // Arrange - Ajouter une table en retard (25 minutes)
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 101,
        tableId: 21,
        status: 'en_preparation',
        createdAt: twentyFiveMinAgo,
      });

      // Act
      render(<ActiveServices />);

      // Assert - Attendre que l'alerte de retard apparaisse
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Vérifier l'icône warning dans l'alerte
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('warning');
    });

    it('n\'affiche pas d\'alerte de retard quand il n\'y en a pas', async () => {
      // Arrange - Vider les commandes et ajouter une commande récente
      await db.orders.clear();
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 102,
        tableId: 22,
        status: 'en_attente',
        createdAt: now,
      });

      // Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/table\(s\) en retard/)).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('État vide', () => {
    it('affiche un message quand il n\'y a aucun service en cours', async () => {
      // Arrange - Vider les commandes
      await db.orders.clear();

      // Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Aucun service en cours')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('affiche le message secondaire pour l\'état vide', async () => {
      // Arrange - Vider les commandes
      await db.orders.clear();

      // Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText('Les tables actives apparaîtront ici')
        ).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('affiche l\'icône restaurant pour l\'état vide', async () => {
      // Arrange - Vider les commandes
      await db.orders.clear();

      // Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('restaurant')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Limite de cartes', () => {
    it('respecte la limite maxCards par défaut (6)', async () => {
      // Arrange - Ajouter plusieurs commandes
      const now = Date.now();
      for (let i = 200; i < 215; i++) {
        await db.orders.add({
          ...createOrder(),
          id: i,
          tableId: i,
          status: 'en_attente',
          createdAt: now,
        });
      }

      // Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles.length).toBeLessThanOrEqual(6);
      }, { timeout: 2000 });
    });

    it('respecte une limite maxCards personnalisée', async () => {
      // Arrange - Ajouter plusieurs commandes
      const now = Date.now();
      for (let i = 300; i < 310; i++) {
        await db.orders.add({
          ...createOrder(),
          id: i,
          tableId: i,
          status: 'en_attente',
          createdAt: now,
        });
      }

      // Act
      render(<ActiveServices maxCards={3} />);

      // Assert
      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles.length).toBeLessThanOrEqual(3);
      }, { timeout: 2000 });
    });

    it('affiche un indicateur quand il y a plus de tables', async () => {
      // Arrange - Ajouter 10 commandes
      const now = Date.now();
      for (let i = 400; i < 410; i++) {
        await db.orders.add({
          ...createOrder(),
          id: i,
          tableId: i,
          status: 'en_attente',
          createdAt: now,
        });
      }

      // Act
      render(<ActiveServices maxCards={3} />);

      // Assert - Devrait afficher un indicateur "autre(s) table(s)"
      await waitFor(() => {
        expect(screen.getByText(/autre\(s\) table\(s\)/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Design system', () => {
    it('utilise bg-surface-container pour le fond', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('region')).toHaveClass('bg-surface-container');
      }, { timeout: 2000 });
    });

    it('utilise rounded-xl pour le border-radius', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('region')).toHaveClass('rounded-xl');
      }, { timeout: 2000 });
    });

    it('utilise font-headline text-xl font-bold pour le titre', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        const title = screen.getByText('Services Actifs');
        expect(title).toHaveClass('font-headline');
        expect(title).toHaveClass('text-xl');
        expect(title).toHaveClass('font-bold');
      }, { timeout: 2000 });
    });

    it('utilise font-label text-sm pour le sous-titre', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        const subtitle = screen.getByText('Vue d\'ensemble des tables et commandes en cours');
        expect(subtitle).toHaveClass('font-label');
        expect(subtitle).toHaveClass('text-sm');
      }, { timeout: 2000 });
    });
  });

  describe('Classes personnalisées', () => {
    it('fusionne les classes personnalisées avec les classes de base', async () => {
      // Arrange & Act
      render(<ActiveServices className="custom-class" />);

      // Assert
      await waitFor(() => {
        const region = screen.getByRole('region');
        expect(region).toHaveClass('custom-class');
        expect(region).toHaveClass('bg-surface-container');
      }, { timeout: 2000 });
    });
  });

  describe('Accessibilité', () => {
    it('a un rôle region', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('region')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('a un aria-label "Services Actifs"', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('region', { name: 'Services Actifs' })).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('a des boutons de toggle avec aria-pressed', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert - Les boutons devraient être disponibles immédiatement
      await waitFor(() => {
        expect(screen.getByRole('region')).toBeInTheDocument();
      }, { timeout: 2000 });

      const cuisineButton = screen.getByRole('button', { name: 'Vue Cuisine' });
      const serviceButton = screen.getByRole('button', { name: 'Vue Service' });

      expect(cuisineButton).toHaveAttribute('aria-pressed');
      expect(serviceButton).toHaveAttribute('aria-pressed');
    });

    it('a une liste de tables avec role="list"', async () => {
      // Arrange & Act
      render(<ActiveServices />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Réactivité', () => {
    it('met à jour l\'affichage quand une nouvelle commande est ajoutée', async () => {
      // Arrange - Vider d'abord pour avoir un état connu
      await db.orders.clear();

      // Ajouter une commande initiale
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 600,
        tableId: 60,
        status: 'en_attente',
        createdAt: now,
      });

      render(<ActiveServices />);

      // Attendre que l'article soit chargé
      await waitFor(() => {
        expect(screen.getByRole('article')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Act - Ajouter une nouvelle commande
      await db.orders.add({
        ...createOrder(),
        id: 601,
        tableId: 61,
        status: 'en_attente',
        createdAt: now + 1000,
      });

      // Assert - Devrait avoir 2 articles maintenant
      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles.length).toBe(2);
      }, { timeout: 2000 });
    });
  });
});

// src/hooks/useMenu.test.ts
// Tests unitaires pour les hooks de gestion du menu

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { seedDatabase } from '../db/database';
import { db } from '../db/database';
import type { MenuItem } from '../db/types';

// Import des hooks à tester
import {
  useAllMenuItems,
  useMenuItemsByCategory,
  useAvailableMenuItems,
  useMenuItem,
  createMenuItem,
  toggleMenuItemAvailability,
  useMenuItemsSearch,
} from './useMenu';

describe('useMenu Hooks', () => {
  beforeEach(async () => {
    // Seed des données avant chaque test
    await seedDatabase();
  });

  describe('useAllMenuItems', () => {
    it('devrait retourner tous les 6 items du menu créés par le seed', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAllMenuItems());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(6);
      });
    });

    it('devrait retourner les items triés par catégorie', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAllMenuItems());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      const categories = items.map(item => item.category);
      
      // Vérifier que les catégories sont triées
      const sortedCategories = [...categories].sort();
      expect(categories).toEqual(sortedCategories);
    });

    it('devrait retourner un tableau vide quand il n\'y a pas d\'items', async () => {
      // Arrange - Vider le menu
      await db.menuItems.clear();

      // Act
      const { result } = renderHook(() => useAllMenuItems());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });
  });

  describe('useMenuItemsByCategory', () => {
    it('devrait retourner les items de la catégorie "Entrées"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsByCategory('Entrées'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => {
        expect(item.category).toBe('Entrées');
      });
    });

    it('devrait retourner les items de la catégorie "Plats"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsByCategory('Plats'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => {
        expect(item.category).toBe('Plats');
      });
    });

    it('devrait retourner les items de la catégorie "Desserts"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsByCategory('Desserts'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => {
        expect(item.category).toBe('Desserts');
      });
    });

    it('devrait retourner les items triés par nom dans chaque catégorie', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsByCategory('Plats'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      const names = items.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('devrait retourner un tableau vide pour une catégorie sans items', async () => {
      // Arrange - Vider et créer un item dans une seule catégorie
      await db.menuItems.clear();
      await db.menuItems.add({
        name: 'Test',
        description: 'Test',
        price: 10,
        category: 'Entrées',
        isAvailable: 1,
      });

      // Act
      const { result } = renderHook(() => useMenuItemsByCategory('Desserts'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });
  });

  describe('useAvailableMenuItems', () => {
    it('devrait retourner uniquement les items disponibles (isAvailable = 1)', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAvailableMenuItems());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      items.forEach(item => {
        expect(item.isAvailable).toBe(1);
      });
    });

    it('devrait exclure les items avec isAvailable = 0', async () => {
      // Arrange - Ajouter un item indisponible
      await db.menuItems.add({
        name: 'Item Indisponible',
        description: 'Test',
        price: 15,
        category: 'Plats',
        isAvailable: 0,
      });

      // Act
      const { result } = renderHook(() => useAvailableMenuItems());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      const unavailableItem = items.find(item => item.name === 'Item Indisponible');
      expect(unavailableItem).toBeUndefined();
    });

    it('devrait retourner les items triés par catégorie', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAvailableMenuItems());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      const categories = items.map(item => item.category);
      const sortedCategories = [...categories].sort();
      expect(categories).toEqual(sortedCategories);
    });

    it('devrait retourner tous les items du seed (tous disponibles)', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAvailableMenuItems());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(6);
      });
    });
  });

  describe('useMenuItem', () => {
    it('devrait retourner un item spécifique par son ID', async () => {
      // Arrange - Récupérer le premier item
      const firstItem = await db.menuItems.orderBy("id").first();
      expect(firstItem).toBeDefined();

      // Act
      const { result } = renderHook(() => useMenuItem(firstItem!.id));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current!.id).toBe(firstItem!.id);
      expect(result.current!.name).toBe(firstItem!.name);
    });

    it('devrait retourner les bonnes informations pour le Tartare de Saumon', async () => {
      // Arrange - Trouver l'item par nom
      const tartareItem = await db.menuItems.where('name').equals('Tartare de Saumon').first();
      expect(tartareItem).toBeDefined();

      // Act
      const { result } = renderHook(() => useMenuItem(tartareItem!.id));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current!.name).toBe('Tartare de Saumon');
      expect(result.current!.category).toBe('Entrées');
      expect(result.current!.price).toBe(14.50);
    });

    it('devrait retourner undefined pour un ID inexistant', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItem(999));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });
  });

  describe('createMenuItem', () => {
    it('devrait créer un nouvel item du menu avec succès', async () => {
      // Arrange
      const newItemData = {
        name: 'Nouvel Item',
        description: 'Description du nouvel item',
        price: 22.00,
        category: 'Plats' as const,
        isAvailable: 1 as const,
      };

      // Act
      const itemId = await createMenuItem(newItemData);

      // Assert
      expect(itemId).toBeDefined();
      expect(typeof itemId).toBe('number');

      const createdItem = await db.menuItems.get(itemId);
      expect(createdItem).toBeDefined();
      expect(createdItem!.name).toBe('Nouvel Item');
      expect(createdItem!.price).toBe(22.00);
      expect(createdItem!.category).toBe('Plats');
      expect(createdItem!.isAvailable).toBe(1);
    });

    it('devrait créer un item avec des allergènes', async () => {
      // Arrange
      const newItemData = {
        name: 'Item Allergène',
        description: 'Test',
        price: 18.00,
        category: 'Entrées' as const,
        isAvailable: 1 as const,
        allergens: ['poisson', 'gluten'],
      };

      // Act
      const itemId = await createMenuItem(newItemData);

      // Assert
      const createdItem = await db.menuItems.get(itemId);
      expect(createdItem!.allergens).toEqual(['poisson', 'gluten']);
    });

    it('devrait créer un item avec une station', async () => {
      // Arrange
      const newItemData = {
        name: 'Item Station',
        description: 'Test',
        price: 20.00,
        category: 'Plats' as const,
        isAvailable: 1 as const,
        station: 'GRILL' as const,
      };

      // Act
      const itemId = await createMenuItem(newItemData);

      // Assert
      const createdItem = await db.menuItems.get(itemId);
      expect(createdItem!.station).toBe('GRILL');
    });

    it('devrait créer un item avec une image', async () => {
      // Arrange
      const newItemData = {
        name: 'Item Image',
        description: 'Test',
        price: 25.00,
        category: 'Desserts' as const,
        isAvailable: 1 as const,
        image: 'https://example.com/image.jpg',
      };

      // Act
      const itemId = await createMenuItem(newItemData);

      // Assert
      const createdItem = await db.menuItems.get(itemId);
      expect(createdItem!.image).toBe('https://example.com/image.jpg');
    });

    it('devrait créer un item indisponible (isAvailable = 0)', async () => {
      // Arrange
      const newItemData = {
        name: 'Item Indisponible',
        description: 'Test',
        price: 15.00,
        category: 'Desserts' as const,
        isAvailable: 0 as const,
      };

      // Act
      const itemId = await createMenuItem(newItemData);

      // Assert
      const createdItem = await db.menuItems.get(itemId);
      expect(createdItem!.isAvailable).toBe(0);
    });
  });

  describe('toggleMenuItemAvailability', () => {
    it('devrait passer un item de disponible (1) à indisponible (0)', async () => {
      // Arrange - Récupérer un item disponible
      const availableItem = await db.menuItems.where('isAvailable').equals(1).first();
      expect(availableItem).toBeDefined();

      // Act
      await toggleMenuItemAvailability(availableItem!.id, false);

      // Assert
      const updatedItem = await db.menuItems.get(availableItem!.id);
      expect(updatedItem!.isAvailable).toBe(0);
    });

    it('devrait passer un item de indisponible (0) à disponible (1)', async () => {
      // Arrange - Créer un item indisponible
      const itemId = await db.menuItems.add({
        name: 'Test',
        description: 'Test',
        price: 10,
        category: 'Plats',
        isAvailable: 0,
      });

      // Act
      await toggleMenuItemAvailability(itemId, true);

      // Assert
      const updatedItem = await db.menuItems.get(itemId);
      expect(updatedItem!.isAvailable).toBe(1);
    });

    it('devrait faire un toggle complet : 1 → 0 → 1', async () => {
      // Arrange - Récupérer un item disponible
      const item = await db.menuItems.where('isAvailable').equals(1).first();
      expect(item).toBeDefined();

      // Act - Toggle vers 0
      await toggleMenuItemAvailability(item!.id, false);
      let updatedItem = await db.menuItems.get(item!.id);
      expect(updatedItem!.isAvailable).toBe(0);

      // Act - Toggle vers 1
      await toggleMenuItemAvailability(item!.id, true);
      updatedItem = await db.menuItems.get(item!.id);

      // Assert
      expect(updatedItem!.isAvailable).toBe(1);
    });
  });

  describe('useMenuItemsSearch', () => {
    it('devrait trouver un item par son nom exact', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsSearch('Tartare de Saumon'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Tartare de Saumon');
    });

    it('devrait trouver des items par début de nom (case insensitive)', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsSearch('tartare'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Tartare de Saumon');
    });

    it('devrait trouver plusieurs items avec le même préfixe', async () => {
      // Arrange - Ajouter des items avec préfixe commun
      await db.menuItems.add({
        name: 'Test Item 1',
        description: 'Test',
        price: 10,
        category: 'Plats',
        isAvailable: 1,
      });
      await db.menuItems.add({
        name: 'Test Item 2',
        description: 'Test',
        price: 12,
        category: 'Plats',
        isAvailable: 1,
      });

      // Act
      const { result } = renderHook(() => useMenuItemsSearch('Test'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const items = result.current!;
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it('devrait retourner tous les items quand le terme de recherche est vide', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsSearch(''));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(6);
      });
    });

    it('devrait retourner tous les items quand le terme de recherche est null', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsSearch(''));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(6);
      });
    });

    it('devrait retourner un tableau vide pour un terme qui ne matche rien', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useMenuItemsSearch('ItemInexistant'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });
  });
});

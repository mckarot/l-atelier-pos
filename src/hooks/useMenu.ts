// src/hooks/useMenu.ts
// Hooks Dexie pour la gestion du menu

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { MenuItem, MenuCategory, CreateMenuItemInput } from '../db/types';

/**
 * Récupère tous les items du menu
 * Utilise l'index `category` pour le tri optionnel
 * @returns Observable de tous les items du menu
 */
export function useAllMenuItems(): MenuItem[] | undefined {
  return useLiveQuery(
    () => db.menuItems.orderBy('category').toArray(),
    []
  );
}

/**
 * Récupère les items du menu filtrés par catégorie
 * Utilise l'index `category` pour un filtrage O(log n)
 * @param category - Catégorie à filtrer ('Entrées', 'Plats', 'Desserts', 'Boissons')
 * @returns Observable des items de la catégorie
 */
export function useMenuItemsByCategory(category: MenuCategory): MenuItem[] | undefined {
  return useLiveQuery(
    () => db.menuItems
      .where('category')
      .equals(category)
      .sortBy('name'),
    [category]
  );
}

/**
 * Récupère uniquement les items disponibles (isAvailable = 1)
 * Utilise l'index `isAvailable` pour filtrer efficacement
 * IMPORTANT: isAvailable est stocké en 0|1 (pas boolean) pour compatibilité Dexie
 * @returns Observable des items disponibles
 */
export function useAvailableMenuItems(): MenuItem[] | undefined {
  return useLiveQuery(
    () => db.menuItems
      .where('isAvailable')
      .equals(1)
      .sortBy('category'),
    []
  );
}

/**
 * Récupère un item du menu par son ID
 * Utilise l'index primaire `id` pour une recherche O(1)
 * @param itemId - ID de l'item
 * @returns L'item ou undefined
 */
export function useMenuItem(itemId: number): MenuItem | undefined {
  return useLiveQuery(
    () => db.menuItems.get(itemId),
    [itemId]
  );
}

/**
 * Crée un nouvel item du menu
 * @param input - Données de création (sans id)
 * @returns ID de l'item créé
 */
export async function createMenuItem(input: CreateMenuItemInput): Promise<number> {
  const id = await db.menuItems.add(input as MenuItem);
  return id;
}

/**
 * Met à jour la disponibilité d'un item
 * Utilise 0|1 pour l'indexation Dexie (pas boolean)
 * @param itemId - ID de l'item
 * @param isAvailable - Disponibilité (true/false converti en 1/0)
 */
export async function toggleMenuItemAvailability(
  itemId: number,
  isAvailable: boolean
): Promise<void> {
  await db.menuItems.update(itemId, {
    isAvailable: isAvailable ? 1 : 0,
  });
}

/**
 * Recherche des items du menu par nom (partiel)
 * Utilise l'index `name` pour la recherche
 * @param searchTerm - Terme de recherche
 * @returns Observable des items correspondants
 */
export function useMenuItemsSearch(searchTerm: string): MenuItem[] | undefined {
  return useLiveQuery(
    () => {
      if (!searchTerm || searchTerm.trim() === '') {
        return db.menuItems.orderBy('name').toArray();
      }
      // Utilise l'index 'name' avec startsWithIgnoreCase
      return db.menuItems
        .where('name')
        .startsWithIgnoreCase(searchTerm.toLowerCase())
        .sortBy('name');
    },
    [searchTerm]
  );
}

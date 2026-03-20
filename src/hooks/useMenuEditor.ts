// src/hooks/useMenuEditor.ts
// Hook personnalisé pour les opérations CRUD du menu

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { MenuItem, MenuCategory, CreateMenuItemInput, StationType } from '../db/types';

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  allergens?: string[];
  station?: StationType;
  isAvailable: 0 | 1;
  customizationOptions?: CreateMenuItemInput['customizationOptions'];
}

interface UseMenuEditorReturn {
  menuItems: MenuItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isModalOpen: boolean;
  editingItem: MenuItem | null;
  openAddModal: () => void;
  openEditModal: (item: MenuItem) => void;
  closeModal: () => void;
  addItem: (data: MenuItemFormData) => Promise<void>;
  updateItem: (id: number, data: Partial<MenuItemFormData>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  toggleAvailability: (id: number, isAvailable: boolean) => Promise<void>;
}

const CATEGORIES: MenuCategory[] = ['Entrées', 'Plats', 'Desserts', 'Boissons'];
const STATIONS: StationType[] = ['GRILL', 'FROID', 'PATISSERIE'];

export function useMenuEditor(): UseMenuEditorReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Récupère tous les items du menu en temps réel
  const menuItems = useLiveQuery<MenuItem[]>(
    () => db.menuItems.orderBy('category').sortBy('name'),
    []
  );

  const isLoading = menuItems === undefined;

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setIsModalOpen(true);
    setError(null);
  }, []);

  const openEditModal = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    setError(null);
  }, []);

  const addItem = useCallback(async (data: MenuItemFormData): Promise<void> => {
    try {
      setError(null);
      
      // Validation
      if (!data.name.trim()) {
        throw new Error('Le nom est obligatoire');
      }
      if (data.price <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }

      const newItem: CreateMenuItemInput = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: data.price,
        category: data.category,
        image: data.image?.trim() || '',
        allergens: data.allergens || [],
        isAvailable: data.isAvailable,
        station: data.station,
        customizationOptions: data.customizationOptions,
      };

      await db.menuItems.add(newItem as MenuItem);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'ajout'));
      throw err;
    }
  }, [closeModal]);

  const updateItem = useCallback(async (
    id: number,
    data: Partial<MenuItemFormData>
  ): Promise<void> => {
    try {
      setError(null);
      
      // Validation
      if (data.name !== undefined && !data.name.trim()) {
        throw new Error('Le nom est obligatoire');
      }
      if (data.price !== undefined && data.price <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }

      const updateData: Partial<MenuItem> = {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.image !== undefined && { image: data.image?.trim() || '' }),
        ...(data.allergens !== undefined && { allergens: data.allergens }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        ...(data.station !== undefined && { station: data.station }),
        ...(data.customizationOptions !== undefined && { customizationOptions: data.customizationOptions }),
      };

      await db.menuItems.update(id, updateData);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la modification'));
      throw err;
    }
  }, [closeModal]);

  const deleteItem = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await db.menuItems.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la suppression'));
      throw err;
    }
  }, []);

  const toggleAvailability = useCallback(async (
    id: number,
    isAvailable: boolean
  ): Promise<void> => {
    try {
      await db.menuItems.update(id, { isAvailable: isAvailable ? 1 : 0 });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la mise à jour'));
      throw err;
    }
  }, []);

  return {
    menuItems,
    isLoading,
    error,
    isModalOpen,
    editingItem,
    openAddModal,
    openEditModal,
    closeModal,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability,
  };
}

export { CATEGORIES, STATIONS };

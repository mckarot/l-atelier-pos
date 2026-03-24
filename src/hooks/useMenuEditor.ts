// src/hooks/useMenuEditor.ts
// Hook personnalisé pour les opérations CRUD du menu

import { useState, useCallback, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { getDb } from '../firebase/config';
import type { MenuItem, MenuCategory, CreateMenuItemInput, StationType } from '../firebase/types';

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  allergens?: string[];
  station?: StationType;
  isAvailable: boolean; // Changed from 0 | 1 to boolean for Firestore
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
  updateItem: (id: string, data: Partial<MenuItemFormData>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string, isAvailable: boolean) => Promise<void>;
}

const CATEGORIES: MenuCategory[] = ['entree', 'plat', 'dessert', 'boisson'];
const STATIONS: StationType[] = ['FROID', 'GRILL', 'CHAUD', 'BAR', 'PIZZA'];

export function useMenuEditor(): UseMenuEditorReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Récupère tous les items du menu en temps réel
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const menuItemsRef = collection(getDb(), 'menuItems');
    const q = query(menuItemsRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as MenuItem));
        setMenuItems(items);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useMenuEditor] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur lors du chargement du menu'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

      await addDoc(collection(getDb(), 'menuItems'), {
        ...newItem,
        createdAt: Timestamp.now(),
      });
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'ajout'));
      throw err;
    }
  }, [closeModal]);

  const updateItem = useCallback(async (
    id: string,
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

      const itemRef = doc(getDb(), 'menuItems', id);
      await updateDoc(itemRef, updateData);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la modification'));
      throw err;
    }
  }, [closeModal]);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      const itemRef = doc(getDb(), 'menuItems', id);
      await deleteDoc(itemRef);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la suppression'));
      throw err;
    }
  }, []);

  const toggleAvailability = useCallback(async (
    id: string,
    isAvailable: boolean
  ): Promise<void> => {
    try {
      const itemRef = doc(getDb(), 'menuItems', id);
      await updateDoc(itemRef, { isAvailable });
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

// src/hooks/useMenu.ts
// Hooks Firestore pour la gestion du menu

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { MenuItem, MenuCategory, CreateMenuItemInput } from '../firebase/types';

/**
 * Récupère tous les items du menu
 * Utilise un snapshot temps réel pour les mises à jour automatiques
 * @returns Tous les items du menu
 */
export function useAllMenuItems(): {
  items: MenuItem[];
  isLoading: boolean;
  error: Error | null;
} {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(collection(db, 'menuItems'), orderBy('category', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedItems = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as MenuItem
        );
        setItems(fetchedItems);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useAllMenuItems] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { items, isLoading, error };
}

/**
 * Récupère les items du menu filtrés par catégorie
 * @param category - Catégorie à filtrer
 * @returns Les items de la catégorie
 */
export function useMenuItemsByCategory(
  category: MenuCategory
): { items: MenuItem[]; isLoading: boolean; error: Error | null } {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'menuItems'),
      where('category', '==', category),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedItems = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as MenuItem
        );
        setItems(fetchedItems);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useMenuItemsByCategory] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [category]);

  return { items, isLoading, error };
}

/**
 * Récupère uniquement les items disponibles
 * @returns Les items disponibles
 */
export function useAvailableMenuItems(): {
  items: MenuItem[];
  isLoading: boolean;
  error: Error | null;
} {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'menuItems'),
      where('isAvailable', '==', true),
      orderBy('category', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedItems = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as MenuItem
        );
        setItems(fetchedItems);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useAvailableMenuItems] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { items, isLoading, error };
}

/**
 * Récupère un item du menu par son ID
 * @param itemId - ID de l'item
 * @returns L'item ou null
 */
export function useMenuItem(
  itemId: string | null
): { item: MenuItem | null; isLoading: boolean; error: Error | null } {
  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const itemRef = doc(db, 'menuItems', itemId);

    const unsubscribe = onSnapshot(
      itemRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() } as MenuItem);
        } else {
          setItem(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('[useMenuItem] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [itemId]);

  return { item, isLoading, error };
}

/**
 * Crée un nouvel item de menu
 * @param input - Données de création
 */
export async function createMenuItem(input: CreateMenuItemInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'menuItems'), {
      ...input,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('[createMenuItem] Error:', error);
    throw error;
  }
}

/**
 * Met à jour un item de menu
 * @param itemId - ID de l'item
 * @param updates - Données à mettre à jour
 */
export async function updateMenuItem(
  itemId: string,
  updates: Partial<MenuItem>
): Promise<void> {
  try {
    const itemRef = doc(db, 'menuItems', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[updateMenuItem] Error:', error);
    throw error;
  }
}

/**
 * Toggle la disponibilité d'un item
 * @param itemId - ID de l'item
 */
export async function toggleMenuItemAvailability(
  itemId: string
): Promise<void> {
  try {
    const itemRef = doc(db, 'menuItems', itemId);
    const itemSnap = await getDoc(itemRef);
    if (itemSnap.exists()) {
      const currentAvailability = itemSnap.data().isAvailable;
      await updateDoc(itemRef, {
        isAvailable: !currentAvailability,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('[toggleMenuItemAvailability] Error:', error);
    throw error;
  }
}

/**
 * Supprime un item de menu
 * @param itemId - ID de l'item
 */
export async function deleteMenuItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'menuItems', itemId));
  } catch (error) {
    console.error('[deleteMenuItem] Error:', error);
    throw error;
  }
}

/**
 * Recherche des items par nom
 * @param searchTerm - Terme de recherche
 * @returns Les items correspondants
 */
export function useSearchMenuItems(
  searchTerm: string
): { items: MenuItem[]; isLoading: boolean; error: Error | null } {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!searchTerm) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Note: Firestore ne supporte pas la recherche full-text
    // On récupère tous les items et on filtre côté client
    // Pour une vraie recherche, utiliser Algolia ou ElasticSearch
    const q = query(collection(db, 'menuItems'), orderBy('name'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allItems = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as MenuItem
        );

        const filtered = allItems.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setItems(filtered);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useSearchMenuItems] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [searchTerm]);

  return { items, isLoading, error };
}

/**
 * Hook personnalisé pour les opérations Firestore
 * 
 * Fournit des utilitaires pour :
 * - Récupérer une collection
 * - Récupérer un document
 * - Créer un document
 * - Mettre à jour un document
 * - Supprimer un document
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import { useCallback, useState } from 'react';

/**
 * Hook pour les opérations CRUD sur Firestore
 */
export function useFirestore<T extends DocumentData>(collectionName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Récupérer tous les documents d'une collection
   */
  const getAll = useCallback(
    async (constraints: QueryConstraint[] = []): Promise<T[]> => {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(collection(db, collectionName), ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur Firestore');
        setError(error);
        console.error(`[useFirestore.${collectionName}.getAll] Error:`, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  /**
   * Récupérer un document par ID
   */
  const getById = useCallback(
    async (id: string): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur Firestore');
        setError(error);
        console.error(`[useFirestore.${collectionName}.getById] Error:`, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  /**
   * Créer un nouveau document
   */
  const create = useCallback(
    async (data: Omit<T, 'id'>): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: Timestamp.now(),
        });
        return docRef.id;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur Firestore');
        setError(error);
        console.error(`[useFirestore.${collectionName}.create] Error:`, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  /**
   * Mettre à jour un document
   */
  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur Firestore');
        setError(error);
        console.error(`[useFirestore.${collectionName}.update] Error:`, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  /**
   * Supprimer un document
   */
  const remove = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur Firestore');
        setError(error);
        console.error(`[useFirestore.${collectionName}.remove] Error:`, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    isLoading,
    error,
  };
}

/**
 * Hook pour récupérer une collection en temps réel
 * Utilise les snapshots en temps réel de Firestore
 */
export function useCollection<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): { data: T[] | undefined; isLoading: boolean; error: Error | null } {
  const [data, setData] = useState<T[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Note: Dans une vraie implémentation, on utiliserait onSnapshot ici
  // Pour l'instant, on fait un fetch simple
  // À remplacer par un vrai hook temps réel avec useEffect + onSnapshot

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      setData(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]
      );
    } catch (err) {
      const errObj = err instanceof Error ? err : new Error('Erreur Firestore');
      setError(errObj);
      console.error(`[useCollection.${collectionName}] Error:`, errObj);
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, constraints]);

  // Fetch initial
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error };
}

// Import React pour le hook useCollection
import React from 'react';

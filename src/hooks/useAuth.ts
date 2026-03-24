// src/hooks/useAuth.ts
// Hook Firestore pour l'authentification Firebase

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User, UserRole } from '../firebase/types';

/**
 * Hook d'authentification Firebase
 * Gère la connexion, déconnexion, et le profil utilisateur
 */
export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Écouter les changements d'authentification
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Récupérer le profil utilisateur depuis Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const unsubscribeUser = onSnapshot(
            userRef,
            (docSnap) => {
              if (docSnap.exists()) {
                setUserProfile({ id: docSnap.id, ...docSnap.data() } as User);
              } else {
                setUserProfile(null);
              }
              setIsLoading(false);
            },
            (err) => {
              console.error('[useAuth] Error fetching user profile:', err);
              setError(err instanceof Error ? err : new Error('Erreur de chargement du profil'));
              setIsLoading(false);
            }
          );

          return () => unsubscribeUser();
        } catch (err) {
          console.error('[useAuth] Error:', err);
          setError(err instanceof Error ? err : new Error('Erreur d\'authentification'));
          setIsLoading(false);
        }
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  /**
   * Se connecter avec email et mot de passe
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('[login] Error:', err);
      throw err;
    }
  }, []);

  /**
   * Se déconnecter
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('[logout] Error:', err);
      throw err;
    }
  }, []);

  return {
    firebaseUser,
    userProfile,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!firebaseUser,
    role: userProfile?.role,
    isActive: userProfile?.isActive,
  };
}

/**
 * Hook pour vérifier le rôle de l'utilisateur
 */
export function useUserRole() {
  const { userProfile, isLoading, isAuthenticated } = useAuth();

  const isAdmin = userProfile?.role === 'admin';
  const isKDS = userProfile?.role === 'kds';
  const isServeur = userProfile?.role === 'serveur';
  const isClient = userProfile?.role === 'client';

  return {
    role: userProfile?.role,
    isLoading,
    isAuthenticated,
    isAdmin,
    isKDS,
    isServeur,
    isClient,
  };
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 */
export function useHasRole(allowedRoles: UserRole[]) {
  const { userProfile, isLoading } = useUserRole();

  const hasRole = userProfile?.role ? allowedRoles.includes(userProfile.role) : false;

  return { hasRole, isLoading };
}

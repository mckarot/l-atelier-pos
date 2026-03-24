/**
 * Configuration Firebase pour L'Atelier POS
 * 
 * Singleton - Une seule instance pour toute l'application
 * Utilise les émulateurs locaux en développement
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'atelier-pos-dev.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'atelier-pos-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'atelier-pos-dev.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Variables pour tracker l'initialisation
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let emulatorsConnected = false;

/**
 * Initialiser l'application Firebase (une seule fois)
 */
function initApp(): FirebaseApp {
  if (!appInstance) {
    try {
      appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      console.log('[Firebase] ✅ Application initialisée');
    } catch (error) {
      console.error('[Firebase] Erreur initialisation app:', error);
      throw error;
    }
  }
  return appInstance;
}

/**
 * Obtenir l'instance Firestore (une seule fois)
 */
export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getApp());
    
    // Connecter aux émulateurs une seule fois
    if (import.meta.env.DEV && !emulatorsConnected) {
      try {
        connectFirestoreEmulator(dbInstance, 'localhost', 8080);
        emulatorsConnected = true;
        console.log('[Firebase] ✅ Firestore connecté aux émulateurs');
      } catch (error) {
        console.log('[Firebase] Firestore déjà connecté aux émulateurs');
      }
    }
  }
  return dbInstance;
}

/**
 * Obtenir l'instance Auth (une seule fois)
 */
export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getApp());
    
    // Connecter aux émulateurs une seule fois
    if (import.meta.env.DEV && !emulatorsConnected) {
      try {
        connectAuthEmulator(authInstance, 'http://localhost:9099');
        emulatorsConnected = true;
        console.log('[Firebase] ✅ Auth connecté aux émulateurs');
      } catch (error) {
        console.log('[Firebase] Auth déjà connecté aux émulateurs');
      }
    }
  }
  return authInstance;
}

/**
 * Obtenir l'application (initialise si nécessaire)
 */
export function getApp(): FirebaseApp {
  if (!appInstance) {
    return initApp();
  }
  return appInstance;
}

// Initialisation au chargement du module
initApp();

// Exports
export const app = getApp();
export const db = getDb();
export const auth = getAuthInstance();
export { firebaseConfig };
export default app;

/**
 * Setup des tests pour Firebase Emulator
 * 
 * Remplace fake-indexeddb par Firebase Emulator
 */

import '@testing-library/jest-dom';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  clearIndexedDbPersistence,
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { beforeAll, afterAll, beforeEach } from 'vitest';

// Configuration Firebase pour les tests
const testFirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:test123',
};

// Variables globales pour les tests
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

// Initialiser Firebase pour les tests
beforeAll(() => {
  // Réinitialiser les apps Firebase existantes
  if (getApps().length > 0) {
    getApps().forEach((app) => app.delete());
  }

  // Initialiser l'application de test
  app = initializeApp(testFirebaseConfig, 'test-app');
  db = getFirestore(app);
  auth = getAuth(app);

  // Connexion aux émulateurs
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
});

// Nettoyer après tous les tests
afterAll(async () => {
  if (db) {
    await clearIndexedDbPersistence(db);
  }
  if (app) {
    await app.delete();
  }
});

// Nettoyer la base de données avant chaque test
beforeEach(async () => {
  if (db) {
    // Clear all collections
    // Note: Cette fonction dépend de l'implémentation de clearFirestoreData
    await clearFirestoreData();
  }
});

/**
 * Effacer toutes les données de Firestore
 * Utile pour isoler chaque test
 */
export async function clearFirestoreData(): Promise<void> {
  if (!db) return;

  const collections = [
    'orders',
    'tables',
    'menuItems',
    'reservations',
    'users',
  ];

  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const batchPromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(batchPromises);
    } catch (error) {
      console.warn(`[clearFirestoreData] Error clearing ${collectionName}:`, error);
    }
  }
}

// Exports pour les tests
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export { app, db, auth };

// Helper pour créer un utilisateur de test
export async function createTestUser(
  email: string,
  role: 'admin' | 'kds' | 'serveur' | 'client',
  isActive = true
) {
  const userRef = doc(collection(db, 'users'));
  await setDoc(userRef, {
    email,
    role,
    isActive,
    name: `Test ${role}`,
    createdAt: Timestamp.now(),
  });
  return { id: userRef.id, email, role, isActive };
}

// Helper pour créer une commande de test
export async function createTestOrder(tableId: number, status = 'attente') {
  const orderRef = doc(collection(db, 'orders'));
  await setDoc(orderRef, {
    tableId,
    customerName: `Table ${tableId}`,
    status,
    items: [],
    total: 0,
    createdAt: Timestamp.now(),
  });
  return { id: orderRef.id, tableId, status };
}

// Import setDoc pour les helpers
import { setDoc } from 'firebase/firestore';

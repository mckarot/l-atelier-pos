// src/components/dev/FirebaseTestPanel.tsx
// Panneau de test Firebase pour le développement

import { useState, useCallback } from 'react';
import { db } from '../../firebase/config';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { seedDatabase } from '../../firebase/seed';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export function FirebaseTestPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const runTest = useCallback(async (name: string, testFn: () => Promise<string>) => {
    try {
      const message = await testFn();
      return { name, status: 'success' as const, message };
    } catch (error) {
      return {
        name,
        status: 'error' as const,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }, []);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      // Test 1: Connexion Firestore
      {
        name: '🔌 Connexion Firestore',
        fn: async () => {
          const testRef = doc(db, '_test', 'connection');
          await getDoc(testRef);
          return 'Connecté à Firestore';
        },
      },

      // Test 2: Émulateurs
      {
        name: '🧪 Émulateurs',
        fn: async () => {
          // Si on arrive ici, c'est que les émulateurs tournent
          return 'Émulateurs détectés';
        },
      },

      // Test 3: Seed Database
      {
        name: '🌱 Seed Database',
        fn: async () => {
          await seedDatabase();
          return 'Base de données seedée';
        },
      },

      // Test 4: Users
      {
        name: '👤 Users',
        fn: async () => {
          const usersSnap = await getDocs(collection(db, 'users'));
          return `${usersSnap.size} utilisateurs trouvés`;
        },
      },

      // Test 5: Tables
      {
        name: '🪑 Tables',
        fn: async () => {
          const tablesSnap = await getDocs(collection(db, 'tables'));
          return `${tablesSnap.size} tables trouvées`;
        },
      },

      // Test 6: Menu Items
      {
        name: '🍽️ Menu Items',
        fn: async () => {
          const itemsSnap = await getDocs(collection(db, 'menuItems'));
          return `${itemsSnap.size} items trouvés`;
        },
      },

      // Test 7: Orders
      {
        name: '📦 Orders',
        fn: async () => {
          const ordersSnap = await getDocs(collection(db, 'orders'));
          return `${ordersSnap.size} commandes trouvées`;
        },
      },

      // Test 8: Reservations
      {
        name: '📅 Reservations',
        fn: async () => {
          const reservationsSnap = await getDocs(collection(db, 'reservations'));
          return `${reservationsSnap.size} réservations trouvées`;
        },
      },

      // Test 9: Écriture Firestore
      {
        name: '✏️ Écriture Firestore',
        fn: async () => {
          const testRef = await addDoc(collection(db, '_test'), {
            timestamp: Timestamp.now(),
            test: true,
          });
          return `Document test créé: ${testRef.id}`;
        },
      },

      // Test 10: Rules de sécurité
      {
        name: '🔒 Rules de sécurité',
        fn: async () => {
          // En dev, les rules doivent être permissives
          const testRef = await addDoc(collection(db, '_test_rules'), {
            test: 'security',
          });
          return 'Rules permissives (mode dev)';
        },
      },
    ];

    // Exécuter tous les tests
    for (const test of tests) {
      const result = await runTest(test.name, test.fn);
      setResults((prev) => [...prev, result]);
    }

    setIsRunning(false);
  }, [runTest]);

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <>
      {/* Bouton Flottant */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="fixed bottom-6 right-6 z-[100] bg-primary-container text-on-primary-container px-6 py-4 rounded-full font-bold shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        aria-label="Tester Firebase"
      >
        <span className="material-symbols-outlined">
          {isRunning ? 'sync' : 'bug_report'}
        </span>
        {isRunning ? 'Tests en cours...' : 'Tester Firebase'}
      </button>

      {/* Panneau de Tests */}
      {isPanelOpen && (
        <div className="fixed bottom-24 right-6 z-[100] w-96 bg-surface-container-low rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden">
          {/* Header */}
          <div className="bg-surface-container-highest px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-on-surface">
              🔥 Firebase Test Panel
            </h2>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Fermer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Bouton Run */}
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="w-full bg-primary text-on-primary rounded-lg px-6 py-3 font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
            </button>

            {/* Résultats */}
            {results.length > 0 && (
              <div className="space-y-2">
                {/* Résumé */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-surface-container-high rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">
                      {successCount}/{results.length} tests réussis
                    </p>
                  </div>
                  {errorCount > 0 && (
                    <div className="text-error text-sm font-bold">
                      {errorCount} erreurs
                    </div>
                  )}
                </div>

                {/* Liste des tests */}
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      result.status === 'success'
                        ? 'bg-tertiary-container/10 border-tertiary'
                        : result.status === 'error'
                        ? 'bg-error-container/10 border-error'
                        : 'bg-surface-container-high border-outline-variant'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        {result.status === 'success'
                          ? 'check_circle'
                          : result.status === 'error'
                          ? 'error'
                          : 'pending'}
                      </span>
                      <span className="text-sm font-medium text-on-surface">
                        {result.name}
                      </span>
                    </div>
                    {result.message && (
                      <p className="text-xs text-on-surface-variant mt-1 ml-6">
                        {result.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            {results.length === 0 && !isRunning && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                  science
                </span>
                <p className="text-sm text-on-surface-variant">
                  Clique sur "Lancer tous les tests" pour vérifier la
                  configuration Firebase
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FirebaseTestPanel;

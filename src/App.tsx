import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { db, seedDatabase } from './db/database';

export function App() {
  // Seed database au premier lancement
  useEffect(() => {
    let isMounted = true;
  
    const initializeDatabase = async () => {
      try {
        await db.open();
        const tables = await db.tables;
        let hasData = false;

        for (const table of tables) {
          const count = await table.count();
          if (count > 0) {
            hasData = true;
            break;
          }
        }

        if (!hasData) {
          await seedDatabase();
        }
      } catch (error) {
        console.error('[App] Database initialization error:', error);
      } finally {
        // Cleanup pour éviter les state updates sur un composant démonté
        if (!isMounted) {
          console.log('[App] Component unmounted during initialization');
        }
      }
    };
  
    initializeDatabase();
  
    return () => {
      isMounted = false;
    };
  }, []);

  return <Outlet />;
}

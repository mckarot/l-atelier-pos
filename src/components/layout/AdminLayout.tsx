// src/components/layout/AdminLayout.tsx
import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { Order } from '../../firebase/types';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { SyncIndicator } from './SyncIndicator';
import { OfflineBanner } from '../ui/OfflineBanner';
import { useSyncStatus } from '../../hooks/useSyncStatus';

export function AdminLayout(): JSX.Element {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { status, lastSync } = useSyncStatus();

  // Commandes actives pour le compteur
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  useEffect(() => {
    const ordersRef = collection(getDb(), 'orders');
    const q = query(
      ordersRef,
      where('status', 'in', ['attente', 'preparation', 'pret'])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Order));
        // Sort by createdAt
        orders.sort((a, b) => {
          const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : a.createdAt;
          const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : b.createdAt;
          return aTime - bTime;
        });
        setActiveOrders(orders);
      },
      (error) => {
        console.error('[AdminLayout] Error monitoring active orders:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implémenter la logique de recherche globale
  }, []);

  const activeOrdersCount = activeOrders.length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <OfflineBanner />
      <AdminSidebar onLogout={handleLogout} />
      <main className="ml-64 flex-1 flex flex-col h-full overflow-hidden">
        <AdminTopBar
          activeOrdersCount={activeOrdersCount}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />
        <SyncIndicator status={status} lastSync={lastSync} />
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
        <footer className="p-6 flex justify-between items-center bg-surface-container-lowest/50 border-t border-outline-variant/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-tertiary"></div>
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-tighter">
                Instance: PROD-PARIS-01
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-sm text-on-surface-variant"
                aria-hidden="true"
              >
                database
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-tighter">
                Firebase Firestore
              </span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/50 uppercase">
            {new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        </footer>
      </main>
    </div>
  );
}

export default AdminLayout;

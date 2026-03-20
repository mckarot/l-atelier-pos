// src/views/Serveur/index.tsx
// Layout principal du module Serveur

import { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ServeurSidebar } from '../../components/layout/ServeurSidebar';
import { ServeurHeader } from '../../components/layout/ServeurHeader';
import { SyncIndicator } from '../../components/layout/SyncIndicator';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { clearUserRole } from '../../utils/roleGuard';
import { cn } from '../../utils/cn';

export default function ServeurLayout(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { status, lastSync } = useSyncStatus();

  const handleLogout = useCallback(() => {
    clearUserRole();
    navigate('/login');
  }, [navigate]);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Determine title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/serveur' || path === '/serveur/') {
      return 'Plan de Salle';
    }
    if (path === '/serveur/orders') {
      return 'Commandes';
    }
    if (path === '/serveur/menu') {
      return 'Menu';
    }
    if (path === '/serveur/dashboard') {
      return 'Tableau de Bord';
    }
    if (path === '/serveur/settings') {
      return 'Paramètres';
    }
    if (path === '/serveur/reservations') {
      return 'Réservations';
    }
    return "L'ATELIER POS";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <OfflineBanner />
      {/* Sidebar */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-0'
        )}
      >
        <ServeurSidebar onLogout={handleLogout} currentPath={location.pathname} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <ServeurHeader
          title={getPageTitle()}
          onMenuClick={handleMenuClick}
        />

        {/* Sync Indicator */}
        <SyncIndicator status={status} lastSync={lastSync} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

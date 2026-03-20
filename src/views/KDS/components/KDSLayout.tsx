// src/views/KDS/components/KDSLayout.tsx
// Layout principal du KDS avec Sidebar, Header, Board et Footer

import { type JSX, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { KDSHeader } from './KDSHeader';
import { KDSBoard } from './KDSBoard';
import { KDSFooter } from './KDSFooter';
import { SyncIndicator } from '../../../components/layout/SyncIndicator';
import { OfflineBanner } from '../../../components/ui/OfflineBanner';
import { useSyncStatus } from '../../../hooks/useSyncStatus';
import { clearUserRole } from '../../../utils/roleGuard';

/**
 * Layout principal du KDS
 * Comprend:
 * - Sidebar de navigation
 * - Header avec compteur LIVE
 * - Board avec 3 colonnes
 * - Footer avec statistiques
 */
export function KDSLayout(): JSX.Element {
  const navigate = useNavigate();
  const { status, lastSync } = useSyncStatus();

  // Gestion de la déconnexion
  const handleLogout = useCallback(() => {
    clearUserRole();
    navigate('/login');
  }, [navigate]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <OfflineBanner />
      {/* Sidebar de navigation */}
      <aside
        className="fixed left-0 top-0 h-full w-64 bg-surface-container-low shadow-xl z-40"
        role="navigation"
        aria-label="Navigation principale KDS"
      >
        {/* Header de la sidebar */}
        <div className="px-6 py-6 mb-4">
          <h1 className="text-on-surface font-bold font-headline text-xl tracking-tight">
            L'Atelier POS
          </h1>
          <p className="text-on-surface/40 text-xs font-label uppercase tracking-widest mt-1">
            Cuisine / KDS
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <a
            href="/menu"
            className="flex items-center gap-4 text-on-surface/60 px-4 py-3 hover:text-on-surface hover:bg-surface-variant/50 transition-all rounded-lg"
            aria-label="Aller au menu"
          >
            <span className="material-symbols-outlined">restaurant_menu</span>
            <span className="text-sm font-medium">Menu</span>
          </a>
          <a
            href="/kds"
            className="flex items-center gap-4 bg-surface-variant text-primary rounded-lg px-4 py-3 border-l-4 border-primary"
            aria-label="Voir les commandes (page actuelle)"
            aria-current="page"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-sm font-medium">Commandes</span>
          </a>
          <a
            href="/serveur"
            className="flex items-center gap-4 text-on-surface/60 px-4 py-3 hover:text-on-surface hover:bg-surface-variant/50 transition-all rounded-lg"
            aria-label="Aller aux tables"
          >
            <span className="material-symbols-outlined">table_restaurant</span>
            <span className="text-sm font-medium">Tables</span>
          </a>
          <a
            href="/admin"
            className="flex items-center gap-4 text-on-surface/60 px-4 py-3 hover:text-on-surface hover:bg-surface-variant/50 transition-all rounded-lg"
            aria-label="Aller au tableau de bord"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Tableau de bord</span>
          </a>
          <a
            href="/settings"
            className="flex items-center gap-4 text-on-surface/60 px-4 py-3 hover:text-on-surface hover:bg-surface-variant/50 transition-all rounded-lg"
            aria-label="Aller aux paramètres"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Paramètres</span>
          </a>
        </nav>

        {/* Profil utilisateur */}
        <div className="px-6 py-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Chef d'Atelier</p>
              <p className="text-[10px] text-on-surface/50 uppercase tracking-tighter">
                Service Midi
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-error-container
                       text-on-error-container rounded-lg text-xs font-bold uppercase
                       tracking-widest hover:brightness-110 transition-all focus-visible:outline
                       focus-visible:outline-2 focus-visible:outline-on-error-container"
            aria-label="Se déconnecter et changer de rôle"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Changer de rôle
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="ml-64 flex-1 flex flex-col h-full overflow-hidden">
        {/* Header avec compteur LIVE */}
        <KDSHeader />

        {/* Sync Indicator */}
        <SyncIndicator status={status} lastSync={lastSync} showDetails={false} />

        {/* Board Kanban avec les 3 colonnes */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <KDSBoard />
        </div>

        {/* Footer avec statistiques */}
        <KDSFooter />
      </div>
    </div>
  );
}

export default KDSLayout;

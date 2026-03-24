// src/components/layout/ServeurSidebar.tsx
// Sidebar du module Serveur - Layout principal

import { Link, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface ServeurSidebarProps {
  onLogout: () => void;
}

export function ServeurSidebar({ onLogout }: ServeurSidebarProps): JSX.Element {
  const location = useLocation();

  const navItems = [
    { label: 'Menu', path: '/serveur/menu', icon: 'restaurant' },
    { label: 'Commandes', path: '/serveur/orders', icon: 'receipt_long' },
    { label: 'Tables', path: '/serveur', icon: 'table_restaurant' },
    { label: 'Tableau de bord', path: '/serveur/dashboard', icon: 'dashboard' },
    { label: 'Paramètres', path: '/serveur/settings', icon: 'settings' },
  ];

  const handleLogoutClick = useCallback(() => {
    onLogout();
  }, [onLogout]);

  return (
    <aside
      className="w-64 bg-surface-container-low h-full flex flex-col"
      role="navigation"
      aria-label="Navigation principale Serveur"
    >
      {/* Header - Logo */}
      <div className="px-6 py-6 border-b border-outline-variant/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">restaurant</span>
          </div>
          <span className="text-xl font-bold text-on-surface font-headline">L'Atelier</span>
        </div>
        <p className="text-[10px] text-on-surface-variant/60 font-mono uppercase tracking-widest ml-11">
          GESTION SYSTÈME
        </p>
      </div>

      {/* Profile Section */}
      <div className="px-4 py-4 mb-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-highest/30">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface font-headline">
              Chef d'Atelier
            </p>
            <p className="text-xs text-on-surface-variant/60">
              Service Midi
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                isActive
                  ? 'text-primary font-bold bg-surface-container-highest/50 border-l-2 border-primary'
                  : 'text-on-surface/60 hover:text-on-surface hover:bg-surface-container-highest/30'
              )}
            >
              <span
                className="material-symbols-outlined text-xl"
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="font-headline text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FAB - Nouvelle Commande */}
      <div className="px-4 py-4">
        <button
          className="w-full bg-primary-container text-on-primary-container font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
          aria-label="Créer une nouvelle commande"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="text-xs uppercase tracking-wider">Nouvelle Commande</span>
        </button>
      </div>

      {/* Footer - Theme & Urgence */}
      <div className="px-3 py-4 border-t border-outline-variant/10 space-y-2">
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface/60 hover:text-on-surface hover:bg-surface-container-highest/30 transition-colors"
          aria-label="Changer le thème"
        >
          <span className="material-symbols-outlined text-xl">dark_mode</span>
          <span className="font-headline text-sm">Thème</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error/70 hover:text-error hover:bg-error-container/20 transition-colors"
          aria-label="Appeler en urgence"
        >
          <span className="material-symbols-outlined text-xl">emergency</span>
          <span className="font-headline text-sm">Urgence</span>
        </button>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface/60 hover:text-on-surface hover:bg-surface-container-highest/30 transition-colors"
          aria-label="Changer de rôle"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="font-headline text-sm">Changer de rôle</span>
        </button>
      </div>
    </aside>
  );
}

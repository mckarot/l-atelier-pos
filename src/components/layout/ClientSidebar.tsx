// src/components/layout/ClientSidebar.tsx
// Sidebar de navigation pour la vue Client

import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn, iconFilled } from '../../utils/cn';
import { clearUserRole } from '../../utils/roleGuard';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Menu', path: '/client', icon: 'restaurant_menu' },
  { label: 'Commandes', path: '/client/orders', icon: 'receipt_long' },
  { label: 'Tables', path: '/client/tables', icon: 'table_bar' },
  { label: 'Tableau de bord', path: '/client/dashboard', icon: 'dashboard' },
];

interface ClientSidebarProps {
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

export function ClientSidebar({ onToggleTheme, isDarkMode = false }: ClientSidebarProps): JSX.Element {
  const location = useLocation();
  const [showUrgency, setShowUrgency] = useState(false);

  const handleLogout = useCallback(() => {
    clearUserRole();
    window.location.href = '/login';
  }, []);

  const handleUrgency = useCallback(() => {
    setShowUrgency(true);
    // Simuler un appel d'urgence - en production, appeler le serveur
    setTimeout(() => setShowUrgency(false), 3000);
  }, []);

  return (
    <aside
      className="w-64 bg-surface-container-low border-r border-outline-variant/10 flex flex-col h-full"
      role="navigation"
      aria-label="Navigation principale Client"
    >
      {/* Logo */}
      <div className="px-6 py-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
            <span
              className={cn(iconFilled(), 'text-on-primary-container text-2xl')}
              aria-hidden="true"
            >
              restaurant
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-on-surface font-headline">
              L'Atelier
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
              SERVICE CLIENT V2.4
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium',
                'transition-colors duration-200 group',
                'border-l-2',
                isActive
                  ? 'text-primary font-bold border-primary bg-surface-container-highest'
                  : 'text-on-surface/60 border-transparent hover:text-on-surface hover:bg-surface-variant'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined',
                  isActive && iconFilled()
                )}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="font-headline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Urgency indicator */}
      {showUrgency && (
        <div className="mx-4 mb-4 p-3 bg-error-container/20 border border-error/30 rounded-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span
              className={cn(iconFilled(), 'text-error text-xl animate-spin')}
              aria-hidden="true"
            >
              warning
            </span>
            <span className="text-sm font-bold text-error">URGENCE DEMANDÉE</span>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="px-3 border-t border-outline-variant/10 pt-4 space-y-2 mb-4">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface/60
                     font-medium hover:text-primary hover:bg-surface-variant
                     transition-colors duration-200 w-full text-left"
          aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
          aria-pressed={isDarkMode}
        >
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
          <span className="font-headline text-sm">
            {isDarkMode ? 'Mode Clair' : 'Thème Sombre'}
          </span>
        </button>

        {/* Urgency button */}
        <button
          onClick={handleUrgency}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface/60
                     font-medium hover:text-error hover:bg-error-container/20
                     transition-colors duration-200 w-full text-left"
          aria-label="Appeler un serveur en urgence"
        >
          <span
            className={cn(iconFilled(), 'text-error')}
            aria-hidden="true"
          >
            diamond
          </span>
          <span className="font-headline text-sm">Urgence</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface/60
                     font-medium hover:text-error hover:bg-error-container/20
                     transition-colors duration-200 w-full text-left"
          aria-label="Se déconnecter"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-headline text-sm">Changer de rôle</span>
        </button>
      </div>
    </aside>
  );
}

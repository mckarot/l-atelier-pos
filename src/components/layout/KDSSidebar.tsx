import { Link, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface KDSSidebarProps {
  onLogout: () => void;
}

export function KDSSidebar({ onLogout }: KDSSidebarProps): JSX.Element {
  const location = useLocation();

  const navItems = [
    { label: 'Menu', path: '/kds/menu', icon: 'menu_book' },
    { label: 'Commandes', path: '/kds', icon: 'receipt_long' },
    { label: 'Tables', path: '/kds/tables', icon: 'table_restaurant' },
    { label: 'Dashboard', path: '/kds/dashboard', icon: 'dashboard' },
    { label: 'Paramètres', path: '/kds/settings', icon: 'settings' },
  ];

  const handleLogoutClick = useCallback(() => {
    onLogout();
  }, [onLogout]);

  return (
    <aside
      className="w-64 bg-surface-container-low h-full flex flex-col"
      role="navigation"
      aria-label="Navigation principale KDS"
    >
      {/* Header */}
      <div className="px-6 py-6 border-b border-outline-variant/15">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-2xl"
            aria-hidden="true"
          >
            restaurant_menu
          </span>
          <h1 className="text-xl font-bold text-on-surface font-['Space_Grotesk']">
            L'Atelier POS
          </h1>
        </div>
        <p className="text-xs text-on-surface-variant/40 font-mono uppercase tracking-widest mt-1">
          Cuisine / KDS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
              location.pathname === item.path
                ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-highest/30'
                : 'text-on-surface/60 hover:text-on-surface hover:bg-surface-container-highest'
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
        ))}
      </nav>

      {/* Footer - Change role button */}
      <div className="px-3 py-4 border-t border-outline-variant/15">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface/60 hover:text-on-surface hover:bg-surface-container-highest transition-colors"
          aria-label="Changer de rôle"
        >
          <span
            className="material-symbols-outlined text-xl"
            aria-hidden="true"
          >
            logout
          </span>
          <span className="font-headline text-sm">Changer de rôle</span>
        </button>
      </div>
    </aside>
  );
}

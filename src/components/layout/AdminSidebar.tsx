// src/components/layout/AdminSidebar.tsx
import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn, iconFilled } from '../../utils/cn';
import { clearUserRole } from '../../utils/roleGuard';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface AdminSidebarProps {
  onLogout: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
  { label: 'Live Orders', path: '/admin/orders', icon: 'receipt_long' },
  { label: 'Kitchen Display', path: '/admin/kitchen', icon: 'soup_kitchen' },
  { label: 'Menu Editor', path: '/admin/menu', icon: 'menu_book' },
  { label: 'Staff Management', path: '/admin/staff', icon: 'group' },
  { label: 'Reports', path: '/admin/reports', icon: 'analytics' },
];

export function AdminSidebar({ onLogout }: AdminSidebarProps): JSX.Element {
  const location = useLocation();

  const handleLogout = useCallback(() => {
    clearUserRole();
    onLogout();
  }, [onLogout]);

  return (
    <aside
      className="w-64 bg-surface-container-low border-r border-outline-variant/10 flex flex-col h-full"
      role="navigation"
      aria-label="Navigation principale Admin"
    >
      {/* Logo */}
      <div className="px-6 py-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
            <span
              className={cn(iconFilled(), 'text-on-primary-container text-xl')}
              aria-hidden="true"
            >
              restaurant
            </span>
          </div>
          <span className="text-xl font-bold text-on-surface font-headline">
            Atelier Admin
          </span>
        </div>
        <p className="text-xs text-on-surface-variant/60 font-mono uppercase tracking-widest mt-1">
          Station 01 - Main Floor
        </p>
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
                isActive
                  ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-highest/30'
                  : 'text-on-surface/60 hover:text-on-surface hover:bg-surface-variant'
              )}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="font-headline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FAB Create Order */}
      <div className="px-6 mt-4 mb-6">
        <button
          className="w-full bg-primary-container text-on-primary-container font-bold py-3 rounded-lg
                     flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98]
                     transition-all"
          aria-label="Créer une nouvelle commande"
        >
          <span
            className={cn(iconFilled(), 'text-sm')}
            aria-hidden="true"
          >
            add_circle
          </span>
          <span>Create Order</span>
        </button>
      </div>

      {/* Bottom actions */}
      <div className="px-3 border-t border-outline-variant/10 pt-4 space-y-1 mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface/60
                     font-medium hover:text-error hover:bg-error-container/20
                     transition-colors duration-200 w-full text-left"
          aria-label="Se déconnecter"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-headline">Changer de rôle</span>
        </button>
        <button
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface/60
                     font-medium hover:text-primary hover:bg-surface-variant
                     transition-colors duration-200 w-full text-left"
          aria-label="Paramètres"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-headline">Settings</span>
        </button>
        <button
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface/60
                     font-medium hover:text-primary hover:bg-surface-variant
                     transition-colors duration-200 w-full text-left"
          aria-label="Support"
        >
          <span className="material-symbols-outlined">support</span>
          <span className="font-headline">Support</span>
        </button>
      </div>
    </aside>
  );
}

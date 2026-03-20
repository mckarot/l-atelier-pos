// src/views/Login/index.tsx
// Page de sélection de rôle

// TODO (v1.1): Authentification par rôle dans localStorage uniquement
// Cette implémentation est une limitation volontaire pour la v1.0
// Authentification JWT réelle prévue en v1.1 — NE PAS UTILISER EN PRODUCTION

import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { setUserRole } from '../../utils/roleGuard';
import type { UserRole } from '../../db/types';
import { cn, iconFilled } from '../../utils/cn';

interface RoleCard {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
}

const roles: RoleCard[] = [
  {
    role: 'admin',
    label: 'Administrateur',
    description: 'Tableau de bord, gestion complète',
    icon: 'dashboard',
  },
  {
    role: 'kds',
    label: 'Cuisine (KDS)',
    description: 'Écran de production cuisine',
    icon: 'soup_kitchen',
  },
  {
    role: 'serveur',
    label: 'Serveur',
    description: 'Plan de salle, réservations',
    icon: 'room_service',
  },
  {
    role: 'client',
    label: 'Client',
    description: 'Menu, commande en ligne',
    icon: 'restaurant_menu',
  },
];

function LoginView(): JSX.Element {
  const navigate = useNavigate();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setIsSelecting(true);
    try {
      setUserRole(role);
      
      // Redirection selon le rôle
      const paths: Record<UserRole, string> = {
        admin: '/admin',
        kds: '/kds',
        serveur: '/serveur',
        client: '/client',
      };
      
      navigate(paths[role]);
    } catch (error) {
      console.error('[Login] Error setting role:', error);
      setIsSelecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo et titre */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
          <span
            className={cn(iconFilled(), 'text-on-primary text-4xl')}
            aria-hidden="true"
          >
            restaurant_menu
          </span>
        </div>
        <h1 className="text-4xl font-black text-on-surface font-headline mb-2">
          L'Atelier POS
        </h1>
        <p className="text-on-surface-variant text-sm">
          Système de gestion de restaurant
        </p>
      </div>

      {/* Grille des rôles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {roles.map((roleCard) => (
          <button
            key={roleCard.role}
            onClick={() => handleRoleSelect(roleCard.role)}
            disabled={isSelecting}
            className={cn(
              'group relative flex flex-col items-start p-6 rounded-xl',
              'bg-surface-container-highest border border-outline-variant/10',
              'hover:border-primary/30 hover:bg-surface-bright',
              'transition-all duration-200',
              'active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'text-left'
            )}
            aria-label={`Sélectionner le rôle ${roleCard.label}`}
          >
            <div className="flex items-start gap-4 w-full">
              <div className="flex-shrink-0">
                <span
                  className="material-symbols-outlined text-3xl text-on-surface-variant 
                             group-hover:text-primary transition-colors"
                  aria-hidden="true"
                >
                  {roleCard.icon}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-on-surface font-headline mb-1">
                  {roleCard.label}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {roleCard.description}
                </p>
              </div>
            </div>
            
            {/* Indicateur de sélection */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span
                className={cn(iconFilled(), 'text-primary text-2xl')}
                aria-hidden="true"
              >
                arrow_forward_ios
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs text-on-surface-variant font-mono">
          Version 1.0.0 • Mode Développement
        </p>
      </div>
    </div>
  );
}

export default LoginView;

// src/utils/roleGuard.ts
// Gardes d'authentification par rôle

import type { UserRole } from '../firebase/types';

const STORAGE_KEY = 'atelier_role';

/**
 * Récupère le rôle actuel de l'utilisateur depuis localStorage
 */
export function getUserRole(): UserRole | null {
  const role = localStorage.getItem(STORAGE_KEY);
  if (isValidRole(role)) {
    return role;
  }
  return null;
}

/**
 * Définit le rôle de l'utilisateur dans localStorage
 */
export function setUserRole(role: UserRole): void {
  localStorage.setItem(STORAGE_KEY, role);
}

/**
 * Supprime le rôle de l'utilisateur (déconnexion)
 */
export function clearUserRole(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Vérifie si le rôle fourni est valide
 */
function isValidRole(role: string | null): role is UserRole {
  return role !== null && ['admin', 'kds', 'serveur', 'client'].includes(role);
}

/**
 * Vérifie si l'utilisateur a le rôle requis
 */
export function hasRole(requiredRole: UserRole): boolean {
  const currentRole = getUserRole();
  return currentRole === requiredRole;
}

/**
 * Vérifie si l'utilisateur a l'un des rôles requis
 */
export function hasAnyRole(requiredRoles: UserRole[]): boolean {
  const currentRole = getUserRole();
  return currentRole !== null && requiredRoles.includes(currentRole);
}

/**
 * Redirige vers la page appropriée selon le rôle
 */
export function getRedirectPathForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'kds':
      return '/kds';
    case 'serveur':
      return '/serveur';
    case 'client':
      return '/client';
    default:
      return '/login';
  }
}

// src/hooks/useRole.ts
// Hook personnalisé pour la gestion du rôle utilisateur

import { useState, useCallback } from 'react';
import type { UserRole } from '../firebase/types';
import { getUserRole, setUserRole, clearUserRole, getRedirectPathForRole } from '../utils/roleGuard';

interface UseRoleReturn {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
  getRedirectPath: () => string;
  isAdmin: boolean;
  isKDS: boolean;
  isServeur: boolean;
  isClient: boolean;
}

export function useRole(): UseRoleReturn {
  const [role, setRoleState] = useState<UserRole | null>(getUserRole());

  const setRole = useCallback((newRole: UserRole) => {
    setUserRole(newRole);
    setRoleState(newRole);
  }, []);

  const clearRole = useCallback(() => {
    clearUserRole();
    setRoleState(null);
  }, []);

  const getRedirectPath = useCallback((): string => {
    return role ? getRedirectPathForRole(role) : '/login';
  }, [role]);

  return {
    role,
    setRole,
    clearRole,
    getRedirectPath,
    isAdmin: role === 'admin',
    isKDS: role === 'kds',
    isServeur: role === 'serveur',
    isClient: role === 'client',
  };
}

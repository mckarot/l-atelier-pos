import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from './useRole';
import { clearUserRole } from '../utils/roleGuard';
import type { UserRole } from '../firebase/types';

export interface UseRoleGuardReturn {
  isAuthorized: boolean;
  currentRole: UserRole | null;
  redirectTo: string;
  handleLogout: () => void;
}

export function useRoleGuard(allowedRole: UserRole): UseRoleGuardReturn {
  const navigate = useNavigate();
  const { role, clearRole } = useRole();

  const isAuthorized = role === allowedRole;

  const redirectTo = useCallback((): string => {
    if (!role) return '/login';
    if (role === allowedRole) return window.location.pathname;
    return '/login';
  }, [role, allowedRole]);

  const handleLogout = useCallback(() => {
    clearUserRole();
    clearRole();
    navigate('/login', { replace: true });
  }, [clearRole, navigate]);

  return {
    isAuthorized,
    currentRole: role,
    redirectTo: redirectTo(),
    handleLogout,
  };
}

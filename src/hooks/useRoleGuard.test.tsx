// src/hooks/useRoleGuard.test.ts
// Tests unitaires pour le hook useRoleGuard

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useRoleGuard } from './useRoleGuard';
import * as roleGuard from '../utils/roleGuard';

// Wrapper pour fournir le contexte de routing
function createWrapper(initialPath = '/') {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/*" element={children} />
        </Routes>
      </MemoryRouter>
    );
  };
}

describe('useRoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('useRoleGuard - Authorization checks', () => {
    it('devrait retourner isAuthorized=true quand le rôle correspond', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'admin');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(true);
      expect(result.current.currentRole).toBe('admin');
    });

    it('devrait retourner isAuthorized=false quand le rôle ne correspond pas', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'kds');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(false);
      expect(result.current.currentRole).toBe('kds');
    });

    it('devrait retourner isAuthorized=false quand aucun rôle n\'est défini', () => {
      // Arrange
      localStorage.removeItem('atelier_role');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(false);
      expect(result.current.currentRole).toBe(null);
    });

    it('devrait retourner isAuthorized=true pour le rôle kds', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'kds');
      const wrapper = createWrapper('/kds');

      // Act
      const { result } = renderHook(() => useRoleGuard('kds'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(true);
      expect(result.current.currentRole).toBe('kds');
    });

    it('devrait retourner isAuthorized=true pour le rôle serveur', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'serveur');
      const wrapper = createWrapper('/serveur');

      // Act
      const { result } = renderHook(() => useRoleGuard('serveur'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(true);
      expect(result.current.currentRole).toBe('serveur');
    });

    it('devrait retourner isAuthorized=true pour le rôle client', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'client');
      const wrapper = createWrapper('/client');

      // Act
      const { result } = renderHook(() => useRoleGuard('client'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(true);
      expect(result.current.currentRole).toBe('client');
    });
  });

  describe('useRoleGuard - redirectTo', () => {
    it('devrait retourner /login quand aucun rôle n\'est défini', () => {
      // Arrange
      localStorage.removeItem('atelier_role');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert
      expect(result.current.redirectTo).toBe('/login');
    });

    it('devrait retourner /login quand le rôle ne correspond pas', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'kds');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert
      expect(result.current.redirectTo).toBe('/login');
    });
  });

  describe('useRoleGuard - handleLogout', () => {
    it('devrait effacer le rôle du localStorage', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'admin');
      const wrapper = createWrapper('/admin');
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Act
      act(() => {
        result.current.handleLogout();
      });

      // Assert
      expect(localStorage.getItem('atelier_role')).toBe(null);
    });

    it('devrait appeler clearUserRole du module roleGuard', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'admin');
      const clearUserRoleSpy = vi.spyOn(roleGuard, 'clearUserRole');
      const wrapper = createWrapper('/admin');
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Act
      act(() => {
        result.current.handleLogout();
      });

      // Assert
      expect(clearUserRoleSpy).toHaveBeenCalled();
      clearUserRoleSpy.mockRestore();
    });

    it('devrait fonctionner quand le rôle est déjà null', () => {
      // Arrange
      localStorage.removeItem('atelier_role');
      const wrapper = createWrapper('/login');
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Act & Assert - ne devrait pas lancer d'erreur
      expect(() => {
        act(() => {
          result.current.handleLogout();
        });
      }).not.toThrow();
    });
  });

  describe('useRoleGuard - Reactivity', () => {
    it('devrait initialiser avec le bon rôle', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'admin');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(true);
      expect(result.current.currentRole).toBe('admin');
    });

    it('devrait initialiser avec un rôle non autorisé', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'kds');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(false);
      expect(result.current.currentRole).toBe('kds');
    });
  });

  describe('useRoleGuard - Edge cases', () => {
    it('devrait gérer un rôle invalide dans localStorage', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'invalid_role');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert - Le rôle invalide devrait être traité comme null
      expect(result.current.isAuthorized).toBe(false);
      expect(result.current.currentRole).toBe(null);
    });

    it('devrait gérer une chaîne vide dans localStorage', () => {
      // Arrange
      localStorage.setItem('atelier_role', '');
      const wrapper = createWrapper('/admin');

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'), { wrapper });

      // Assert
      expect(result.current.isAuthorized).toBe(false);
      expect(result.current.currentRole).toBe(null);
    });
  });
});

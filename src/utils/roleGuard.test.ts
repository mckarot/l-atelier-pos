// src/utils/roleGuard.test.ts
// Tests unitaires pour les gardes d'authentification par rôle

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUserRole,
  setUserRole,
  clearUserRole,
  hasRole,
  hasAnyRole,
  getRedirectPathForRole,
} from './roleGuard';
import type { UserRole } from '../db/types';

describe('roleGuard', () => {
  // localStorage est nettoyé automatiquement par setup.ts

  describe('setUserRole() / getUserRole()', () => {
    it('sauvegarde et récupère un rôle admin', () => {
      // Arrange
      const role: UserRole = 'admin';

      // Act
      setUserRole(role);
      const result = getUserRole();

      // Assert
      expect(result).toBe('admin');
    });

    it('sauvegarde et récupère un rôle kds', () => {
      // Arrange
      const role: UserRole = 'kds';

      // Act
      setUserRole(role);
      const result = getUserRole();

      // Assert
      expect(result).toBe('kds');
    });

    it('sauvegarde et récupère un rôle serveur', () => {
      // Arrange
      const role: UserRole = 'serveur';

      // Act
      setUserRole(role);
      const result = getUserRole();

      // Assert
      expect(result).toBe('serveur');
    });

    it('sauvegarde et récupère un rôle client', () => {
      // Arrange
      const role: UserRole = 'client';

      // Act
      setUserRole(role);
      const result = getUserRole();

      // Assert
      expect(result).toBe('client');
    });

    it('retourne null quand aucun rôle n\'est défini', () => {
      // Arrange - localStorage est vide
      localStorage.clear();

      // Act
      const result = getUserRole();

      // Assert
      expect(result).toBe(null);
    });

    it('retourne null quand le rôle dans localStorage est invalide', () => {
      // Arrange
      localStorage.setItem('atelier_role', 'invalid_role');

      // Act
      const result = getUserRole();

      // Assert
      expect(result).toBe(null);
    });

    it('écrase le rôle précédent quand on en définit un nouveau', () => {
      // Arrange
      setUserRole('admin');

      // Act
      setUserRole('client');
      const result = getUserRole();

      // Assert
      expect(result).toBe('client');
    });
  });

  describe('clearUserRole()', () => {
    it('supprime le rôle du localStorage', () => {
      // Arrange
      setUserRole('admin');
      expect(getUserRole()).toBe('admin');

      // Act
      clearUserRole();

      // Assert
      expect(getUserRole()).toBe(null);
    });

    it('ne lève pas d\'erreur si aucun rôle n\'est défini', () => {
      // Arrange - localStorage vide
      localStorage.clear();

      // Act & Assert - ne doit pas lever d'erreur
      expect(() => clearUserRole()).not.toThrow();
    });
  });

  describe('hasRole()', () => {
    it('retourne true quand l\'utilisateur a le rôle requis', () => {
      // Arrange
      setUserRole('admin');

      // Act
      const result = hasRole('admin');

      // Assert
      expect(result).toBe(true);
    });

    it('retourne false quand l\'utilisateur a un rôle différent', () => {
      // Arrange
      setUserRole('admin');

      // Act
      const result = hasRole('client');

      // Assert
      expect(result).toBe(false);
    });

    it('retourne false quand aucun rôle n\'est défini', () => {
      // Arrange - localStorage vide
      localStorage.clear();

      // Act
      const result = hasRole('admin');

      // Assert
      expect(result).toBe(false);
    });

    it('retourne true pour le rôle kds', () => {
      // Arrange
      setUserRole('kds');

      // Act
      const result = hasRole('kds');

      // Assert
      expect(result).toBe(true);
    });

    it('retourne true pour le rôle serveur', () => {
      // Arrange
      setUserRole('serveur');

      // Act
      const result = hasRole('serveur');

      // Assert
      expect(result).toBe(true);
    });

    it('retourne true pour le rôle client', () => {
      // Arrange
      setUserRole('client');

      // Act
      const result = hasRole('client');

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('hasAnyRole()', () => {
    it('retourne true quand l\'utilisateur a l\'un des rôles requis', () => {
      // Arrange
      setUserRole('admin');

      // Act
      const result = hasAnyRole(['admin', 'serveur']);

      // Assert
      expect(result).toBe(true);
    });

    it('retourne true quand l\'utilisateur a le premier rôle de la liste', () => {
      // Arrange
      setUserRole('serveur');

      // Act
      const result = hasAnyRole(['serveur', 'admin']);

      // Assert
      expect(result).toBe(true);
    });

    it('retourne false quand l\'utilisateur n\'a aucun des rôles requis', () => {
      // Arrange
      setUserRole('client');

      // Act
      const result = hasAnyRole(['admin', 'kds']);

      // Assert
      expect(result).toBe(false);
    });

    it('retourne false quand aucun rôle n\'est défini', () => {
      // Arrange - localStorage vide
      localStorage.clear();

      // Act
      const result = hasAnyRole(['admin', 'kds']);

      // Assert
      expect(result).toBe(false);
    });

    it('retourne true avec un seul rôle dans le tableau qui correspond', () => {
      // Arrange
      setUserRole('kds');

      // Act
      const result = hasAnyRole(['kds']);

      // Assert
      expect(result).toBe(true);
    });

    it('retourne false avec un seul rôle dans le tableau qui ne correspond pas', () => {
      // Arrange
      setUserRole('client');

      // Act
      const result = hasAnyRole(['admin']);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getRedirectPathForRole()', () => {
    it('retourne /admin pour le rôle admin', () => {
      // Act
      const result = getRedirectPathForRole('admin');

      // Assert
      expect(result).toBe('/admin');
    });

    it('retourne /kds pour le rôle kds', () => {
      // Act
      const result = getRedirectPathForRole('kds');

      // Assert
      expect(result).toBe('/kds');
    });

    it('retourne /serveur pour le rôle serveur', () => {
      // Act
      const result = getRedirectPathForRole('serveur');

      // Assert
      expect(result).toBe('/serveur');
    });

    it('retourne /client pour le rôle client', () => {
      // Act
      const result = getRedirectPathForRole('client');

      // Assert
      expect(result).toBe('/client');
    });

    it('retourne /login pour un rôle inconnu', () => {
      // Act - on teste avec un cast pour simuler un rôle invalide
      const result = getRedirectPathForRole('unknown' as UserRole);

      // Assert
      expect(result).toBe('/login');
    });
  });
});

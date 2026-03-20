// src/utils/errorUtils.test.ts
// Tests unitaires pour les utilitaires de gestion d'erreurs

import { describe, it, expect, vi } from 'vitest';
import {
  isDexieError,
  categorizeDexieError,
  formatErrorMessage,
  logError,
} from './errorUtils';

describe('errorUtils', () => {
  describe('isDexieError()', () => {
    it('retourne true pour une erreur QuotaExceededError', () => {
      // Arrange
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';

      // Act
      const result = isDexieError(error);

      // Assert
      expect(result).toBe(true);
    });

    it('retourne true pour une erreur InvalidStateError', () => {
      // Arrange
      const error = new Error('Invalid state');
      error.name = 'InvalidStateError';

      // Act
      const result = isDexieError(error);

      // Assert
      expect(result).toBe(true);
    });

    it('retourne true pour une erreur VersionError', () => {
      // Arrange
      const error = new Error('Version mismatch');
      error.name = 'VersionError';

      // Act
      const result = isDexieError(error);

      // Assert
      expect(result).toBe(true);
    });

    it('retourne true pour une erreur DatabaseClosedError', () => {
      // Arrange
      const error = new Error('Database closed');
      error.name = 'DatabaseClosedError';

      // Act
      const result = isDexieError(error);

      // Assert
      expect(result).toBe(true);
    });

    it('retourne false pour une erreur standard non-Dexie', () => {
      // Arrange
      const error = new Error('Standard error');

      // Act
      const result = isDexieError(error);

      // Assert
      expect(result).toBe(false);
    });

    it('retourne false pour une valeur non-erreur', () => {
      // Arrange
      const notAnError = 'just a string';

      // Act
      const result = isDexieError(notAnError);

      // Assert
      expect(result).toBe(false);
    });

    it('retourne false pour null ou undefined', () => {
      // Act & Assert
      expect(isDexieError(null)).toBe(false);
      expect(isDexieError(undefined)).toBe(false);
    });

    it('retourne false pour un nombre', () => {
      // Act & Assert
      expect(isDexieError(42)).toBe(false);
    });
  });

  describe('categorizeDexieError()', () => {
    it('catégorise QuotaExceededError comme "quota"', () => {
      // Arrange
      const error = new Error('Storage quota exceeded');
      error.name = 'QuotaExceededError';

      // Act
      const result = categorizeDexieError(error);

      // Assert
      expect(result.category).toBe('quota');
      expect(result.message).toContain('Stockage plein');
    });

    it('catégorise InvalidStateError comme "privateBrowsing"', () => {
      // Arrange
      const error = new Error('Invalid state');
      error.name = 'InvalidStateError';

      // Act
      const result = categorizeDexieError(error);

      // Assert
      expect(result.category).toBe('privateBrowsing');
      expect(result.message).toContain('Navigation privée');
    });

    it('catégorise VersionError comme "version"', () => {
      // Arrange
      const error = new Error('Version mismatch');
      error.name = 'VersionError';

      // Act
      const result = categorizeDexieError(error);

      // Assert
      expect(result.category).toBe('version');
      expect(result.message).toContain('Erreur de version');
    });

    it('catégorise DatabaseClosedError comme "closed"', () => {
      // Arrange
      const error = new Error('Database closed');
      error.name = 'DatabaseClosedError';

      // Act
      const result = categorizeDexieError(error);

      // Assert
      expect(result.category).toBe('closed');
      expect(result.message).toContain('Base de données fermée');
    });

    it('catégorise une erreur inconnue comme "unknown"', () => {
      // Arrange
      const error = new Error('Unknown error');
      error.name = 'SomeUnknownError';

      // Act
      const result = categorizeDexieError(error);

      // Assert
      expect(result.category).toBe('unknown');
      expect(result.message).toBe('Unknown error');
    });

    it('retourne "unknown" pour une valeur non-erreur', () => {
      // Arrange
      const notAnError = 'just a string';

      // Act
      const result = categorizeDexieError(notAnError);

      // Assert
      expect(result.category).toBe('unknown');
      expect(result.message).toBe('Une erreur inconnue est survenue');
    });

    it('retourne "unknown" pour null', () => {
      // Act
      const result = categorizeDexieError(null);

      // Assert
      expect(result.category).toBe('unknown');
    });

    it('retourne "unknown" pour undefined', () => {
      // Act
      const result = categorizeDexieError(undefined);

      // Assert
      expect(result.category).toBe('unknown');
    });
  });

  describe('formatErrorMessage()', () => {
    it('extrait le message d\'une erreur Error', () => {
      // Arrange
      const error = new Error('Something went wrong');

      // Act
      const result = formatErrorMessage(error);

      // Assert
      expect(result).toBe('Something went wrong');
    });

    it('retourne la chaîne telle quelle si c\'est un string', () => {
      // Arrange
      const message = 'Error message string';

      // Act
      const result = formatErrorMessage(message);

      // Assert
      expect(result).toBe('Error message string');
    });

    it('retourne un message par défaut pour une valeur inconnue', () => {
      // Arrange
      const unknown = { code: 500 };

      // Act
      const result = formatErrorMessage(unknown);

      // Assert
      expect(result).toBe('Une erreur inconnue est survenue');
    });

    it('retourne un message par défaut pour null', () => {
      // Act
      const result = formatErrorMessage(null);

      // Assert
      expect(result).toBe('Une erreur inconnue est survenue');
    });

    it('retourne un message par défaut pour undefined', () => {
      // Act
      const result = formatErrorMessage(undefined);

      // Assert
      expect(result).toBe('Une erreur inconnue est survenue');
    });

    it('retourne un message par défaut pour un nombre', () => {
      // Act
      const result = formatErrorMessage(42);

      // Assert
      expect(result).toBe('Une erreur inconnue est survenue');
    });
  });

  describe('logError()', () => {
    it('appelle console.error avec le contexte et l\'erreur', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const context = 'TestContext';
      const error = new Error('Test error');

      // Act
      logError(context, error);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('[Error] TestContext:', error);
      consoleSpy.mockRestore();
    });

    it('fonctionne avec une erreur string', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const context = 'TestContext';
      const errorMessage = 'String error';

      // Act
      logError(context, errorMessage);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('[Error] TestContext:', 'String error');
      consoleSpy.mockRestore();
    });

    it('fonctionne avec null comme erreur', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const context = 'TestContext';

      // Act
      logError(context, null);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('[Error] TestContext:', null);
      consoleSpy.mockRestore();
    });
  });
});

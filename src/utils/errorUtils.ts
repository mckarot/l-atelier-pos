// src/utils/errorUtils.ts
// Utilitaires de gestion d'erreurs pour l'application

import { DexieError } from 'dexie';

/**
 * Vérifie si une erreur est une erreur Dexie connue
 */
export function isDexieError(error: unknown): error is DexieError {
  return error instanceof Error && 
    ['QuotaExceededError', 'InvalidStateError', 'VersionError', 'DatabaseClosedError'].includes(error.name);
}

/**
 * Catégorise une erreur Dexie pour un message utilisateur adapté
 */
export function categorizeDexieError(error: unknown): {
  category: 'quota' | 'privateBrowsing' | 'version' | 'closed' | 'unknown';
  message: string;
} {
  if (!(error instanceof Error)) {
    return { category: 'unknown', message: 'Une erreur inconnue est survenue' };
  }

  switch (error.name) {
    case 'QuotaExceededError':
      return {
        category: 'quota',
        message: 'Stockage plein. Veuillez libérer de l\'espace dans votre navigateur.',
      };
    case 'InvalidStateError':
      return {
        category: 'privateBrowsing',
        message: 'Navigation privée détectée. Certaines fonctionnalités peuvent être limitées.',
      };
    case 'VersionError':
      return {
        category: 'version',
        message: 'Erreur de version de base de données. Veuillez rafraîchir la page.',
      };
    case 'DatabaseClosedError':
      return {
        category: 'closed',
        message: 'Base de données fermée. Veuillez rafraîchir la page.',
      };
    default:
      return {
        category: 'unknown',
        message: error.message || 'Une erreur est survenue',
      };
  }
}

/**
 * Formate une erreur pour l'affichage utilisateur
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Une erreur inconnue est survenue';
}

/**
 * Log une erreur avec le contexte pour le débogage
 */
export function logError(context: string, error: unknown): void {
  console.error(`[Error] ${context}:`, error);
}

// src/utils/errorUtils.ts
// Utilitaires de gestion d'erreurs pour l'application
// Nettoyé — Plus de dépendances Dexie

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

/**
 * Catégorise une erreur Firebase pour un message utilisateur adapté
 */
export function categorizeFirebaseError(error: unknown): {
  category: 'permission' | 'network' | 'not-found' | 'already-exists' | 'unknown';
  message: string;
} {
  if (!(error instanceof Error)) {
    return { category: 'unknown', message: 'Une erreur inconnue est survenue' };
  }

  const errorMessage = error.message.toLowerCase();

  // Permission denied
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return {
      category: 'permission',
      message: 'Vous n\'avez pas la permission d\'effectuer cette action.',
    };
  }

  // Network error
  if (errorMessage.includes('network') || errorMessage.includes('offline')) {
    return {
      category: 'network',
      message: 'Problème de connexion. Vérifiez votre connexion Internet.',
    };
  }

  // Not found
  if (errorMessage.includes('not found') || errorMessage.includes('no document')) {
    return {
      category: 'not-found',
      message: 'La ressource demandée n\'existe pas.',
    };
  }

  // Already exists
  if (errorMessage.includes('already exists')) {
    return {
      category: 'already-exists',
      message: 'Cette ressource existe déjà.',
    };
  }

  // Default
  return {
    category: 'unknown',
    message: error.message || 'Une erreur est survenue',
  };
}

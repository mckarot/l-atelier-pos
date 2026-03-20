// src/hooks/useToast.ts
// Hook pour afficher des notifications Toast

import { useCallback } from 'react';
import type { ToastType } from '../context/ToastContext';

/**
 * Hook pour afficher des notifications Toast
 * Utilise les CustomEvents pour communiquer avec le ToastContainer
 * 
 * @example
 * const { showToast } = useToast();
 * showToast('Produit ajouté au panier', 'success');
 */
export function useToast() {
  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ) => {
    // Dispatch un événement custom pour le ToastContainer
    const event = new CustomEvent('app-toast', {
      detail: { message, type, duration },
    });
    window.dispatchEvent(event);
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

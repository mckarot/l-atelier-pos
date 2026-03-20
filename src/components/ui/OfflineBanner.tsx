// src/components/ui/OfflineBanner.tsx
// Bannière d'affichage du mode hors-ligne pour US-051

import { useEffect, useState } from 'react';
import { cn, iconFilled } from '../../utils/cn';

export interface OfflineBannerProps {
  /** Message personnalisé (optionnel) */
  message?: string;
  /** Classe CSS supplémentaire */
  className?: string;
}

/**
 * Bannière affichée lorsque l'application est hors-ligne
 * - S'affiche quand navigator.onLine === false
 * - Disparaît automatiquement à la reconnexion
 * - Message : "Mode hors-ligne — vos données sont sauvegardées"
 */
export function OfflineBanner({
  message,
  className,
}: OfflineBannerProps): JSX.Element | null {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // État initial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ne rien afficher si en ligne
  if (isOnline) {
    return null;
  }

  const defaultMessage = 'Mode hors-ligne — vos données sont sauvegardées';

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-error-container border-b border-error/30',
        'px-4 py-3',
        'shadow-lg',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-label="Mode hors-ligne activé"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <span
          className={cn(iconFilled(), 'text-error text-xl animate-pulse')}
          aria-hidden="true"
        >
          cloud_off
        </span>
        <p className="text-sm font-bold text-error text-center">
          {message || defaultMessage}
        </p>
      </div>
    </div>
  );
}

export default OfflineBanner;

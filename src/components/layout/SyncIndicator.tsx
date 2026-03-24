// src/components/layout/SyncIndicator.tsx
// Indicateur de statut de synchronisation pour US-050

import { cn } from '../../utils/cn';

export interface SyncIndicatorProps {
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: Date | null;
  version?: string;
  showDetails?: boolean;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Jamais';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) {
    return "à l'instant";
  } else if (diffSec < 60) {
    return `il y a ${diffSec}s`;
  } else {
    const diffMin = Math.floor(diffSec / 60);
    return `il y a ${diffMin}min`;
  }
}

function formatTimestamp(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Composant SyncIndicator pour US-050
 * - État connecté : point vert pulsant, "DEXIE.JS CONNECTÉ", timestamp
 * - État hors-ligne : point rouge, "HORS LIGNE — Données sauvegardées localement"
 * - Bordure gauche : verte (connecté) / rouge (hors-ligne)
 */
export function SyncIndicator({
  status,
  lastSync = new Date(),
  version = 'v1.0.0',
  showDetails = true,
}: SyncIndicatorProps): JSX.Element {
  const isDisconnected = status === 'disconnected';

  const label = isDisconnected
    ? 'HORS LIGNE — Données sauvegardées localement'
    : 'DEXIE.JS CONNECTÉ';

  const icon = isDisconnected ? 'cloud_off' : 'cloud_done';
  const borderClass = isDisconnected ? 'border-error' : 'border-tertiary';

  return (
    <div className="mx-8 mt-6">
      <div
        className={cn(
          'flex items-center justify-between p-4 rounded-xl border-l-4',
          borderClass,
          'bg-surface-container-low'
        )}
        role="status"
        aria-live="polite"
        aria-label={isDisconnected ? 'Hors ligne' : 'Connecté'}
      >
        <div className="flex items-center gap-4">
          {/* Indicateur pulsant */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  isDisconnected ? 'bg-error' : 'bg-tertiary'
                )}
                aria-hidden="true"
              ></span>
              <span
                className={cn(
                  'relative inline-flex rounded-full h-3 w-3',
                  isDisconnected ? 'bg-error' : 'bg-tertiary'
                )}
                aria-hidden="true"
              ></span>
            </span>
            <span
              className={cn(
                'font-mono text-sm font-bold',
                isDisconnected ? 'text-error' : 'text-tertiary'
              )}
            >
              {label}
            </span>
          </div>

          {/* Timestamp */}
          {showDetails && (
            <>
              <div className="h-4 w-px bg-outline-variant/20" aria-hidden="true"></div>
              <p className="text-sm text-on-surface-variant">
                Dernière synchronisation :{' '}
                <span className="font-mono">{formatTimestamp(lastSync)}</span>
                <span className="text-xs"> ({formatRelativeTime(lastSync)})</span>
              </p>
            </>
          )}
        </div>

        {/* Version badge */}
        <div
          className={cn(
            'flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full'
          )}
          aria-label={`Version ${version}`}
        >
          <span
            className={cn(
              'material-symbols-outlined text-sm',
              isDisconnected ? 'text-error' : 'text-tertiary'
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {version}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SyncIndicator;

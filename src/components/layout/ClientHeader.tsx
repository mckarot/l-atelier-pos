import { useCallback } from 'react';

export interface ClientHeaderProps {
  onLogout: () => void;
  currentTime: Date;
}

export function ClientHeader({ onLogout, currentTime }: ClientHeaderProps): JSX.Element {
  const handleLogoutClick = useCallback(() => {
    onLogout();
  }, [onLogout]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="bg-surface-container-low border-b border-outline-variant/15 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-2xl"
            aria-hidden="true"
          >
            restaurant_menu
          </span>
          <h1 className="text-xl font-bold text-on-surface font-['Space_Grotesk']">
            L'Atelier POS
          </h1>
        </div>

        {/* Time + Logout */}
        <div className="flex items-center gap-4">
          <time className="font-mono text-sm text-on-surface-variant">
            {formatTime(currentTime)}
          </time>
          <button
            onClick={handleLogoutClick}
            className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
            aria-label="Se déconnecter"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant text-xl"
              aria-hidden="true"
            >
              logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

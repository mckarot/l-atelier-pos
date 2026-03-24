// src/components/layout/ServeurHeader.tsx
// Header du module Serveur

import { useEffect, useState } from 'react';

export interface ServeurHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function ServeurHeader({
  title = "L'ATELIER POS",
  onMenuClick,
}: ServeurHeaderProps): JSX.Element {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="h-16 flex justify-between items-center px-6 bg-surface sticky top-0 z-30 border-b border-outline-variant/10">
      {/* Left section - Menu + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined text-primary">menu</span>
        </button>
        <h1 className="font-headline font-bold text-lg uppercase tracking-wider text-on-surface">
          {title}
        </h1>
      </div>

      {/* Center - Sync Status */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-lg">
        <span className="material-symbols-outlined text-primary text-sm">sync</span>
        <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
          SYNC OK
        </span>
      </div>

      {/* Right section - Service indicator + Time + Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-highest rounded-xl">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
            Service Midi
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-on-surface-variant">
            {formatTime(currentTime)}
          </span>
          <button
            className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
            aria-label="Profil"
          >
            <span className="material-symbols-outlined text-on-surface">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
}

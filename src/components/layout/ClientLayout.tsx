// src/components/layout/ClientLayout.tsx
// Layout complet pour la vue Client avec sidebar et header

import { useState, useCallback, useEffect } from 'react';
import { cn, iconFilled } from '../../utils/cn';
import { ClientSidebar } from './ClientSidebar';
import { OfflineBanner } from '../ui/OfflineBanner';
import { ToastContainer } from '../ui/Toast';
import type { Toast as ToastType } from '../../context/ToastContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Horloge temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Écouter les événements de toast
  useEffect(() => {
    const handleToast = (event: CustomEvent<{ message: string; type: any; duration: number }>) => {
      const { message, type, duration } = event.detail;
      const id = Math.random().toString(36).substr(2, 9);
      const toast: ToastType = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    window.addEventListener('app-toast' as any, handleToast as any);
    return () => window.removeEventListener('app-toast' as any, handleToast as any);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn(
      'min-h-screen bg-surface text-on-surface flex',
      isDarkMode && 'dark'
    )}>
      <OfflineBanner />
      {/* Sidebar */}
      <ClientSidebar
        onToggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-outline-variant/10 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-headline font-bold text-lg uppercase tracking-wider text-primary">
              L'Atelier POS
            </h1>
            <span className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">
              SERVICE CLIENT
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Kitchen status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-tertiary-container/20 rounded-full">
              <span
                className={cn(iconFilled(), 'text-tertiary text-sm')}
                aria-hidden="true"
              >
                check_circle
              </span>
              <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
                Cuisine Ouverte
              </span>
            </div>

            {/* Time */}
            <span className="text-sm font-mono text-on-surface-variant">
              {formatTime(currentTime)}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

      {/* Global styles for toast animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}

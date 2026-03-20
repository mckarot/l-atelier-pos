// src/components/ui/RootErrorBoundary.tsx
// Error Boundary racine pour les erreurs critiques de l'application

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { categorizeDexieError } from '../../utils/errorUtils';

interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RootErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[RootErrorBoundary] Critical error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    localStorage.removeItem('atelier_role');
    window.location.href = '/login';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { category } = categorizeDexieError(this.state.error);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-surface-container rounded-xl p-8 border border-outline-variant/20">
          <div className="text-center mb-6">
            <span
              className="material-symbols-outlined text-error text-6xl mb-4"
              aria-hidden="true"
            >
              warning
            </span>
            <h1 className="text-2xl font-black text-on-surface font-headline mb-2">
              Oups, quelque chose s'est mal passé
            </h1>
            <p className="text-on-surface-variant">
              L'application a rencontré une erreur critique.
            </p>
          </div>

          {category === 'quota' && (
            <div className="bg-error-container/20 border border-error/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-error text-xl flex-shrink-0"
                  aria-hidden="true"
                >
                  storage
                </span>
                <div>
                  <h2 className="text-sm font-bold text-on-surface mb-1">
                    Stockage plein
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Votre navigateur a atteint sa limite de stockage IndexedDB. 
                    Veuillez libérer de l'espace dans les paramètres de votre navigateur 
                    ou utiliser un autre navigateur.
                  </p>
                </div>
              </div>
            </div>
          )}

          {category === 'privateBrowsing' && (
            <div className="bg-error-container/20 border border-error/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-error text-xl flex-shrink-0"
                  aria-hidden="true"
                >
                  privacy_tip
                </span>
                <div>
                  <h2 className="text-sm font-bold text-on-surface mb-1">
                    Navigation privée détectée
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    La navigation privée limite l'accès à IndexedDB. 
                    Veuillez utiliser un navigateur standard pour accéder 
                    à toutes les fonctionnalités de l'application.
                  </p>
                </div>
              </div>
            </div>
          )}

          {category === 'version' && (
            <div className="bg-error-container/20 border border-error/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-error text-xl flex-shrink-0"
                  aria-hidden="true"
                >
                  update
                </span>
                <div>
                  <h2 className="text-sm font-bold text-on-surface mb-1">
                   Erreur de version
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    La base de données nécessite une mise à jour. 
                    Cliquez sur "Rafraîchir" pour recharger l'application.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleReload}
              className="flex-1 bg-primary text-on-primary font-bold py-3 px-4 rounded-lg 
                         hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Rafraîchir la page
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex-1 bg-surface-container-highest text-on-surface font-bold py-3 px-4 rounded-lg 
                         hover:bg-surface-bright active:scale-[0.98] transition-all"
            >
              Retour à l'accueil
            </button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 text-xs text-on-surface-variant">
              <summary className="cursor-pointer hover:text-on-surface">
                Détails techniques (développement)
              </summary>
              <pre className="mt-2 bg-surface-container-lowest p-3 rounded overflow-auto max-h-64 text-[10px]">
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="mt-6 pt-6 border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant text-center">
              Si le problème persiste, contactez votre administrateur système.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

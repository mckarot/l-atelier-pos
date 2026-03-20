// src/components/ui/ErrorBoundary.tsx
// Error Boundary pour les erreurs au niveau des features

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { categorizeDexieError } from '../../utils/errorUtils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Fallback personnalisé fourni
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Catégorisation de l'erreur pour un message adapté
    const { category, message } = categorizeDexieError(this.state.error);

    return (
      <div
        role="alert"
        className="rounded-xl bg-error-container/20 border border-error/30 p-6 max-w-md mx-auto"
      >
        <div className="flex items-start gap-4">
          <span
            className="material-symbols-outlined text-error text-3xl"
            aria-hidden="true"
          >
            error
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-on-surface mb-2">
              Une erreur est survenue
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">{message}</p>
            
            {category === 'quota' && (
              <div className="bg-surface-container-high rounded-lg p-3 mb-4">
                <p className="text-xs text-on-surface-variant">
                  Solution : Allez dans les paramètres de votre navigateur et augmentez 
                  l'espace de stockage IndexedDB, ou videz le cache.
                </p>
              </div>
            )}
            
            {category === 'privateBrowsing' && (
              <div className="bg-surface-container-high rounded-lg p-3 mb-4">
                <p className="text-xs text-on-surface-variant">
                  Solution : Désactivez la navigation privée ou utilisez un navigateur 
                  standard pour accéder à toutes les fonctionnalités.
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-primary text-on-primary font-bold py-2.5 px-4 rounded-lg 
                         hover:brightness-110 active:scale-[0.98] transition-all text-sm"
            >
              Réessayer
            </button>
          </div>
        </div>

        {import.meta.env.DEV && this.state.error && (
          <details className="mt-4 text-xs text-on-surface-variant">
            <summary className="cursor-pointer hover:text-on-surface">
              Détails techniques (développement)
            </summary>
            <pre className="mt-2 bg-surface-container-lowest p-3 rounded overflow-auto max-h-48">
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        )}
      </div>
    );
  }
}

// src/views/Auth/LoginView.tsx
// Page de connexion avec Firebase Auth

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  /** Gérer la soumission du formulaire */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // La redirection se fait via le useEffect ci-dessus
    } catch (err) {
      console.error('[LoginView] Login error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Email ou mot de passe incorrect'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest px-4">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-bold text-primary mb-2">
            L'Atelier POS
          </h1>
          <p className="text-on-surface-variant">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-surface-container-low rounded-xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-high rounded-lg px-4 py-3 text-on-surface border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="votre@email.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-high rounded-lg px-4 py-3 text-on-surface border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-error-container/10 border border-error/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-container text-on-primary-container rounded-lg px-6 py-3 font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Identifiants de démo */}
          <div className="mt-6 pt-6 border-t border-outline-variant/20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 text-center">
              Identifiants de démo
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@atelierpos.com');
                  setPassword('password');
                }}
                className="bg-surface-container-high hover:bg-surface-container-highest px-3 py-2 rounded transition-colors text-on-surface-variant"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('serveur@atelierpos.com');
                  setPassword('password');
                }}
                className="bg-surface-container-high hover:bg-surface-container-highest px-3 py-2 rounded transition-colors text-on-surface-variant"
              >
                Serveur
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('kds@atelierpos.com');
                  setPassword('password');
                }}
                className="bg-surface-container-high hover:bg-surface-container-highest px-3 py-2 rounded transition-colors text-on-surface-variant"
              >
                KDS
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('client@atelierpos.com');
                  setPassword('password');
                }}
                className="bg-surface-container-high hover:bg-surface-container-highest px-3 py-2 rounded transition-colors text-on-surface-variant"
              >
                Client
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-on-surface-variant/50 mt-6">
          © 2026 L'Atelier POS — Système de gestion de restaurant
        </p>
      </div>
    </div>
  );
}

export default LoginView;

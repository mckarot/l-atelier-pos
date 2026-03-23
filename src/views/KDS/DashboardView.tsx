// src/views/KDS/DashboardView.tsx
// Placeholder pour la vue Tableau de bord du module KDS

import { useNavigate } from 'react-router-dom';

export default function DashboardView(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center bg-surface-container-lowest p-6">
      <div className="text-center max-w-md">
        <span
          className="material-symbols-outlined text-on-surface-variant/40 text-8xl mb-6"
          aria-hidden="true"
        >
          construction
        </span>
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
          Tableau de bord
        </h2>
        <p className="text-on-surface-variant mb-6">
          Fonctionnalité à venir dans une prochaine mise à jour
        </p>
        <button
          onClick={() => navigate('/kds')}
          aria-label="Retourner à l'accueil KDS"
          className="px-6 py-3 bg-primary-container text-on-primary-container rounded-lg font-bold
                     hover:brightness-110 active:scale-[0.98] transition-all focus-visible:outline 
                     focus-visible:outline-2 focus-visible:outline-primary"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

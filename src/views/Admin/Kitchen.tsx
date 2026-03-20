// src/views/Admin/Kitchen.tsx
// Affichage cuisine (KDS) pour l'admin

import { type JSX } from 'react';
import { KDSBoard } from '../../views/KDS/components/KDSBoard';

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vue Kitchen Display pour l'admin
 * Intègre le composant KDSBoard existant dans un layout adapté à l'admin
 * Conserve les 3 colonnes (À PRÉPARER, EN COURS, PRÊT) avec timers et actions
 */
export function AdminKitchen(): JSX.Element {
  return (
    <div className="h-full flex flex-col">
      {/* En-tête de page */}
      <header className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-headline text-on-surface">
              Kitchen Display
            </h2>
            <p className="font-label text-sm text-on-surface-variant">
              Tableau de bord cuisine en temps réel
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">
              soup_kitchen
            </span>
            <span className="font-mono text-sm font-bold text-on-surface-variant">
              MODE ADMIN
            </span>
          </div>
        </div>
      </header>

      {/* Board KDS - occupe tout l'espace restant */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <KDSBoard />
        </div>
      </div>
    </div>
  );
}

export default AdminKitchen;

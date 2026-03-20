// src/components/admin/StockAlert.tsx
// Bandeau d'alerte de stock critique pour le dashboard administrateur

import type { StockAlert } from '../../hooks/useKitchenMonitor';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface StockAlertProps {
  /** Données d'alerte de stock */
  alert: StockAlert;
  /** Handler pour le bouton "GÉRER LE STOCK" */
  onManageStock?: () => void;
  /** Classe CSS personnalisée */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bandeau d'alerte de stock critique
 *
 * Design system conforme aux maquettes PNG:
 * - Fond: bg-error-container (rouge foncé)
 * - Texte: "X articles sont épuisés et Y articles sont en dessous du seuil de sécurité"
 * - Bouton: "GÉRER LE STOCK" à droite
 * - Icône: warning/alerte à gauche
 */
export function StockAlert({
  alert,
  onManageStock,
  className = '',
}: StockAlertProps): JSX.Element {
  // Formater le message d'alerte
  const formatAlertMessage = (stockAlert: StockAlert): string => {
    const parts: string[] = [];

    if (stockAlert.depletedCount > 0) {
      const depletedText = stockAlert.depletedCount > 1
        ? `${stockAlert.depletedCount} articles sont épuisés`
        : `${stockAlert.depletedCount} article est épuisé`;
      parts.push(depletedText);
    }

    if (stockAlert.lowStockCount > 0) {
      const lowStockText = stockAlert.lowStockCount > 1
        ? `${stockAlert.lowStockCount} articles sont en dessous du seuil de sécurité`
        : `${stockAlert.lowStockCount} article est en dessous du seuil de sécurité`;
      parts.push(lowStockText);
    }

    if (parts.length === 0) {
      return 'Aucune alerte de stock';
    }

    return parts.join(' et ');
  };

  // Déterminer si l'alerte doit être affichée
  const shouldShowAlert = alert.depletedCount > 0 || alert.lowStockCount > 0;

  if (!shouldShowAlert) {
    return (
      <div
        className="hidden"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg bg-error-container ${className}`}
      role="alert"
      aria-label="Alerte stock critique"
      aria-live="polite"
    >
      {/* Contenu de l'alerte */}
      <div className="flex items-center gap-3">
        {/* Icône d'alerte */}
        <span
          className="material-symbols-outlined text-on-error-container text-xl"
          aria-hidden="true"
        >
          warning
        </span>

        {/* Texte d'alerte */}
        <div className="flex flex-col">
          <span className="font-label text-sm font-bold uppercase tracking-wider text-on-error-container">
            ALERTE STOCK CRITIQUE
          </span>
          <span className="font-label text-xs text-on-error-container/80 mt-0.5">
            {formatAlertMessage(alert)}
          </span>
        </div>
      </div>

      {/* Bouton "GÉRER LE STOCK" */}
      <button
        type="button"
        onClick={onManageStock}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-on-error-container/10 hover:bg-on-error-container/20 transition-colors"
        aria-label="Gérer le stock"
      >
        <span className="font-label text-xs font-bold uppercase tracking-wider text-on-error-container">
          GÉRER LE STOCK
        </span>
        <span
          className="material-symbols-outlined text-sm text-on-error-container"
          aria-hidden="true"
        >
          inventory
        </span>
      </button>
    </div>
  );
}

export default StockAlert;

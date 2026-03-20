// src/views/Admin/Dashboard.tsx
// Tableau de bord administrateur avec KPI, graphique, flux live et services actifs

import { useCallback } from 'react';
import { KPICard } from '../../components/admin/KPICard';
import { WeeklyPerformance } from '../../components/admin/WeeklyPerformance';
import { LiveFeed } from '../../components/admin/LiveFeed';
import { ActiveServices } from '../../components/admin/ActiveServices';
import { StockAlert } from '../../components/admin/StockAlert';
import { KitchenMonitor } from '../../components/admin/KitchenMonitor';
import { useDashboardData, useFormattedRevenue, useFormattedTime } from '../../hooks/useDashboardData';
import { useStockAlert } from '../../hooks/useKitchenMonitor';

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tableau de bord administrateur
 *
 * Sections:
 * - 4 cartes KPI (Revenu, Commandes, Temps Prep, Satisfaction)
 * - Services Actifs (tables et commandes en cours)
 * - Graphique de performance hebdomadaire
 * - Flux live d'activités
 *
 * Design system conforme aux maquettes PNG:
 * - bg-surface-container pour les cartes
 * - font-headline text-4xl/5xl pour les valeurs
 * - font-label text-xs uppercase pour les titres
 * - Badges de variation avec tokens appropriés
 */
export function AdminDashboard(): JSX.Element {
  // Récupérer les données du dashboard
  const data = useDashboardData();

  // Hooks de formatage
  const formattedRevenue = useFormattedRevenue(data?.revenue);
  const formattedPrepTime = useFormattedTime(data?.avgPrepTime);
  const formattedObjective = useFormattedTime(data?.prepTimeObjective);

  // Calculer le label de variation pour le temps de préparation
  const prepTimeVariationLabel = useCallback(() => {
    if (!data) return '';
    
    const diffSeconds = data.prepTimeChange;
    const diffMinutes = Math.abs(Math.round(diffSeconds / 60));
    
    if (diffSeconds > 0) {
      return `+${diffMinutes}min`;
    } else if (diffSeconds < 0) {
      return `~-${diffMinutes}min`;
    }
    return 'Objectif atteint';
  }, [data]);

  // Déterminer le type de variation pour le temps de préparation
  const prepTimeVariationType = useCallback(() => {
    if (!data) return 'neutral';
    // Temps plus court = positif (meilleur)
    if (data.prepTimeChange < 0) return 'positive';
    if (data.prepTimeChange > 0) return 'negative';
    return 'neutral';
  }, [data]);

  // Handler pour "Voir tout l'historique"
  const handleViewAllHistory = useCallback(() => {
    // TODO: Naviguer vers la page d'historique
    console.log('Navigation vers l\'historique complet');
  }, []);

  // Handler pour "Gérer le stock"
  const handleManageStock = useCallback(() => {
    // TODO: Naviguer vers la page de gestion du stock
    console.log('Navigation vers la gestion du stock');
  }, []);

  // Récupérer l'alerte de stock
  const stockAlert = useStockAlert();

  // État de chargement
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <span
            className="material-symbols-outlined text-primary text-4xl animate-spin"
            aria-hidden="true"
          >
            progress_activity
          </span>
          <p className="font-label text-sm text-on-surface-variant">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Tableau de bord
          </h2>
          <p className="font-label text-sm text-on-surface-variant mt-1">
            Vue d'ensemble de l'activité du restaurant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary/10">
            <span
              className="w-2 h-2 rounded-full bg-tertiary animate-pulse"
              aria-hidden="true"
            />
            <span className="font-label text-xs font-bold text-tertiary">
              LIVE
            </span>
          </span>
        </div>
      </div>

      {/* Bandeau Alerte Stock Critique */}
      {stockAlert && (
        <StockAlert
          alert={stockAlert}
          onManageStock={handleManageStock}
        />
      )}

      {/* Section 1: Cartes KPI */}
      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Indicateurs clés de performance"
      >
        {/* KPI 1: Revenu Quotidien */}
        <KPICard
          title="Revenu Quotidien"
          value={formattedRevenue}
          variationLabel={`${data.revenueChange > 0 ? '+' : ''}${data.revenueChange.toFixed(1)}% VS HIER`}
          variationType={data.revenueChange >= 0 ? 'positive' : 'negative'}
          icon="payments"
          ariaLabel="Revenu quotidien du jour"
        />

        {/* KPI 2: Commandes */}
        <KPICard
          title="Commandes"
          value={data.ordersCount.toString()}
          variationLabel={`${data.ordersChange > 0 ? '+' : ''}${data.ordersChange}% VS MOYENNE`}
          variationType={data.ordersChange >= 0 ? 'positive' : 'negative'}
          icon="receipt_long"
          ariaLabel="Nombre de commandes du jour"
        />

        {/* KPI 3: Temps de Préparation Moyen */}
        <KPICard
          title="Temps Prep. Moyen"
          value={formattedPrepTime}
          variationLabel={prepTimeVariationLabel()}
          variationType={prepTimeVariationType()}
          secondaryInfo={`OBJECTIF: ${formattedObjective}`}
          icon="timer"
          ariaLabel="Temps moyen de préparation des commandes"
        />

        {/* KPI 4: Satisfaction */}
        <KPICard
          title="Satisfaction"
          value={`${data.satisfaction}/5`}
          variationLabel={data.satisfactionLabel}
          variationType="positive"
          icon="star"
          ariaLabel="Score de satisfaction client"
        />
      </section>

      {/* Section 2: Services Actifs */}
      <section
        aria-label="Services Actifs"
      >
        <ActiveServices />
      </section>

      {/* Section 3: Moniteur Cuisine en Direct */}
      <section
        aria-label="Moniteur Cuisine en Direct"
      >
        <KitchenMonitor />
      </section>

      {/* Section 4: Graphique et Flux Live */}
      <section
        className="grid gap-4 lg:grid-cols-3"
        aria-label="Performance et activité en temps réel"
      >
        {/* Graphique de performance hebdomadaire */}
        <div className="lg:col-span-2">
          <WeeklyPerformance
            data={data.weeklyData}
            title="Performance Hebdomadaire"
            subtitle="Évolution du chiffre d'affaires (7 derniers jours)"
          />
        </div>

        {/* Flux Live */}
        <div>
          <LiveFeed
            events={data.liveEvents}
            title="Flux Live"
            onViewAll={handleViewAllHistory}
          />
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;

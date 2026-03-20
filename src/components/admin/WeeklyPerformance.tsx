// src/components/admin/WeeklyPerformance.tsx
// Composant graphique de performance hebdomadaire

import { useMemo, useState } from 'react';
import type { WeeklyDataPoint } from '../../hooks/useDashboardData';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface WeeklyPerformanceProps {
  /** Données hebdomadaires */
  data: WeeklyDataPoint[];
  /** Titre du graphique */
  title?: string;
  /** Sous-titre */
  subtitle?: string;
  /** Classe CSS personnalisée */
  className?: string;
}

type ViewMode = 'JOUR' | 'SEMAINE';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const CHART_HEIGHT = 200;
const BAR_WIDTH = 40;
const BAR_GAP = 16;

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Graphique de performance hebdomadaire avec barres
 * 
 * Design system:
 * - Toggle JOUR/SEMAINE: bg-surface-container-high
 * - Barres: hauteur variable selon le revenu
 * - Jour actuel: surligné avec bg-primary-container
 */
export function WeeklyPerformance({
  data,
  title = 'Performance Hebdomadaire',
  subtitle = 'Évolution du chiffre d\'affaires (7 derniers jours)',
  className = '',
}: WeeklyPerformanceProps): JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>('SEMAINE');

  // Calculer le revenu maximum pour l'échelle du graphique
  const maxRevenue = useMemo(() => {
    if (!data || data.length === 0) return 3000;
    const max = Math.max(...data.map(d => d.revenue));
    return max > 0 ? max : 3000;
  }, [data]);

  // Calculer la hauteur de chaque barre
  const barHeights = useMemo(() => {
    if (!data) return [];
    return data.map(point => {
      const percentage = point.revenue / maxRevenue;
      return Math.max(20, percentage * (CHART_HEIGHT - 40)); // Minimum 20px de hauteur
    });
  }, [data, maxRevenue]);

  // Formater le revenu pour l'affichage
  const formatRevenue = (revenue: number): string => {
    if (revenue >= 1000) {
      return `${(revenue / 1000).toFixed(1)}k`;
    }
    return revenue.toString();
  };

  // Calculer la largeur totale du graphique
  const chartWidth = useMemo(() => {
    return data.length * (BAR_WIDTH + BAR_GAP) + BAR_GAP;
  }, [data?.length]);

  return (
    <div
      className={`rounded-xl border border-outline-variant/10 bg-surface-container p-6 ${className}`}
      role="region"
      aria-label={title}
    >
      {/* En-tête avec titre et toggle */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-headline text-lg font-semibold text-on-surface">
            {title}
          </h3>
          <p className="font-label text-sm text-on-surface-variant mt-1">
            {subtitle}
          </p>
        </div>

        {/* Toggle JOUR/SEMAINE */}
        <div
          className="flex rounded bg-surface-container-high p-1"
          role="group"
          aria-label="Mode d'affichage"
        >
          <button
            type="button"
            onClick={() => setViewMode('JOUR')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              viewMode === 'JOUR'
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            aria-pressed={viewMode === 'JOUR'}
          >
            JOUR
          </button>
          <button
            type="button"
            onClick={() => setViewMode('SEMAINE')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              viewMode === 'SEMAINE'
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            aria-pressed={viewMode === 'SEMAINE'}
          >
            SEMAINE
          </button>
        </div>
      </div>

      {/* Graphique à barres */}
      <div className="relative overflow-x-auto">
        <div
          className="relative"
          style={{ width: chartWidth, height: CHART_HEIGHT }}
          role="img"
          aria-label="Graphique à barres montrant le revenu par jour"
        >
          {/* Lignes de grille horizontales */}
          <svg
            width={chartWidth}
            height={CHART_HEIGHT}
            className="absolute inset-0"
            aria-hidden="true"
          >
            {/* Lignes de grille */}
            {[0, 1, 2, 3].map(i => (
              <line
                key={i}
                x1={0}
                y1={i * (CHART_HEIGHT / 3)}
                x2={chartWidth}
                y2={i * (CHART_HEIGHT / 3)}
                stroke="currentColor"
                strokeOpacity="0.1"
                className="text-on-surface"
              />
            ))}

            {/* Barres */}
            {data && data.map((point, index) => {
              const x = BAR_GAP + index * (BAR_WIDTH + BAR_GAP);
              const height = barHeights[index] || 0;
              const y = CHART_HEIGHT - height - 30; // 30px pour les labels

              return (
                <g key={point.day}>
                  {/* Barre */}
                  <rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={height}
                    rx={4}
                    className={`transition-all duration-300 ${
                      point.isCurrentDay
                        ? 'fill-primary-container'
                        : 'fill-surface-variant'
                    }`}
                    style={{
                      fill: point.isCurrentDay ? '#f59e0b' : '#353534',
                    }}
                  />

                  {/* Valeur au-dessus de la barre */}
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className={`text-xs font-bold ${
                      point.isCurrentDay ? 'fill-primary' : 'fill-on-surface-variant'
                    }`}
                    style={{
                      fill: point.isCurrentDay ? '#ffc174' : '#d8c3ad',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {formatRevenue(point.revenue)}
                  </text>

                  {/* Label du jour */}
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={CHART_HEIGHT - 10}
                    textAnchor="middle"
                    className={`text-xs font-label ${
                      point.isCurrentDay ? 'fill-primary' : 'fill-on-surface-variant'
                    }`}
                    style={{
                      fill: point.isCurrentDay ? '#ffc174' : '#d8c3ad',
                      fontSize: '11px',
                    }}
                  >
                    {point.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: '#ffc174' }}
            aria-hidden="true"
          />
          <span className="font-label text-xs text-on-surface-variant">
            Jour actuel
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: '#353534' }}
            aria-hidden="true"
          />
          <span className="font-label text-xs text-on-surface-variant">
            Autres jours
          </span>
        </div>
      </div>
    </div>
  );
}

export default WeeklyPerformance;

// src/components/serveur/ReservationsPlanning.tsx
// Planning des réservations du jour

import { useTodayReservations, useOccupancyStats, useUpcomingArrivals } from '../../hooks/useReservationsPlanning';
import { TableOccupancy } from './TableOccupancy';
import { ReservationCard } from './ReservationCard';

export interface ReservationsPlanningProps {
  onCheckIn?: (reservationId: number) => void;
  onCancel?: (reservationId: number) => void;
}

export function ReservationsPlanning({ onCheckIn, onCancel }: ReservationsPlanningProps): JSX.Element {
  const todayReservations = useTodayReservations();
  const occupancyStats = useOccupancyStats();
  const upcomingArrivals = useUpcomingArrivals(5);

  const handleCheckIn = (reservationId: number) => {
    onCheckIn?.(reservationId);
  };

  const handleCancel = (reservationId: number) => {
    onCancel?.(reservationId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Section header */}
      <div>
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
          Réservations du Jour
        </h2>
        <p className="text-on-surface-variant font-medium">
          Occupation des Tables • Vue en temps réel
        </p>
      </div>

      {/* Stats d'occupation - Style PNG */}
      <div className="bg-surface-container-low p-4 rounded-xl">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
          Occupation des Tables
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Libres</span>
            <span className="font-mono text-xl font-bold text-tertiary">T-{occupancyStats.free}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Occupées</span>
            <span className="font-mono text-xl font-bold text-primary">T-{occupancyStats.occupied}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Réservées</span>
            <span className="font-mono text-xl font-bold text-purple-500">T-{occupancyStats.reserved}</span>
          </div>
        </div>
      </div>

      {/* Prochaines arrivées */}
      <div>
        <h3 className="font-headline text-xl font-bold text-on-surface mb-4">
          Prochaines Arrivées
        </h3>
        <div className="space-y-3">
          {upcomingArrivals.length > 0 ? (
            upcomingArrivals.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCheckIn={handleCheckIn}
                onCancel={handleCancel}
                compact
              />
            ))
          ) : (
            <div className="text-center py-8 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl mb-2">
                event_busy
              </span>
              <p className="text-on-surface-variant text-sm">
                Aucune arrivée prévue
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toutes les réservations du jour */}
      <div>
        <h3 className="font-headline text-xl font-bold text-on-surface mb-4">
          Toutes les Réservations
        </h3>
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          {todayReservations.length > 0 ? (
            <table className="w-full">
              <thead className="bg-surface-container-high">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Heure
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Couverts
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {todayReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-on-surface">
                      {reservation.time}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      {reservation.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {reservation.guests} pers.
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {reservation.tableId ? `T-${reservation.tableId}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider',
                          reservation.status === 'confirme' && 'bg-tertiary/10 text-tertiary',
                          reservation.status === 'en_attente' && 'bg-primary/10 text-primary',
                          reservation.status === 'arrive' && 'bg-blue-500/10 text-blue-500',
                          reservation.status === 'annule' && 'bg-error/10 text-error'
                        )}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {reservation.status === 'confirme' && (
                        <button
                          onClick={() => handleCheckIn(reservation.id)}
                          className="text-primary hover:text-primary-container font-medium text-sm transition-colors"
                          aria-label="Enregistrer l'arrivée"
                        >
                          Check-in
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-on-surface-variant">
              Aucune réservation pour aujourd'hui
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper pour les classes conditionnelles
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

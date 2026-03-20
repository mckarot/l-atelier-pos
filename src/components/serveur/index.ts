// src/components/serveur/index.ts
// Export de tous les composants du module Serveur

export { TableCard } from './TableCard';
export type { TableCardProps } from './TableCard';

export { OrderItem } from './OrderItem';
export type { OrderItemProps } from './OrderItem';

export { SelectedTable } from './SelectedTable';
export type { SelectedTableProps } from './SelectedTable';

export { FloorPlan } from './FloorPlan';
export type { FloorPlanProps } from './FloorPlan';

export { ReservationCard } from './ReservationCard';
export type { ReservationCardProps } from './ReservationCard';

export { TableOccupancy } from './TableOccupancy';
export type { TableOccupancyProps } from './TableOccupancy';

export { ReservationsPlanning } from './ReservationsPlanning';
export type { ReservationsPlanningProps } from './ReservationsPlanning';

export type {
  FloorTable,
  TableOrder,
  OrderItem as OrderItemType,
  Reservation,
  OccupancyStats,
} from './types';

// src/hooks/index.ts
// Export de tous les hooks du projet

// Hooks Serveur
export { useServerCart } from './useServerCart';
export type { UseServerCartReturn, ServerCartItem } from './useServerCart';

export { useServerOrders } from './useServerOrders';

// Hooks Menu
export {
  useAllMenuItems,
  useMenuItemsByCategory,
  useAvailableMenuItems,
  useMenuItem,
  useMenuItemsSearch,
  createMenuItem,
  toggleMenuItemAvailability,
} from './useMenu';

// Hooks Tables
export { useTables, useTable } from './useTables';

// Hooks Orders
export { useOrders, useOrder } from './useOrders';

// Hooks FloorPlan
export { useFloorPlan, useElapsedTime } from './useFloorPlan';

// Hooks ActiveTables
export { useActiveTables } from './useActiveTables';

// Hooks Dashboard
export { useDashboardData } from './useDashboardData';

// Hooks KitchenMonitor
export { useKitchenMonitor } from './useKitchenMonitor';

// Hooks MenuEditor
export { useMenuEditor } from './useMenuEditor';

// Hooks Reservations
export { useReservations } from './useReservations';
export { useReservationsPlanning } from './useReservationsPlanning';

// Hooks Cart (Client)
export { useCart } from './useCart';
export type { CartItem, Cart, OrderType } from './useCart';

// Hooks Role
export { useRole } from './useRole';
export { useRoleGuard } from './useRoleGuard';

// Hooks Toast
export { useToast } from './useToast';

// Hooks SyncStatus
export { useSyncStatus } from './useSyncStatus';

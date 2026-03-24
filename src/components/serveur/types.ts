// src/components/serveur/types.ts
// Types TypeScript pour le module Serveur

import type { Order, OrderItem as DbOrderItem, TableRecord } from '../../firebase/types';

/** Statut d'une table */
export type TableStatus = 'libre' | 'occupee' | 'pret' | 'reservation';

/** Table du plan de salle avec données enrichies */
export interface FloorTable extends TableRecord {
  name: string; // "T.01"
  sector: string; // "Terrasse", "Salle", "Bar"
  currentOrder?: TableOrder;
}

/** Commande associée à une table */
export interface TableOrder {
  id: number;
  items: OrderItem[];
  total: number;
  startTime: number;
  customerName?: string;
  notes?: string;
}

/** Item de commande avec contrôles */
export interface OrderItem extends DbOrderItem {
  id: number;
  price: number;
  description?: string;
  customization?: string;
}

/** Réservation */
export interface Reservation {
  id: number;
  customerName: string;
  time: string;
  guests: number;
  tableId?: number;
  status: 'confirme' | 'arrive' | 'annule' | 'attente';
  email?: string;
  phone?: string;
  notes?: string;
}

/** Stats d'occupation */
export interface OccupancyStats {
  free: number;
  occupied: number;
  reserved: number;
  total: number;
}

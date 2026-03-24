/**
 * Types TypeScript pour Firestore
 * 
 * Ces types sont adaptés de src/db/types.ts pour Firestore.
 * Les principales différences :
 * - Timestamp utilise firebase.firestore.Timestamp
 * - Les ID sont des strings (au lieu de numbers pour Dexie)
 * - Les champs optionnels sont explicités
 */

import type { Timestamp } from 'firebase/firestore';

// ============================================
// TYPES DE BASE (inchangés)
// ============================================

export type UserRole = 'admin' | 'kds' | 'serveur' | 'client';

export type OrderStatus =
  | 'attente'
  | 'preparation'
  | 'pret'
  | 'served'
  | 'paid'
  | 'annule';

export type TableStatus = 'libre' | 'occupee' | 'reservation' | 'maintenance';

export type MenuCategory = 'entree' | 'plat' | 'dessert' | 'boisson';

export type StationType = 'FROID' | 'GRILL' | 'CHAUD' | 'BAR' | 'PIZZA';

export type CookingLevel = 'saignant' | 'a_point' | 'bien_cuit' | 'pas_cuit';

export type ReservationStatus = 'attente' | 'confirme' | 'arrive' | 'annule';

export type TimeSlot =
  | '12:00'
  | '12:30'
  | '13:00'
  | '13:30'
  | '14:00'
  | '14:30'
  | '19:00'
  | '19:30'
  | '20:00'
  | '20:30'
  | '21:00'
  | '21:30'
  | '22:00';

export type Supplement = 'supplement_fromage' | 'supplement_sauce' | 'supplement_legumes';

// Mappers pour Supplement (affichage)
export const SUPPLEMENT_LABELS: Record<Supplement, string> = {
  supplement_fromage: 'Fromage',
  supplement_sauce: 'Sauce',
  supplement_legumes: 'Légumes',
};

export const SUPPLEMENT_PRICES: Record<Supplement, number> = {
  supplement_fromage: 1.5,
  supplement_sauce: 0.5,
  supplement_legumes: 1.0,
};

export interface CustomizationOptions {
  cookingLevel?: CookingLevel;
  without?: string[];
  extra?: string[];
}

// ============================================
// ENTITÉS PRINCIPALES
// ============================================

/** Item individuel dans une commande */
export interface OrderItem {
  id: string; // UUID au lieu de number
  name: string;
  quantity: number;
  customization?: string;
  done?: boolean;
  station?: StationType;
  supplements?: Supplement[];
  cookingLevel?: CookingLevel;
  price?: number;
}

/** Commande complète */
export interface Order {
  id: string; // Firestore utilise des strings
  tableId: number;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  total?: number;
  notes?: string;
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt?: Timestamp;
  servedAt?: Timestamp;
  paymentMethod?: 'especes' | 'cb' | 'none';
}

/** Table de restaurant */
export interface TableRecord {
  id: number; // On garde number pour cohérence avec l'UI
  name: string;
  status: TableStatus;
  capacity?: number;
  currentOrderId?: number;
}

/** Article du menu */
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  allergens?: string[];
  isAvailable: boolean; // Firestore gère mieux les booléens que Dexie
  station?: StationType;
  customizationOptions?: CustomizationOptions;
}

/** Réservation client */
export interface Reservation {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  date: string; // YYYY-MM-DD
  time: TimeSlot | string; // HH:mm
  guests: number;
  status: ReservationStatus;
  tableId?: number;
  notes?: string;
  createdAt: Timestamp;
  referenceNumber: string;
}

/** Utilisateur du système */
export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Timestamp;
}

// ============================================
// TYPES INPUT POUR CRÉATION / MISE À JOUR
// ============================================

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'servedAt'> & {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  servedAt?: Timestamp;
};

export type UpdateOrderInput = Pick<Order, 'id'> &
  Partial<Omit<Order, 'id' | 'createdAt'>>;

export type CreateTableInput = Omit<TableRecord, 'currentOrderId'>;

export type UpdateTableInput = Pick<TableRecord, 'id'> & Partial<TableRecord>;

export type CreateMenuItemInput = Omit<MenuItem, 'id'>;

export type UpdateMenuItemInput = Pick<MenuItem, 'id'> & Partial<MenuItem>;

export type CreateReservationInput = Omit<Reservation, 'id' | 'createdAt' | 'referenceNumber'> & {
  id?: string;
  createdAt?: Timestamp;
  referenceNumber?: string;
};

export type UpdateReservationInput = Pick<Reservation, 'id'> &
  Partial<Omit<Reservation, 'id' | 'createdAt' | 'referenceNumber'>>;

export type CreateUserInput = Omit<User, 'id' | 'createdAt'>;

export type UpdateUserInput = Pick<User, 'id'> & Partial<Omit<User, 'id' | 'createdAt'>>;

// ============================================
// TYPES POUR LES REQUÊTES
// ============================================

/** Filtres pour les commandes */
export interface OrderFilters {
  status?: OrderStatus;
  tableId?: number;
  dateFrom?: string;
  dateTo?: string;
}

/** Filtres pour les réservations */
export interface ReservationFilters {
  date?: string;
  status?: ReservationStatus;
  timeFrom?: string;
  timeTo?: string;
}

/** Filtres pour le menu */
export interface MenuFilters {
  category?: MenuCategory;
  isAvailable?: boolean;
  search?: string;
}

/** Stats de service */
export interface ServiceStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderTime: number;
  tablesOccupied: number;
  coversServed: number;
}

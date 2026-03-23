// src/db/types.ts
// Types TypeScript pour toutes les entités de la base de données

// ─────────────────────────────────────────────────────────────────────────────
// TYPES UNION POUR LES STATUTS
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus = 
  | 'en_attente' 
  | 'en_preparation' 
  | 'pret' 
  | 'servi' 
  | 'paye' 
  | 'annule';

export type TableStatus = 
  | 'libre' 
  | 'occupee' 
  | 'pret' 
  | 'reserve';

export type MenuCategory =
  | 'Entrées'
  | 'Plats'
  | 'Desserts'
  | 'Boissons';

export type CookingLevel =
  | 'Bleu'
  | 'Saignant'
  | 'À Point'
  | 'Bien Cuit';

export interface Supplement {
  name: string;
  price: number;
}

export interface CustomizationOptions {
  cooking?: CookingLevel[];
  supplements?: Supplement[];
}

export type ReservationStatus =
  | 'confirme' 
  | 'en_attente' 
  | 'annule' 
  | 'arrive';

export type UserRole = 
  | 'admin' 
  | 'kds' 
  | 'serveur' 
  | 'client';

export type StationType = 
  | 'GRILL' 
  | 'FROID' 
  | 'PATISSERIE';

// ─────────────────────────────────────────────────────────────────────────────
// ENTITÉS STOCKÉES EN BASE DE DONNÉES
// ─────────────────────────────────────────────────────────────────────────────

/** Item individuel dans une commande */
export interface OrderItem {
  id?: number; // Identifiant optionnel pour les opérations de mise à jour
  name: string;
  quantity: number;
  customization?: string;
  done?: boolean;
  station?: StationType;
  supplements?: Supplement[];
  cookingLevel?: CookingLevel;
  price?: number; // Prix unitaire (pour affichage et calculs)
}

/** Commande complète */
export interface Order {
  id: number; // Auto-incrémenté par Dexie lors de l'insertion
  tableId: number;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  total?: number;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
  servedAt?: number;
  paymentMethod?: 'especes' | 'cb' | 'none';
  paidAt?: number;
}

/** Table du restaurant */
export interface TableRecord {
  id: number;
  status: TableStatus;
  capacity?: number;
  sector?: string;
  currentOrderId?: number;
}

/** Article du menu */
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  allergens?: string[];
  isAvailable: 0 | 1;
  station?: StationType;
  customizationOptions?: CustomizationOptions;
}

/** Réservation client */
export interface Reservation {
  id: number;
  customerName: string;
  email?: string;
  phone?: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  tableId?: number;
  notes?: string;
}

/** Utilisateur du système */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: 0 | 1;
  createdAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES INPUT POUR CRÉATION / MISE À JOUR
// ─────────────────────────────────────────────────────────────────────────────

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'servedAt'> & {
  customerName?: string;
};

export type UpdateOrderInput = Pick<Order, 'id'> & Partial<Omit<Order, 'id' | 'createdAt'>>;

export type CreateTableInput = Omit<TableRecord, 'currentOrderId'>;

export type UpdateTableInput = Pick<TableRecord, 'id'> & Partial<TableRecord>;

export type CreateMenuItemInput = Omit<MenuItem, 'id'>;

export type UpdateMenuItemInput = Pick<MenuItem, 'id'> & Partial<MenuItem>;

export type CreateReservationInput = Omit<Reservation, 'id'>;

export type UpdateReservationInput = Pick<Reservation, 'id'> & Partial<Reservation>;

export type CreateUserInput = Omit<User, 'id' | 'createdAt'>;

export type UpdateUserInput = Pick<User, 'id'> & Partial<Omit<User, 'id' | 'createdAt'>>;

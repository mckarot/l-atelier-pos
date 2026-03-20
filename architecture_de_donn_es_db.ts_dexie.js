import Dexie, { type EntityTable } from 'dexie';

// --- Interfaces basées sur les composants et écrans existants ---

export interface MenuItem {
  id?: number;
  name: string;
  price: number;
  description: string;
  category: 'Entrées' | 'Plats' | 'Desserts' | 'Boissons';
  image: string;
  allergens: string[]; // ['gluten', 'lactose', etc.]
  isAvailable: boolean;
}

export interface Table {
  id: number; // Numéro de table (1-16)
  status: 'libre' | 'occupe' | 'pret';
  currentOrderId?: number;
}

export interface Order {
  id?: number;
  tableId: number;
  items: Array<{
    menuItemId: number;
    name: string;
    quantity: number;
    price: number;
    customization?: string;
  }>;
  total: number;
  status: 'en_attente' | 'en_preparation' | 'pret' | 'paye';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface Reservation {
  id?: number;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableId?: number;
  status: 'confirme' | 'arrive' | 'annule';
  notes?: string;
}

// --- Configuration de la base de données ---

const db = new Dexie('AtelierPOSDatabase') as Dexie & {
  menuItems: EntityTable<MenuItem, 'id'>;
  tables: EntityTable<Table, 'id'>;
  orders: EntityTable<Order, 'id'>;
  reservations: EntityTable<Reservation, 'id'>;
};

db.version(1).stores({
  menuItems: '++id, name, category, isAvailable',
  tables: 'id, status',
  orders: '++id, tableId, status, createdAt',
  reservations: '++id, date, time, status'
});

// --- Fonction de Seed (Initialisation) ---

export const seedDatabase = async () => {
  const menuCount = await db.menuItems.count();
  if (menuCount === 0) {
    await db.menuItems.bulkAdd([
      { name: 'Entrecôte Maturée 300g', price: 28.00, description: 'Bœuf Black Angus, maturation 30 jours, jus corsé.', category: 'Plats', image: 'https://images.unsplash.com/photo-1546241072-48010ad2862c', allergens: ['none'], isAvailable: true },
      { name: 'Burger de l’Atelier', price: 19.50, description: 'Pain brioché, bœuf Black Angus, cheddar affiné, oignons confits.', category: 'Plats', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', allergens: ['gluten', 'lactose'], isAvailable: true },
      { name: 'Burrata Crémeuse', price: 14.00, description: 'Tomates d’antan, pesto de basilic frais, éclats de pistaches.', category: 'Entrées', image: 'https://images.unsplash.com/photo-1595196112051-dc46255f02f1', allergens: ['lactose', 'nuts'], isAvailable: true },
      { name: 'Fondant au Chocolat 70%', price: 9.50, description: 'Cœur coulant, crème anglaise à la vanille bourbon.', category: 'Desserts', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb', allergens: ['gluten', 'lactose', 'eggs'], isAvailable: true }
    ]);
  }

  const tableCount = await db.tables.count();
  if (tableCount === 0) {
    const tables: Table[] = Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      status: 'libre'
    }));
    await db.tables.bulkAdd(tables);
  }
};

export { db };
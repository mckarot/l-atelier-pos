/**
 * Seed de la base de données Firestore
 * 
 * Peuple les collections avec des données réalistes pour le développement
 * Exécuté une seule fois au premier lancement
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Vérifier si la base est déjà seedée
 */
async function isDatabaseSeeded(): Promise<boolean> {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  return !usersSnapshot.empty;
}

/**
 * Seed de la base de données
 */
export async function seedDatabase(): Promise<void> {
  // Vérifier si déjà seedé
  const alreadySeeded = await isDatabaseSeeded();
  if (alreadySeeded) {
    console.log('[Seed] Base de données déjà initialisée');
    return;
  }

  console.log('[Seed] Initialisation de la base de données...');

  const now = Timestamp.now();

  // ──────────────────────────────────────────────────────────────────────────
  // Utilisateurs (4 utilisateurs - un par rôle)
  // ──────────────────────────────────────────────────────────────────────────
  const users = [
    {
      id: 'admin-1',
      email: 'admin@atelierpos.com',
      name: 'Admin Principal',
      role: 'admin' as const,
      isActive: true,
      createdAt: now,
    },
    {
      id: 'kds-1',
      email: 'kds@atelierpos.com',
      name: 'Chef KDS',
      role: 'kds' as const,
      isActive: true,
      createdAt: now,
    },
    {
      id: 'serveur-1',
      email: 'serveur@atelierpos.com',
      name: 'Thomas Serveur',
      role: 'serveur' as const,
      isActive: true,
      createdAt: now,
    },
    {
      id: 'client-1',
      email: 'client@atelierpos.com',
      name: 'Marie Client',
      role: 'client' as const,
      isActive: true,
      createdAt: now,
    },
  ];

  for (const user of users) {
    await setDoc(doc(db, 'users', user.id), user);
  }
  console.log('[Seed] ✅ 4 utilisateurs créés');

  // ──────────────────────────────────────────────────────────────────────────
  // Tables (8 tables)
  // ──────────────────────────────────────────────────────────────────────────
  const tables = [
    { id: 1, name: 'Table 1', status: 'libre' as const, capacity: 4 },
    { id: 2, name: 'Table 2', status: 'occupee' as const, capacity: 2 },
    { id: 3, name: 'Table 3', status: 'libre' as const, capacity: 6 },
    { id: 4, name: 'Table 4', status: 'reservation' as const, capacity: 4 },
    { id: 5, name: 'Table 5', status: 'libre' as const, capacity: 8 },
    { id: 6, name: 'Table 6', status: 'occupee' as const, capacity: 4 },
    { id: 7, name: 'Table 7', status: 'maintenance' as const, capacity: 2 },
    { id: 8, name: 'Table 8', status: 'libre' as const, capacity: 6 },
  ];

  for (const table of tables) {
    await setDoc(doc(db, 'tables', table.id.toString()), table);
  }
  console.log('[Seed] ✅ 8 tables créées');

  // ──────────────────────────────────────────────────────────────────────────
  // Menu Items (12 items)
  // ──────────────────────────────────────────────────────────────────────────
  const menuItems = [
    {
      id: 'item-1',
      name: 'Salade César',
      description: 'Salade romaine, parmesan, croûtons, sauce césar',
      price: 12.5,
      category: 'entree' as const,
      isAvailable: true,
      station: 'FROID' as const,
      image: '/images/salade-cesar.jpg',
      allergens: ['gluten', 'lait'],
    },
    {
      id: 'item-2',
      name: 'Foie Gras Maison',
      description: 'Foie gras de canard, chutney de figues, pain grillé',
      price: 18.0,
      category: 'entree' as const,
      isAvailable: true,
      station: 'FROID' as const,
      image: '/images/foie-gras.jpg',
      allergens: ['gluten'],
    },
    {
      id: 'item-3',
      name: 'Burger Gourmet',
      description: 'Boeuf charolais, cheddar affiné, frites maison',
      price: 22.0,
      category: 'plat' as const,
      isAvailable: true,
      station: 'GRILL' as const,
      image: '/images/burger.jpg',
      allergens: ['gluten', 'lait'],
      customizationOptions: {
        cookingLevel: ['saignant', 'a_point', 'bien_cuit'],
        without: ['oignons', 'cornichons'],
        extra: ['bacon', 'fromage'],
      },
    },
    {
      id: 'item-4',
      name: 'Filet de Bar',
      description: 'Bar de ligne, légumes de saison, sauce vierge',
      price: 28.0,
      category: 'plat' as const,
      isAvailable: true,
      station: 'GRILL' as const,
      image: '/images/bar.jpg',
      allergens: ['poisson'],
    },
    {
      id: 'item-5',
      name: 'Risotto aux Champignons',
      description: 'Riz carnaroli, champignons sauvages, parmesan',
      price: 24.0,
      category: 'plat' as const,
      isAvailable: true,
      station: 'CHAUD' as const,
      image: '/images/risotto.jpg',
      allergens: ['lait'],
    },
    {
      id: 'item-6',
      name: 'Pizza Margherita',
      description: 'Tomate San Marzano, mozzarella di bufala, basilic',
      price: 18.0,
      category: 'plat' as const,
      isAvailable: true,
      station: 'PIZZA' as const,
      image: '/images/margherita.jpg',
      allergens: ['gluten', 'lait'],
    },
    {
      id: 'item-7',
      name: 'Tiramisu Classique',
      description: 'Mascarpone, café, cacao, biscuits cuillère',
      price: 9.0,
      category: 'dessert' as const,
      isAvailable: true,
      station: 'FROID' as const,
      image: '/images/tiramisu.jpg',
      allergens: ['gluten', 'lait', 'oeufs'],
    },
    {
      id: 'item-8',
      name: 'Moelleux au Chocolat',
      description: 'Chocolat Valrhona, glace vanille bourbon',
      price: 11.0,
      category: 'dessert' as const,
      isAvailable: true,
      station: 'CHAUD' as const,
      image: '/images/moelleux.jpg',
      allergens: ['gluten', 'lait', 'oeufs'],
    },
    {
      id: 'item-9',
      name: 'Coca-Cola',
      description: '33cl, bien frais',
      price: 4.0,
      category: 'boisson' as const,
      isAvailable: true,
      station: 'BAR' as const,
      image: '/images/coca.jpg',
      allergens: [],
    },
    {
      id: 'item-10',
      name: 'Vin Rouge - Verre',
      description: 'Côtes du Rhône, verre 15cl',
      price: 6.5,
      category: 'boisson' as const,
      isAvailable: true,
      station: 'BAR' as const,
      image: '/images/vin-rouge.jpg',
      allergens: ['sulfites'],
    },
    {
      id: 'item-11',
      name: 'Café Expresso',
      description: '100% Arabica, torréfaction artisanale',
      price: 3.0,
      category: 'boisson' as const,
      isAvailable: true,
      station: 'BAR' as const,
      image: '/images/espresso.jpg',
      allergens: [],
    },
    {
      id: 'item-12',
      name: 'Eau Minérale',
      description: 'Bouteille 1L',
      price: 5.0,
      category: 'boisson' as const,
      isAvailable: true,
      station: 'BAR' as const,
      image: '/images/eau.jpg',
      allergens: [],
    },
  ];

  for (const item of menuItems) {
    await setDoc(doc(db, 'menuItems', item.id), item);
  }
  console.log('[Seed] ✅ 12 items de menu créés');

  // ──────────────────────────────────────────────────────────────────────────
  // Commandes (5 commandes actives)
  // ──────────────────────────────────────────────────────────────────────────
  const orders = [
    {
      id: 'order-1',
      tableId: 2,
      customerName: 'Table 2',
      status: 'preparation' as const,
      items: [
        {
          id: 'order-item-1',
          name: 'Burger Gourmet',
          quantity: 1,
          cookingLevel: 'a_point',
          station: 'GRILL',
          price: 22.0,
        },
        {
          id: 'order-item-2',
          name: 'Coca-Cola',
          quantity: 1,
          station: 'BAR',
          price: 4.0,
        },
      ],
      total: 26.0,
      createdAt: Timestamp.fromMillis(Date.now() - 20 * 60 * 1000),
      updatedAt: Timestamp.fromMillis(Date.now() - 15 * 60 * 1000),
    },
    {
      id: 'order-2',
      tableId: 6,
      customerName: 'Table 6',
      status: 'pret' as const,
      items: [
        {
          id: 'order-item-3',
          name: 'Filet de Bar',
          quantity: 2,
          station: 'GRILL',
          price: 28.0,
        },
        {
          id: 'order-item-4',
          name: 'Vin Rouge - Verre',
          quantity: 2,
          station: 'BAR',
          price: 6.5,
        },
      ],
      total: 69.0,
      createdAt: Timestamp.fromMillis(Date.now() - 35 * 60 * 1000),
      updatedAt: Timestamp.fromMillis(Date.now() - 5 * 60 * 1000),
      servedAt: Timestamp.fromMillis(Date.now() - 5 * 60 * 1000),
    },
    {
      id: 'order-3',
      tableId: 3,
      customerName: 'Table 3',
      status: 'attente' as const,
      items: [
        {
          id: 'order-item-5',
          name: 'Pizza Margherita',
          quantity: 2,
          station: 'PIZZA',
          price: 18.0,
        },
        {
          id: 'order-item-6',
          name: 'Salade César',
          quantity: 1,
          station: 'FROID',
          price: 12.5,
        },
      ],
      total: 48.5,
      createdAt: Timestamp.fromMillis(Date.now() - 5 * 60 * 1000),
    },
    {
      id: 'order-4',
      tableId: 5,
      customerName: 'Table 5',
      status: 'served' as const,
      items: [
        {
          id: 'order-item-7',
          name: 'Risotto aux Champignons',
          quantity: 1,
          station: 'CHAUD',
          price: 24.0,
        },
        {
          id: 'order-item-8',
          name: 'Tiramisu Classique',
          quantity: 1,
          station: 'FROID',
          price: 9.0,
        },
      ],
      total: 33.0,
      createdAt: Timestamp.fromMillis(Date.now() - 50 * 60 * 1000),
      updatedAt: Timestamp.fromMillis(Date.now() - 30 * 60 * 1000),
      servedAt: Timestamp.fromMillis(Date.now() - 30 * 60 * 1000),
    },
    {
      id: 'order-5',
      tableId: 8,
      customerName: 'Table 8',
      status: 'paid' as const,
      items: [
        {
          id: 'order-item-9',
          name: 'Foie Gras Maison',
          quantity: 1,
          station: 'FROID',
          price: 18.0,
        },
        {
          id: 'order-item-10',
          name: 'Moelleux au Chocolat',
          quantity: 1,
          station: 'CHAUD',
          price: 11.0,
        },
      ],
      total: 29.0,
      createdAt: Timestamp.fromMillis(Date.now() - 90 * 60 * 1000),
      updatedAt: Timestamp.fromMillis(Date.now() - 60 * 60 * 1000),
      servedAt: Timestamp.fromMillis(Date.now() - 60 * 60 * 1000),
      paymentMethod: 'cb' as const,
    },
  ];

  for (const order of orders) {
    await setDoc(doc(db, 'orders', order.id), order);
  }
  console.log('[Seed] ✅ 5 commandes créées');

  // ──────────────────────────────────────────────────────────────────────────
  // Réservations (3 réservations)
  // ──────────────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const reservations = [
    {
      id: 'res-1',
      customerName: 'Famille Martin',
      email: 'martin@email.com',
      phone: '06 12 34 56 78',
      date: today,
      time: '19:30' as TimeSlot,
      guests: 4,
      status: 'confirme' as const,
      tableId: 6,
      notes: 'Anniversaire - prévoir un gâteau',
      createdAt: Timestamp.fromMillis(Date.now() - 2 * 24 * 60 * 60 * 1000),
      referenceNumber: `RES-${Date.now()}-001`,
    },
    {
      id: 'res-2',
      customerName: 'Pierre Dupont',
      email: 'p.dupont@email.com',
      phone: '07 89 12 34 56',
      date: today,
      time: '20:00' as TimeSlot,
      guests: 2,
      status: 'attente' as const,
      notes: 'Préfère une table près de la fenêtre',
      createdAt: Timestamp.fromMillis(Date.now() - 1 * 24 * 60 * 60 * 1000),
      referenceNumber: `RES-${Date.now()}-002`,
    },
    {
      id: 'res-3',
      customerName: 'Sophie Bernard',
      email: 'sophie.b@email.com',
      phone: '06 98 76 54 32',
      date: today,
      time: '21:00' as TimeSlot,
      guests: 6,
      status: 'confirme' as const,
      tableId: 5,
      createdAt: Timestamp.fromMillis(Date.now() - 3 * 24 * 60 * 60 * 1000),
      referenceNumber: `RES-${Date.now()}-003`,
    },
  ];

  for (const res of reservations) {
    await setDoc(doc(db, 'reservations', res.id), res);
  }
  console.log('[Seed] ✅ 3 réservations créées');

  console.log('[Seed] ✅ Base de données initialisée avec succès !');
  console.log('[Seed] 📊 Résumé:');
  console.log('   - 4 utilisateurs');
  console.log('   - 8 tables');
  console.log('   - 12 items de menu');
  console.log('   - 5 commandes');
  console.log('   - 3 réservations');
}

// Type pour les time slots
type TimeSlot =
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

// Export pour utilisation dans un script
if (typeof window !== 'undefined') {
  (window as any).seedDatabase = seedDatabase;
}

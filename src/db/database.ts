// src/db/database.ts
// Configuration Dexie.js - Instance unique de la base de données

import Dexie, { type Table } from 'dexie';
import type { Order, TableRecord, MenuItem, Reservation, User } from './types';

export class AtelierDatabase extends Dexie {
  // Tables typées - le second paramètre est le type de la clé primaire
  // Note: 'tables' est renommé en 'restaurantTables' pour éviter le conflit avec le getter Dexie
  orders!: Table<Order, number>;
  restaurantTables!: Table<TableRecord, number>;
  menuItems!: Table<MenuItem, number>;
  reservations!: Table<Reservation, number>;
  users!: Table<User, number>;

  constructor() {
    super('AtelierPOSDatabase');

    // Version 1 - Schéma initial
    // Chaque index est justifié par les requêtes qui l'utilisent
    this.version(1).stores({
      // orders: ++id (auto-incrément), tableId (FK), status (filtre KDS), createdAt (tri)
      orders: '++id, tableId, status, createdAt',

      // tables: id (numéro de table unique), status (filtre plan de salle)
      // Le nom de stockage reste 'tables' pour compatibilité
      tables: 'id, status',

      // menuItems: ++id, name (recherche), category (filtre menu), isAvailable (filtre disponibilité)
      menuItems: '++id, name, category, isAvailable',

      // reservations: ++id, date (filtre jour), time (tri), status (filtre)
      reservations: '++id, date, time, status',

      // users: ++id, email (unique), role (filtre par rôle), status (actif/inactif)
      users: '++id, &email, role, isActive',
    });

    // Mapping de la propriété de classe vers la table Dexie
    // Dexie utilise 'tables' comme nom de stockage, mais on accède via restaurantTables
    this.restaurantTables = this.table('tables') as Table<TableRecord, number>;
  }
}

// Instance unique exportée - ne jamais instancier new Dexie() ailleurs
export const db = new AtelierDatabase();

/**
 * Seed de la base de données - exécuté au premier lancement uniquement
 * Peuple les tables avec des données réalistes pour le développement
 * Utilise bulkPut() pour éviter les ConstraintError si les données existent déjà
 */
export async function seedDatabase(): Promise<void> {
  const now = Date.now();

  // ──────────────────────────────────────────────────────────────────────────
  // Tables du restaurant (16 tables)
  // ──────────────────────────────────────────────────────────────────────────
  const tables: TableRecord[] = [
    { id: 1, status: 'libre', capacity: 2, sector: 'Salle principale' },
    { id: 2, status: 'occupee', capacity: 2, sector: 'Salle principale', currentOrderId: 1 },
    { id: 3, status: 'libre', capacity: 4, sector: 'Salle principale' },
    { id: 4, status: 'occupee', capacity: 4, sector: 'Salle principale', currentOrderId: 2 },
    { id: 5, status: 'libre', capacity: 4, sector: 'Salle principale' },
    { id: 6, status: 'reserve', capacity: 6, sector: 'Salle principale' },
    { id: 7, status: 'libre', capacity: 2, sector: 'Terrasse' },
    { id: 8, status: 'occupee', capacity: 4, sector: 'Terrasse', currentOrderId: 3 },
    { id: 9, status: 'libre', capacity: 2, sector: 'Terrasse' },
    { id: 10, status: 'libre', capacity: 6, sector: 'Salle principale' },
    { id: 11, status: 'occupee', capacity: 2, sector: 'Bar', currentOrderId: 4 },
    { id: 12, status: 'occupee', capacity: 6, sector: 'Salle principale', currentOrderId: 5 },
    { id: 13, status: 'libre', capacity: 4, sector: 'Salle principale' },
    { id: 14, status: 'libre', capacity: 2, sector: 'Terrasse' },
    { id: 15, status: 'pret', capacity: 4, sector: 'Salle principale', currentOrderId: 6 },
    { id: 16, status: 'libre', capacity: 8, sector: 'Salle principale' },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Menu items (6 items minimum - 2 Entrées, 3 Plats, 1 Dessert)
  // ──────────────────────────────────────────────────────────────────────────
  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Tartare de Saumon',
      description: 'Saumon frais, avocat, citron vert, aneth',
      price: 14.50,
      category: 'Entrées',
      image: 'https://images.unsplash.com/photo-tartare-saumon',
      allergens: ['poisson'],
      isAvailable: 1,
      station: 'FROID',
    },
    {
      id: 2,
      name: 'Foie Gras Maison',
      description: 'Foie gras de canard, chutney de figues, pain grillé',
      price: 18.00,
      category: 'Entrées',
      image: 'https://images.unsplash.com/photo-foie-gras',
      allergens: ['gluten'],
      isAvailable: 1,
      station: 'FROID',
    },
    {
      id: 3,
      name: 'Burger de l\'Atelier',
      description: 'Boeuf charolais, cheddar affiné, bacon croustillant, sauce maison, frites',
      price: 19.50,
      category: 'Plats',
      image: 'https://images.unsplash.com/photo-burger',
      allergens: ['gluten', 'lait'],
      isAvailable: 1,
      station: 'GRILL',
      customizationOptions: {
        cooking: ['Bleu', 'Saignant', 'À Point', 'Bien Cuit'],
        supplements: [
          { name: 'Double Fromage', price: 2.50 },
          { name: 'Bacon Croustillant', price: 3.00 },
          { name: 'Oignons Caramélisés', price: 1.50 },
        ],
      },
    },
    {
      id: 4,
      name: 'Entrecôte Black Angus 300g',
      description: 'Viande maturée 28 jours, pommes grenailles, sauce au poivre',
      price: 34.00,
      category: 'Plats',
      image: 'https://images.unsplash.com/photo-entrecote',
      allergens: [],
      isAvailable: 1,
      station: 'GRILL',
      customizationOptions: {
        cooking: ['Bleu', 'Saignant', 'À Point', 'Bien Cuit'],
        supplements: [
          { name: 'Sauce Roquefort', price: 2.00 },
          { name: 'Champignons Grillés', price: 3.50 },
        ],
      },
    },
    {
      id: 5,
      name: 'Filet de Bar Rôti',
      description: 'Bar de ligne, asperges vertes, sauce hollandaise',
      price: 28.50,
      category: 'Plats',
      image: 'https://images.unsplash.com/photo-filet-bar',
      allergens: ['poisson', 'oeufs'],
      isAvailable: 1,
      station: 'GRILL',
    },
    {
      id: 6,
      name: 'Café Gourmand',
      description: 'Café espresso accompagné de 4 mignardises',
      price: 8.50,
      category: 'Desserts',
      image: 'https://images.unsplash.com/photo-cafe-gourmand',
      allergens: ['lait', 'gluten', 'oeufs'],
      isAvailable: 1,
      station: 'PATISSERIE',
    },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Commandes actives (8 commandes - couvrant les 3 états KDS)
  // ──────────────────────────────────────────────────────────────────────────
  const orders: Order[] = [
    {
      id: 1,
      tableId: 2,
      customerName: 'Pierre D.',
      status: 'en_attente',
      items: [
        { name: 'Entrecôte Black Angus', quantity: 2, customization: 'SAIGNANT', station: 'GRILL' },
        { name: 'Frites Maison', quantity: 2, station: 'GRILL' },
      ],
      total: 78.00,
      createdAt: now - 15 * 60 * 1000,
    },
    {
      id: 2,
      tableId: 4,
      customerName: 'Marie L.',
      status: 'en_preparation',
      items: [
        { name: 'Tartare de Saumon', quantity: 1, station: 'FROID' },
        { name: 'Filet de Bar Rôti', quantity: 1, customization: 'SANS ASPERGES', station: 'GRILL' },
      ],
      total: 43.00,
      createdAt: now - 25 * 60 * 1000,
      updatedAt: now - 20 * 60 * 1000,
    },
    {
      id: 3,
      tableId: 8,
      customerName: 'Jean M.',
      status: 'en_attente',
      items: [
        { name: 'Risotto aux Truffes', quantity: 2, station: 'PATISSERIE' },
      ],
      total: 52.00,
      createdAt: now - 5 * 60 * 1000,
    },
    {
      id: 4,
      tableId: 11,
      customerName: 'Sophie B.',
      status: 'pret',
      items: [
        { name: 'Foie Gras Maison', quantity: 1, station: 'FROID' },
        { name: 'Café Gourmand', quantity: 1, station: 'PATISSERIE' },
      ],
      total: 26.50,
      createdAt: now - 45 * 60 * 1000,
      updatedAt: now - 30 * 60 * 1000,
    },
    {
      id: 5,
      tableId: 12,
      customerName: 'Lucas P.',
      status: 'en_preparation',
      items: [
        { name: 'Entrecôte Black Angus', quantity: 3, customization: 'À POINT', station: 'GRILL' },
        { name: 'Salade César', quantity: 2, station: 'FROID' },
      ],
      total: 124.00,
      createdAt: now - 35 * 60 * 1000,
      updatedAt: now - 28 * 60 * 1000,
    },
    {
      id: 6,
      tableId: 15,
      customerName: 'Emma R.',
      status: 'pret',
      items: [
        { name: 'Filet de Bar Rôti', quantity: 2, station: 'GRILL' },
      ],
      total: 57.00,
      createdAt: now - 50 * 60 * 1000,
      updatedAt: now - 35 * 60 * 1000,
    },
    {
      id: 7,
      tableId: 1,
      customerName: 'Thomas G.',
      status: 'en_attente',
      items: [
        { name: 'Café Gourmand', quantity: 2, station: 'PATISSERIE' },
      ],
      total: 17.00,
      createdAt: now - 3 * 60 * 1000,
    },
    {
      id: 8,
      tableId: 6,
      customerName: 'Camille F.',
      status: 'en_attente',
      items: [
        { name: 'Risotto aux Truffes', quantity: 1, station: 'PATISSERIE' },
        { name: 'Tartare de Saumon', quantity: 1, station: 'FROID' },
      ],
      total: 40.50,
      createdAt: now - 8 * 60 * 1000,
    },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Réservations (2 réservations)
  // ──────────────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const reservations: Reservation[] = [
    {
      id: 1,
      customerName: 'Famille Martin',
      email: 'martin@email.com',
      phone: '06 12 34 56 78',
      date: today,
      time: '19:30',
      guests: 4,
      status: 'confirme',
      tableId: 6,
      notes: 'Anniversaire - prévoir un gâteau',
      createdAt: Date.now(),
      referenceNumber: `RES-${Date.now()}-001`,
    },
    {
      id: 2,
      customerName: 'Pierre Dupont',
      email: 'p.dupont@email.com',
      phone: '07 89 12 34 56',
      date: today,
      time: '20:00',
      guests: 2,
      status: 'en_attente',
      notes: 'Préfère une table près de la fenêtre',
      createdAt: Date.now(),
      referenceNumber: `RES-${Date.now()}-002`,
    },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Utilisateurs (4 utilisateurs - un par rôle)
  // ──────────────────────────────────────────────────────────────────────────
  const users: User[] = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'admin@latelier.pos',
      role: 'admin',
      isActive: 1,
      createdAt: now,
    },
    {
      id: 2,
      name: 'Chef d\'Atelier',
      email: 'chef@latelier.pos',
      role: 'kds',
      isActive: 1,
      createdAt: now,
    },
    {
      id: 3,
      name: 'Marie Laurent',
      email: 'serveur@latelier.pos',
      role: 'serveur',
      isActive: 1,
      createdAt: now,
    },
    {
      id: 4,
      name: 'Client Test',
      email: 'client@latelier.pos',
      role: 'client',
      isActive: 1,
      createdAt: now,
    },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Insertion en base - utilise bulkPut() pour éviter les erreurs de clés dupliquées
  // bulkPut() fait un upsert (update si existe, insert si n'existe pas)
  // ──────────────────────────────────────────────────────────────────────────
  
  await db.restaurantTables.bulkPut(tables);
  await db.menuItems.bulkPut(menuItems);
  await db.orders.bulkPut(orders);
  await db.reservations.bulkPut(reservations);
  await db.users.bulkPut(users);

  console.log('[Database] Seed completed successfully');
}

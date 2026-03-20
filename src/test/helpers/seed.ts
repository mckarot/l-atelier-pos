// src/test/helpers/seed.ts
// Factories typées pour le seed des données de test

import { db } from '../../db/database';
import type { User, Order, MenuItem, TableRecord, Reservation, UserRole } from '../../db/types';

/**
 * Crée un utilisateur de test avec des données par défaut
 */
export async function seedUser(overrides: Partial<Omit<User, 'id' | 'createdAt'>> = {}): Promise<User> {
  const id = await db.users.add({
    name: overrides.name ?? `Test User ${Date.now()}`,
    email: overrides.email ?? `user-${Date.now()}@test.com`,
    role: overrides.role ?? 'member',
    isActive: overrides.isActive ?? 1,
    createdAt: Date.now(),
  });
  const user = await db.users.get(id);
  if (!user) throw new Error('Failed to create user');
  return user;
}

/**
 * Crée un utilisateur avec un rôle spécifique pour les tests d'authentification
 */
export async function seedUserWithRole(role: UserRole): Promise<User> {
  return seedUser({
    role,
    email: `${role}-${Date.now()}@test.com`,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
  });
}

/**
 * Crée plusieurs utilisateurs de différents rôles
 */
export async function seedAllUserRoles(): Promise<User[]> {
  const roles: UserRole[] = ['admin', 'kds', 'serveur', 'client'];
  return Promise.all(roles.map((role) => seedUserWithRole(role)));
}

/**
 * Crée un item de menu de test
 */
export async function seedMenuItem(overrides: Partial<Omit<MenuItem, 'id'>> = {}): Promise<MenuItem> {
  const id = await db.menuItems.add({
    name: overrides.name ?? `Menu Item ${Date.now()}`,
    description: overrides.description ?? 'Test description',
    price: overrides.price ?? 15.0,
    category: overrides.category ?? 'Plats',
    isAvailable: overrides.isAvailable ?? 1,
    image: overrides.image,
    allergens: overrides.allergens,
    station: overrides.station,
  });
  const item = await db.menuItems.get(id);
  if (!item) throw new Error('Failed to create menu item');
  return item;
}

/**
 * Crée plusieurs items de menu
 */
export async function seedMenuItems(count: number): Promise<MenuItem[]> {
  const items: Omit<MenuItem, 'id'>[] = Array.from({ length: count }, (_, i) => ({
    name: `Menu Item ${i + 1}`,
    description: `Description ${i + 1}`,
    price: 10 + i * 5,
    category: (['Entrées', 'Plats', 'Desserts'] as const)[i % 3],
    isAvailable: 1,
  }));
  await db.menuItems.bulkAdd(items);
  return db.menuItems.toArray();
}

/**
 * Crée une table de test
 */
export async function seedTable(overrides: Partial<Omit<TableRecord, 'id'>> = {}): Promise<TableRecord> {
  const id = overrides.id ?? 1;
  await db.tables.add({
    id,
    status: overrides.status ?? 'libre',
    capacity: overrides.capacity ?? 2,
    sector: overrides.sector ?? 'Salle principale',
    currentOrderId: overrides.currentOrderId,
  });
  const table = await db.tables.get(id);
  if (!table) throw new Error('Failed to create table');
  return table;
}

/**
 * Crée une commande de test
 */
export async function seedOrder(overrides: Partial<Omit<Order, 'id' | 'createdAt'>> = {}): Promise<Order> {
  const id = await db.orders.add({
    tableId: overrides.tableId ?? 1,
    customerName: overrides.customerName ?? 'Client Test',
    status: overrides.status ?? 'en_attente',
    items: overrides.items ?? [{ name: 'Test Item', quantity: 1 }],
    total: overrides.total ?? 20.0,
    createdAt: Date.now(),
    updatedAt: overrides.updatedAt,
    notes: overrides.notes,
    servedAt: overrides.servedAt,
  } as Order);
  const order = await db.orders.get(id);
  if (!order) throw new Error('Failed to create order');
  return order;
}

/**
 * Crée une réservation de test
 */
export async function seedReservation(
  overrides: Partial<Omit<Reservation, 'id'>> = {}
): Promise<Reservation> {
  const id = await db.reservations.add({
    customerName: overrides.customerName ?? 'Test Customer',
    email: overrides.email ?? 'test@test.com',
    phone: overrides.phone ?? '06 12 34 56 78',
    date: overrides.date ?? new Date().toISOString().split('T')[0],
    time: overrides.time ?? '19:00',
    guests: overrides.guests ?? 2,
    status: overrides.status ?? 'confirme',
    tableId: overrides.tableId,
    notes: overrides.notes,
  } as Reservation);
  const reservation = await db.reservations.get(id);
  if (!reservation) throw new Error('Failed to create reservation');
  return reservation;
}

/**
 * Réinitialise complètement la base de données
 */
export async function resetDatabase(): Promise<void> {
  await db.orders.clear();
  await db.restaurantTables.clear();
  await db.menuItems.clear();
  await db.reservations.clear();
  await db.users.clear();
}

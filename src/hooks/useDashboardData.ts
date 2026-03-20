// src/hooks/useDashboardData.ts
// Hook Dexie pour récupérer les données du tableau de bord administrateur

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Order, OrderStatus } from '../db/types';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES TYPESCRIPT
// ─────────────────────────────────────────────────────────────────────────────

/** Point de données pour le graphique hebdomadaire */
export interface WeeklyDataPoint {
  day: string; // "LUN", "MAR", ...
  revenue: number;
  isCurrentDay: boolean;
}

/** Événement du flux live */
export interface LiveEvent {
  id: number;
  type: 'payment' | 'order' | 'cancellation';
  title: string;
  amount?: number;
  timeAgo: string;
  icon: string;
  color: string;
}

/** Données complètes du dashboard */
export interface DashboardData {
  revenue: number;
  revenueChange: number; // +12.4
  ordersCount: number;
  ordersChange: number; // +5
  avgPrepTime: number; // en secondes (18*60+45 = 1125)
  prepTimeObjective: number; // 15*60 = 900
  prepTimeChange: number; // -2min en secondes
  satisfaction: number; // 4.8
  satisfactionLabel: string; // "Excellent"
  weeklyData: WeeklyDataPoint[];
  liveEvents: LiveEvent[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

const SATISFACTION_LABELS: Record<number, string> = {
  5: 'Excellent',
  4: 'Très bien',
  3: 'Bien',
  2: 'Moyen',
  1: 'À améliorer',
};

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formate un temps en secondes vers le format MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcule le temps écoulé depuis un timestamp
 */
function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `Il y a ${days}j`;
  if (hours > 0) return `Il y a ${hours}h`;
  if (minutes > 0) return `Il y a ${minutes}min`;
  return 'À l\'instant';
}

/**
 * Obtient le jour de la semaine en français (0 = Dimanche, 1 = Lundi, ...)
 */
function getFrenchDayIndex(date: Date): number {
  const day = date.getDay();
  // Convertir Dimanche (0) -> 6, Lundi (1) -> 0, etc.
  return day === 0 ? 6 : day - 1;
}

/**
 * Calcule le revenu total d'une commande
 */
function calculateOrderTotal(order: Order): number {
  if (order.total !== undefined && order.total !== null) {
    return order.total;
  }
  // Si pas de total, on utilise 0 (ou on pourrait calculer depuis le menu)
  return 0;
}

/**
 * Calcule le temps de préparation d'une commande (en secondes)
 */
function calculatePrepTime(order: Order): number {
  if (!order.servedAt || !order.createdAt) {
    return 0;
  }
  return Math.floor((order.servedAt - order.createdAt) / 1000);
}

/**
 * Génère des données hebdomadaires simulées basées sur les commandes réelles
 */
function generateWeeklyData(orders: Order[]): WeeklyDataPoint[] {
  const now = new Date();
  const todayIndex = getFrenchDayIndex(now);
  
  // Initialiser les données pour les 7 jours
  const dailyRevenue = new Array(7).fill(0);
  
  // Agréger les revenus par jour de la semaine
  orders.forEach(order => {
    if (order.status === 'paye') {
      const orderDate = new Date(order.createdAt);
      const dayIndex = getFrenchDayIndex(orderDate);
      dailyRevenue[dayIndex] += calculateOrderTotal(order);
    }
  });

  // Si aucun revenu trouvé (pas de commandes payées), générer des données de démo
  const totalRevenue = dailyRevenue.reduce((sum, rev) => sum + rev, 0);
  if (totalRevenue === 0) {
    // Données de démo réalistes
    const demoData = [1850, 2100, 1950, 2300, 2485, 3200, 2800];
    return DAYS_OF_WEEK.map((day, index) => ({
      day,
      revenue: demoData[index],
      isCurrentDay: index === todayIndex,
    }));
  }

  return DAYS_OF_WEEK.map((day, index) => ({
    day,
    revenue: dailyRevenue[index],
    isCurrentDay: index === todayIndex,
  }));
}

/**
 * Génère les événements du flux live basés sur les commandes récentes
 */
function generateLiveEvents(orders: Order[]): LiveEvent[] {
  const events: LiveEvent[] = [];
  
  // Trier les commandes par date de création (plus récentes en premier)
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);
  
  // Prendre les 5 commandes les plus récentes
  sortedOrders.slice(0, 5).forEach(order => {
    let event: LiveEvent;
    
    if (order.status === 'paye') {
      event = {
        id: order.id,
        type: 'payment',
        title: `Paiement Reçu - Table ${order.tableId}`,
        amount: calculateOrderTotal(order),
        timeAgo: timeAgo(order.updatedAt || order.createdAt),
        icon: 'payments',
        color: 'text-tertiary',
      };
    } else if (order.status === 'annule') {
      event = {
        id: order.id,
        type: 'cancellation',
        title: `Annulation - Table ${order.tableId}`,
        timeAgo: timeAgo(order.updatedAt || order.createdAt),
        icon: 'cancel',
        color: 'text-error',
      };
    } else if (order.status === 'servi' || order.status === 'pret') {
      event = {
        id: order.id,
        type: 'order',
        title: `Commande Terminée - #${order.id}`,
        timeAgo: timeAgo(order.updatedAt || order.createdAt),
        icon: 'check_circle',
        color: 'text-tertiary',
      };
    } else {
      event = {
        id: order.id,
        type: 'order',
        title: `Nouvelle Commande - Table ${order.tableId}`,
        amount: calculateOrderTotal(order),
        timeAgo: timeAgo(order.createdAt),
        icon: 'receipt_long',
        color: 'text-primary',
      };
    }
    
    events.push(event);
  });

  // Si aucun événement, générer des événements de démo
  if (events.length === 0) {
    return [
      {
        id: 1,
        type: 'payment',
        title: 'Paiement Reçu - Table 14',
        amount: 124.50,
        timeAgo: 'Il y a 2 min',
        icon: 'payments',
        color: 'text-tertiary',
      },
      {
        id: 2,
        type: 'order',
        title: 'Commande Terminée - #842',
        timeAgo: 'Il y a 5 min',
        icon: 'check_circle',
        color: 'text-tertiary',
      },
      {
        id: 3,
        type: 'cancellation',
        title: 'Annulation - Table 4',
        timeAgo: 'Il y a 12 min',
        icon: 'cancel',
        color: 'text-error',
      },
    ];
  }

  return events;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook pour récupérer les données du tableau de bord
 * Utilise useLiveQuery pour une mise à jour réactive
 * @returns DashboardData | undefined
 */
export function useDashboardData(): DashboardData | undefined {
  // Récupérer toutes les commandes via Dexie
  const allOrders = useLiveQuery(
    () => db.orders.orderBy('createdAt').toArray(),
    []
  );

  // Calculer les données dérivées avec useMemo pour éviter les recalculs inutiles
  return useMemo(() => {
    if (!allOrders) {
      return undefined;
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 86400000; // 24 heures en ms

    // ────────────────────────────────────────────────────────────────────────
    // 1. REVENU QUOTIDIEN
    // ────────────────────────────────────────────────────────────────────────
    // Filtrer les commandes payées du jour
    const todayPaidOrders = allOrders.filter(order => 
      order.status === 'paye' && 
      order.createdAt >= startOfDay && 
      order.createdAt < endOfDay
    );
    
    const revenue = todayPaidOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
    
    // Simulation de la variation (dans une implémentation réelle, comparer avec la veille)
    const revenueChange = revenue > 0 ? 12.4 : 0;

    // ────────────────────────────────────────────────────────────────────────
    // 2. COMMANDES
    // ────────────────────────────────────────────────────────────────────────
    // Toutes les commandes du jour (hors annulées)
    const todayOrders = allOrders.filter(order => 
      order.createdAt >= startOfDay && 
      order.createdAt < endOfDay &&
      order.status !== 'annule'
    );
    
    const ordersCount = todayOrders.length;
    const ordersChange = ordersCount > 0 ? 5 : 0;

    // ────────────────────────────────────────────────────────────────────────
    // 3. TEMPS DE PRÉPARATION MOYEN
    // ────────────────────────────────────────────────────────────────────────
    // Calculer le temps de préparation pour les commandes servies
    const servedOrders = allOrders.filter(order => 
      order.status === 'servi' && order.servedAt && order.createdAt
    );
    
    let avgPrepTime = 0;
    if (servedOrders.length > 0) {
      const totalPrepTime = servedOrders.reduce((sum, order) => sum + calculatePrepTime(order), 0);
      avgPrepTime = Math.floor(totalPrepTime / servedOrders.length);
    } else {
      // Valeur par défaut si aucune commande servie
      avgPrepTime = 18 * 60 + 45; // 18:45
    }
    
    const prepTimeObjective = 15 * 60; // 15:00
    const prepTimeChange = avgPrepTime - prepTimeObjective; // positif = plus lent, négatif = plus rapide

    // ────────────────────────────────────────────────────────────────────────
    // 4. SATISFACTION
    // ────────────────────────────────────────────────────────────────────────
    // Dans une implémentation réelle, récupérer depuis une table de reviews
    // Ici on utilise une valeur fixe réaliste
    const satisfaction = 4.8;
    const satisfactionLabel = SATISFACTION_LABELS[5] || 'Excellent';

    // ────────────────────────────────────────────────────────────────────────
    // 5. DONNÉES HEBDOMADAIRES
    // ────────────────────────────────────────────────────────────────────────
    const weeklyData = generateWeeklyData(allOrders);

    // ────────────────────────────────────────────────────────────────────────
    // 6. FLUX LIVE
    // ────────────────────────────────────────────────────────────────────────
    const liveEvents = generateLiveEvents(allOrders);

    return {
      revenue,
      revenueChange,
      ordersCount,
      ordersChange,
      avgPrepTime,
      prepTimeObjective,
      prepTimeChange,
      satisfaction,
      satisfactionLabel,
      weeklyData,
      liveEvents,
    };
  }, [allOrders]);
}

/**
 * Hook utilitaire pour formater le revenu en euros
 */
export function useFormattedRevenue(revenue: number | undefined): string {
  return useMemo(() => {
    if (revenue === undefined) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(revenue);
  }, [revenue]);
}

/**
 * Hook utilitaire pour formater le temps
 */
export function useFormattedTime(seconds: number | undefined): string {
  return useMemo(() => {
    if (seconds === undefined) return '00:00';
    return formatTime(seconds);
  }, [seconds]);
}

export default useDashboardData;

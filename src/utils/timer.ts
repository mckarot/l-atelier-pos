// src/utils/timer.ts
// Fonctions pures pour le calcul et le formatage des timers KDS

import type { Order, OrderStatus } from '../firebase/types';
import type { Timestamp } from 'firebase/firestore';

/**
 * Seuils d'alerte pour les timers (en millisecondes)
 */
export const TIMER_THRESHOLDS = {
  /** Alerte warning : 10 minutes */
  warning: 10 * 60 * 1000,
  /** Alerte danger : 20 minutes */
  danger: 20 * 60 * 1000,
} as const;

/**
 * Statut d'alerte du timer
 */
export type TimerAlertStatus = 'normal' | 'warning' | 'danger';

/**
 * Helper to convert Timestamp to milliseconds
 */
function toMillis(timestamp: Timestamp | number): number {
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  return timestamp.toMillis();
}

/**
 * Calcule le temps écoulé depuis un timestamp
 * @param createdAt - Timestamp de création en millisecondes
 * @param currentTime - Timestamp actuel en millisecondes (par défaut Date.now())
 * @returns Temps écoulé en millisecondes
 */
export function calculateElapsedTime(createdAt: number, currentTime: number = Date.now()): number {
  return currentTime - createdAt;
}

/**
 * Formate un temps écoulé en format MM:SS
 * @param elapsedMs - Temps écoulé en millisecondes
 * @returns Chaîne formatée MM:SS
 */
export function formatElapsedTime(elapsedMs: number): string {
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formate un timestamp en heure locale HH:MM
 * @param timestamp - Timestamp en millisecondes
 * @returns Heure formatée HH:MM
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Détermine le statut d'alerte en fonction du temps écoulé
 * @param elapsedMs - Temps écoulé en millisecondes
 * @returns Statut d'alerte : 'normal', 'warning' ou 'danger'
 */
export function getTimerAlertStatus(elapsedMs: number): TimerAlertStatus {
  if (elapsedMs > TIMER_THRESHOLDS.danger) {
    return 'danger';
  }
  if (elapsedMs > TIMER_THRESHOLDS.warning) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Vérifie si le timer est en état d'alerte danger
 * @param elapsedMs - Temps écoulé en millisecondes
 * @returns true si le temps dépasse le seuil danger
 */
export function isTimerDanger(elapsedMs: number): boolean {
  return elapsedMs > TIMER_THRESHOLDS.danger;
}

/**
 * Vérifie si le timer est en état d'alerte warning (mais pas danger)
 * @param elapsedMs - Temps écoulé en millisecondes
 * @returns true si le temps dépasse le seuil warning sans atteindre danger
 */
export function isTimerWarning(elapsedMs: number): boolean {
  return elapsedMs > TIMER_THRESHOLDS.warning && elapsedMs <= TIMER_THRESHOLDS.danger;
}

/**
 * Options pour le calcul du temps moyen
 */
export interface AveragePrepTimeOptions {
  /** Statuts à inclure dans le calcul (par défaut: ['pret', 'served', 'paid']) */
  completedStatuses?: OrderStatus[];
  /** Nombre minimum de commandes pour calculer (par défaut: 1) */
  minOrders?: number;
}

/**
 * Calcule le temps moyen de préparation en minutes
 * Basé sur les commandes terminées (status: 'pret', 'served', 'paid')
 *
 * @param orders - Liste des commandes
 * @param options - Options de calcul
 * @returns Temps moyen en minutes (arrondi), ou 0 si pas assez de données
 */
export function calculateAveragePrepTime(
  orders: Order[],
  options: AveragePrepTimeOptions = {}
): number {
  const {
    completedStatuses = ['pret', 'served', 'paid'],
    minOrders = 1,
  } = options;

  const completedOrders = orders.filter((order) =>
    completedStatuses.includes(order.status)
  );

  if (completedOrders.length < minOrders) {
    return 0;
  }

  const totalTime = completedOrders.reduce((sum, order) => {
    const startTime = toMillis(order.createdAt);
    const endTime = order.updatedAt ? toMillis(order.updatedAt) : startTime;
    const prepTime = endTime - startTime;
    return sum + prepTime;
  }, 0);

  const avgMs = totalTime / completedOrders.length;
  return Math.round(avgMs / 60000); // Conversion ms → minutes
}

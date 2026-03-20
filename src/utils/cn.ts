// src/utils/cn.ts
// Utilitaire de fusion de classes Tailwind

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne des classes Tailwind de manière intelligente.
 * Combine clsx pour les conditions et tailwind-merge pour résoudre les conflits.
 *
 * @example
 * cn('text-red-500', 'text-blue-500') // => 'text-blue-500'
 * cn('base-class', isActive && 'active-class') // => 'base-class active-class'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retourne la classe pour les icônes Material Symbols en style filaire (outline).
 */
export function iconOutlined(): string {
  return 'material-symbols-outlined';
}

/**
 * Retourne la classe pour les icônes Material Symbols en style rempli (filled).
 * Utilise la classe CSS .material-symbols-filled qui applique FILL 1.
 */
export function iconFilled(): string {
  return 'material-symbols-filled';
}

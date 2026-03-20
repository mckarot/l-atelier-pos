// src/views/KDS/index.tsx
// Vue Kitchen Display System - Écran de production cuisine
// Wrapper qui délègue au composant KDSLayout

import { type JSX } from 'react';
import KDSLayout from './components/KDSLayout';

/**
 * Vue KDS - Point d'entrée principal
 * Ce fichier est un wrapper qui importe et rend le KDSLayout
 * Toute la logique est déléguée aux composants dans ./components/
 */
export function KDSView(): JSX.Element {
  return <KDSLayout />;
}

export default KDSView;

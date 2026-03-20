// src/components/admin/TableCard.test.tsx
// Tests unitaires pour le composant TableCard

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { TableService } from '../../hooks/useActiveTables';
import { TableCard } from './TableCard';

// Helper pour créer un service de table
function createTableService(overrides: Partial<TableService> = {}): TableService {
  return {
    orderId: 1402,
    tableId: 8,
    tableName: 'Table 08',
    status: 'en_preparation',
    guests: 4,
    server: 'Marc',
    items: [
      { name: 'Entrecôte Argentine', quantity: 2, status: 'preparation' },
      { name: 'Risotto Truffe', quantity: 1, status: 'attente' },
    ],
    waitTime: 12,
    total: 118.0,
    ...overrides,
  };
}

describe('TableCard', () => {
  describe('Rendu de base', () => {
    it('affiche le numéro de commande', () => {
      // Arrange
      const service = createTableService({ orderId: 1402 });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('#1402')).toBeInTheDocument();
    });

    it('affiche le nom de la table', () => {
      // Arrange
      const service = createTableService({ tableName: 'Table 08' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('Table 08')).toBeInTheDocument();
    });

    it('utilise le rôle article pour l\'accessibilité', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('utilise aria-label avec le numéro de commande et le nom de table', () => {
      // Arrange
      const service = createTableService({ orderId: 1402, tableName: 'Table 08' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article', { name: 'Commande 1402 - Table 08' })).toBeInTheDocument();
    });
  });

  describe('Badge de statut', () => {
    it('affiche le badge "EN PRÉPARATION" pour le statut en_preparation', () => {
      // Arrange
      const service = createTableService({ status: 'en_preparation' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('EN PRÉPARATION')).toBeInTheDocument();
    });

    it('affiche le badge "RETARD" pour le statut retard', () => {
      // Arrange
      const service = createTableService({ status: 'retard' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('RETARD')).toBeInTheDocument();
    });

    it('affiche le badge "NOUVEAU" pour le statut nouveau', () => {
      // Arrange
      const service = createTableService({ status: 'nouveau' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('NOUVEAU')).toBeInTheDocument();
    });

    it('affiche l\'icône warning pour le statut retard', () => {
      // Arrange
      const service = createTableService({ status: 'retard' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('warning')).toBeInTheDocument();
    });

    it('n\'affiche pas d\'icône pour le statut en_preparation', () => {
      // Arrange
      const service = createTableService({ status: 'en_preparation' });

      // Act
      render(<TableCard service={service} />);

      // Assert - Ne devrait pas avoir d'icône warning
      expect(screen.queryByText('warning')).not.toBeInTheDocument();
    });
  });

  describe('Classes de style selon le statut', () => {
    it('applique border-error pour le statut retard', () => {
      // Arrange
      const service = createTableService({ status: 'retard' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      const card = screen.getByRole('article');
      expect(card).toHaveClass('border-error');
    });

    it('applique border-tertiary pour le statut en_preparation', () => {
      // Arrange
      const service = createTableService({ status: 'en_preparation' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      const card = screen.getByRole('article');
      expect(card).toHaveClass('border-tertiary');
    });

    it('applique border-primary pour le statut nouveau', () => {
      // Arrange
      const service = createTableService({ status: 'nouveau' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      const card = screen.getByRole('article');
      expect(card).toHaveClass('border-primary');
    });

    it('applique bg-error/20 text-error pour le badge retard', () => {
      // Arrange
      const service = createTableService({ status: 'retard' });

      // Act
      render(<TableCard service={service} />);

      // Assert - Le badge devrait avoir les classes
      const badge = screen.getByText('RETARD');
      expect(badge).toHaveClass('bg-error/20');
      expect(badge).toHaveClass('text-error');
    });

    it('applique bg-tertiary/10 text-tertiary pour le badge en_preparation', () => {
      // Arrange
      const service = createTableService({ status: 'en_preparation' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      const badge = screen.getByText('EN PRÉPARATION');
      expect(badge).toHaveClass('bg-tertiary/10');
      expect(badge).toHaveClass('text-tertiary');
    });
  });

  describe('Informations sur le service', () => {
    it('affiche le nombre de personnes', () => {
      // Arrange
      const service = createTableService({ guests: 4 });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('4 Personnes')).toBeInTheDocument();
    });

    it('affiche le nom du serveur', () => {
      // Arrange
      const service = createTableService({ server: 'Marc' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('Serveur: Marc')).toBeInTheDocument();
    });

    it('affiche l\'icône people pour le nombre de personnes', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('people')).toBeInTheDocument();
    });

    it('affiche l\'icône person pour le serveur', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('person')).toBeInTheDocument();
    });
  });

  describe('Liste des items', () => {
    it('affiche la liste des items de la commande', () => {
      // Arrange
      const service = createTableService({
        items: [
          { name: 'Entrecôte Argentine', quantity: 2, status: 'preparation' },
          { name: 'Risotto Truffe', quantity: 1, status: 'attente' },
        ],
      });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('Entrecôte Argentine')).toBeInTheDocument();
      expect(screen.getByText('Risotto Truffe')).toBeInTheDocument();
    });

    it('affiche la quantité avec formatage 2x', () => {
      // Arrange
      const service = createTableService({
        items: [{ name: 'Entrecôte', quantity: 2, status: 'preparation' }],
      });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('2x')).toBeInTheDocument();
    });

    it('affiche le statut de l\'item en texte coloré', () => {
      // Arrange
      const service = createTableService({
        items: [
          { name: 'Item 1', quantity: 1, status: 'attente' },
          { name: 'Item 2', quantity: 1, status: 'pret' },
          { name: 'Item 3', quantity: 1, status: 'preparation' },
        ],
      });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('ATTENTE')).toBeInTheDocument();
      expect(screen.getByText('PRÊT')).toBeInTheDocument();
      expect(screen.getByText('EN CUISINE')).toBeInTheDocument();
    });
  });

  describe('Temps d\'attente et total', () => {
    it('affiche le temps d\'attente en minutes', () => {
      // Arrange
      const service = createTableService({ waitTime: 12 });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('12min')).toBeInTheDocument();
    });

    it('affiche le temps d\'attente avec font-mono', () => {
      // Arrange
      const service = createTableService({ waitTime: 12 });

      // Act
      render(<TableCard service={service} />);

      // Assert - Le temps d'attente devrait utiliser font-mono
      const waitTime = screen.getByText('12min');
      expect(waitTime).toHaveClass('font-mono');
    });

    it('affiche le total formaté en euros', () => {
      // Arrange
      const service = createTableService({ total: 118.0 });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('118.00 €')).toBeInTheDocument();
    });

    it('affiche le total avec font-mono font-bold', () => {
      // Arrange
      const service = createTableService({ total: 118.0 });

      // Act
      render(<TableCard service={service} />);

      // Assert
      const total = screen.getByText('118.00 €');
      expect(total).toHaveClass('font-mono');
      expect(total).toHaveClass('font-bold');
    });

    it('affiche l\'icône schedule pour le temps d\'attente', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByText('schedule')).toBeInTheDocument();
    });
  });

  describe('Couleur du temps d\'attente', () => {
    it('applique text-error pour le temps d\'attente en retard', () => {
      // Arrange
      const service = createTableService({ status: 'retard', waitTime: 24 });

      // Act
      render(<TableCard service={service} />);

      // Assert - Le temps d'attente et l'icône devraient être en rouge
      const waitTime = screen.getByText('24min');
      expect(waitTime).toHaveClass('text-error');
    });

    it('applique text-error pour un temps d\'attente > 15min', () => {
      // Arrange
      const service = createTableService({ waitTime: 16 });

      // Act
      render(<TableCard service={service} />);

      // Assert
      const waitTime = screen.getByText('16min');
      expect(waitTime).toHaveClass('text-error');
    });
  });

  describe('Design system', () => {
    it('utilise bg-surface-container pour le fond', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('bg-surface-container');
    });

    it('utilise border-l-4 pour la bordure gauche', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('border-l-4');
    });

    it('utilise w-[350px] pour la largeur', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('w-[350px]');
    });

    it('utilise font-mono text-lg font-bold text-primary pour le numéro de commande', () => {
      // Arrange
      const service = createTableService({ orderId: 1402 });

      // Act
      render(<TableCard service={service} />);

      // Assert
      const orderId = screen.getByText('#1402');
      expect(orderId).toHaveClass('font-mono');
      expect(orderId).toHaveClass('text-lg');
      expect(orderId).toHaveClass('font-bold');
      expect(orderId).toHaveClass('text-primary');
    });

    it('utilise font-headline font-bold text-lg pour le nom de la table', () => {
      // Arrange
      const service = createTableService({ tableName: 'Table 08' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      const tableName = screen.getByText('Table 08');
      expect(tableName).toHaveClass('font-headline');
      expect(tableName).toHaveClass('font-bold');
      expect(tableName).toHaveClass('text-lg');
    });
  });

  describe('Classes personnalisées', () => {
    it('fusionne les classes personnalisées avec les classes de base', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} className="custom-class" />);

      // Assert
      const card = screen.getByRole('article');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-surface-container');
    });
  });

  describe('Accessibilité', () => {
    it('a un rôle article', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('a un aria-label descriptif', () => {
      // Arrange
      const service = createTableService({ orderId: 1402, tableName: 'Table 08' });

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article', { name: 'Commande 1402 - Table 08' })).toBeInTheDocument();
    });
  });

  describe('Structure HTML', () => {
    it('a une bordure border-outline-variant/10', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('border-outline-variant/10');
    });

    it('a un border-radius rounded-xl', () => {
      // Arrange
      const service = createTableService();

      // Act
      render(<TableCard service={service} />);

      // Assert
      expect(screen.getByRole('article')).toHaveClass('rounded-xl');
    });
  });
});

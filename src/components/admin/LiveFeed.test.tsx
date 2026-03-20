// src/components/admin/LiveFeed.test.tsx
// Tests unitaires pour le composant LiveFeed

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LiveFeed } from './LiveFeed';
import type { LiveEvent } from '../../hooks/useDashboardData';

// Données de test
const mockEvents: LiveEvent[] = [
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
  {
    id: 4,
    type: 'order',
    title: 'Nouvelle Commande - Table 8',
    amount: 67.00,
    timeAgo: 'Il y a 18 min',
    icon: 'receipt_long',
    color: 'text-primary',
  },
];

describe('LiveFeed', () => {
  describe('Rendu de base', () => {
    it('affiche le titre par défaut', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByText('Flux Live')).toBeInTheDocument();
    });

    it('affiche le titre personnalisé quand fourni', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} title="Activité Récente" />);

      // Assert
      expect(screen.getByText('Activité Récente')).toBeInTheDocument();
    });

    it('utilise le rôle region pour l\'accessibilité', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('affiche l\'icône realtime dans l\'en-tête', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByText('realtime')).toBeInTheDocument();
    });
  });

  describe('Affichage des événements', () => {
    it('affiche tous les événements fournis', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByText('Paiement Reçu - Table 14')).toBeInTheDocument();
      expect(screen.getByText('Commande Terminée - #842')).toBeInTheDocument();
      expect(screen.getByText('Annulation - Table 4')).toBeInTheDocument();
      expect(screen.getByText('Nouvelle Commande - Table 8')).toBeInTheDocument();
    });

    it('affiche les montants pour les événements de paiement', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByText('124.50 €')).toBeInTheDocument();
      expect(screen.getByText('67.00 €')).toBeInTheDocument();
    });

    it('n\'affiche pas de montant pour les événements sans amount', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      const cancellationEvent = screen.getByText('Annulation - Table 4').closest('div');
      expect(cancellationEvent?.textContent).not.toContain('€');
    });

    it('affiche le temps écoulé pour chaque événement', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByText('Il y a 2 min')).toBeInTheDocument();
      expect(screen.getByText('Il y a 5 min')).toBeInTheDocument();
      expect(screen.getByText('Il y a 12 min')).toBeInTheDocument();
      expect(screen.getByText('Il y a 18 min')).toBeInTheDocument();
    });

    it('affiche les icônes Material Symbols pour chaque événement', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByText('payments')).toBeInTheDocument();
      expect(screen.getByText('check_circle')).toBeInTheDocument();
      expect(screen.getByText('cancel')).toBeInTheDocument();
      expect(screen.getByText('receipt_long')).toBeInTheDocument();
    });
  });

  describe('Limite maxEvents', () => {
    it('limite le nombre d\'événements affichés à maxEvents', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} maxEvents={2} />);

      // Assert
      expect(screen.getByText('Paiement Reçu - Table 14')).toBeInTheDocument();
      expect(screen.getByText('Commande Terminée - #842')).toBeInTheDocument();
      expect(screen.queryByText('Annulation - Table 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Nouvelle Commande - Table 8')).not.toBeInTheDocument();
    });

    it('affiche tous les événements quand maxEvents n\'est pas spécifié', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getAllByRole('listitem').length).toBe(4);
    });
  });

  describe('Lien "Voir tout"', () => {
    it('affiche le lien "VOIR TOUT L\'HISTORIQUE"', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByText('VOIR TOUT L\'HISTORIQUE')).toBeInTheDocument();
    });

    it('affiche un texte personnalisé pour le lien', () => {
      // Arrange & Act
      render(
        <LiveFeed
          events={mockEvents}
          viewAllText="Voir l'historique complet"
        />
      );

      // Assert
      expect(screen.getByText('Voir l\'historique complet')).toBeInTheDocument();
    });

    it('appelle onViewAll quand le lien est cliqué', async () => {
      // Arrange
      const onViewAllMock = vi.fn();
      render(<LiveFeed events={mockEvents} onViewAll={onViewAllMock} />);

      // Act
      await userEvent.click(screen.getByText('VOIR TOUT L\'HISTORIQUE'));

      // Assert
      expect(onViewAllMock).toHaveBeenCalledTimes(1);
    });

    it('n\'affiche pas le lien quand il n\'y a pas d\'événements', () => {
      // Arrange & Act
      render(<LiveFeed events={[]} />);

      // Assert
      expect(screen.queryByText('VOIR TOUT L\'HISTORIQUE')).not.toBeInTheDocument();
    });
  });

  describe('État vide', () => {
    it('affiche un message quand il n\'y a pas d\'événements', () => {
      // Arrange & Act
      render(<LiveFeed events={[]} />);

      // Assert
      expect(screen.getByText('Aucun événement récent')).toBeInTheDocument();
    });

    it('affiche l\'icône notifications_none quand vide', () => {
      // Arrange & Act
      render(<LiveFeed events={[]} />);

      // Assert
      expect(screen.getByText('notifications_none')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('a un aria-label basé sur le titre', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByRole('region', { name: 'Flux Live' })).toBeInTheDocument();
    });

    it('a une liste avec role="list"', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByRole('list', { name: 'Événements récents' })).toBeInTheDocument();
    });

    it('a des items avec role="listitem"', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(4);
    });

    it('a des aria-label sur chaque événement', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(
        screen.getByRole('listitem', { name: 'Paiement Reçu - Table 14' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('listitem', { name: 'Commande Terminée - #842' })
      ).toBeInTheDocument();
    });

    it('a un bouton "Voir tout" avec aria-label', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      const viewAllButton = screen.getByText('VOIR TOUT L\'HISTORIQUE').closest('button');
      expect(viewAllButton).toHaveAttribute(
        'aria-label',
        'Voir tout l\'historique des événements'
      );
    });
  });

  describe('Classes personnalisées', () => {
    it('fusionne les classes personnalisées avec les classes de base', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} className="custom-class" />);

      // Assert
      const container = screen.getByRole('region');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveClass('bg-surface-container');
      expect(container).toHaveClass('p-6');
    });
  });

  describe('Design system', () => {
    it('utilise bg-surface-container pour le fond', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      expect(screen.getByRole('region')).toHaveClass('bg-surface-container');
    });

    it('utilise font-headline text-lg pour le titre', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      const title = screen.getByText('Flux Live');
      expect(title).toHaveClass('font-headline');
      expect(title).toHaveClass('text-lg');
    });

    it('utilise font-label text-sm pour les titres d\'événements', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      const eventTitle = screen.getByText('Paiement Reçu - Table 14');
      expect(eventTitle).toHaveClass('font-label');
      expect(eventTitle).toHaveClass('text-sm');
    });

    it('utilise font-headline pour les montants', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      const amount = screen.getByText('124.50 €');
      expect(amount).toHaveClass('font-headline');
    });

    it('utilise font-label text-xs pour le temps écoulé', () => {
      // Arrange & Act
      render(<LiveFeed events={mockEvents} />);

      // Assert
      const timeAgo = screen.getByText('Il y a 2 min');
      expect(timeAgo).toHaveClass('font-label');
      expect(timeAgo).toHaveClass('text-xs');
    });
  });

  describe('Types d\'événements', () => {
    it('affiche les événements de type payment avec l\'icône payments', () => {
      // Arrange
      const paymentEvent: LiveEvent[] = [
        {
          id: 1,
          type: 'payment',
          title: 'Paiement',
          amount: 100,
          timeAgo: 'Il y a 1 min',
          icon: 'payments',
          color: 'text-tertiary',
        },
      ];

      // Act
      render(<LiveFeed events={paymentEvent} />);

      // Assert
      expect(screen.getByText('payments')).toBeInTheDocument();
    });

    it('affiche les événements de type order avec l\'icône appropriée', () => {
      // Arrange
      const orderEvent: LiveEvent[] = [
        {
          id: 1,
          type: 'order',
          title: 'Commande',
          timeAgo: 'Il y a 1 min',
          icon: 'check_circle',
          color: 'text-tertiary',
        },
      ];

      // Act
      render(<LiveFeed events={orderEvent} />);

      // Assert
      expect(screen.getByText('check_circle')).toBeInTheDocument();
    });

    it('affiche les événements de type cancellation avec l\'icône cancel', () => {
      // Arrange
      const cancellationEvent: LiveEvent[] = [
        {
          id: 1,
          type: 'cancellation',
          title: 'Annulation',
          timeAgo: 'Il y a 1 min',
          icon: 'cancel',
          color: 'text-error',
        },
      ];

      // Act
      render(<LiveFeed events={cancellationEvent} />);

      // Assert
      expect(screen.getByText('cancel')).toBeInTheDocument();
    });
  });
});

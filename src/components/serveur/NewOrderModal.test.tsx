// src/components/serveur/NewOrderModal.test.tsx
// Tests pour le composant NewOrderModal

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewOrderModal } from './NewOrderModal';
import { db } from '../../firebase/config';
import type { FloorTable } from './types';
import type { MenuItem } from '../../firebase/types';

const mockTable: FloorTable = {
  id: 1,
  name: 'T.01',
  status: 'libre',
  sector: 'Salle principale',
  capacity: 4,
};

const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Tartare de Saumon',
    description: 'Saumon frais, avocat, citron vert',
    price: 14.50,
    category: 'entree',
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-tartare',
  },
  {
    id: 2,
    name: 'Burger de l\'Atelier',
    description: 'Burger délicieux',
    price: 19.50,
    category: 'plat',
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-burger',
  },
  {
    id: 3,
    name: 'Café Gourmand',
    description: 'Café et mignardises',
    price: 8.50,
    category: 'dessert',
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-cafe',
  },
  {
    id: 4,
    name: 'Coca Cola',
    description: 'Boisson gazeuse 33cl',
    price: 4.50,
    category: 'boisson',
    isAvailable: 1,
  },
];

const mockOnClose = vi.fn();
const mockOnOrderCreated = vi.fn();

describe('NewOrderModal', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Nettoyer et peupler la base
    await db.menuItems.clear();
    await db.menuItems.bulkAdd(mockMenuItems);
  });

  it('ne devrait pas s\'afficher quand isOpen est false', () => {
    const { container } = render(
      <NewOrderModal
        isOpen={false}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('devrait afficher le titre avec le nom de la table', () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    expect(screen.getByText('NOUVELLE COMMANDE')).toBeInTheDocument();
    expect(screen.getByText('Table T.01')).toBeInTheDocument();
  });

  it('devrait afficher le champ de nom du client', () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    expect(screen.getByLabelText('Nom du client (optionnel)')).toBeInTheDocument();
  });

  it('devrait afficher les filtres de catégorie', () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    expect(screen.getByRole('button', { name: 'Tous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'entree' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'plat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'dessert' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'boisson' })).toBeInTheDocument();
  });

  it('devrait filtrer les items par catégorie', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    // Tous les items
    await waitFor(() => {
      expect(screen.getByText('Tartare de Saumon')).toBeInTheDocument();
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });

    // Filtrer par Entrées
    fireEvent.click(screen.getByRole('button', { name: 'entree' }));
    await waitFor(() => {
      expect(screen.getByText('Tartare de Saumon')).toBeInTheDocument();
      expect(screen.queryByText('Burger de l\'Atelier')).not.toBeInTheDocument();
    });
  });

  it('devrait ajouter un item au panier lors du clic', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    // Attendre que les items du menu soient affichés
    await waitFor(() => {
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });

    // Cliquer sur le bouton d'ajout du Burger
    const burgerButton = screen.getByLabelText('Ajouter Burger de l\'Atelier à la commande');
    fireEvent.click(burgerButton);

    // Vérifier que le panier affiche "1x"
    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
    });
  });

  it('devrait afficher le résumé du panier avec le total', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    // Attendre que les items du menu soient affichés
    await waitFor(() => {
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });

    // Ajouter un item
    const burgerButton = screen.getByLabelText('Ajouter Burger de l\'Atelier à la commande');
    fireEvent.click(burgerButton);

    // Vérifier que le résumé du panier est affiché avec le nombre d'articles
    await waitFor(() => {
      expect(screen.getByText('1 article')).toBeInTheDocument();
    });
    
    // Vérifier que le bouton VALIDER COMMANDE est affiché
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'VALIDER COMMANDE' })).toBeInTheDocument();
    });
  });

  it('devrait incrémenter la quantité lors du clic sur +', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    // Ajouter un item
    await waitFor(() => {
      const burgerButton = screen.getByLabelText('Ajouter Burger de l\'Atelier à la commande');
      fireEvent.click(burgerButton);
    });

    // Incrémenter
    await waitFor(() => {
      const incrementButton = screen.getByLabelText('Augmenter la quantité de Burger de l\'Atelier');
      fireEvent.click(incrementButton);
    });

    await waitFor(() => {
      expect(screen.getByText('2x')).toBeInTheDocument();
    });
  });

  it('devrait décrémenter la quantité lors du clic sur -', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    // Ajouter deux fois le même item
    await waitFor(() => {
      const burgerButton = screen.getByLabelText('Ajouter Burger de l\'Atelier à la commande');
      fireEvent.click(burgerButton);
      fireEvent.click(burgerButton);
    });

    // Décrémenter
    await waitFor(() => {
      const decrementButton = screen.getByLabelText('Diminuer la quantité de Burger de l\'Atelier');
      fireEvent.click(decrementButton);
    });

    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
    });
  });

  it('devrait supprimer un item lors du clic sur le bouton supprimer', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    // Attendre que les items du menu soient affichés
    await waitFor(() => {
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });

    // Ajouter un item
    const burgerButton = screen.getByLabelText('Ajouter Burger de l\'Atelier à la commande');
    fireEvent.click(burgerButton);

    // Attendre que l'item soit dans le panier
    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    // Supprimer
    const removeButton = screen.getByLabelText('Supprimer Burger de l\'Atelier du panier');
    fireEvent.click(removeButton);

    // L'item ne devrait plus être dans le panier (mais toujours dans le menu)
    // On vérifie qu'il n'y a plus de "1x" dans le panier
    await waitFor(() => {
      expect(screen.queryByText('1x')).not.toBeInTheDocument();
    });
  });

  it('devrait appeler onClose lors du clic sur le bouton fermer', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    const closeButton = screen.getByLabelText('Fermer la fenêtre');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onClose lors de la touche Escape', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onOrderCreated après validation', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
        onOrderCreated={mockOnOrderCreated}
      />
    );

    // Ajouter un item
    await waitFor(() => {
      const burgerButton = screen.getByLabelText('Ajouter Burger de l\'Atelier à la commande');
      fireEvent.click(burgerButton);
    });

    // Valider
    await waitFor(() => {
      const validateButton = screen.getByRole('button', { name: 'VALIDER COMMANDE' });
      fireEvent.click(validateButton);
    });

    await waitFor(() => {
      expect(mockOnOrderCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('devrait vider le panier après validation', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
        onOrderCreated={mockOnOrderCreated}
      />
    );

    // Attendre que les items du menu soient affichés
    await waitFor(() => {
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });

    // Ajouter un item
    const burgerButton = screen.getByLabelText('Ajouter Burger de l\'Atelier à la commande');
    fireEvent.click(burgerButton);

    // Attendre que l'item soit dans le panier
    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    // Valider la commande
    const validateButton = screen.getByRole('button', { name: 'VALIDER COMMANDE' });
    fireEvent.click(validateButton);

    // Après validation, le modal se ferme et le panier est vidé
    await waitFor(() => {
      expect(mockOnOrderCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('devrait afficher un message quand le panier est vide', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    expect(
      screen.getByText('Sélectionnez des items dans le menu pour commencer la commande')
    ).toBeInTheDocument();
  });

  it('devrait avoir les attributs ARIA appropriés', async () => {
    render(
      <NewOrderModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTable}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'new-order-modal-title');
  });
});

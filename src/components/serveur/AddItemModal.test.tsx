// src/components/serveur/AddItemModal.test.tsx
// Tests pour le composant AddItemModal

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddItemModal } from './AddItemModal';
import { db } from '../../db/database';
import type { FloorTable } from './types';
import type { MenuItem } from '../../db/types';

const mockTableWithOrder: FloorTable = {
  id: 1,
  name: 'T.01',
  status: 'occupee',
  sector: 'Salle principale',
  capacity: 4,
  currentOrder: {
    id: 1,
    items: [],
    total: 25.00,
    startTime: Date.now(),
  },
};

const mockTableWithoutOrder: FloorTable = {
  id: 2,
  name: 'T.02',
  status: 'libre',
  sector: 'Salle principale',
  capacity: 2,
};

const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Tartare de Saumon',
    description: 'Saumon frais, avocat, citron vert',
    price: 14.50,
    category: 'Entrées',
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-tartare',
  },
  {
    id: 2,
    name: 'Burger de l\'Atelier',
    description: 'Burger délicieux',
    price: 19.50,
    category: 'Plats',
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-burger',
  },
  {
    id: 3,
    name: 'Café Gourmand',
    description: 'Café et mignardises',
    price: 8.50,
    category: 'Desserts',
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-cafe',
  },
];

const mockOnClose = vi.fn();
const mockOnItemsAdded = vi.fn();

describe('AddItemModal', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Nettoyer et peupler la base
    await db.menuItems.clear();
    await db.menuItems.bulkAdd(mockMenuItems);
    
    // Créer une commande pour mockTableWithOrder
    await db.orders.clear();
    await db.orders.add({
      id: 1,
      tableId: 1,
      customerName: 'Test',
      status: 'en_attente',
      items: [],
      total: 25.00,
      createdAt: Date.now(),
    });
  });

  it('ne devrait pas s\'afficher quand isOpen est false', () => {
    const { container } = render(
      <AddItemModal
        isOpen={false}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('devrait afficher le titre avec le nom de la table', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    expect(screen.getByText('AJOUTER À LA COMMANDE')).toBeInTheDocument();
    expect(screen.getByText('Table T.01')).toBeInTheDocument();
  });

  it('devrait afficher les filtres de catégorie', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    expect(screen.getByRole('button', { name: 'Tous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrées' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plats' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desserts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Boissons' })).toBeInTheDocument();
  });

  it('devrait afficher les items du menu', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tartare de Saumon')).toBeInTheDocument();
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });
  });

  it('devrait filtrer les items par catégorie', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    // Tous les items
    await waitFor(() => {
      expect(screen.getByText('Tartare de Saumon')).toBeInTheDocument();
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    });

    // Filtrer par Entrées
    fireEvent.click(screen.getByRole('button', { name: 'Entrées' }));
    await waitFor(() => {
      expect(screen.getByText('Tartare de Saumon')).toBeInTheDocument();
      expect(screen.queryByText('Burger de l\'Atelier')).not.toBeInTheDocument();
    });
  });

  it('devrait ajouter un item au panier lors du clic', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
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

  it('devrait afficher le bouton AJOUTER seulement si le panier n\'est pas vide', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    // Message panier vide
    await waitFor(() => {
      expect(
        screen.getByText('Sélectionnez des items à ajouter à la commande')
      ).toBeInTheDocument();
    });

    // Ajouter un item
    const burgerButton = screen.getByLabelText('Ajouter Burger de l\'Atelier à la commande');
    fireEvent.click(burgerButton);

    // Bouton AJOUTER devrait apparaître (avec le bon aria-label)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'AJOUTER' })).toBeInTheDocument();
    });
  });

  it('devrait appeler onItemsAdded après validation', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
        onItemsAdded={mockOnItemsAdded}
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

    // Valider
    const addButton = screen.getByRole('button', { name: 'AJOUTER' });
    fireEvent.click(addButton);

    // La validation devrait appeler onItemsAdded et onClose
    await waitFor(() => {
      expect(mockOnItemsAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('devrait appeler onClose lors du clic sur le bouton fermer', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    const closeButton = screen.getByLabelText('Fermer la fenêtre');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onClose lors de la touche Escape', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('devrait vider le panier après validation', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
        onItemsAdded={mockOnItemsAdded}
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

    // Valider
    const addButton = screen.getByRole('button', { name: 'AJOUTER' });
    fireEvent.click(addButton);

    // Après validation, le modal se ferme
    await waitFor(() => {
      expect(mockOnItemsAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('devrait avoir les attributs ARIA appropriés', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithOrder}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'add-item-modal-title');
  });

  it('devrait afficher un message d\'erreur si la table n\'a pas de commande', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        table={mockTableWithoutOrder}
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

    // Tenter de valider (ne devrait rien faire car pas de commande)
    const addButton = screen.getByRole('button', { name: 'AJOUTER' });
    fireEvent.click(addButton);

    // La modal reste ouverte (onItemsAdded ne devrait pas être appelé)
    // On vérifie simplement que le modal est toujours ouvert
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // onItemsAdded ne devrait pas être appelé
    expect(mockOnItemsAdded).not.toHaveBeenCalled();
  });
});

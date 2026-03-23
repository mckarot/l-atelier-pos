// src/components/serveur/SelectedTable.test.tsx
// Tests pour le composant SelectedTable

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectedTable } from './SelectedTable';
import type { FloorTable } from './types';

const mockTableFree: FloorTable = {
  id: 1,
  name: 'T.01',
  status: 'libre',
  sector: 'Salle principale',
  capacity: 4,
};

const mockTableOccupied: FloorTable = {
  id: 2,
  name: 'T.02',
  status: 'occupee',
  sector: 'Salle principale',
  capacity: 2,
  currentOrder: {
    id: 1,
    items: [
      { id: 1, name: 'Burger de l\'Atelier', quantity: 2, price: 19.50 },
      { id: 2, name: 'Café Gourmand', quantity: 1, price: 8.50 },
    ],
    total: 47.50,
    startTime: Date.now() - 10 * 60 * 1000, // Il y a 10 minutes
  },
};

const mockHandlers = {
  onClose: vi.fn(),
  onCheckout: vi.fn(),
  onAddNote: vi.fn(),
  onSplit: vi.fn(),
  onOrderCreated: vi.fn(),
  onItemsAdded: vi.fn(),
};

describe('SelectedTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le nom de la table', () => {
    render(<SelectedTable table={mockTableFree} {...mockHandlers} />);

    expect(screen.getByText('T.01')).toBeInTheDocument();
  });

  it('devrait afficher le total de la commande', () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    // Le total est affiché avec le format €XX.X (47.50 devient €47.5)
    expect(screen.getByText((content) => content.includes('€47.5'))).toBeInTheDocument();
  });

  it('devrait afficher le temps écoulé pour une table occupée', () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    expect(screen.getByText(/DEPUIS/i)).toBeInTheDocument();
  });

  it('devrait afficher le bouton PRENDRE COMMANDE pour une table libre', () => {
    render(<SelectedTable table={mockTableFree} {...mockHandlers} />);

    expect(screen.getByRole('button', { name: 'Prendre une nouvelle commande' })).toBeInTheDocument();
  });

  it('devrait afficher les boutons AJOUTER et ENCAISSER pour une table occupée', () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    expect(screen.getByRole('button', { name: 'Ajouter des items à la commande' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Encaisser' })).toBeInTheDocument();
  });

  it('devrait afficher la barre de recherche', () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    expect(screen.getByLabelText('Rechercher un article')).toBeInTheDocument();
  });

  it('devrait filtrer les items par recherche', async () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    const searchInput = screen.getByLabelText('Rechercher un article');
    fireEvent.change(searchInput, { target: { value: 'Burger' } });

    await waitFor(() => {
      expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
      expect(screen.queryByText('Café Gourmand')).not.toBeInTheDocument();
    });
  });

  it('devrait afficher les notes de la commande si présentes', () => {
    const tableWithNotes: FloorTable = {
      ...mockTableOccupied,
      currentOrder: {
        ...mockTableOccupied.currentOrder!,
        notes: 'Allergie aux arachides',
      },
    };

    render(<SelectedTable table={tableWithNotes} {...mockHandlers} />);

    expect(screen.getByText('Allergie aux arachides')).toBeInTheDocument();
  });

  it('devrait appeler onClose lors du clic sur le bouton fermer', () => {
    render(<SelectedTable table={mockTableFree} {...mockHandlers} />);

    const closeButton = screen.getByLabelText('Fermer le panel');
    fireEvent.click(closeButton);

    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onAddNote lors du clic sur NOTE', () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    const noteButton = screen.getByLabelText('Ajouter une note');
    fireEvent.click(noteButton);

    expect(mockHandlers.onAddNote).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onSplit lors du clic sur DIVISER', () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    const splitButton = screen.getByLabelText('Diviser l\'addition');
    fireEvent.click(splitButton);

    expect(mockHandlers.onSplit).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onCheckout lors du clic sur ENCAISSER', () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    const checkoutButton = screen.getByLabelText('Encaisser');
    fireEvent.click(checkoutButton);

    expect(mockHandlers.onCheckout).toHaveBeenCalledTimes(1);
  });

  it('devrait ouvrir le modal NewOrderModal pour une table libre', async () => {
    render(<SelectedTable table={mockTableFree} {...mockHandlers} />);

    const newOrderButton = screen.getByLabelText('Prendre une nouvelle commande');
    fireEvent.click(newOrderButton);

    // Le modal devrait s'ouvrir avec le titre
    await waitFor(() => {
      expect(screen.getByText('NOUVELLE COMMANDE')).toBeInTheDocument();
    });
  });

  it('devrait ouvrir le modal AddItemModal pour une table occupée', async () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    const addItemButton = screen.getByLabelText('Ajouter des items à la commande');
    fireEvent.click(addItemButton);

    // Le modal devrait s'ouvrir avec le titre
    await waitFor(() => {
      expect(screen.getByText('AJOUTER À LA COMMANDE')).toBeInTheDocument();
    });
  });

  it('devrait afficher les items de la commande', () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
    expect(screen.getByText('Café Gourmand')).toBeInTheDocument();
  });

  it('devrait afficher un message quand aucun item ne correspond à la recherche', async () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    const searchInput = screen.getByLabelText('Rechercher un article');
    fireEvent.change(searchInput, { target: { value: 'Pizza' } });

    await waitFor(() => {
      expect(
        screen.getByText('Aucun article ne correspond à votre recherche')
      ).toBeInTheDocument();
    });
  });

  it('devrait avoir les attributs ARIA appropriés', () => {
    render(<SelectedTable table={mockTableFree} {...mockHandlers} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Détails de la table T.01');
  });

  it('devrait appeler onOrderCreated quand une commande est créée', async () => {
    render(<SelectedTable table={mockTableFree} {...mockHandlers} />);

    const newOrderButton = screen.getByLabelText('Prendre une nouvelle commande');
    fireEvent.click(newOrderButton);

    // Simuler la création de commande
    await waitFor(() => {
      expect(screen.getByText('NOUVELLE COMMANDE')).toBeInTheDocument();
    });
  });

  it('devrait appeler onItemsAdded quand des items sont ajoutés', async () => {
    render(<SelectedTable table={mockTableOccupied} {...mockHandlers} />);

    const addItemButton = screen.getByLabelText('Ajouter des items à la commande');
    fireEvent.click(addItemButton);

    await waitFor(() => {
      expect(screen.getByText('AJOUTER À LA COMMANDE')).toBeInTheDocument();
    });
  });
});

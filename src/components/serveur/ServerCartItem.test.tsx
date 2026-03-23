// src/components/serveur/ServerCartItem.test.tsx
// Tests pour le composant ServerCartItem

import { render, screen, fireEvent } from '@testing-library/react';
import { ServerCartItem } from './ServerCartItem';
import type { ServerCartItem as ServerCartItemData } from '../../hooks/useServerCart';

const mockItem: ServerCartItemData = {
  menuItemId: 1,
  name: 'Burger de l\'Atelier',
  price: 19.50,
  quantity: 2,
};

const mockItemWithSupplements: ServerCartItemData = {
  menuItemId: 1,
  name: 'Burger de l\'Atelier',
  price: 19.50,
  quantity: 2,
  supplements: [
    { name: 'Double Fromage', price: 2.50 },
    { name: 'Bacon', price: 3.00 },
  ],
};

const mockItemWithNotes: ServerCartItemData = {
  menuItemId: 1,
  name: 'Burger de l\'Atelier',
  price: 19.50,
  quantity: 2,
  notes: 'Sans oignons',
};

const mockHandlers = {
  onIncrement: vi.fn(),
  onDecrement: vi.fn(),
  onRemove: vi.fn(),
};

describe('ServerCartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le nom et la quantité de l\'item', () => {
    render(<ServerCartItem item={mockItem} {...mockHandlers} />);

    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('Burger de l\'Atelier')).toBeInTheDocument();
  });

  it('devrait afficher le prix total de l\'item', () => {
    render(<ServerCartItem item={mockItem} {...mockHandlers} />);

    // 19.50 * 2 = 39.00
    expect(screen.getByText('€39.')).toBeInTheDocument();
  });

  it('devrait afficher les supplements', () => {
    render(<ServerCartItem item={mockItemWithSupplements} {...mockHandlers} />);

    expect(screen.getByText('+ Double Fromage (+€2.50)')).toBeInTheDocument();
    expect(screen.getByText('+ Bacon (+€3.00)')).toBeInTheDocument();
  });

  it('devrait afficher les notes', () => {
    render(<ServerCartItem item={mockItemWithNotes} {...mockHandlers} />);

    expect(screen.getByText(/Note: Sans oignons/i)).toBeInTheDocument();
  });

  it('devrait appeler onIncrement lors du clic sur le bouton +', () => {
    render(<ServerCartItem item={mockItem} {...mockHandlers} />);

    const incrementButton = screen.getByLabelText('Augmenter la quantité de Burger de l\'Atelier');
    fireEvent.click(incrementButton);

    expect(mockHandlers.onIncrement).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onDecrement lors du clic sur le bouton -', () => {
    render(<ServerCartItem item={mockItem} {...mockHandlers} />);

    const decrementButton = screen.getByLabelText('Diminuer la quantité de Burger de l\'Atelier');
    fireEvent.click(decrementButton);

    expect(mockHandlers.onDecrement).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onRemove lors du clic sur le bouton supprimer', () => {
    render(<ServerCartItem item={mockItem} {...mockHandlers} />);

    const removeButton = screen.getByLabelText('Supprimer Burger de l\'Atelier du panier');
    fireEvent.click(removeButton);

    expect(mockHandlers.onRemove).toHaveBeenCalledTimes(1);
  });

  it('devrait calculer correctement le prix avec supplements', () => {
    render(<ServerCartItem item={mockItemWithSupplements} {...mockHandlers} />);

    // (19.50 + 2.50 + 3.00) * 2 = 50.00
    expect(screen.getByText('€50.')).toBeInTheDocument();
  });

  it('devrait avoir les attributs ARIA appropriés', () => {
    render(<ServerCartItem item={mockItem} {...mockHandlers} />);

    const incrementButton = screen.getByLabelText('Augmenter la quantité de Burger de l\'Atelier');
    const decrementButton = screen.getByLabelText('Diminuer la quantité de Burger de l\'Atelier');
    const removeButton = screen.getByLabelText('Supprimer Burger de l\'Atelier du panier');

    expect(incrementButton).toHaveAttribute('aria-label');
    expect(decrementButton).toHaveAttribute('aria-label');
    expect(removeButton).toHaveAttribute('aria-label');
  });

  it('devrait avoir les classes CSS appropriées pour le design system', () => {
    render(<ServerCartItem item={mockItem} {...mockHandlers} />);

    const incrementButton = screen.getByLabelText('Augmenter la quantité de Burger de l\'Atelier');
    expect(incrementButton).toHaveClass('bg-primary-container');
    expect(incrementButton).toHaveClass('text-on-primary-container');
  });
});

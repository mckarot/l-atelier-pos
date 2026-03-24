// src/components/admin/MenuItemRow.test.tsx
// Tests unitaires pour le composant MenuItemRow

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuItemRow } from './MenuItemRow';
import type { MenuItem } from '../../firebase/types';

const mockItem: MenuItem = {
  id: 1,
  name: 'Test Item',
  description: 'Test Description',
  price: 15.50,
  category: 'plat',
  isAvailable: 1,
  station: 'GRILL',
  allergens: ['gluten'],
  image: 'https://example.com/image.jpg',
};

describe('MenuItemRow', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleAvailability = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('should render item information', () => {
    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('15.50€')).toBeInTheDocument();
    expect(screen.getByText('plat')).toBeInTheDocument();
    expect(screen.getByText('GRILL')).toBeInTheDocument();
  });

  it('should display availability badge when available', () => {
    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    expect(screen.getByText('Dispo')).toBeInTheDocument();
  });

  it('should display unavailable badge when not available', () => {
    const unavailableItem = { ...mockItem, isAvailable: 0 as 0 | 1 };

    render(
      <MenuItemRow
        item={unavailableItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    expect(screen.getByText('Indisponible')).toBeInTheDocument();
  });

  it('should display allergens', () => {
    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    expect(screen.getByText(/Allergènes: gluten/)).toBeInTheDocument();
  });

  it('should call onToggleAvailability when toggle is clicked', () => {
    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    expect(mockOnToggleAvailability).toHaveBeenCalledWith(1, true);
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    const editButton = screen.getByLabelText(`Modifier ${mockItem.name}`);
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockItem);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    const deleteButton = screen.getByLabelText(`Supprimer ${mockItem.name}`);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('should ask for confirmation before delete', () => {
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    const deleteButton = screen.getByLabelText(`Supprimer ${mockItem.name}`);
    fireEvent.click(deleteButton);

    expect(confirmMock).toHaveBeenCalledWith(`Êtes-vous sûr de vouloir supprimer "${mockItem.name}" ?`);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should not call onDelete if confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    const deleteButton = screen.getByLabelText(`Supprimer ${mockItem.name}`);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should display item image when available', () => {
    render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    const image = screen.getByAltText(mockItem.name);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockItem.image);
  });

  it('should display placeholder icon when no image', () => {
    const itemWithoutImage = { ...mockItem, image: undefined };

    render(
      <MenuItemRow
        item={itemWithoutImage}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    expect(screen.getByText('restaurant')).toBeInTheDocument();
  });

  it('should have reduced opacity when unavailable', () => {
    const unavailableItem = { ...mockItem, isAvailable: 0 as 0 | 1 };

    const { container } = render(
      <MenuItemRow
        item={unavailableItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    expect(container.firstChild).toHaveClass('opacity-60');
  });

  it('should have correct role attribute', () => {
    const { container } = render(
      <MenuItemRow
        item={mockItem}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleAvailability={mockOnToggleAvailability}
      />
    );

    expect(container.firstChild).toHaveAttribute('role', 'row');
  });
});

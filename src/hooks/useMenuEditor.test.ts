// src/hooks/useMenuEditor.test.ts
// Tests unitaires pour le hook useMenuEditor

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { db } from '../db/database';
import { useMenuEditor } from './useMenuEditor';
import type { MenuItem } from '../db/types';

// Mock Dexie
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

describe('useMenuEditor', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.menuItems.clear();
  });

  it('should initialize with empty menu items', async () => {
    const { result } = renderHook(() => useMenuEditor());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.menuItems).toEqual([]);
  });

  it('should add a new menu item', async () => {
    const { result } = renderHook(() => useMenuEditor());

    await act(async () => {
      await result.current.addItem({
        name: 'Test Item',
        description: 'Test Description',
        price: 15.50,
        category: 'plat',
        isAvailable: 1,
        station: 'GRILL',
      });
    });

    await waitFor(() => {
      expect(result.current.menuItems).toHaveLength(1);
    });

    const item = result.current.menuItems?.[0];
    expect(item).toBeDefined();
    expect(item?.name).toBe('Test Item');
    expect(item?.price).toBe(15.50);
    expect(item?.category).toBe('plat');
  });

  it('should validate name is required', async () => {
    const { result } = renderHook(() => useMenuEditor());

    await expect(
      result.current.addItem({
        name: '',
        description: 'Test',
        price: 10,
        category: 'plat',
        isAvailable: 1,
      })
    ).rejects.toThrow('Le nom est obligatoire');
  });

  it('should validate price is greater than 0', async () => {
    const { result } = renderHook(() => useMenuEditor());

    await expect(
      result.current.addItem({
        name: 'Test',
        description: 'Test',
        price: 0,
        category: 'plat',
        isAvailable: 1,
      })
    ).rejects.toThrow('Le prix doit être supérieur à 0');

    await expect(
      result.current.addItem({
        name: 'Test',
        description: 'Test',
        price: -5,
        category: 'plat',
        isAvailable: 1,
      })
    ).rejects.toThrow('Le prix doit être supérieur à 0');
  });

  it('should update an existing menu item', async () => {
    const { result } = renderHook(() => useMenuEditor());

    // Add item first
    await act(async () => {
      await result.current.addItem({
        name: 'Original Item',
        description: 'Original Description',
        price: 10,
        category: 'entree',
        isAvailable: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.menuItems).toHaveLength(1);
    });

    const item = result.current.menuItems?.[0];
    expect(item).toBeDefined();

    // Update item
    await act(async () => {
      if (item) {
        await result.current.updateItem(item.id, {
          name: 'Updated Item',
          price: 20,
        });
      }
    });

    await waitFor(() => {
      expect(result.current.menuItems?.[0]?.name).toBe('Updated Item');
      expect(result.current.menuItems?.[0]?.price).toBe(20);
    });
  });

  it('should delete a menu item', async () => {
    const { result } = renderHook(() => useMenuEditor());

    // Add item first
    await act(async () => {
      await result.current.addItem({
        name: 'To Delete',
        description: 'Will be deleted',
        price: 10,
        category: 'dessert',
        isAvailable: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.menuItems).toHaveLength(1);
    });

    const item = result.current.menuItems?.[0];
    expect(item).toBeDefined();

    // Delete item
    if (item) {
      await act(async () => {
        await result.current.deleteItem(item.id);
      });
    }

    await waitFor(() => {
      expect(result.current.menuItems).toHaveLength(0);
    });
  });

  it('should toggle availability', async () => {
    const { result } = renderHook(() => useMenuEditor());

    // Add item first
    await act(async () => {
      await result.current.addItem({
        name: 'Toggle Item',
        description: 'Test',
        price: 10,
        category: 'plat',
        isAvailable: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.menuItems).toHaveLength(1);
    });

    const item = result.current.menuItems?.[0];
    expect(item?.isAvailable).toBe(1);

    // Toggle to unavailable
    if (item) {
      await act(async () => {
        await result.current.toggleAvailability(item.id, false);
      });
    }

    await waitFor(() => {
      expect(result.current.menuItems?.[0]?.isAvailable).toBe(0);
    });

    // Toggle back to available
    if (item) {
      await act(async () => {
        await result.current.toggleAvailability(item.id, true);
      });
    }

    await waitFor(() => {
      expect(result.current.menuItems?.[0]?.isAvailable).toBe(1);
    });
  });

  it('should open and close modal', () => {
    const { result } = renderHook(() => useMenuEditor());

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.editingItem).toBeNull();

    act(() => {
      result.current.openAddModal();
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.editingItem).toBeNull();

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isModalOpen).toBe(false);
  });

  it('should open edit modal with item', async () => {
    const { result } = renderHook(() => useMenuEditor());

    // Add item first
    await act(async () => {
      await result.current.addItem({
        name: 'Edit Test',
        description: 'Test',
        price: 10,
        category: 'plat',
        isAvailable: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.menuItems).toHaveLength(1);
    });

    const item = result.current.menuItems?.[0];
    expect(item).toBeDefined();

    // Open edit modal
    if (item) {
      act(() => {
        result.current.openEditModal(item);
      });
    }

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.editingItem).toEqual(item);
  });

  it('should group items by category', async () => {
    const { result } = renderHook(() => useMenuEditor());

    // Add items in different categories
    await act(async () => {
      await result.current.addItem({
        name: 'Entrée Item',
        description: 'Test',
        price: 10,
        category: 'entree',
        isAvailable: 1,
      });
      await result.current.addItem({
        name: 'Plat Item',
        description: 'Test',
        price: 20,
        category: 'plat',
        isAvailable: 1,
      });
      await result.current.addItem({
        name: 'Dessert Item',
        description: 'Test',
        price: 8,
        category: 'dessert',
        isAvailable: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.menuItems).toHaveLength(3);
    });

    const items = result.current.menuItems;
    const entrees = items?.filter((i) => i.category === 'entree');
    const plats = items?.filter((i) => i.category === 'plat');
    const desserts = items?.filter((i) => i.category === 'dessert');

    expect(entrees).toHaveLength(1);
    expect(plats).toHaveLength(1);
    expect(desserts).toHaveLength(1);
  });
});

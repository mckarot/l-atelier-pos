// src/hooks/useSyncStatus.test.ts
// Tests unitaires pour le hook useSyncStatus

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSyncStatus } from './useSyncStatus';

// Mock navigator.onLine
const mockOnLine = vi.spyOn(navigator, 'onLine', 'get');

// Mock window.addEventListener
const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

describe('useSyncStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnLine.mockReturnValue(true);
  });

  it('should initialize with connected status when online', () => {
    mockOnLine.mockReturnValue(true);

    const { result } = renderHook(() => useSyncStatus());

    expect(result.current.status).toBe('connected');
    expect(result.current.isOnline).toBe(true);
  });

  it('should initialize with disconnected status when offline', () => {
    mockOnLine.mockReturnValue(false);

    const { result } = renderHook(() => useSyncStatus());

    expect(result.current.status).toBe('disconnected');
    expect(result.current.isOnline).toBe(false);
  });

  it('should have lastSync date on initialization', () => {
    const { result } = renderHook(() => useSyncStatus());

    expect(result.current.lastSync).toBeInstanceOf(Date);
  });

  it('should update status when going offline', () => {
    const { result } = renderHook(() => useSyncStatus());

    // Simulate offline event
    mockOnLine.mockReturnValue(false);
    const offlineHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'offline'
    )?.[1] as EventListener;

    if (offlineHandler) {
      offlineHandler(new Event('offline'));
    }

    expect(result.current.status).toBe('disconnected');
    expect(result.current.isOnline).toBe(false);
  });

  it('should update status when going online', () => {
    mockOnLine.mockReturnValue(false);
    const { result } = renderHook(() => useSyncStatus());

    // Simulate online event
    mockOnLine.mockReturnValue(true);
    const onlineHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'online'
    )?.[1] as EventListener;

    if (onlineHandler) {
      onlineHandler(new Event('online'));
    }

    expect(result.current.status).toBe('connected');
    expect(result.current.isOnline).toBe(true);
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useSyncStatus());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should return lastMutationAt same as lastSync', () => {
    const { result } = renderHook(() => useSyncStatus());

    expect(result.current.lastMutationAt).toEqual(result.current.lastSync);
  });

  it('should handle multiple online/offline transitions', () => {
    const { result } = renderHook(() => useSyncStatus());

    // Go offline
    mockOnLine.mockReturnValue(false);
    const offlineHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'offline'
    )?.[1] as EventListener;
    if (offlineHandler) offlineHandler(new Event('offline'));

    expect(result.current.isOnline).toBe(false);

    // Go online
    mockOnLine.mockReturnValue(true);
    const onlineHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'online'
    )?.[1] as EventListener;
    if (onlineHandler) onlineHandler(new Event('online'));

    expect(result.current.isOnline).toBe(true);

    // Go offline again
    mockOnLine.mockReturnValue(false);
    if (offlineHandler) offlineHandler(new Event('offline'));

    expect(result.current.isOnline).toBe(false);
  });
});

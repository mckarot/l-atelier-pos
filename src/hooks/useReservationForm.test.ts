// src/hooks/useReservationForm.test.ts
// Tests unitaires pour le hook useReservationForm

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReservationForm } from './useReservationForm';
import * as useReservations from './useReservations';

// Mock du createReservation
vi.mock('./useReservations', () => ({
  createReservation: vi.fn(),
}));

describe('useReservationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialise avec l état par défaut', () => {
    const { result } = renderHook(() => useReservationForm());
    
    expect(result.current.currentStep).toBe(0);
    expect(result.current.dateTime).toEqual({
      date: '',
      time: '',
      guests: 2,
    });
    expect(result.current.customer).toEqual({
      customerName: '',
      phone: '',
      email: '',
      notes: '',
    });
    expect(result.current.confirmation).toBeNull();
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('met à jour les données dateTime', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.updateDateTime({ date: '2024-03-25' });
    });
    
    expect(result.current.dateTime.date).toBe('2024-03-25');
  });

  it('met à jour les données customer', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.updateCustomer({ customerName: 'Jean Dupont' });
    });
    
    expect(result.current.customer.customerName).toBe('Jean Dupont');
  });

  it('passe à l étape suivante', () => {
    const { result } = renderHook(() => useReservationForm());
    
    expect(result.current.currentStep).toBe(0);
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(1);
  });

  it('revient à l étape précédente', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(2);
    
    act(() => {
      result.current.previousStep();
    });
    
    expect(result.current.currentStep).toBe(1);
  });

  it('ne descend pas en dessous de 0', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.previousStep();
    });
    
    expect(result.current.currentStep).toBe(0);
  });

  it('ne dépasse pas 2', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
      result.current.nextStep();
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(2);
  });

  it('va à une étape spécifique', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.goToStep(2);
    });
    
    expect(result.current.currentStep).toBe(2);
  });

  it('valide l étape 1 avec des données valides', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.updateDateTime({
        date: '2024-03-25',
        time: '19:30',
        guests: 4,
      });
    });
    
    const isValid = result.current.validateStep(0);
    
    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('ne valide pas l étape 1 sans date', () => {
    const { result } = renderHook(() => useReservationForm());
    
    const isValid = result.current.validateStep(0);
    
    expect(isValid).toBe(false);
    expect(result.current.errors.date).toBe('La date est obligatoire');
  });

  it('ne valide pas l étape 1 sans heure', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.updateDateTime({ date: '2024-03-25' });
    });
    
    const isValid = result.current.validateStep(0);
    
    expect(isValid).toBe(false);
    expect(result.current.errors.time).toBe("L'heure est obligatoire");
  });

  it('valide l étape 2 avec un nom client', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.updateCustomer({ customerName: 'Jean Dupont' });
    });
    
    const isValid = result.current.validateStep(1);
    
    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('ne valide pas l étape 2 sans nom client', () => {
    const { result } = renderHook(() => useReservationForm());
    
    const isValid = result.current.validateStep(1);
    
    expect(isValid).toBe(false);
    expect(result.current.errors.customerName).toBe('Le nom du client est obligatoire');
  });

  it('réinitialise le formulaire', () => {
    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.updateDateTime({ date: '2024-03-25', time: '19:30' });
      result.current.updateCustomer({ customerName: 'Jean Dupont' });
      result.current.nextStep();
    });
    
    act(() => {
      result.current.resetForm();
    });
    
    expect(result.current.currentStep).toBe(0);
    expect(result.current.dateTime.date).toBe('');
    expect(result.current.customer.customerName).toBe('');
  });

  it('soumet la réservation avec succès', async () => {
    const mockCreateReservation = vi.mocked(useReservations.createReservation);
    mockCreateReservation.mockResolvedValue(1);

    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.updateDateTime({
        date: '2024-03-25',
        time: '19:30',
        guests: 4,
      });
      result.current.updateCustomer({
        customerName: 'Jean Dupont',
        email: 'jean@email.com',
        phone: '0612345678',
      });
    });
    
    await act(async () => {
      await result.current.submitReservation();
    });
    
    expect(mockCreateReservation).toHaveBeenCalledWith({
      customerName: 'Jean Dupont',
      email: 'jean@email.com',
      phone: '0612345678',
      date: '2024-03-25',
      time: '19:30',
      guests: 4,
      status: 'en_attente',
      notes: undefined,
    });
    
    expect(result.current.confirmation).not.toBeNull();
    expect(result.current.currentStep).toBe(2);
  });

  it('gère l erreur lors de la soumission', async () => {
    const mockCreateReservation = vi.mocked(useReservations.createReservation);
    mockCreateReservation.mockRejectedValue(new Error('Erreur DB'));

    const { result } = renderHook(() => useReservationForm());
    
    act(() => {
      result.current.updateDateTime({
        date: '2024-03-25',
        time: '19:30',
        guests: 4,
      });
      result.current.updateCustomer({ customerName: 'Jean Dupont' });
    });
    
    await act(async () => {
      try {
        await result.current.submitReservation();
      } catch (error) {
        // L'erreur est attendue
      }
    });
    
    expect(result.current.isSubmitting).toBe(false);
  });
});

// src/hooks/useReservationForm.ts
// Hook de gestion du formulaire de réservation

import { useState, useCallback } from 'react';
import { createReservation } from './useReservations';
import type { CreateReservationInput } from '../firebase/types';

/** Données de date et heure */
interface DateTimeData {
  date: string;
  time: string;
  guests: number;
}

/** Données client */
interface CustomerData {
  customerName: string;
  phone: string;
  email: string;
  notes: string;
}

/** Confirmation de réservation */
interface ReservationConfirmation {
  referenceNumber: string;
  reservationId: string;
}

/** État complet du formulaire */
interface ReservationFormState {
  currentStep: number;
  dateTime: DateTimeData;
  customer: CustomerData;
  confirmation: ReservationConfirmation | null;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

/** Retour du hook */
interface UseReservationFormReturn {
  // État
  currentStep: number;
  dateTime: DateTimeData;
  customer: CustomerData;
  confirmation: ReservationConfirmation | null;
  errors: Record<string, string>;
  isSubmitting: boolean;

  // Navigation stepper
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Actions formulaire
  updateDateTime: (data: Partial<DateTimeData>) => void;
  updateCustomer: (data: Partial<CustomerData>) => void;
  validateStep: (step: number) => boolean;
  resetForm: () => void;

  // Soumission
  submitReservation: () => Promise<void>;
}

/** État initial du formulaire */
const INITIAL_STATE: ReservationFormState = {
  currentStep: 0,
  dateTime: {
    date: '',
    time: '',
    guests: 2,
  },
  customer: {
    customerName: '',
    phone: '',
    email: '',
    notes: '',
  },
  confirmation: null,
  errors: {},
  isSubmitting: false,
};

/**
 * Hook de gestion du formulaire de réservation
 * Gère les 3 étapes : Date/Heure → Détails client → Confirmation
 */
export function useReservationForm(): UseReservationFormReturn {
  const [state, setState] = useState<ReservationFormState>(INITIAL_STATE);

  /** Aller à une étape spécifique */
  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step, errors: {} }));
  }, []);

  /** Étape suivante */
  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  /** Étape précédente */
  const previousStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  }, []);

  /** Mettre à jour les données de date/heure */
  const updateDateTime = useCallback((data: Partial<DateTimeData>) => {
    setState((prev) => ({
      ...prev,
      dateTime: { ...prev.dateTime, ...data },
    }));
  }, []);

  /** Mettre à jour les données client */
  const updateCustomer = useCallback((data: Partial<CustomerData>) => {
    setState((prev) => ({
      ...prev,
      customer: { ...prev.customer, ...data },
    }));
  }, []);

  /** Valider une étape */
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Validation étape 1 : Date, Heure, Couverts
      if (!state.dateTime.date) {
        newErrors.date = 'Date requise';
      } else {
        const selectedDate = new Date(state.dateTime.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.date = 'La date doit être >= aujourd\'hui';
        }
      }

      if (!state.dateTime.time) {
        newErrors.time = 'Heure requise';
      }

      if (state.dateTime.guests < 1 || state.dateTime.guests > 20) {
        newErrors.guests = '1-20 convives';
      }
    } else if (step === 1) {
      // Validation étape 2 : Nom client
      if (!state.customer.customerName.trim()) {
        newErrors.customerName = 'Nom requis';
      }

      if (
        state.customer.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customer.email)
      ) {
        newErrors.email = 'Email invalide';
      }
    }

    setState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [state.dateTime, state.customer]);

  /** Réinitialiser le formulaire */
  const resetForm = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /** Soumettre la réservation */
  const submitReservation = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      // Générer un numéro de référence
      const referenceNumber = `RES-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Créer la réservation
      const input: CreateReservationInput = {
        customerName: state.customer.customerName,
        email: state.customer.email || undefined,
        phone: state.customer.phone || undefined,
        date: state.dateTime.date,
        time: state.dateTime.time,
        guests: state.dateTime.guests,
        notes: state.customer.notes || undefined,
        status: 'attente',
        referenceNumber,
      };

      const reservationId = await createReservation(input);

      setState((prev) => ({
        ...prev,
        confirmation: {
          referenceNumber,
          reservationId,
        },
        isSubmitting: false,
        currentStep: 2, // Étape confirmation
      }));
    } catch (error) {
      console.error('[submitReservation] Error:', error);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        errors: {
          submit:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la création',
        },
      }));
    }
  }, [state.customer, state.dateTime]);

  return {
    currentStep: state.currentStep,
    dateTime: state.dateTime,
    customer: state.customer,
    confirmation: state.confirmation,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    goToStep,
    nextStep,
    previousStep,
    updateDateTime,
    updateCustomer,
    validateStep,
    resetForm,
    submitReservation,
  };
}

// src/hooks/useReservationForm.ts
// Hook de gestion du formulaire de réservation

import { useState, useCallback } from 'react';
import { createReservation } from './useReservations';
import type { CreateReservationInput } from '../db/types';

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
  reservationId: number;
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
 * - 3 étapes : Date/Heure, Détails client, Confirmation
 * - Validation par étape
 * - Génération du numéro de référence
 */
export function useReservationForm(): UseReservationFormReturn {
  const [state, setState] = useState<ReservationFormState>(INITIAL_STATE);

  /** Navigation vers une étape spécifique */
  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step, errors: {} }));
  }, []);

  /** Étape suivante */
  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 2) }));
  }, []);

  /** Étape précédente */
  const previousStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 0) }));
  }, []);

  /** Mise à jour des données date/heure */
  const updateDateTime = useCallback((data: Partial<DateTimeData>) => {
    setState((prev) => ({
      ...prev,
      dateTime: { ...prev.dateTime, ...data },
    }));
  }, []);

  /** Mise à jour des données client */
  const updateCustomer = useCallback((data: Partial<CustomerData>) => {
    setState((prev) => ({
      ...prev,
      customer: { ...prev.customer, ...data },
    }));
  }, []);

  /** Validation d'une étape */
  const validateStep = useCallback((step: number): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (step === 0) {
      if (!state.dateTime.date) {
        errors.date = 'La date est obligatoire';
        isValid = false;
      }
      if (!state.dateTime.time) {
        errors.time = "L'heure est obligatoire";
        isValid = false;
      }
      if (state.dateTime.guests < 1 || state.dateTime.guests > 10) {
        errors.guests = 'Le nombre de couverts doit être entre 1 et 10';
        isValid = false;
      }
    } else if (step === 1) {
      if (!state.customer.customerName.trim()) {
        errors.customerName = 'Le nom du client est obligatoire';
        isValid = false;
      }
    }

    if (!isValid) {
      setState((prev) => ({ ...prev, errors }));
    }
    return isValid;
  }, [state.dateTime, state.customer]);

  /** Réinitialisation du formulaire */
  const resetForm = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /** Soumission de la réservation */
  const submitReservation = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      const now = Date.now();
      const referenceNumber = `RES-${now}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      const reservationData: CreateReservationInput = {
        customerName: state.customer.customerName.trim(),
        email: state.customer.email.trim() || undefined,
        phone: state.customer.phone.trim() || undefined,
        date: state.dateTime.date,
        time: state.dateTime.time,
        guests: state.dateTime.guests,
        status: 'en_attente',
        notes: state.customer.notes.trim() || undefined,
      };

      const reservationId = await createReservation(reservationData);

      setState((prev) => ({
        ...prev,
        confirmation: {
          referenceNumber,
          reservationId,
        },
        isSubmitting: false,
      }));

      setState((prev) => ({ ...prev, currentStep: 2 }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState((prev) => ({
        ...prev,
        errors: { submit: errorMessage },
        isSubmitting: false,
      }));
      throw error;
    }
  }, [state.dateTime, state.customer]);

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

export default useReservationForm;

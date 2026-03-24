// src/components/client/ReservationModal.tsx
// Modal de réservation avec steps

import { useState, useCallback } from 'react';
import { cn, iconFilled } from '../../utils/cn';
import { ReservationSteps } from './ReservationSteps';
import { ReservationForm } from './ReservationForm';
import { ReservationConfirmation } from './ReservationConfirmation';
import { useToast } from '../../hooks/useToast';
import { createReservation } from '../../hooks/useReservations';
import type { Reservation } from '../../firebase/types';

export type ReservationStep = 'DATE' | 'DETAILS' | 'CONFIRMATION';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationModal({ isOpen, onClose }: ReservationModalProps): JSX.Element | null {
  const [currentStep, setCurrentStep] = useState<ReservationStep>('DATE');
  const [reservationData, setReservationData] = useState<Partial<Reservation>>({
    date: '',
    time: '',
    guests: 2,
    customerName: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [reservationId, setReservationId] = useState<number | null>(null);
  const { showSuccess, showError } = useToast();

  const handleUpdateData = useCallback((data: Partial<Reservation>) => {
    setReservationData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === 'DATE') {
      setCurrentStep('DETAILS');
    } else if (currentStep === 'DETAILS') {
      handleSubmit();
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep === 'DETAILS') {
      setCurrentStep('DATE');
    } else if (currentStep === 'CONFIRMATION') {
      setCurrentStep('DETAILS');
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    try {
      if (!reservationData.date || !reservationData.time || !reservationData.customerName) {
        showError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const id = await createReservation({
        customerName: reservationData.customerName!,
        email: reservationData.email,
        phone: reservationData.phone,
        date: reservationData.date!,
        time: reservationData.time!,
        guests: reservationData.guests!,
        status: 'attente',
        notes: reservationData.notes,
      });

      setReservationId(id);
      setCurrentStep('CONFIRMATION');
      showSuccess('Réservation confirmée !');
    } catch (error) {
      console.error('[ReservationModal] Error creating reservation:', error);
      showError('Erreur lors de la réservation');
    }
  }, [reservationData, showSuccess, showError]);

  const handleClose = useCallback(() => {
    setCurrentStep('DATE');
    setReservationData({
      date: '',
      time: '',
      guests: 2,
      customerName: '',
      email: '',
      phone: '',
      notes: '',
    });
    setReservationId(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const steps: ReservationStep[] = ['DATE', 'DETAILS', 'CONFIRMATION'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
      onClick={handleClose}
    >
      <div
        className="bg-surface-container rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-container border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between">
          <h2
            id="reservation-modal-title"
            className="text-xl font-bold font-headline"
          >
            Réservation
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-surface-variant transition-colors"
            aria-label="Fermer"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              close
            </span>
          </button>
        </div>

        {/* Progress steps */}
        <ReservationSteps
          steps={steps}
          currentStepIndex={currentStepIndex}
        />

        {/* Content */}
        <div className="p-6">
          {currentStep === 'DATE' && (
            <ReservationForm.DateStep
              data={reservationData}
              onUpdate={handleUpdateData}
            />
          )}
          {currentStep === 'DETAILS' && (
            <ReservationForm.DetailsStep
              data={reservationData}
              onUpdate={handleUpdateData}
            />
          )}
          {currentStep === 'CONFIRMATION' && reservationId && (
            <ReservationConfirmation
              reservation={{ ...reservationData, id: reservationId } as Reservation}
            />
          )}
        </div>

        {/* Footer actions */}
        {currentStep !== 'CONFIRMATION' && (
          <div className="sticky bottom-0 bg-surface-container border-t border-outline-variant/10 px-6 py-4 flex items-center justify-between">
            <button
              onClick={currentStep === 'DATE' ? handleClose : handleBack}
              className="px-6 py-3 rounded-lg font-bold bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant transition-colors"
            >
              {currentStep === 'DATE' ? 'Annuler' : 'RETOUR'}
            </button>
            <button
              onClick={handleNext}
              className={cn(
                'px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all',
                'bg-primary-container text-on-primary-container hover:brightness-110 active:scale-[0.98]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'
              )}
            >
              <span>
                {currentStep === 'DATE' ? 'SUIVANT' : 'CONFIRMER LA RÉSERVATION'}
              </span>
              <span
                className={iconFilled()}
                aria-hidden="true"
              >
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

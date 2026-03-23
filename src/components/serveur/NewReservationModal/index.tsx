// src/components/serveur/NewReservationModal/index.tsx
// Composant principal du formulaire de réservation

import { type JSX } from 'react';
import { Modal } from '../../ui/Modal';
import { Stepper } from '../../ui/Stepper';
import { Button } from '../../ui/Button';
import { DateTimeStep } from './components/DateTimeStep';
import { DetailsStep } from './components/DetailsStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { useReservationForm } from '../../../hooks/useReservationForm';

export interface NewReservationModalProps {
  /** État d'ouverture du modal */
  isOpen: boolean;
  /** Callback de fermeture */
  onClose: () => void;
}

/** Étapes du stepper */
const STEPS = [
  { id: 1, label: 'Date & Heure' },
  { id: 2, label: 'Client' },
  { id: 3, label: 'Confirmation' },
];

/**
 * Modal de nouvelle réservation avec stepper 3 étapes
 * - Étape 1 : Date, Heure, Couverts
 * - Étape 2 : Détails client
 * - Étape 3 : Confirmation
 */
export function NewReservationModal({
  isOpen,
  onClose,
}: NewReservationModalProps): JSX.Element {
  const {
    currentStep,
    dateTime,
    customer,
    confirmation,
    errors,
    isSubmitting,
    goToStep,
    nextStep,
    previousStep,
    updateDateTime,
    updateCustomer,
    validateStep,
    resetForm,
    submitReservation,
  } = useReservationForm();

  /** Gestion de la fermeture */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /** Passage à l'étape suivante avec validation */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep();
    }
  };

  /** Soumission du formulaire */
  const handleSubmit = async () => {
    if (validateStep(1)) {
      try {
        await submitReservation();
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
      }
    }
  };

  /** Rendu du contenu de l'étape courante */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <DateTimeStep
            date={dateTime.date}
            time={dateTime.time}
            guests={dateTime.guests}
            onChange={updateDateTime}
            errors={errors}
          />
        );

      case 1:
        return (
          <DetailsStep
            customer={customer}
            onChange={updateCustomer}
            errors={errors}
          />
        );

      case 2:
        return (
          <ConfirmationStep
            confirmation={{
              customerName: customer.customerName,
              date: dateTime.date,
              time: dateTime.time,
              guests: dateTime.guests,
              phone: customer.phone,
              email: customer.email,
              notes: customer.notes,
              referenceNumber: confirmation?.referenceNumber || '',
            }}
            onClose={handleClose}
          />
        );

      default:
        return null;
    }
  };

  /** Rendu des boutons de navigation */
  const renderNavigation = () => {
    if (currentStep === 2) {
      return null;
    }

    return (
      <div className="flex items-center justify-between gap-4 border-t border-surface-variant pt-4">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={currentStep === 0 || isSubmitting}
          aria-label="Étape précédente"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Retour
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isSubmitting}
            aria-label="Étape suivante"
          >
            Suivant
            <span className="material-symbols-outlined">arrow_forward</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            aria-label="Confirmer la réservation"
          >
            {isSubmitting ? 'En cours...' : 'Confirmer la réservation'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nouvelle Réservation"
      size="lg"
    >
      <div className="space-y-6">
        <Stepper steps={STEPS} currentStep={currentStep} />

        <div>{renderStepContent()}</div>

        {renderNavigation()}
      </div>
    </Modal>
  );
}

export default NewReservationModal;

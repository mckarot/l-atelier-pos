// src/components/serveur/NewReservationModal/components/ConfirmationStep.tsx
// Étape 3 : Confirmation avec numéro de référence et résumé

import { type JSX } from 'react';
import { Button } from '../../../ui/Button';

export interface ConfirmationData {
  customerName: string;
  date: string;
  time: string;
  guests: number;
  phone?: string;
  email?: string;
  notes?: string;
  referenceNumber: string;
}

export interface ConfirmationStepProps {
  /** Données de confirmation */
  confirmation: ConfirmationData;
  /** Callback de fermeture */
  onClose: () => void;
}

/**
 * Formate une date YYYY-MM-DD en format lisible
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Étape 3 du formulaire de réservation
 * - Numéro de référence : RES-YYYYMMDDD-NNN
 * - Résumé complet (nom, date, heure, couverts)
 * - Bouton "Fermer"
 */
export function ConfirmationStep({
  confirmation,
  onClose,
}: ConfirmationStepProps): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container">
          <span className="material-symbols-filled text-4xl text-on-primary-container">
            check_circle
          </span>
        </div>
      </div>

      <div className="text-center">
        <h3 className="font-headline text-xl font-bold text-on-surface">
          Réservation confirmée !
        </h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Votre réservation a été enregistrée avec succès.
        </p>
      </div>

      <div className="rounded-xl bg-surface-container-high p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Numéro de référence
        </p>
        <p className="mt-1 font-mono text-2xl font-bold text-primary-container">
          {confirmation.referenceNumber}
        </p>
      </div>

      <div className="space-y-3 rounded-xl bg-surface-container p-4">
        <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
          Résumé de la réservation
        </h4>

        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">
            person
          </span>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {confirmation.customerName}
            </p>
            <p className="text-xs text-on-surface-variant">Client</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">
            calendar_today
          </span>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {formatDate(confirmation.date)}
            </p>
            <p className="text-xs text-on-surface-variant">Date</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">
            schedule
          </span>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {confirmation.time}
            </p>
            <p className="text-xs text-on-surface-variant">Heure</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">
            groups
          </span>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {confirmation.guests} {confirmation.guests === 1 ? 'personne' : 'personnes'}
            </p>
            <p className="text-xs text-on-surface-variant">Nombre de couverts</p>
          </div>
        </div>

        {confirmation.phone && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              phone
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {confirmation.phone}
              </p>
              <p className="text-xs text-on-surface-variant">Téléphone</p>
            </div>
          </div>
        )}

        {confirmation.email && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              email
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {confirmation.email}
              </p>
              <p className="text-xs text-on-surface-variant">Email</p>
            </div>
          </div>
        )}

        {confirmation.notes && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              note
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {confirmation.notes}
              </p>
              <p className="text-xs text-on-surface-variant">Notes</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button
          variant="primary"
          onClick={onClose}
          className="w-full"
          aria-label="Fermer la confirmation"
        >
          <span className="material-symbols-outlined">close</span>
          Fermer
        </Button>
      </div>
    </div>
  );
}

export default ConfirmationStep;

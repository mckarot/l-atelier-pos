// src/components/serveur/NewReservationModal/components/DetailsStep.tsx
// Étape 2 : Détails du client (Nom, Téléphone, Email, Notes)

import { type JSX, useId } from 'react';

export interface CustomerData {
  customerName: string;
  phone: string;
  email: string;
  notes: string;
}

export interface DetailsStepProps {
  /** Données client */
  customer: CustomerData;
  /** Callback de mise à jour */
  onChange: (data: Partial<CustomerData>) => void;
  /** Erreurs de validation */
  errors: Record<string, string>;
}

/**
 * Étape 2 du formulaire de réservation
 * - Input Nom client (required)
 * - Input Téléphone (optional)
 * - Input Email (optional)
 * - Textarea Notes (optional)
 * - Validation : nom obligatoire
 */
export function DetailsStep({
  customer,
  onChange,
  errors,
}: DetailsStepProps): JSX.Element {
  const id = useId();
  const nameInputId = `customer-name-${id}`;
  const phoneInputId = `customer-phone-${id}`;
  const emailInputId = `customer-email-${id}`;
  const notesTextareaId = `customer-notes-${id}`;

  const nameErrorId = `${nameInputId}-error`;
  const phoneErrorId = `${phoneInputId}-error`;
  const emailErrorId = `${emailInputId}-error`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <label
          htmlFor={nameInputId}
          className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
        >
          Nom du client <span className="text-error">*</span>
        </label>

        <input
          type="text"
          id={nameInputId}
          value={customer.customerName}
          onChange={(event) => onChange({ customerName: event.target.value })}
          placeholder="Ex: Jean Dupont"
          aria-invalid={errors.customerName ? 'true' : 'false'}
          aria-describedby={errors.customerName ? nameErrorId : undefined}
          aria-required="true"
          className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        />

        {errors.customerName && (
          <p
            id={nameErrorId}
            role="alert"
            className="text-xs text-error"
          >
            {errors.customerName}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={phoneInputId}
            className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
          >
            Téléphone
          </label>

          <input
            type="tel"
            id={phoneInputId}
            value={customer.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            placeholder="06 12 34 56 78"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? phoneErrorId : undefined}
            className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />

          {errors.phone && (
            <p
              id={phoneErrorId}
              role="alert"
              className="text-xs text-error"
            >
              {errors.phone}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={emailInputId}
            className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
          >
            Email
          </label>

          <input
            type="email"
            id={emailInputId}
            value={customer.email}
            onChange={(event) => onChange({ email: event.target.value })}
            placeholder="jean.dupont@email.com"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? emailErrorId : undefined}
            className="w-full rounded-lg bg-surface-container-high px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />

          {errors.email && (
            <p
              id={emailErrorId}
              role="alert"
              className="text-xs text-error"
            >
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={notesTextareaId}
          className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
        >
          Notes particulières
        </label>

        <textarea
          id={notesTextareaId}
          value={customer.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Allergies, anniversaire, demande spéciale..."
          rows={4}
          className="w-full resize-none rounded-lg bg-surface-container-high px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        />
      </div>

      <p className="text-xs text-on-surface-variant">
        <span className="text-error">*</span> Champ obligatoire
      </p>
    </div>
  );
}

export default DetailsStep;

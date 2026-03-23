// src/components/ui/Stepper.tsx
// Stepper 3 étapes avec cercles connectés par lignes

import { type JSX } from 'react';
import { cn } from '../../utils/cn';

export interface Step {
  id: number;
  label: string;
}

export interface StepperProps {
  /** Étapes du stepper */
  steps: Step[];
  /** Étape actuelle (0-indexed) */
  currentStep: number;
  /** Classe CSS supplémentaire */
  className?: string;
}

/**
 * Stepper horizontal avec cercles connectés
 * - Étape active : bg-primary-container
 * - Étape complétée : bg-tertiary
 * - Labels : text-[10px] font-bold uppercase tracking-widest
 */
export function Stepper({
  steps,
  currentStep,
  className,
}: StepperProps): JSX.Element {
  return (
    <nav aria-label="Progression du formulaire" className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={step.id} className="relative flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full font-bold text-on-primary-container transition-colors',
                    isCompleted && 'bg-tertiary text-on-tertiary-container',
                    isCurrent && 'bg-primary-container',
                    !isCompleted && !isCurrent && 'bg-surface-container-high text-on-surface-variant'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Étape ${index + 1} : ${step.label}`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-filled text-lg">check</span>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>

                <span
                  className={cn(
                    'mt-2 text-[10px] font-bold uppercase tracking-widest',
                    isCompleted || isCurrent
                      ? 'text-on-surface'
                      : 'text-on-surface-variant'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 w-16 transition-colors',
                    isCompleted
                      ? 'bg-tertiary'
                      : 'bg-surface-container-high'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;

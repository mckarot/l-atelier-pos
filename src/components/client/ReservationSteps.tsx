// src/components/client/ReservationSteps.tsx
// Barre de progression des steps de réservation

import { cn, iconFilled } from '../../utils/cn';
import type { ReservationStep } from './ReservationModal';

interface ReservationStepsProps {
  steps: ReservationStep[];
  currentStepIndex: number;
}

export function ReservationSteps({
  steps,
  currentStepIndex,
}: ReservationStepsProps): JSX.Element {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step} className="flex items-center">
              {/* Step circle */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                  isCompleted
                    ? 'bg-tertiary text-on-tertiary'
                    : isCurrent
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-highest text-on-surface-variant'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <span
                    className={iconFilled()}
                    aria-hidden="true"
                  >
                    check
                  </span>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  'ml-2 text-xs font-bold uppercase tracking-wider hidden sm:inline',
                  isCurrent
                    ? 'text-primary'
                    : isCompleted
                    ? 'text-tertiary'
                    : 'text-on-surface-variant'
                )}
              >
                {step}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-0.5 mx-2',
                    isCompleted
                      ? 'bg-tertiary'
                      : 'bg-surface-container-highest'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

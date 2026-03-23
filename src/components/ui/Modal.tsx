// src/components/ui/Modal.tsx
// Modal générique avec focus trap et gestion ARIA

import { useEffect, useRef, type ReactNode, type JSX } from 'react';
import { cn } from '../../utils/cn';

export interface ModalProps {
  /** État d'ouverture du modal */
  isOpen: boolean;
  /** Callback de fermeture */
  onClose: () => void;
  /** Titre du modal (pour aria-labelledby) */
  title: string;
  /** Contenu du modal */
  children: ReactNode;
  /** Taille du modal */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Classe CSS supplémentaire pour le container */
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Modal accessible avec focus trap et gestion du clavier
 * - Appuie sur Escape pour fermer
 * - Focus trap à l'intérieur du modal
 * - ARIA: role="dialog", aria-modal="true"
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  className,
}: ModalProps): JSX.Element {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Focus sur le bouton de fermeture à l'ouverture
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modalContent = modalContentRef.current;
    if (!modalContent) return;

    const focusableElements = modalContent.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || focusableElements.length === 0) return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modalContent.addEventListener('keydown', handleTabKey);
    return () => modalContent.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Empêcher le scroll du body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return <></>;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className={cn(
          'w-full bg-surface-container-low rounded-xl shadow-xl',
          SIZE_CLASSES[size],
          'mx-4',
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-variant px-6 py-4">
          <h2
            id="modal-title"
            className="font-headline text-2xl font-bold text-on-surface"
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

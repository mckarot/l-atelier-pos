// src/components/ui/Modal.test.tsx
// Tests unitaires pour le composant Modal

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: 'Test Modal',
    children: <p>Modal content</p>,
  };

  it('ne se rend pas quand isOpen est false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se rend quand isOpen est true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('appelle onClose quand on clique sur le bouton de fermeture', () => {
    render(<Modal {...defaultProps} />);
    const closeButton = screen.getByLabelText('Fermer la fenêtre');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose quand on clique sur le backdrop', () => {
    render(<Modal {...defaultProps} />);
    // Le backdrop est l'élément avec role="dialog"
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('nappelle pas onClose quand on clique sur le contenu du modal', () => {
    render(<Modal {...defaultProps} />);
    const modalContent = screen.getByText('Modal content');
    fireEvent.click(modalContent);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('utilise la taille lg par défaut', () => {
    render(<Modal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-2xl');
  });

  it('utilise la taille sm quand spécifié', () => {
    render(<Modal {...defaultProps} size="sm" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-md');
  });

  it('utilise la taille xl quand spécifié', () => {
    render(<Modal {...defaultProps} size="xl" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-4xl');
  });

  it('applique la className supplémentaire', () => {
    render(<Modal {...defaultProps} className="custom-class" />);
    const dialog = screen.getByRole('dialog');
    // La className est appliquée au container interne
    expect(screen.getByText('Modal content').parentElement).toHaveClass('custom-class');
  });

  it('a les attributs ARIA corrects', () => {
    render(<Modal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('gère la touche Escape', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ne répond pas à Escape quand isOpen est false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

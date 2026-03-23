// src/components/ui/DatePicker.test.tsx
// Tests unitaires pour le composant DatePicker

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: '2024-03-23',
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('affiche la valeur correcte', () => {
    render(<DatePicker {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('2024-03-23');
  });

  it('appelle onChange quand la valeur change', () => {
    render(<DatePicker {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '2024-03-24' } });
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('2024-03-24');
  });

  it('affiche le label par défaut', () => {
    render(<DatePicker {...defaultProps} />);
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  it('affiche un label personnalisé', () => {
    render(<DatePicker {...defaultProps} label="Date de réservation" />);
    expect(screen.getByText('Date de réservation')).toBeInTheDocument();
  });

  it('applique minDate quand spécifié', () => {
    render(<DatePicker {...defaultProps} minDate="2024-03-25" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('min', '2024-03-25');
  });

  it('applique maxDate quand spécifié', () => {
    render(<DatePicker {...defaultProps} maxDate="2024-12-31" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('max', '2024-12-31');
  });

  it('affiche le message d erreur', () => {
    render(<DatePicker {...defaultProps} error="La date est obligatoire" />);
    expect(screen.getByText('La date est obligatoire')).toBeInTheDocument();
  });

  it('applique aria-invalid quand il y a une erreur', () => {
    render(<DatePicker {...defaultProps} error="La date est obligatoire" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('n applique pas aria-invalid quand il n y a pas d erreur', () => {
    render(<DatePicker {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('est désactivé quand disabled est true', () => {
    render(<DatePicker {...defaultProps} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('a le style de background correct', () => {
    render(<DatePicker {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-surface-container-high');
  });

  it('a le style de label correct', () => {
    render(<DatePicker {...defaultProps} />);
    const label = screen.getByText('Date');
    expect(label).toHaveClass('text-[10px]', 'font-bold', 'uppercase', 'tracking-widest');
  });
});

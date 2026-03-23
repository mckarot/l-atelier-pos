// src/components/ui/TimeSlotSelect.test.tsx
// Tests unitaires pour le composant TimeSlotSelect

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeSlotSelect } from './TimeSlotSelect';

describe('TimeSlotSelect', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: '12:00',
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('affiche la valeur correcte', () => {
    render(<TimeSlotSelect {...defaultProps} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('12:00');
  });

  it('appelle onChange quand la valeur change', () => {
    render(<TimeSlotSelect {...defaultProps} />);
    const select = screen.getByRole('combobox');
    
    fireEvent.change(select, { target: { value: '19:30' } });
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('19:30');
  });

  it('affiche le label par défaut', () => {
    render(<TimeSlotSelect {...defaultProps} />);
    expect(screen.getByText('Heure')).toBeInTheDocument();
  });

  it('affiche un label personnalisé', () => {
    render(<TimeSlotSelect {...defaultProps} label="Heure de réservation" />);
    expect(screen.getByText('Heure de réservation')).toBeInTheDocument();
  });

  it('affiche le groupe Midi', () => {
    render(<TimeSlotSelect {...defaultProps} />);
    expect(screen.getByLabelText('Service Midi')).toBeInTheDocument();
  });

  it('affiche le groupe Soir', () => {
    render(<TimeSlotSelect {...defaultProps} />);
    expect(screen.getByLabelText('Service Soir')).toBeInTheDocument();
  });

  it('affiche les créneaux Midi', () => {
    render(<TimeSlotSelect {...defaultProps} />);
    const select = screen.getByRole('combobox');
    
    expect(select).toContainHTML('<option value="12:00">12:00</option>');
    expect(select).toContainHTML('<option value="12:30">12:30</option>');
    expect(select).toContainHTML('<option value="14:30">14:30</option>');
  });

  it('affiche les créneaux Soir', () => {
    render(<TimeSlotSelect {...defaultProps} />);
    const select = screen.getByRole('combobox');
    
    expect(select).toContainHTML('<option value="19:00">19:00</option>');
    expect(select).toContainHTML('<option value="20:00">20:00</option>');
    expect(select).toContainHTML('<option value="22:00">22:00</option>');
  });

  it('affiche le message d erreur', () => {
    render(<TimeSlotSelect {...defaultProps} error="L'heure est obligatoire" />);
    expect(screen.getByText("L'heure est obligatoire")).toBeInTheDocument();
  });

  it('applique aria-invalid quand il y a une erreur', () => {
    render(<TimeSlotSelect {...defaultProps} error="L'heure est obligatoire" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('est désactivé quand disabled est true', () => {
    render(<TimeSlotSelect {...defaultProps} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('a le style de background correct', () => {
    render(<TimeSlotSelect {...defaultProps} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('bg-surface-container-high');
  });

  it('a une option vide par défaut', () => {
    render(<TimeSlotSelect value="" onChange={mockOnChange} />);
    const select = screen.getByRole('combobox');
    expect(select).toContainHTML('<option value="">Sélectionner un créneau</option>');
  });
});

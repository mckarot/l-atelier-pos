// src/components/ui/Stepper.test.tsx
// Tests unitaires pour le composant Stepper

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

const mockSteps = [
  { id: 1, label: 'Date & Heure' },
  { id: 2, label: 'Client' },
  { id: 3, label: 'Confirmation' },
];

describe('Stepper', () => {
  it('affiche toutes les étapes', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    
    mockSteps.forEach((step) => {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    });
  });

  it('affiche la première étape comme active', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    
    const firstStep = screen.getByLabelText('Étape 1 : Date & Heure');
    expect(firstStep).toHaveClass('bg-primary-container');
  });

  it('affiche la deuxième étape comme active', () => {
    render(<Stepper steps={mockSteps} currentStep={1} />);
    
    const secondStep = screen.getByLabelText('Étape 2 : Client');
    expect(secondStep).toHaveClass('bg-primary-container');
  });

  it('marque les étapes précédentes comme complétées', () => {
    render(<Stepper steps={mockSteps} currentStep={2} />);
    
    const firstStep = screen.getByLabelText('Étape 1 : Date & Heure');
    const secondStep = screen.getByLabelText('Étape 2 : Client');
    
    expect(firstStep).toHaveClass('bg-tertiary');
    expect(secondStep).toHaveClass('bg-tertiary');
  });

  it('affiche une icône check pour les étapes complétées', () => {
    render(<Stepper steps={mockSteps} currentStep={2} />);
    
    const firstStep = screen.getByLabelText('Étape 1 : Date & Heure');
    expect(firstStep).toHaveTextContent('check');
  });

  it('affiche les numéros pour les étapes non complétées', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    
    const secondStep = screen.getByLabelText('Étape 2 : Client');
    const thirdStep = screen.getByLabelText('Étape 3 : Confirmation');
    
    expect(secondStep).toHaveTextContent('2');
    expect(thirdStep).toHaveTextContent('3');
  });

  it('a le rôle de navigation', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('a un label ARIA', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Progression du formulaire'
    );
  });

  it('affiche les lignes de connexion entre les étapes', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    
    // Il devrait y avoir 2 lignes pour 3 étapes
    const lines = document.querySelectorAll('[aria-hidden="true"]');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('marque l étape courante avec aria-current', () => {
    render(<Stepper steps={mockSteps} currentStep={1} />);
    
    const currentStep = screen.getByLabelText('Étape 2 : Client');
    expect(currentStep).toHaveAttribute('aria-current', 'step');
  });
});

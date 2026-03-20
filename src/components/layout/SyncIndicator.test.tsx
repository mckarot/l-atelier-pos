// src/components/layout/SyncIndicator.test.tsx
// Tests unitaires pour le composant SyncIndicator

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyncIndicator } from './SyncIndicator';

describe('SyncIndicator', () => {
  it('should render connected state correctly', () => {
    render(
      <SyncIndicator
        status="connected"
        lastSync={new Date()}
      />
    );

    expect(screen.getByText('DEXIE.JS CONNECTÉ')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Connecté');
  });

  it('should render disconnected state correctly', () => {
    render(
      <SyncIndicator
        status="disconnected"
        lastSync={new Date()}
      />
    );

    expect(
      screen.getByText('HORS LIGNE — Données sauvegardées localement')
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Hors ligne');
  });

  it('should display version number', () => {
    render(
      <SyncIndicator
        status="connected"
        version="v1.0.0"
        lastSync={new Date()}
      />
    );

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('should hide details when showDetails is false', () => {
    const { container } = render(
      <SyncIndicator
        status="connected"
        showDetails={false}
        lastSync={new Date()}
      />
    );

    // Should not contain "Dernière synchronisation"
    expect(container.textContent).not.toContain('Dernière synchronisation');
  });

  it('should show details by default', () => {
    render(
      <SyncIndicator
        status="connected"
        lastSync={new Date()}
      />
    );

    expect(screen.getByText(/Dernière synchronisation/)).toBeInTheDocument();
  });

  it('should display cloud_done icon when connected', () => {
    render(
      <SyncIndicator
        status="connected"
        lastSync={new Date()}
      />
    );

    expect(screen.getByText('cloud_done')).toBeInTheDocument();
  });

  it('should display cloud_off icon when disconnected', () => {
    render(
      <SyncIndicator
        status="disconnected"
        lastSync={new Date()}
      />
    );

    expect(screen.getByText('cloud_off')).toBeInTheDocument();
  });

  it('should have pulsing indicator', () => {
    const { container } = render(
      <SyncIndicator
        status="connected"
        lastSync={new Date()}
      />
    );

    const pingElement = container.querySelector('.animate-ping');
    expect(pingElement).toBeInTheDocument();
  });

  it('should have green border when connected', () => {
    const { container } = render(
      <SyncIndicator
        status="connected"
        lastSync={new Date()}
      />
    );

    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toHaveClass('border-tertiary');
  });

  it('should have red border when disconnected', () => {
    const { container } = render(
      <SyncIndicator
        status="disconnected"
        lastSync={new Date()}
      />
    );

    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toHaveClass('border-error');
  });

  it('should format relative time correctly', () => {
    const now = new Date();
    render(
      <SyncIndicator
        status="connected"
        lastSync={now}
      />
    );

    // Should show "à l'instant" for recent sync
    expect(screen.getByText(/à l'instant/)).toBeInTheDocument();
  });

  it('should handle null lastSync', () => {
    render(
      <SyncIndicator
        status="connected"
        lastSync={null}
      />
    );

    expect(screen.getByText('Jamais')).toBeInTheDocument();
  });

  it('should have correct role and aria-live', () => {
    render(
      <SyncIndicator
        status="connected"
        lastSync={new Date()}
      />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('should have left border styling', () => {
    const { container } = render(
      <SyncIndicator
        status="connected"
        lastSync={new Date()}
      />
    );

    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toHaveClass('border-l-4');
  });
});

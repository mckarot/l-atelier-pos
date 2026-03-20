// src/components/ui/OfflineBanner.test.tsx
// Tests unitaires pour le composant OfflineBanner

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';

// Mock navigator.onLine
const mockOnLine = vi.spyOn(navigator, 'onLine', 'get');

describe('OfflineBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when online', () => {
    mockOnLine.mockReturnValue(true);

    const { container } = render(<OfflineBanner />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when offline', () => {
    mockOnLine.mockReturnValue(false);

    render(<OfflineBanner />);

    const banner = screen.getByRole('alert');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent('Mode hors-ligne — vos données sont sauvegardées');
  });

  it('should display custom message', () => {
    mockOnLine.mockReturnValue(false);
    const customMessage = 'Connexion perdue';

    render(<OfflineBanner message={customMessage} />);

    const banner = screen.getByRole('alert');
    expect(banner).toHaveTextContent(customMessage);
  });

  it('should have correct accessibility attributes', () => {
    mockOnLine.mockReturnValue(false);

    render(<OfflineBanner />);

    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-live', 'assertive');
    expect(banner).toHaveAttribute('aria-label', 'Mode hors-ligne activé');
  });

  it('should have error styling', () => {
    mockOnLine.mockReturnValue(false);

    const { container } = render(<OfflineBanner />);

    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('bg-error-container');
    expect(banner).toHaveClass('text-error');
  });

  it('should display cloud_off icon', () => {
    mockOnLine.mockReturnValue(false);

    render(<OfflineBanner />);

    const icon = screen.getByText('cloud_off');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('material-symbols-outlined');
  });

  it('should have pulse animation on icon', () => {
    mockOnLine.mockReturnValue(false);

    render(<OfflineBanner />);

    const icon = screen.getByText('cloud_off');
    expect(icon).toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    mockOnLine.mockReturnValue(false);
    const customClass = 'custom-banner';

    const { container } = render(<OfflineBanner className={customClass} />);

    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass(customClass);
  });

  it('should be fixed at top of screen', () => {
    mockOnLine.mockReturnValue(false);

    const { container } = render(<OfflineBanner />);

    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('fixed', 'top-0', 'left-0', 'right-0');
  });

  it('should have high z-index', () => {
    mockOnLine.mockReturnValue(false);

    const { container } = render(<OfflineBanner />);

    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('z-50');
  });
});

// src/components/layout/Placeholder.test.tsx
// Tests de composants pour Placeholder

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Placeholder } from './Placeholder';

describe('Placeholder', () => {
  describe('Rendu de base', () => {
    it('affiche le nom de la vue', () => {
      // Arrange
      const viewName = 'Dashboard';

      // Act
      render(<Placeholder viewName={viewName} />);

      // Assert
      expect(screen.getByText(viewName)).toBeInTheDocument();
    });

    it('affiche le nom de la vue dans un h1', () => {
      // Arrange
      const viewName = 'Admin Panel';

      // Act
      render(<Placeholder viewName={viewName} />);

      // Assert
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(viewName);
    });

    it('affiche la description par défaut quand aucune description n\'est fournie', () => {
      // Arrange
      const viewName = 'TestView';

      // Act
      render(<Placeholder viewName={viewName} />);

      // Assert
      expect(screen.getByText('Cette vue est en cours de développement.')).toBeInTheDocument();
    });

    it('affiche la description personnalisée quand fournie', () => {
      // Arrange
      const viewName = 'Reports';
      const description = 'Page de rapports et statistiques';

      // Act
      render(<Placeholder viewName={viewName} description={description} />);

      // Assert
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  describe('Icône', () => {
    it('affiche l\'icône de construction', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const icon = screen.getByText('construction');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('material-symbols-outlined');
    });

    it('l\'icône a aria-hidden="true"', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const icon = screen.getByText('construction');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('l\'icône a la classe text-primary', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const icon = screen.getByText('construction');
      expect(icon).toHaveClass('text-primary');
    });

    it('l\'icône a la taille 6xl (text-6xl)', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const icon = screen.getByText('construction');
      expect(icon).toHaveClass('text-6xl');
    });
  });

  describe('Statut', () => {
    it('affiche le statut "EN CONSTRUCTION"', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      expect(screen.getByText('EN CONSTRUCTION')).toBeInTheDocument();
    });

    it('affiche le statut avec la classe text-primary', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const statusElement = screen.getByText('EN CONSTRUCTION');
      expect(statusElement).toHaveClass('text-primary');
    });

    it('affiche l\'étiquette "Statut :"', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      expect(screen.getByText('Statut :')).toBeInTheDocument();
    });
  });

  describe('Route', () => {
    it('affiche la route basée sur le nom de la vue', () => {
      // Arrange
      const viewName = 'Dashboard';

      // Act
      render(<Placeholder viewName={viewName} />);

      // Assert
      expect(screen.getByText('/dashboard')).toBeInTheDocument();
    });

    it('affiche la route en minuscules', () => {
      // Arrange
      const viewName = 'AdminPanel';

      // Act
      render(<Placeholder viewName={viewName} />);

      // Assert
      expect(screen.getByText('/adminpanel')).toBeInTheDocument();
    });

    it('affiche l\'étiquette "Route :"', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      expect(screen.getByText('Route :')).toBeInTheDocument();
    });

    it('la route a la classe text-tertiary', () => {
      // Arrange
      const viewName = 'Test';

      // Act
      render(<Placeholder viewName={viewName} />);

      // Assert
      const routeElement = screen.getByText('/test');
      expect(routeElement).toHaveClass('text-tertiary');
    });
  });

  describe('Styles et mise en page', () => {
    it('utilise un fond bg-surface-container', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('bg-surface-container');
    });

    it('centre le contenu horizontalement et verticalement', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
    });

    it('a un padding p-8', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('p-8');
    });

    it('limite la largeur du contenu à max-w-md', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const contentDiv = screen.getByText('EN CONSTRUCTION').closest('.text-center');
      expect(contentDiv).toHaveClass('max-w-md');
    });

    it('le conteneur d\'info a un fond bg-surface-container-highest', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const infoContainer = screen.getByText('Statut :').closest('.bg-surface-container-highest');
      expect(infoContainer).toBeInTheDocument();
    });

    it('le conteneur d\'info est arrondi (rounded-lg)', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const infoContainer = screen.getByText('Statut :').closest('.rounded-lg');
      expect(infoContainer).toBeInTheDocument();
    });

    it('le conteneur d\'info a un padding p-4', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const infoContainer = screen.getByText('Statut :').closest('.p-4');
      expect(infoContainer).toBeInTheDocument();
    });
  });

  describe('Typographie', () => {
    it('le titre utilise font-headline', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('font-headline');
    });

    it('le titre est en taille text-2xl', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl');
    });

    it('le titre est en font-black', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('font-black');
    });

    it('la description utilise text-on-surface-variant', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const description = screen.getByText('Cette vue est en cours de développement.');
      expect(description).toHaveClass('text-on-surface-variant');
    });

    it('les infos techniques utilisent font-mono', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const statusText = screen.getByText('Statut :');
      expect(statusText).toHaveClass('font-mono');
      expect(statusText).toHaveClass('text-xs');
    });
  });

  describe('Accessibilité', () => {
    it('l\'icône de construction est décorative (aria-hidden)', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      const icon = screen.getByText('construction');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('le titre principal est un h1', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" />);

      // Assert
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('la structure est sémantique', () => {
      // Arrange & Act
      render(<Placeholder viewName="Test" description="Test description" />);

      // Assert
      // Le h1 doit exister
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      // La description doit être un paragraphe
      const description = screen.getByText('Test description');
      expect(description.tagName.toLowerCase()).toBe('p');
    });
  });

  describe('Cas particuliers', () => {
    it('gère les noms de vue avec des espaces', () => {
      // Arrange
      const viewName = 'User Dashboard';

      // Act
      render(<Placeholder viewName={viewName} />);

      // Assert
      expect(screen.getByText('User Dashboard')).toBeInTheDocument();
      // La route devrait être en minuscules mais garder les espaces
      expect(screen.getByText('/user dashboard')).toBeInTheDocument();
    });

    it('gère les noms de vue vides', () => {
      // Arrange & Act
      render(<Placeholder viewName="" />);

      // Assert
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('');
      // La route affiche "/" pour un nom vide
      expect(screen.getByText('Route :')).toBeInTheDocument();
    });

    it('gère les descriptions longues', () => {
      // Arrange
      const longDescription = 'Cette vue est en cours de développement et sera disponible dans une prochaine version. Veuillez revenir ultérieurement.';

      // Act
      render(<Placeholder viewName="Test" description={longDescription} />);

      // Assert
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });
});

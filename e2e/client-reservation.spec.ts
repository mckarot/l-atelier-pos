// e2e/client-reservation.spec.ts
// Tests E2E pour le module Client - Réservation

import { test, expect } from '@playwright/test';

test.describe('Client Module - Réservation', () => {
  test.beforeEach(async ({ page }) => {
    // Seed des données et connexion en tant que client
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('atelier_role', 'client');
    });
    await page.goto('/client');
  });

  test.describe('Ouverture du modal de réservation', () => {
    test('devrait pouvoir ouvrir le modal de réservation', async ({ page }) => {
      // Note: Le bouton de réservation devrait être ajouté dans la sidebar ou l'header
      // Pour ce test, on simule l'ouverture via un événement
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    });
  });

  test.describe('Barre de progression', () => {
    test('devrait afficher les 3 steps de réservation', async ({ page }) => {
      // Arrange - Ouvrir le modal
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert
      await expect(page.getByText('DATE')).toBeVisible();
      await expect(page.getByText('DÉTAILS')).toBeVisible();
      await expect(page.getByText('CONFIRMATION')).toBeVisible();
    });

    test('devrait afficher le step DATE comme actif par défaut', async ({ page }) => {
      // Arrange - Ouvrir le modal
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert - Le premier cercle devrait être coloré
      const firstStep = page.locator('[role="dialog"] div.w-8.h-8').first();
      await expect(firstStep).toHaveClass(/bg-primary-container/);
    });
  });

  test.describe('Step 1: DATE', () => {
    test('devrait afficher les 7 prochains jours', async ({ page }) => {
      // Arrange - Ouvrir le modal
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert - Devrait avoir au moins 7 boutons de date
      const dateButtons = page.locator('[role="dialog"] button').filter({ hasText: /Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre|Aujourd'hui|Demain/ });
      await expect(dateButtons).toHaveCount({ min: 7 });
    });

    test('devrait afficher "Aujourd\'hui" pour le premier jour', async ({ page }) => {
      // Arrange - Ouvrir le modal
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert
      await expect(page.getByText('Aujourd\'hui')).toBeVisible();
    });

    test('devrait afficher les créneaux horaires', async ({ page }) => {
      // Arrange - Ouvrir le modal
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert
      await expect(page.getByText('12:00')).toBeVisible();
      await expect(page.getByText('12:30')).toBeVisible();
      await expect(page.getByText('19:00')).toBeVisible();
      await expect(page.getByText('20:00')).toBeVisible();
      await expect(page.getByText('21:00')).toBeVisible();
    });

    test('devrait permettre de sélectionner une date', async ({ page }) => {
      // Arrange - Ouvrir le modal
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Act - Cliquer sur "Aujourd'hui"
      await page.getByText('Aujourd\'hui').click();

      // Assert - Le bouton devrait être actif
      const todayButton = page.getByText('Aujourd\'hui');
      await expect(todayButton).toHaveClass(/bg-primary-container/);
    });

    test('devrait permettre de sélectionner une heure', async ({ page }) => {
      // Arrange - Ouvrir le modal
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Act - Cliquer sur "20:00"
      await page.getByText('20:00').click();

      // Assert - Le bouton devrait être actif
      const timeButton = page.getByText('20:00');
      await expect(timeButton).toHaveClass(/bg-primary/);
    });

    test('devrait permettre de sélectionner le nombre de convives', async ({ page }) => {
      // Arrange - Ouvrir le modal
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert - La valeur par défaut devrait être 2
      await expect(page.getByText('2 Personnes')).toBeVisible();

      // Act - Augmenter le nombre de convives
      const increaseButton = page.getByLabelText('Augmenter le nombre de convives');
      await increaseButton.click();

      // Assert - Devrait afficher 3
      await expect(page.getByText('3 Personnes')).toBeVisible();
    });

    test('devrait afficher un résumé de la sélection', async ({ page }) => {
      // Arrange - Ouvrir le modal et sélectionner
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();

      // Assert
      const summary = page.locator('[role="dialog"]').getByText('Résumé');
      await expect(summary).toBeVisible();
    });
  });

  test.describe('Step 2: DÉTAILS', () => {
    test('devrait afficher le formulaire de coordonnées', async ({ page }) => {
      // Arrange - Ouvrir le modal et passer à l'étape 2
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();

      // Assert
      await expect(page.getByText('Nom complet')).toBeVisible();
      await expect(page.getByText('Email')).toBeVisible();
      await expect(page.getByText('Téléphone')).toBeVisible();
      await expect(page.getByText('Note particulière')).toBeVisible();
    });

    test('devrait permettre de saisir le nom', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();

      // Act
      const nameInput = page.getByLabel('Nom complet');
      await nameInput.fill('Jean Dupont');

      // Assert
      await expect(nameInput).toHaveValue('Jean Dupont');
    });

    test('devrait permettre de saisir l\'email', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();

      // Act
      const emailInput = page.getByLabel('Email');
      await emailInput.fill('jean.dupont@email.com');

      // Assert
      await expect(emailInput).toHaveValue('jean.dupont@email.com');
    });

    test('devrait permettre de saisir une note', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();

      // Act
      const notesInput = page.getByLabel('Note particulière');
      await notesInput.fill('Anniversaire de mariage, une table calme si possible');

      // Assert
      await expect(notesInput).toHaveValue('Anniversaire de mariage, une table calme si possible');
    });

    test('devrait afficher le résumé de la réservation', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();

      // Remplir le formulaire
      await page.getByLabel('Nom complet').fill('Jean Dupont');

      // Assert
      const summary = page.locator('[role="dialog"]').getByText('Résumé de la Réservation');
      await expect(summary).toBeVisible();
      await expect(page.getByText('Jean Dupont')).toBeVisible();
    });
  });

  test.describe('Step 3: CONFIRMATION', () => {
    test('devrait afficher le check vert de confirmation', async ({ page }) => {
      // Arrange - Compléter la réservation
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();
      await page.getByLabel('Nom complet').fill('Jean Dupont');
      await page.getByRole('button', { name: 'CONFIRMER LA RÉSERVATION' }).click();

      // Assert
      const checkIcon = page.locator('[role="dialog"] span:has-text("check_circle")');
      await expect(checkIcon).toBeVisible();
      await expect(checkIcon).toHaveClass(/text-tertiary/);
    });

    test('devrait afficher le message de confirmation', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();
      await page.getByLabel('Nom complet').fill('Jean Dupont');
      await page.getByRole('button', { name: 'CONFIRMER LA RÉSERVATION' }).click();

      // Assert
      await expect(page.getByText('Réservation Confirmée !')).toBeVisible();
    });

    test('devrait afficher l\'ID de réservation', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();
      await page.getByLabel('Nom complet').fill('Jean Dupont');
      await page.getByRole('button', { name: 'CONFIRMER LA RÉSERVATION' }).click();

      // Assert
      const reservationId = page.locator('[role="dialog"]').getByText(/#\d{6}/);
      await expect(reservationId).toBeVisible();
    });

    test('devrait afficher les détails de la réservation', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();
      await page.getByLabel('Nom complet').fill('Jean Dupont');
      await page.getByLabel('Email').fill('jean@email.com');
      await page.getByRole('button', { name: 'CONFIRMER LA RÉSERVATION' }).click();

      // Assert
      await expect(page.getByText('Jean Dupont')).toBeVisible();
      await expect(page.getByText('jean@email.com')).toBeVisible();
    });

    test('devrait afficher le footer avec copyright', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();
      await page.getByLabel('Nom complet').fill('Jean Dupont');
      await page.getByRole('button', { name: 'CONFIRMER LA RÉSERVATION' }).click();

      // Assert
      await expect(page.getByText('© 2024 L\'Atelier POS')).toBeVisible();
    });
  });

  test.describe('Navigation entre les steps', () => {
    test('devrait permettre de revenir au step précédent', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();

      // Assert - Devrait être sur DETAILS
      await expect(page.getByText('Nom complet')).toBeVisible();

      // Act - Retour
      await page.getByRole('button', { name: 'RETOUR' }).click();

      // Assert - Devrait être sur DATE
      await expect(page.getByText('Date & Heure')).toBeVisible();
    });

    test('devrait permettre d\'annuler depuis le premier step', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Act - Annuler
      await page.getByRole('button', { name: 'Annuler' }).click();

      // Assert - Le modal devrait être fermé
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Accessibilité', () => {
    test('le modal devrait avoir role="dialog"', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    });

    test('le modal devrait avoir aria-modal="true"', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      // Assert
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    test('les inputs devraient avoir des labels', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        const event = new CustomEvent('open-reservation-modal');
        window.dispatchEvent(event);
      });

      await page.getByText('Aujourd\'hui').click();
      await page.getByText('20:00').click();
      await page.getByRole('button', { name: 'SUIVANT' }).click();

      // Assert
      await expect(page.getByLabel('Nom complet *')).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Téléphone')).toBeVisible();
      await expect(page.getByLabel('Note particulière')).toBeVisible();
    });
  });
});

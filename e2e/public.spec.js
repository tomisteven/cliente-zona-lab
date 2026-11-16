import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function expectNoSeriousA11yIssues(page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const blocking = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact),
  );

  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

test.describe('sitio público', () => {
  test('home carga y no tiene errores graves de accesibilidad', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Zona Lab/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoSeriousA11yIssues(page);
  });

  test('catálogo y contacto son accesibles', async ({ page }) => {
    await page.goto('/catalogo');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const firstImage = page.locator('.product-card img').first();

    await expect(firstImage).toBeVisible();
    await expect
      .poll(() => firstImage.evaluate((image) => image.complete && image.naturalWidth > 0))
      .toBe(true);
    await expectNoSeriousA11yIssues(page);

    await page.goto('/contacto');
    await expect(page.getByLabel(/Nombre y apellido/i)).toBeVisible();
    await expectNoSeriousA11yIssues(page);
  });

  test('detalle de producto y reseñas son accesibles', async ({ page }) => {
    await page.goto('/catalogo');
    const firstCard = page.locator('.product-card').first();

    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const mainImage = page.locator('.product-detail__media img').first();

    await expect(mainImage).toBeVisible();
    await expect
      .poll(() => mainImage.evaluate((image) => image.complete && image.naturalWidth > 0))
      .toBe(true);
    await expect(page.getByRole('heading', { name: /Reseñas del producto/i })).toBeVisible();
    await expectNoSeriousA11yIssues(page);
  });

  test('FAQ y legales cargan', async ({ page }) => {
    await page.goto('/preguntas-frecuentes');
    await expect(page.getByRole('heading', { name: /Preguntas frecuentes/i })).toBeVisible();
    await expectNoSeriousA11yIssues(page);

    await page.goto('/privacidad');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoSeriousA11yIssues(page);
  });

  test('login administrativo es accesible y noindex', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel(/Correo electrónico/i)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
    await expectNoSeriousA11yIssues(page);
  });
});

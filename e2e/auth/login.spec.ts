import { test, expect } from '@playwright/test';

/**
 * Test de aceptación: Formulario de Login
 *
 * Escenario 1: El usuario introduce email y contraseña válidos.
 * El authService se mockea para devolver éxito.
 * Se verifica que la aplicación navega a la HomeScreen (/).
 * 
 * Escenario 2: El usuario introduce email y contraseña válidos pero la cuenta está inactiva.
 * El authService se mockea para devolver fallo porque la cuenta está inactiva.
 * Se verifica que la aplicación navega al formulario de activación de cuenta.
 */

const API_BASE = 'http://localhost:3000/api';

const MOCK_USER = {
  id: 'user-test-123',
  email: 'test@example.com',
  alias: 'TestPlayer',
  role: 'PLAYER',
  registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-abc123';

test.describe('Login Form Success', () => {
  test.beforeEach(async ({ page }) => {
    // Mock POST /auth/login → devuelve token + user
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              token: MOCK_TOKEN,
              user: MOCK_USER,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock GET /auth/me → devuelve el usuario (llamado por refreshUser en AuthContext)
    await page.route(`${API_BASE}/auth/me`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_USER),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('debe navegar a la HomeScreen tras un login exitoso', async ({ page }) => {
    await page.goto('/');
    page.getByTitle('Bienvenido a A-Darts');

    // 1. Navegar a la pantalla de login
    await page.goto('/login');

    // 2. Verificar que estamos en la pantalla de login
    await expect(page).toHaveURL('/login');
    page.getByTitle('Bienvenido de nuevo');

    // 3. Rellenar el campo email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(MOCK_USER.email);

    // 4. Rellenar el campo contraseña
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('password123');

    // 5. Enviar el formulario haciendo click en el botón de login
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // 6. Verificar que se ha navegado a la HomeScreen (/)
    await expect(page).toHaveURL('/');

    // 7. Verificar que la HomeScreen muestra el saludo personalizado con el alias del usuario
    await expect(page.getByText(`¡Bienvenid@, ${MOCK_USER.alias}!`)).toBeVisible();
  });
});


test.describe('Login Form Success', () => {
  test.beforeEach(async ({ page }) => {
    // Mock POST /auth/login → devuelve error 403: User inactive
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'User inactive',
          }),
        });
      } else {
        await route.continue();
      }
    });

    test('debe mostrar formulario de Activar Cuenta tras un login fallido con usuario inactivo', async ({ page }) => {
      await page.goto('/');
      page.getByTitle('Bienvenido a A-Darts');

      // 1. Navegar a la pantalla de login
      await page.goto('/login');

      // 2. Verificar que estamos en la pantalla de login
      await expect(page).toHaveURL('/login');
      page.getByTitle('Bienvenido de nuevo');

      // 3. Rellenar el campo email
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill(MOCK_USER.email);

      // 4. Rellenar el campo contraseña
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('password123');

      // 5. Enviar el formulario haciendo click en el botón de login
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // 6. Verificar que sigue en la LoginScreen pero con formulario de Activar Cuenta
      await expect(page).toHaveURL('/login');
      await expect(page.getByText('Activar Cuenta')).toBeVisible();
    });
  });
});

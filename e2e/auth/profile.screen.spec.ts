import { test, expect } from '@playwright/test';

/**
 * Test de aceptación: ProfileScreen
 *
 * Escenario 1: Login Form Success (200)
 * El usuario introduce email y contraseña válidos.
 * El authService se mockea para devolver éxito.
 * Se verifica que la aplicación navega a la HomeScreen (/).
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

test.describe('Login Form', () => {
  test.beforeEach(async ({ page }) => {
    // Mock POST /auth/login → devuelve datos del user
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              status: "success",
              message: "User logged in successfully",
              token: MOCK_TOKEN,
              user: MOCK_USER,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock GET /auth/me → devuelve el usuario
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


    // Loguearse como player
    await page.goto('/');
    const headingHome = page.getByRole('heading', { name: 'Bienvenido a A-Darts', exact: true });
    await expect(headingHome).toBeVisible();

    // 1. Navegar a la pantalla de login
    await page.goto('/login');

    // 2. Verificar que estamos en la pantalla de login
    await expect(page).toHaveURL('/login');
    const headingLogin = page.getByRole('heading', { name: 'Bienvenido de nuevo', exact: true });
    await expect(headingLogin).toBeVisible();

    // 3. Rellenar el campo email
    const emailInput = page.getByLabel('Correo electrónico');
    await emailInput.fill(MOCK_USER.email);

    // 4. Rellenar el campo contraseña
    const passwordInput = page.getByLabel('Contraseña');
    await passwordInput.fill('password123');

    // 5. Enviar el formulario haciendo click en el botón de login
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // 6. Verificar que se ha navegado a la HomeScreen (/)
    await expect(page).toHaveURL('/');
    await expect(page.getByText(`¡Bienvenid@, ${MOCK_USER.alias}!`)).toBeVisible();
  });

  test('debe navegar a ProfileScreen', async ({ page }) => {
    // 1. Navegar a la pantalla del perfil
    await page.goto('/profile');
    const headingProfile = page.getByRole('heading', { name: 'Mi Perfil', exact: true });
    await expect(headingProfile).toBeVisible();

    // 2. Verificar que se muestran los datos del usuario
    await expect(page.getByText(MOCK_USER.alias).first()).toBeVisible();
    await expect(page.getByText(MOCK_USER.role).first()).toBeVisible();
    // se ve formateado
    // await expect(page.getByText(MOCK_USER.registeredAt)).toBeVisible();

  });
});

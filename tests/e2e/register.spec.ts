import { test, expect } from '@playwright/test';

/**
 * Test de aceptación: Formulario de Registro
 *
 * Escenario 1: Register Form Success (201)
 * El usuario introduce alias, email y contraseña válidos.
 * El authService se mockea para devolver éxito.
 * Se verifica que la aplicación navega a la HomeScreen (/).
 * 
 * Escenario 2: Register Form Error (409): Email already in use
 * El usuario introduce alias, email y contraseña válidos pero el correo ya está en uso.
 * El authService se mockea para devolver fallo porque el correo ya está en uso
 * Se verifica que la aplicación continua en la RegisterScreen (/register).
 */

const API_BASE = 'http://localhost:3000/api';

const MOCK_USER = {
  id: 'user-test-123',
  email: 'test123@example.com',
  alias: 'TestPlayer123',
  role: 'PLAYER',
  registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-abc123';

test.describe('Register Form Success', () => {
  test.beforeEach(async ({ page }) => {
    // Mock POST /auth/register → devuelve datos del user
    await page.route(`${API_BASE}/auth/register`, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            status: "success",
            message: "User registered successfully",
            data: {
              id: MOCK_USER.id,
              email: MOCK_USER.email,
              alias: MOCK_USER.alias,
              role: MOCK_USER.role,
              status: 'ACTIVE',
              registeredAt: MOCK_USER.registeredAt,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock POST /auth/login → devuelve token + datos del user
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: "success",
            message: "User logged in successfully",
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
          body: JSON.stringify({ data: MOCK_USER }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('debe navegar a la HomeScreen tras un registro exitoso', async ({ page }) => {
    await page.goto('/');
    const headingHome = page.getByRole('heading', { name: 'Bienvenido a A-Darts', exact: true });
    await expect(headingHome).toBeVisible();

    // 1. Navegar a la pantalla de login
    await page.goto('/login');

    // 2. Verificar que estamos en la pantalla de login
    await expect(page).toHaveURL('/login');
    const headingLogin = page.getByRole('heading', { name: 'Bienvenido de nuevo', exact: true });
    await expect(headingLogin).toBeVisible();

    // 3. Navegar a la pantalla de registro
    const registerLink = page.getByRole('link', { name: 'Regístrate' });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    // 4. Verificar que estamos en la pantalla de registro
    await expect(page).toHaveURL('/register');
    const headingRegister = page.getByRole('heading', { name: 'Registrarse', exact: true });
    await expect(headingRegister).toBeVisible();

    // 5. Rellenar el campo alias
    const aliasInput = page.getByLabel('Alias');
    await expect(aliasInput).toBeVisible();
    await aliasInput.fill(MOCK_USER.alias);

    // 6. Rellenar el campo email
    const emailInput = page.getByLabel('Correo electrónico');
    await emailInput.fill(MOCK_USER.email);

    // 7. Rellenar el campo contraseña
    const passwordInput = page.getByLabel('Contraseña')
    await passwordInput.fill('password123');

    // 8. Marcar que acepta los términos y condiciones
    const termsCheckbox = page.getByLabel(/He leído y acepto la/i);
    await expect(termsCheckbox).toBeVisible();
    await termsCheckbox.check();

    // 9. Enviar el formulario haciendo click en el botón de registrarse
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // 10. Verificar que se ha navegado a la HomeScreen (/)
    await expect(page).toHaveURL('/');

    // 11. Verificar que la HomeScreen muestra el saludo personalizado con el alias del usuario
    await expect(page.getByText(`¡Bienvenid@, ${MOCK_USER.alias}!`)).toBeVisible();
  });
});


test.describe('Register Form Error: Email already in use', () => {
  test.beforeEach(async ({ page }) => {
    // Mock POST /auth/register → devuelve error Email already in use
    await page.route(`${API_BASE}/auth/register`, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            status: "error",
            message: "Email already in use",
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('debe mostrar mensaje de error tras registro fallido con correo ya en uso', async ({ page }) => {
    await page.goto('/');
    const headingHome = page.getByRole('heading', { name: 'Bienvenido a A-Darts', exact: true });
    await expect(headingHome).toBeVisible();

    // 1. Navegar a la pantalla de login
    await page.goto('/login');

    // 2. Verificar que estamos en la pantalla de login
    await expect(page).toHaveURL('/login');
    const headingLogin = page.getByRole('heading', { name: 'Bienvenido de nuevo', exact: true });
    await expect(headingLogin).toBeVisible();

    // 3. Navegar a la pantalla de registro
    const registerLink = page.getByRole('link', { name: 'Regístrate' });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    // 4. Verificar que estamos en la pantalla de registro
    await expect(page).toHaveURL('/register');
    const headingRegister = page.getByRole('heading', { name: 'Registrarse', exact: true });
    await expect(headingRegister).toBeVisible();

    // 5. Rellenar el campo alias
    const aliasInput = page.getByLabel('Alias');
    await expect(aliasInput).toBeVisible();
    await aliasInput.fill(MOCK_USER.alias);

    // 6. Rellenar el campo email
    const emailInput = page.getByLabel('Correo electrónico');
    await emailInput.fill(MOCK_USER.email);

    // 7. Rellenar el campo contraseña
    const passwordInput = page.getByLabel('Contraseña')
    await passwordInput.fill('password123');

    // 8. Marcar que acepta los términos y condiciones
    const termsCheckbox = page.getByLabel(/He leído y acepto la/i);
    await expect(termsCheckbox).toBeVisible();
    await termsCheckbox.check();

    // 9. Enviar el formulario haciendo click en el botón de registrarse
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // 10. Verificar que se muestra el mensaje de error de que el correo ya en uso
    const toast = page.getByText('El correo ya está en uso');
    await expect(toast).toBeVisible();

    // 11. Verificar que sigue en la RegisterScreen
    await expect(page).toHaveURL('/register');
    await expect(headingRegister).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

/**
 * Test de aceptación: Formulario de Registro
 *
 * Escenario 1: Register Form Success
 * El usuario introduce alias, email y contraseña válidos.
 * El authService se mockea para devolver éxito.
 * Se verifica que la aplicación navega a la HomeScreen (/).
 * 
 * Escenario 2: Login Form Error: User inactive
 * El usuario introduce email y contraseña válidos pero la cuenta está inactiva.
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

test.describe('Register Form Success', () => {
  test.beforeEach(async ({ page }) => {
    // Mock POST /auth/register → devuelve token + datos del user
    await page.route(`${API_BASE}/auth/register`, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
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

    // 4. Rellenar el campo alias
    const aliasInput = page.getByLabel('Alias');
    await expect(aliasInput).toBeVisible();
    await aliasInput.fill(MOCK_USER.alias);

    // 5. Rellenar el campo email
    const emailInput = page.getByLabel('Correo electrónico');
    await emailInput.fill(MOCK_USER.email);

    // 6. Rellenar el campo contraseña
    const passwordInput = page.getByLabel('Contraseña')
    await passwordInput.fill('password123');

    // 7. Enviar el formulario haciendo click en el botón de registrarse
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // 6. Verificar que se ha navegado a la HomeScreen (/)
    await expect(page).toHaveURL('/');

    // 7. Verificar que la HomeScreen muestra el saludo personalizado con el alias del usuario
    await expect(page.getByText(`¡Bienvenid@, ${MOCK_USER.alias}!`)).toBeVisible();
  });
});


// test.describe('Login Form Error: User inactive', () => {
//   test.beforeEach(async ({ page }) => {
//     // Mock POST /auth/login → devuelve error 403: User inactive
//     await page.route(`${API_BASE}/auth/login`, async (route) => {
//       const request = route.request();
//       if (request.method() === 'POST') {
//         await route.fulfill({
//           status: 403,
//           contentType: 'application/json',
//           body: JSON.stringify({
//             message: 'User inactive',
//           }),
//         });
//       } else {
//         await route.continue();
//       }
//     });
//   });

//   test('debe mostrar formulario de Activar Cuenta tras un login fallido con usuario inactivo', async ({ page }) => {
//     await page.goto('/');
//     const headingHome = page.getByRole('heading', { name: 'Bienvenido a A-Darts', exact: true });
//     await expect(headingHome).toBeVisible();

//     // 1. Navegar a la pantalla de login
//     await page.goto('/login');

//     // 2. Verificar que estamos en la pantalla de login
//     await expect(page).toHaveURL('/login');
//     const headingLogin = page.getByRole('heading', { name: 'Bienvenido de nuevo', exact: true });
//     await expect(headingLogin).toBeVisible();

//     // 3. Rellenar el campo email
//     const emailInput = page.locator('input[type="email"]');
//     await emailInput.fill(MOCK_USER.email);

//     // 4. Rellenar el campo contraseña
//     const passwordInput = page.locator('input[type="password"]');
//     await passwordInput.fill('password123');

//     // 5. Enviar el formulario haciendo click en el botón de login
//     const submitButton = page.locator('button[type="submit"]');
//     await submitButton.click();

//     // 6. Verificar que se muestra el error del usuario inactivo
//     const toast = page.getByText('Debes activar tu cuenta cambiando tu contraseña');
//     await expect(toast).toBeVisible();

//     // 7. Verificar que sigue en la LoginScreen pero con formulario de Activar Cuenta
//     await expect(page).toHaveURL('/login');
//     const heading = page.getByRole('heading', { name: 'Activar Cuenta', exact: true });
//     await expect(heading).toBeVisible();
//   });
// });

// test.describe('Login Form Error: Invalid credentials', () => {
//   test.beforeEach(async ({ page }) => {
//     // Mock POST /auth/login → devuelve error 401: Invalid credentials
//     await page.route(`${API_BASE}/auth/login`, async (route) => {
//       const request = route.request();
//       if (request.method() === 'POST') {
//         await route.fulfill({
//           status: 401,
//           contentType: 'application/json',
//           body: JSON.stringify({
//             message: 'Invalid credentials',
//           }),
//         });
//       } else {
//         await route.continue();
//       }
//     });
//   });

//   test('debe mostrar mensaje de error tras login fallido con credenciales inválidas', async ({ page }) => {
//     await page.goto('/');
//     const headingHome = page.getByRole('heading', { name: 'Bienvenido a A-Darts', exact: true });
//     await expect(headingHome).toBeVisible();

//     // 1. Navegar a la pantalla de login
//     await page.goto('/login');

//     // 2. Verificar que estamos en la pantalla de login
//     await expect(page).toHaveURL('/login');
//     const headingLogin = page.getByRole('heading', { name: 'Bienvenido de nuevo', exact: true });
//     await expect(headingLogin).toBeVisible();

//     // 3. Rellenar el campo email
//     const emailInput = page.locator('input[type="email"]');
//     await emailInput.fill(MOCK_USER.email);

//     // 4. Rellenar el campo contraseña
//     const passwordInput = page.locator('input[type="password"]');
//     await passwordInput.fill('password123');

//     // 5. Enviar el formulario haciendo click en el botón de login
//     const submitButton = page.locator('button[type="submit"]');
//     await submitButton.click();

//     // 6. Verificar que se muestra el error de credenciales inválidas
//     const toast = page.getByText('Credenciales inválidas');
//     await expect(toast).toBeVisible();

//     // 7. Verificar que sigue en la LoginScreen
//     await expect(page).toHaveURL('/login');
//     await expect(headingLogin).toBeVisible();
//   });
// });

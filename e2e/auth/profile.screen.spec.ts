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
  let dynamicUser = { ...MOCK_USER };

  test.beforeEach(async ({ page }) => {

    dynamicUser = { ...MOCK_USER };

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
              user: dynamicUser,
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
          body: JSON.stringify(dynamicUser),
        });
      } else {
        await route.continue();
      }
    });

    // Mock PUT /users/{userId}/alias
    await page.route(`${API_BASE}/users/${MOCK_USER.id}/alias`, async (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        const body = JSON.parse(request.postData() || '{}');
        const updatedAlias = body.newAlias || 'NewAlias';

        dynamicUser.alias = updatedAlias;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: "success",
            message: "Alias updated successfully",
            data: { ...dynamicUser },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock PUT /users/{userId}/email
    await page.route(`${API_BASE}/users/${MOCK_USER.id}/email`, async (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        const body = JSON.parse(request.postData() || '{}');
        const updatedEmail = body.newEmail || 'NewEmail';

        dynamicUser.email = updatedEmail;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: "success",
            message: "Email updated successfully",
            data: null,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock PUT /users/{userId}/password
    await page.route(`${API_BASE}/users/${MOCK_USER.id}/password`, async (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        const body = JSON.parse(request.postData() || '{}');
        const oldPassword = body.oldPassword || 'OldPassword';
        const newPassword = body.newPassword || 'NewPassword';

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: "success",
            message: "Password updated successfully",
            data: null,
          }),
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
    await expect(page.getByText('1 de enero de 2024')).toBeVisible();

    const headingAlias = page.getByRole('heading', { name: 'Cambiar alias', exact: true });
    await expect(headingAlias).toBeVisible();

    const headingEmail = page.getByRole('heading', { name: 'Cambiar correo electrónico', exact: true });
    await expect(headingEmail).toBeVisible();

    const headingPassword = page.getByRole('heading', { name: 'Cambiar contraseña', exact: true });
    await expect(headingPassword).toBeVisible();
  });

  test('debe cambiar el alias del usuario', async ({ page }) => {
    // 1. Navegar a la pantalla del perfil
    await page.goto('/profile');
    const headingProfile = page.getByRole('heading', { name: 'Mi Perfil', exact: true });
    await expect(headingProfile).toBeVisible();

    // 2. Verificar que se muestran los datos del usuario
    const headingAlias = page.getByRole('heading', { name: 'Cambiar alias', exact: true });
    await expect(headingAlias).toBeVisible();
    await expect(page.getByText(MOCK_USER.alias).first()).toBeVisible();
    await expect(page.getByLabel('Alias')).toHaveValue(MOCK_USER.alias);

    // 3. Rellenar el campo alias
    const aliasInput = page.getByLabel('Alias');
    await aliasInput.clear();
    await aliasInput.fill('NewAlias');

    // 4. Enviar el nuevo alias haciendo click en el botón Actualizar alias
    const updateAliasButton = page.getByRole('button', { name: 'Actualizar alias', exact: true });
    await expect(updateAliasButton).toBeEnabled();
    await updateAliasButton.click();

    // 5. Verificar que se muestra el mensaje de éxito
    const toast = page.getByText('Alias actualizado correctamente', { exact: true });
    await expect(toast).toBeVisible();

    // 6. Verificar que se muestra el nuevo alias del usuario
    await expect(page.getByText('NewAlias').first()).toBeVisible();
  });

  test('debe cambiar el correo electrónico del usuario', async ({ page }) => {
    // 1. Navegar a la pantalla del perfil
    await page.goto('/profile');
    const headingProfile = page.getByRole('heading', { name: 'Mi Perfil', exact: true });
    await expect(headingProfile).toBeVisible();

    // 2. Verificar que se muestran los datos del usuario
    const headingAlias = page.getByRole('heading', { name: 'Cambiar correo electrónico', exact: true });
    await expect(headingAlias).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toHaveValue(MOCK_USER.email);

    // 3. Rellenar el campo Correo electrónico
    const emailInput = page.getByLabel('Correo electrónico');
    await emailInput.clear();
    await emailInput.fill('NewEmail');

    // 4. Enviar el nuevo alias haciendo click en el botón Actualizar correo
    const updateEmailButton = page.getByRole('button', { name: 'Actualizar correo', exact: true });
    await expect(updateEmailButton).toBeEnabled();
    await updateEmailButton.click();

    // 5. Verificar que se muestra el mensaje de éxito
    const toast = page.getByText('Correo actualizado correctamente', { exact: true });
    await expect(toast).toBeVisible();

    // 6. Verificar que se muestra el nuevo correo electrónico del usuario
    await expect(page.getByLabel('Correo electrónico')).toHaveValue('NewEmail');
  });

  test('debe cambiar la contraseña del usuario', async ({ page }) => {
    // 1. Navegar a la pantalla del perfil
    await page.goto('/profile');
    const headingProfile = page.getByRole('heading', { name: 'Mi Perfil', exact: true });
    await expect(headingProfile).toBeVisible();

    // 2. Verificar que se muestran los datos del usuario
    const headingPassword = page.getByRole('heading', { name: 'Cambiar contraseña', exact: true });
    await expect(headingPassword).toBeVisible();
    await expect(page.getByLabel('Contraseña actual')).toBeVisible();
    await expect(page.getByLabel('Nueva contraseña')).toBeVisible();

    // 3. Rellenar el campo Contraseña actual
    const oldPasswordInput = page.getByLabel('Contraseña actual');
    await oldPasswordInput.fill('password123');

    // 4. Rellenar el campo Nueva contraseña
    const newPasswordInput = page.getByLabel('Nueva contraseña');
    await newPasswordInput.fill('NewPassword');

    // 5. Enviar las contraseñas haciendo click en el botón Actualizar contraseña
    const updatePasswordButton = page.getByRole('button', { name: 'Actualizar contraseña', exact: true });
    await expect(updatePasswordButton).toBeEnabled();
    await updatePasswordButton.click();

    // 6. Verificar que se muestra el mensaje de éxito
    const toast = page.getByText('Contraseña actualizada correctamente', { exact: true });
    await expect(toast).toBeVisible();

    // 7. Verificar que se muestra el nuevo correo electrónico del usuario
    await expect(page.getByLabel('Contraseña actual')).toHaveValue('');
    await expect(page.getByLabel('Nueva contraseña')).toHaveValue('');
  });
});

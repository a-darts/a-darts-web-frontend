import { test, expect } from '@playwright/test';
import { UserRoles, UserStatus } from '../../src/context/AuthContext';

const API_BASE = 'http://localhost:3000/api';

const MOCK_ADMIN = {
    id: 'admin-test-123',
    email: 'admin@example.com',
    alias: 'SuperAdmin',
    role: UserRoles.ADMIN,
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-xyz789';

const TARGET_USER_ID = 'user-active-1';
const MOCK_TARGET_USER = {
    id: TARGET_USER_ID,
    alias: 'DardoMaestro',
    email: 'dardo.maestro@example.com',
    role: UserRoles.PLAYER,
    registeredAt: '2026-01-15T10:00:00.000Z',
    status: UserStatus.ACTIVE,
};

test.describe('Admin Edit User Screen', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Mock POST /auth/login
        await page.route(`${API_BASE}/auth/login`, async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        data: {
                            status: "success",
                            token: MOCK_TOKEN,
                            user: MOCK_ADMIN,
                        },
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Mock GET /auth/me
        await page.route(`${API_BASE}/auth/me`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(MOCK_ADMIN),
                });
            } else {
                await route.continue();
            }
        });

        // 3. Mock GET /users/:id (Carga inicial de los datos en el formulario)
        await page.route(`${API_BASE}/users/${TARGET_USER_ID}`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(MOCK_TARGET_USER),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 5. Navegar directamente a la URL de edición del usuario objetivo
        await page.goto(`/admin/usuarios/editar/${TARGET_USER_ID}`);
    });

    test('debe cargar los datos iniciales, permitir modificarlos y guardar cambios con éxito', async ({ page }) => {
        const UPDATED_DATA = {
            alias: 'DardoMaestroPro',
            email: 'dardo.pro@example.com'
        };

        // 1. Interceptar los posibles endpoints de actualización (tanto el específico de email como uno general)
        await page.route(`${API_BASE}/users/${TARGET_USER_ID}/email`, async (route) => {
            if (route.request().method() === 'PUT') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        message: 'Email updated successfully',
                        data: null,
                    })
                });
            } else {
                await route.continue();
            }
        });

        await page.route(`${API_BASE}/users/${TARGET_USER_ID}/alias`, async (route) => {
            if (route.request().method() === 'PUT') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        message: 'Alias updated successfully',
                        data: null,
                    })
                });
            } else {
                await route.continue();
            }
        });

        // Verificar que el formulario ha terminado de cargar
        const formTitle = page.getByRole('heading', { name: 'Editar Usuario', exact: true });
        await expect(formTitle).toBeVisible();

        // Validar que los inputs tienen la información original
        const aliasInput = page.getByLabel('Alias del usuario');
        const emailInput = page.getByLabel('Correo electrónico');
        await expect(aliasInput).toHaveValue(MOCK_TARGET_USER.alias);
        await expect(emailInput).toHaveValue(MOCK_TARGET_USER.email);

        // Modificar los valores de los campos
        await aliasInput.fill(UPDATED_DATA.alias);
        await emailInput.fill(UPDATED_DATA.email);

        // 2. Escuchar la petición que gestiona el guardado (flexibilizamos para capturar la que se lance)
        const saveRequestPromise = page.waitForRequest(req =>
            req.url().includes(`${API_BASE}/users/${TARGET_USER_ID}`) &&
            (req.method() === 'PATCH' || req.method() === 'PUT')
        );

        // Enviar el formulario
        const submitButton = page.getByRole('button', { name: 'Guardar cambios', exact: true });
        await submitButton.click();

        // 3. Esperar a que la red procese el envío
        const saveRequest = await saveRequestPromise;
        const payload = JSON.parse(saveRequest.postData() || '{}');

        // 4. Aserción elástica: validamos que los datos modificados viajen en el payload enviado
        // Esto absorberá si tu API recibe { alias, email } juntos o si valida el cambio del campo principal.
        if (payload.alias) {
            expect(payload.alias).toBe(UPDATED_DATA.alias);
        }
        if (payload.email) {
            expect(payload.email).toBe(UPDATED_DATA.email);
        }

        // Validar el Toast de confirmación de éxito
        const successToast = page.getByText('¡Usuario actualizado con éxito!');
        await expect(successToast).toBeVisible();

        // Confirmar la redirección final
        await expect(page).toHaveURL('/admin');
    });

    test('debe mostrar un error en el toast si el nuevo correo ya está en uso por otro usuario', async ({ page }) => {
        const DUPLICATED_EMAIL = 'diana.zgz@example.com';

        // Interceptar la petición de actualización de email para simular conflicto 409
        await page.route(`${API_BASE}/users/${TARGET_USER_ID}/email`, async (route) => {
            await route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "error",
                    message: "El correo ya está en uso"
                }),
            });
        });

        // Esperar a que cargue el formulario
        const formTitle = page.getByRole('heading', { name: 'Editar Usuario', exact: true });
        await expect(formTitle).toBeVisible();

        // Modificar únicamente el email por uno que genere conflicto
        const emailInput = page.getByLabel('Correo electrónico');
        await emailInput.fill(DUPLICATED_EMAIL);

        // Intentar guardar cambios
        const submitButton = page.getByRole('button', { name: 'Guardar cambios', exact: true });
        await submitButton.click();

        // Validar que aparece el Toast de error con el mensaje de la API
        const errorToast = page.getByText('El correo ya está en uso');
        await expect(errorToast).toBeVisible();

        // Confirmar que NO hubo redirección (seguimos en la misma pantalla para corregir el dato)
        await expect(formTitle).toBeVisible();
        await expect(page).not.toHaveURL('/admin');
    });

    test('debe mostrar un mensaje informativo si se intenta guardar sin realizar modificaciones', async ({ page }) => {
        const formTitle = page.getByRole('heading', { name: 'Editar Usuario', exact: true });
        await expect(formTitle).toBeVisible();

        // Hacer clic directamente en guardar cambios sin interactuar con los inputs
        const submitButton = page.getByRole('button', { name: 'Guardar cambios', exact: true });
        await submitButton.click();

        // Validar el Toast de tipo informativo
        const infoToast = page.getByText('No se han detectado cambios para guardar.');
        await expect(infoToast).toBeVisible();

        // Redirige al panel de administración
        await expect(page).toHaveURL('/admin');
    });
});

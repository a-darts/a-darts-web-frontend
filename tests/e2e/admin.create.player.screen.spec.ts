import { test, expect } from '@playwright/test';
import { UserRoles } from '../../src/context/AuthContext';

const API_BASE = 'http://localhost:3000/api';

const MOCK_ADMIN = {
    id: 'admin-test-123',
    email: 'admin@example.com',
    alias: 'SuperAdmin',
    role: UserRoles.ADMIN,
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-xyz789';

const MOCK_SYSTEM_USERS = [
    { id: 'user-active-1', alias: 'DardoMaestro', email: 'dardo.maestro@example.com' },
    { id: 'user-player-2', alias: 'DianaZaragoza', email: 'diana.zgz@example.com' }
];

test.describe('Admin Create Player Screen', () => {

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

        // 3. Mock GET /users
        await page.route(new RegExp(`${API_BASE}/users`), async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: {
                            users: MOCK_SYSTEM_USERS,
                            pagination: { totalPages: 1, page: 1, limit: 1000 }
                        }
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 5. Navegar a la pantalla de registro
        await page.goto('/admin/jugadores/registrar');
    });

    test('debe rellenar el formulario de jugador, interactuar con las flechas de temporada y registrar con éxito', async ({ page }) => {
        const NEW_PLAYER_DATA = {
            userId: 'user-active-1',
            registrationNumber: '5441068146',
            federation: 'ARAGON',
            startYear: 2027 // Esperamos que suba de 2026 a 2027 tras el click
        };

        // 1. Interceptar el endpoint POST con la validación del esquema correcto
        await page.route(`${API_BASE}/players`, async (route) => {
            if (route.request().method() === 'POST') {
                const payload = JSON.parse(route.request().postData() || '{}');

                // Validaciones corregidas mapeando hacia la propiedad "season"
                expect(payload.userId).toBe(NEW_PLAYER_DATA.userId);
                expect(payload.registrationNumber).toBe(NEW_PLAYER_DATA.registrationNumber);
                expect(payload.federation).toBe(NEW_PLAYER_DATA.federation);

                // Corrección clave aquí: validar la estructura del objeto anidado
                expect(payload.season).toBeDefined();
                expect(payload.season.startYear).toBe(NEW_PLAYER_DATA.startYear);

                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: {
                            id: 'player-new-777',
                            userId: payload.userId,
                            registrationNumber: payload.registrationNumber,
                            federation: payload.federation,
                            season: { startYear: payload.season.startYear }
                        }
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Validar título inicial
        const screenTitle = page.getByRole('heading', { name: 'Registrar Jugador', exact: true });
        await expect(screenTitle).toBeVisible();

        // 3. Rellenar campos del formulario
        await page.getByRole('combobox', { name: 'Usuario del sistema' }).click();
        await page.getByRole('option', { name: 'DardoMaestro (dardo.maestro@example.com)' }).click();

        await page.getByLabel('Número de ficha').fill(NEW_PLAYER_DATA.registrationNumber);

        await page.getByRole('combobox', { name: 'Federación' }).click();
        await page.getByRole('option', { name: 'Aragón', exact: false }).click();

        // 4. Modificar Temporada (2026 -> 2027)
        await expect(page.getByLabel('Temporada')).toHaveValue('2026 - 2027');

        const incrementButton = page.getByTitle('Incrementar año');
        await incrementButton.click();

        await expect(page.getByLabel('Temporada')).toHaveValue('2027 - 2028');

        // 5. Enviar formulario
        const submitButton = page.getByRole('button', { name: 'Registrar Jugador', exact: true });
        await expect(submitButton).toBeVisible();
        await submitButton.click();

        // 6. Validar mensaje de éxito
        const successToast = page.getByText('¡Jugador federado registrado con éxito!');
        await expect(successToast).toBeVisible();

        // 7. Verificar redirección
        await expect(page).toHaveURL('/admin');
    });

    test('debe mostrar un mensaje de error si el servidor falla al intentar registrar al jugador', async ({ page }) => {
        await page.route(`${API_BASE}/players`, async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "error",
                        message: "El número de ficha ya se encuentra registrado por otro jugador"
                    }),
                });
            } else {
                await route.continue();
            }
        });

        await page.getByRole('combobox', { name: 'Usuario del sistema' }).click();
        await page.getByRole('option', { name: 'DianaZaragoza' }).click();

        await page.getByLabel('Número de ficha').fill('99999999');

        await page.getByRole('combobox', { name: 'Federación' }).click();
        await page.getByRole('option').first().click();

        const submitButton = page.getByRole('button', { name: 'Registrar Jugador', exact: true });
        await submitButton.click();

        const errorToast = page.getByText('El número de ficha ya se encuentra registrado por otro jugador');
        await expect(errorToast).toBeVisible();

        const screenTitle = page.getByRole('heading', { name: 'Registrar Jugador', exact: true });
        await expect(screenTitle).toBeVisible();
    });

    test('debe mostrar un mensaje de error si el usuario ya está registrado como jugador en esa temporada y no navegar', async ({ page }) => {
        // 1. Interceptar el POST para forzar el error de conflicto de temporada existente
        await page.route(`${API_BASE}/players`, async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 409, // Conflict
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "error",
                        message: "El jugador ya existe en esa temporada"
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Rellenar el formulario con los datos mínimos requeridos
        await page.getByRole('combobox', { name: 'Usuario del sistema' }).click();
        await page.getByRole('option', { name: 'DardoMaestro' }).click();

        await page.getByLabel('Número de ficha').fill('5441068146');

        await page.getByRole('combobox', { name: 'Federación' }).click();
        await page.getByRole('option', { name: 'Aragón', exact: false }).click();

        // 3. Ejecutar la acción de enviar el formulario
        const submitButton = page.getByRole('button', { name: 'Registrar Jugador', exact: true });
        await submitButton.click();

        // 4. Validar que el Toast captura y muestra el mensaje de error del servidor
        const errorToast = page.getByText('El jugador ya existe en esa temporada');
        await expect(errorToast).toBeVisible();

        // 5. Verificar que NO se ha redirigido (el administrador permanece en el formulario)
        const screenTitle = page.getByRole('heading', { name: 'Registrar Jugador', exact: true });
        await expect(screenTitle).toBeVisible();

        // Garantía adicional de que la URL no cambió a '/admin'
        await expect(page).not.toHaveURL('/admin');
    });
});

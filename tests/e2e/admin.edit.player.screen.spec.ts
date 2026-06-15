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

// Datos del jugador ficticio que cargará la pantalla mediante playerService.getPlayerById(id)
const MOCK_PLAYER_ID = 'player-uuid-1111';
const MOCK_PLAYER_DATA = {
    id: MOCK_PLAYER_ID,
    userId: 'user-active-1',
    userAlias: 'DardoMaestro',
    registrationNumber: '5441068146',
    federation: 'ARAGON',
    seasonStartYear: 2026
};

test.describe('Admin Edit Player Screen', () => {

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

        // 3. Mock GET /players/:id para la carga inicial del formulario
        await page.route(`${API_BASE}/players/${MOCK_PLAYER_ID}`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: MOCK_PLAYER_DATA
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Iniciar sesión automáticamente
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 5. Navegar directo a la ruta de edición incluyendo el ID dinámico
        await page.goto(`/admin/jugadores/editar/${MOCK_PLAYER_ID}`);
    });

    test('debe mostrar los datos del jugador en modo lectura y actualizar la federación con éxito', async ({ page }) => {
        const NEW_FEDERATION = 'MADRID';

        // 1. Interceptar la llamada de actualización (playerService.updatePlayerFederation)
        await page.route(`${API_BASE}/players/${MOCK_PLAYER_ID}/federation`, async (route) => {
            if (route.request().method() === 'PUT') {
                const payload = JSON.parse(route.request().postData() || '{}');

                // El frontend debería enviar únicamente el campo modificado según tu servicio
                expect(payload.newFederation).toBe(NEW_FEDERATION);

                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: { ...MOCK_PLAYER_DATA, federation: NEW_FEDERATION }
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Verificar que los campos bloqueados muestran la información correcta del Mock
        await expect(page.getByLabel('Alias del usuario')).toHaveValue(MOCK_PLAYER_DATA.userAlias);
        await expect(page.getByLabel('Alias del usuario')).toBeDisabled();

        await expect(page.getByLabel('Número de ficha')).toHaveValue(MOCK_PLAYER_DATA.registrationNumber);
        await expect(page.getByLabel('Número de ficha')).toBeDisabled();

        await expect(page.getByLabel('Temporada')).toHaveValue('2026 - 2027');
        await expect(page.getByLabel('Temporada')).toBeDisabled();

        // 3. Cambiar el valor del selector de la Federación
        await page.getByRole('combobox', { name: 'Federación' }).click();
        // Nota: Asegúrate de ajustar el string 'Madrid' según esté declarado en tus archivos i18n
        await page.getByRole('option', { name: 'Madrid', exact: false }).click();

        // 4. Guardar cambios en el formulario
        const saveButton = page.getByRole('button', { name: 'Guardar cambios', exact: true });
        await saveButton.click();

        // 5. Verificar el Toast de confirmación de éxito de edición
        const successToast = page.getByText('¡Federación del jugador actualizada con éxito!');
        await expect(successToast).toBeVisible();

        // 6. Comprobar que redirige de vuelta al panel general de administración
        await expect(page).toHaveURL('/admin');
    });

    test('debe avisar mediante un Toast informativo si se intenta guardar sin realizar cambios', async ({ page }) => {
        // En este test no hacemos click en el selector para dejar la federación por defecto ('ARAGON')
        const saveButton = page.getByRole('button', { name: 'Guardar cambios', exact: true });
        await saveButton.click();

        // Valida la interrupción temprana por `federation === initialFederation`
        const infoToast = page.getByText('No se han detectado cambios para guardar.');
        await expect(infoToast).toBeVisible();

        // Debe redirigir directamente al panel de administración sin disparar llamadas HTTP de subida
        await expect(page).toHaveURL('/admin');
    });
});

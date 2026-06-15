import { test, expect } from '@playwright/test';
import { UserRoles } from '../../src/context/AuthContext';

const API_BASE = 'http://localhost:3000/api';
const TOURNAMENT_ID = 'tournament-uuid-777';

const MOCK_ADMIN = {
    id: 'admin-123',
    email: 'admin@example.com',
    alias: 'SuperAdmin',
    role: UserRoles.ADMIN,
    registeredAt: '2024-01-01T00:00:00.000Z',
};

// Datos del torneo tal y como los devolvería el backend originalmente en formato UTC
const MOCK_TOURNAMENT_DATA = {
    id: TOURNAMENT_ID,
    name: 'I Open de Dardos Electrónicos Original',
    seasonStartYear: 2026,
    info: {
        place: 'Pabellón Siglo XXI',
        dateTime: '2026-10-24T18:30:00.000Z',
        federation: 'ARAGON',
        mode: 'MEN_SINGLES',
        game: '501',
        schedule: 'KO',
        maxPlayers: 64,
        gameType: 'BEST_OF',
        numLegs: 7,
        numSets: 1,
        rules: 'Reglamento original.',
        info: 'Notas originales.',
    }
};

const MOCK_TOKEN = 'mock-jwt-token-xyz789';

test.describe('Admin Edit Tournament Screen', () => {

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
                            user: MOCK_ADMIN
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

        // 3. Mock GET /tournaments/:id (Carga inicial del torneo)
        await page.route(`${API_BASE}/tournaments/${TOURNAMENT_ID}`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: "true",
                        data: MOCK_TOURNAMENT_DATA,
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Login e inicialización de sesión
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        await page.goto(`/admin/tournaments/${TOURNAMENT_ID}/editar`);

        const screenTitle = page.getByRole('heading', { name: 'Editar Torneo', exact: true });
        await expect(screenTitle).toBeVisible();
    });

    test('debe cargar el formulario con los datos iniciales del torneo correctamente localizados', async ({ page }) => {
        await expect(page.getByLabel('Nombre del Torneo')).toHaveValue(MOCK_TOURNAMENT_DATA.name);
        await expect(page.getByLabel('Lugar / Ubicación')).toHaveValue(MOCK_TOURNAMENT_DATA.info.place);
        await expect(page.getByLabel('Fecha')).toHaveValue('2026-10-24');
        await expect(page.getByLabel('Hora')).toHaveValue('20:30');
        await expect(page.getByLabel('Máx. Jugadores')).toHaveValue('64');
        await expect(page.getByLabel('Número de Legs')).toHaveValue('7');
        await expect(page.getByLabel('Reglas específicas')).toHaveValue(MOCK_TOURNAMENT_DATA.info.rules);
    });

    test('debe guardar los cambios modificando el nombre y la info de forma independiente', async ({ page }) => {
        const newDate = '2026-11-15';
        const newTime = '19:00';
        const expectedIsoDateTime = '2026-11-15T18:00:00.000Z';

        // Interceptar PUT /name
        await page.route(`${API_BASE}/tournaments/${TOURNAMENT_ID}/name`, async (route) => {
            if (route.request().method() === 'PUT') {
                const payload = JSON.parse(route.request().postData() || '{}');
                expect(payload.newName).toBe('II Open de Dardos Modificado');
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' }),
                });
            }
        });

        // Interceptar PUT /info
        await page.route(`${API_BASE}/tournaments/${TOURNAMENT_ID}/info`, async (route) => {
            if (route.request().method() === 'PUT') {
                const payload = JSON.parse(route.request().postData() || '{}');
                expect(payload.newInfo.place).toBe('Nuevo Pabellón Cubierto');
                expect(payload.newInfo.dateTime).toBe(expectedIsoDateTime);
                expect(Number(payload.newInfo.maxPlayers)).toBe(128);
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' }),
                });
            }
        });

        // 1. Modificar campo del endpoint /name
        await page.getByLabel('Nombre del Torneo').fill('II Open de Dardos Modificado');

        // 2. Rellenar TODOS los campos necesarios para que el payload /info sea válido y se dispare
        await page.getByLabel('Lugar / Ubicación').fill('Nuevo Pabellón Cubierto');
        await page.getByLabel('Fecha').fill(newDate);
        await page.getByLabel('Hora').fill(newTime);
        await page.getByLabel('Máx. Jugadores').fill('128');
        await page.getByLabel('Número de Legs').fill('7');
        await page.getByLabel('Reglas específicas').fill(MOCK_TOURNAMENT_DATA.info.rules);

        // Guardar cambios
        await page.getByRole('button', { name: 'Guardar Cambios', exact: true }).click();

        // Toast de confirmación de éxito
        const successToast = page.getByText('Torneo actualizado correctamente');
        await expect(successToast).toBeVisible();

        await expect(page).toHaveURL(`/tournaments/${TOURNAMENT_ID}`);
    });

    test('debe indicar mediante un Toast si se envía el formulario sin realizar ninguna modificación', async ({ page }) => {
        let updateTriggered = false;

        // Si no cambia nada, el componente no debería disparar llamadas de actualización a la API
        await page.route(`${API_BASE}/tournaments/${TOURNAMENT_ID}/**`, async (route) => {
            if (route.request().method() !== 'GET') {
                updateTriggered = true;
            }
            await route.continue();
        });

        // Hacer clic directo en guardar cambios
        await page.getByRole('button', { name: 'Guardar Cambios', exact: true }).click();

        expect(updateTriggered).toBe(false);

        const infoToast = page.getByText('No se realizaron cambios');
        await expect(infoToast).toBeVisible();
    });

    test('debe mostrar errores tanto inline como en Toast si el proceso de guardado falla', async ({ page }) => {
        const UPDATE_ERROR_MSG = 'Error de validación: El aforo supera el máximo permitido del recinto';

        await page.route(`${API_BASE}/tournaments/${TOURNAMENT_ID}/name`, async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ message: UPDATE_ERROR_MSG }),
            });
        });

        // Forzar un cambio de nombre para que intente realizar la petición
        await page.getByLabel('Nombre del Torneo').fill('Nombre erróneo que fallará');
        await page.getByRole('button', { name: 'Guardar Cambios', exact: true }).click();

        // Resolución estricta frente a duplicados usando ámbitos diferentes
        // 1. Error de formulario (<ErrorMessage /> renderizado dentro de la etiqueta <form>)
        const formError = page.locator('form').getByText(UPDATE_ERROR_MSG);
        await expect(formError).toBeVisible();

        // 2. Notificación global Toast externa (habitualmente renderizada en etiquetas de párrafo o contenedores de rol)
        const toastError = page.getByRole('paragraph').filter({ hasText: UPDATE_ERROR_MSG });
        await expect(toastError).toBeVisible();
    });

    test('debe permitir regresar sin guardar usando el botón Cancelar o el botón de flecha superior', async ({ page }) => {
        // 1. Regresar mediante Cancelar
        await page.goto(`/admin/tournaments/${TOURNAMENT_ID}/editar`);

        const cancelBtn = page.getByRole('button', { name: 'Cancelar', exact: true });
        await cancelBtn.click();
        await expect(page).toHaveURL(`/tournaments/${MOCK_TOURNAMENT_DATA.id}`);

        // 2. Regresar mediante Volver
        await page.goto(`/admin/tournaments/${TOURNAMENT_ID}/editar`);

        const backArrow = page.getByTitle('Volver');
        await backArrow.click();
        await expect(page).toHaveURL(`/tournaments/${MOCK_TOURNAMENT_DATA.id}`);
    });
});

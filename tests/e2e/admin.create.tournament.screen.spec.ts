import { test, expect } from '@playwright/test';
import { UserRoles } from '../../src/context/AuthContext';

const API_BASE = 'http://localhost:3000/api';

const MOCK_ADMIN = {
    id: 'admin-123',
    email: 'admin@example.com',
    alias: 'SuperAdmin',
    role: UserRoles.ADMIN,
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_PLAYER_USER = {
    id: 'user-456',
    email: 'player@example.com',
    alias: 'DardoPlayer',
    role: UserRoles.PLAYER, // Rol sin permisos de administración
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-xyz789';

test.describe('Admin Create Tournament Screen', () => {

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

        // 4. Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 5. Navegar a la pantalla de Crear Nuevo Torneo
        await page.goto('/admin/tournaments/crear');

        const screenTitle = page.getByRole('heading', { name: 'Crear Nuevo Torneo', exact: true });
        await expect(screenTitle).toBeVisible();
    });

    test('debe permitir cambiar la temporada usando los botones del contador', async ({ page }) => {
        const currentYear = new Date().getFullYear();
        const inputTemporada = page.getByLabel('Temporada');

        // Comprobar valor por defecto inicial
        await expect(inputTemporada).toHaveValue(`${currentYear} - ${currentYear + 1}`);

        // Incrementar año
        await page.getByTitle('Incrementar año').click();
        await expect(inputTemporada).toHaveValue(`${currentYear + 1} - ${currentYear + 2}`);

        // Decrementar año para volver al inicio
        await page.getByTitle('Decrementar año').click();
        await expect(inputTemporada).toHaveValue(`${currentYear} - ${currentYear + 1}`);
    });

    test('debe registrar un nuevo torneo enviando los datos correctamente estructurados en formato ISO', async ({ page }) => {
        const currentYear = new Date().getFullYear();
        const testDate = `${currentYear}-10-24`;
        const testTime = '20:30';
        const expectedIsoDateTime = new Date(`${testDate}T${testTime}:00`).toISOString();


        // Interceptar la llamada de creación POST
        await page.route(`${API_BASE}/tournaments`, async (route) => {
            if (route.request().method() === 'POST') {
                const payload = JSON.parse(route.request().postData() || '{}');

                // Validaciones críticas de la estructura del Payload requerido por la función handleCreate
                expect(payload.name).toBe('I Open de Dardos Electrónicos');
                expect(payload.seasonStartYear).toBe(currentYear);
                expect(payload.info.place).toBe('Pabellón Siglo XXI');
                expect(payload.info.federation).toBe('ARAGON');
                expect(payload.info.mode).toBe('MEN_SINGLES');
                expect(payload.info.game).toBe('501');
                expect(payload.info.schedule).toBe('KO');
                expect(payload.info.maxPlayers).toBe(64);
                expect(payload.info.gameType).toBe('BEST_OF');
                expect(payload.info.numLegs).toBe(7);
                expect(payload.info.numSets).toBe(1);
                expect(payload.info.rules).toBe('Reglamento oficial de la federación.');
                expect(payload.info.info).toBe('Premios para los tres primeros clasificados.');
                expect(payload.info.dateTime).toBe(expectedIsoDateTime);

                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        message: 'Tournament created successfully',
                        // data: {
                        //     ...MO
                        //     id: 'new-tournament-uuid-999',
                        // },
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // Rellenar formulario
        await page.getByLabel('Nombre del Torneo').fill('I Open de Dardos Electrónicos');
        await page.getByLabel('Lugar / Ubicación').fill('Pabellón Siglo XXI');

        // Asignar fecha y hora fijas
        await page.getByLabel('Fecha').fill(testDate);
        await page.getByLabel('Hora').fill(testTime);

        // Selectores personalizados integrados
        await page.getByRole('combobox', { name: 'Federación' }).click();
        await page.getByRole('option', { name: 'Aragón', exact: false }).click();

        await page.getByLabel('Máx. Jugadores').fill('64');
        await page.getByLabel('Número de Legs').fill('7');

        // Campos opcionales (TextAreas)
        await page.getByLabel('Reglas específicas').fill('Reglamento oficial de la federación.');
        await page.getByLabel('Más información / Notas').fill('Premios para los tres primeros clasificados.');

        // Enviar formulario
        const submitButton = page.getByRole('button', { name: 'Crear torneo', exact: true });
        await submitButton.click();

        // Comprobar la respuesta visual tras la inserción correcta
        const successToast = page.getByText('Torneo creado con éxito');
        await expect(successToast).toBeVisible();

        // Debe redirigir de vuelta al panel de control de administración
        await expect(page).toHaveURL(/\/admin$/);
    });

    test('debe mostrar un mensaje de error y un Toast si el backend falla en la creación', async ({ page }) => {
        const BACKEND_ERROR_MSG = 'Ya existe un torneo registrado con ese nombre en la temporada actual';

        // Forzar un código de error de base de datos o validación desde la API
        await page.route(`${API_BASE}/tournaments`, async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: BACKEND_ERROR_MSG }),
                });
            }
        });

        // Rellenar únicamente lo requerido para activar la validación nativa del formulario HTML
        await page.getByLabel('Nombre del Torneo').fill('Torneo Duplicado');
        await page.getByLabel('Lugar / Ubicación').fill('Ubicación Cualquiera');

        // Forzar envío
        await page.getByRole('button', { name: 'Crear torneo', exact: true }).click();

        // 1. Validar el mensaje inline buscando específicamente dentro del formulario
        const inlineError = page.locator('form').getByText(BACKEND_ERROR_MSG);
        await expect(inlineError).toBeVisible();

        // 2. Validar el Toast (si es un párrafo, un contenedor flotante, o simplemente el primer elemento capturado)
        const errorToast = page.getByRole('paragraph').filter({ hasText: BACKEND_ERROR_MSG });
        await expect(errorToast).toBeVisible();
    });

    test('debe permitir cancelar la operación usando el botón Volver o el botón Cancelar', async ({ page }) => {
        // Test del botón secundario inferior 'Cancelar'
        const cancelBtn = page.getByRole('button', { name: 'Cancelar', exact: true });
        await cancelBtn.click();
        await expect(page).toHaveURL(/\/admin$/);

        // Regresar para probar el segundo botón superior
        await page.goto('/admin/tournaments/crear');

        const backBtn = page.getByTitle('Volver al panel');
        await backBtn.click();
        await expect(page).toHaveURL(/\/admin$/);
    });
});

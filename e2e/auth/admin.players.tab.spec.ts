import { test, expect } from '@playwright/test';
import { UserRoles } from '../../src/context/AuthContext';
import { Federations } from '../../src/services/tournament.service';
import { PlayerStatus } from '../../src/services/player.service';

const API_BASE = 'http://localhost:3000/api';

const MOCK_ADMIN = {
    id: 'admin-test-123',
    email: 'admin@example.com',
    alias: 'SuperAdmin',
    role: UserRoles.ADMIN,
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-xyz789';

const MOCK_PLAYERS = [
    {
        id: 'player-1',
        userId: 'user-1',
        registrationNumber: 'FED-1111',
        federation: Federations.ARAGON,
        seasonStartYear: 2026,
        status: PlayerStatus.ACTIVE,
        userAlias: 'DardoMaestro',
    },
    {
        id: 'player-2',
        userId: 'user-2',
        registrationNumber: 'FED-2222',
        federation: Federations.CATALUÑA,
        seasonStartYear: 2026,
        status: PlayerStatus.ACTIVE,
        userAlias: 'DianaZaragoza',
    },
    {
        id: 'player-deleted',
        userId: 'user-deleted',
        registrationNumber: 'FED-9999',
        federation: Federations.ARAGON,
        seasonStartYear: 2026,
        status: PlayerStatus.DELETED,
        userAlias: 'UsuarioFantasma',
    },
];

test.describe('Admin Players Tab', () => {

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

        // 3. Mock GET /players (Simulando paginación del playerService)
        await page.route(new RegExp(`${API_BASE}/players`), async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: {
                            players: MOCK_PLAYERS,
                            pagination: {
                                totalPages: 1,
                                page: 1,
                                limit: 16
                            }
                        }
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Login automático previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 5. Navegar al panel de administración
        await page.goto('/admin');

        // 6. Verificar la estructura inicial y título de la pantalla
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 7. Navegar al panel de torneos
        const tournamentsButton = page.getByRole('button', { name: 'Jugadores', exact: true });
        await expect(tournamentsButton).toBeVisible();
        await tournamentsButton.click();

        // 8. Verificar el título de la pantalla
        const titleTournaments = page.getByRole('heading', { name: 'Panel de Jugadores Federados', exact: true });
        await expect(titleTournaments).toBeVisible();
    });

    test('debe mostrar el listado completo de jugadores', async ({ page }) => {
        // 1. Validar que se renderizan los alias del set de mocks
        await expect(page.getByText('DardoMaestro')).toBeVisible();
        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).toBeVisible();
    });

    // test('debe comprobar el funcionamiento del buscador por alias', async ({ page }) => {
    //     const searchInput = page.getByPlaceholder(/buscar/i);
    //     await searchInput.fill('Zaragoza');

    //     await expect(page.getByText('DianaZaragoza')).toBeVisible();
    //     await expect(page.getByText('DardoMaestro')).not.toBeVisible();
    //     await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();
    // });

    // test('debe comprobar el funcionamiento del filtro por federación', async ({ page }) => {
    //     // Seleccionar filtro de Federación (ej. Filtrar por Catalunya)
    //     await page.getByRole('combobox', { name: 'Federación' }).click();
    //     // Se asume que el backend/i18n traduce la clave a su label visible en la opción
    //     await page.getByRole('option', { name: /catalunya/i }).click();

    //     await expect(page.getByText('DardoMaestro')).not.toBeVisible();
    //     await expect(page.getByText('DianaZaragoza')).toBeVisible();
    //     await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();
    // });

    // test('debe comprobar el funcionamiento del filtro por estado', async ({ page }) => {
    //     // Por defecto el estado inicial del componente es activos, cambiamos a 'Eliminados'
    //     await page.getByRole('combobox', { name: 'Estado' }).click();
    //     await page.getByRole('option', { name: 'Eliminados', exact: true }).click();

    //     await expect(page.getByText('DardoMaestro')).not.toBeVisible();
    //     await expect(page.getByText('DianaZaragoza')).not.toBeVisible();
    //     await expect(page.getByText('UsuarioFantasma')).toBeVisible();
    // });

    // test('debe comprobar el funcionamiento del spinner para cambiar de temporada', async ({ page }) => {
    //     // Año actual por defecto en el componente (2026 en este entorno de ejecución)
    //     const currentYear = 2026;
    //     const inputTemporada = page.getByLabel('Temporada');
    //     await expect(inputTemporada).toHaveValue(`${currentYear} - ${currentYear + 1}`);

    //     // Pulsar la flecha de arriba (incrementar año)
    //     await page.getByTitle('Incrementar año').click();
    //     await expect(inputTemporada).toHaveValue(`${currentYear + 1} - ${currentYear + 2}`);

    //     // Al cambiar de año, los jugadores mock de 2026 ya no deberían cumplir el filtro del cliente
    //     await expect(page.getByText('DardoMaestro')).not.toBeVisible();
    // });

    // test('debe mostrar las acciones correctas para cada estado del jugador (activo, eliminado)', async ({ page }) => {
    //     // ---- 1. Estado: ACTIVO ----
    //     // Permite: Editar, Eliminar. NO permite: Restaurar.
    //     const rowActive = page.locator('tr', { hasText: 'DardoMaestro' });
    //     await expect(rowActive.getByRole('button', { name: 'Editar jugador', exact: true })).toBeVisible();
    //     await expect(rowActive.getByRole('button', { name: 'Eliminar jugador', exact: true })).toBeVisible();
    //     await expect(rowActive.getByRole('button', { name: 'Restaurar jugador', exact: true })).not.toBeVisible();

    //     // Cambiamos el selector de estado global a 'Eliminados' para poder inspeccionar al UsuarioFantasma
    //     await page.getByRole('combobox', { name: 'Estado' }).click();
    //     await page.getByRole('option', { name: 'Eliminados', exact: true }).click();

    //     // ---- 2. Estado: ELIMINADO ----
    //     // Permite: Editar, Restaurar. NO permite: Eliminar.
    //     const rowDeleted = page.locator('tr', { hasText: 'UsuarioFantasma' });
    //     await expect(rowDeleted.getByRole('button', { name: 'Editar jugador', exact: true })).toBeVisible();
    //     await expect(rowDeleted.getByRole('button', { name: 'Restaurar jugador', exact: true })).toBeVisible();
    //     await expect(rowDeleted.getByRole('button', { name: 'Eliminar jugador', exact: true })).not.toBeVisible();
    // });
});

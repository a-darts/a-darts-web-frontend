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
                const url = new URL(route.request().url());
                const searchParam = url.searchParams.get('search');
                const federationParam = url.searchParams.get('federation');
                const statusParam = url.searchParams.get('status');
                const seasonParam = url.searchParams.get('seasonStartYear');

                // Empezamos con todos los jugadores mockeados
                let filteredPlayers = [...MOCK_PLAYERS];

                // 1. Filtrar por buscador (alias o número de registro)
                if (searchParam) {
                    const searchLower = searchParam.toLowerCase();
                    filteredPlayers = filteredPlayers.filter(p =>
                        p.userAlias.toLowerCase().includes(searchLower) ||
                        p.registrationNumber.toLowerCase().includes(searchLower)
                    );
                }

                // 2. Filtrar por federación
                if (federationParam) {
                    filteredPlayers = filteredPlayers.filter(p => {
                        const playerFed = p.federation.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                        const paramFed = federationParam.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                        return playerFed === paramFed;
                    });
                }

                // 3. Filtrar por estado (Active, Deleted, etc.)
                if (statusParam) {
                    filteredPlayers = filteredPlayers.filter(p => p.status === statusParam);
                }

                // 4. Filtrar por año de temporada
                if (seasonParam) {
                    filteredPlayers = filteredPlayers.filter(p => p.seasonStartYear === parseInt(seasonParam, 10));
                }

                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: {
                            players: filteredPlayers,
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
        // 1. Validar que se renderizan todos los jugadores (Filtro por defecto 'Activos')
        await expect(page.getByText('DardoMaestro')).toBeVisible();
        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();

        await expect(page.getByText('FED-1111')).toBeVisible();
        await expect(page.getByText('FED-2222')).toBeVisible();
        await expect(page.getByText('FED-9999')).not.toBeVisible();

        await expect(page.getByText('Aragón')).toBeVisible();
        await expect(page.getByText('Cataluña')).toBeVisible();
        await expect(page.getByText('Aragón')).toBeVisible();
    });

    test('debe comprobar el funcionamiento del buscador por alias', async ({ page }) => {
        // 1. Validar que funciona el buscador
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('Zaragoza');

        // 2. Validar que se muestran los jugadores correspondientes
        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por federación', async ({ page }) => {
        // 1. Validar que funciona el filtro por Federación
        await page.getByRole('combobox', { name: 'Federación' }).click();
        await page.getByRole('option', { name: 'Aragón', exact: true }).click();

        // 2. Validar que se muestran los jugadores correspondientes
        await expect(page.getByText('DardoMaestro')).toBeVisible();
        await expect(page.getByText('DianaZaragoza')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por estado', async ({ page }) => {
        // 1. Validar que funciona el filtro por Estado
        await page.getByRole('combobox', { name: 'Estado' }).click();
        await page.getByRole('option', { name: 'Eliminados', exact: true }).click();

        // 2. Validar que se muestran los jugadores correspondientes
        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('DianaZaragoza')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por temporada', async ({ page }) => {
        // 1. Validar que funciona el filtro por Temporada
        const currentYear = 2026;
        const inputTemporada = page.getByLabel('Temporada');
        await expect(inputTemporada).toHaveValue(`${currentYear} - ${currentYear + 1}`);

        await page.getByTitle('Incrementar año').click();
        await expect(inputTemporada).toHaveValue(`${currentYear + 1} - ${currentYear + 2}`);

        // 2. Validar que se muestran los jugadores correspondientes
        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
    });

    test('debe mostrar las acciones correctas para cada estado del jugador (activo, eliminado)', async ({ page }) => {
        // ---- 1. Estado: ACTIVO ----
        // Permite: Editar, Eliminar
        const rowActive = page.locator('tr', { hasText: 'DardoMaestro' });
        await expect(rowActive.getByRole('button', { name: 'Editar jugador', exact: true })).toBeVisible();
        await expect(rowActive.getByRole('button', { name: 'Eliminar jugador', exact: true })).toBeVisible();
        await expect(rowActive.getByRole('button', { name: 'Restaurar jugador', exact: true })).not.toBeVisible();

        // 2. Cambiamos el selector de estado global a 'Eliminados'
        await page.getByRole('combobox', { name: 'Estado' }).click();
        await page.getByRole('option', { name: 'Eliminados', exact: true }).click();

        // ---- 3. Estado: ELIMINADO ----
        // Permite: Editar, Restaurar
        const rowDeleted = page.locator('tr', { hasText: 'UsuarioFantasma' });
        await expect(rowDeleted.getByRole('button', { name: 'Editar jugador', exact: true })).toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: 'Restaurar jugador', exact: true })).toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: 'Eliminar jugador', exact: true })).not.toBeVisible();
    });

    test('debe abrir el modal de confirmación, permitir cancelar y confirmar la eliminación con éxito', async ({ page }) => {
        const TARGET_PLAYER_ID = 'player-1';

        // 1. Interceptar la llamada DELETE al servidor
        await page.route(`${API_BASE}/players/${TARGET_PLAYER_ID}`, async (route) => {
            if (route.request().method() === 'DELETE') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success', message: 'Player deleted' }),
                });
            } else {
                await route.continue();
            }
        });

        const rowActive = page.locator('tr', { hasText: 'DardoMaestro' });
        const deleteButton = rowActive.getByRole('button', { name: 'Eliminar jugador', exact: true });

        // 2. Hacer click en el botón de la papelera para abrir el Modal
        await deleteButton.click();

        // 3. Comprobar que el modal emerge con el título y la descripción esperados
        const modalHeading = page.getByRole('heading', { name: 'Eliminar jugador', exact: true });
        await expect(modalHeading).toBeVisible();
        await expect(page.getByText('¿Estás seguro de que deseas eliminar permanentemente al jugador DardoMaestro?')).toBeVisible();

        // 4. Probar la cancelación del modal primero
        const cancelButton = page.getByRole('button', { name: /cancelar/i, exact: true });
        await cancelButton.click();
        await expect(modalHeading).not.toBeVisible(); // El modal debe cerrarse

        // 5. Volver a abrir y confirmar definitivamente la acción
        await deleteButton.click();
        const confirmButton = page.getByRole('button', { name: 'Eliminar', exact: true });
        await confirmButton.click();

        // 6. Validar que aparece el Toast de éxito definitivo
        const successToast = page.getByText('¡Jugador eliminado con éxito!');
        await expect(successToast).toBeVisible();

        // 7. El modal debe haber desaparecido tras la resolución asíncrona
        await expect(modalHeading).not.toBeVisible();
    });

    test('debe procesar la restauración directa de un jugador inactivo con éxito', async ({ page }) => {
        const DELETED_PLAYER_ID = 'player-deleted';

        // 1. Interceptar la llamada de restauración
        await page.route(`${API_BASE}/players/${DELETED_PLAYER_ID}/restore`, async (route) => {
            if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success', message: 'Player restored' }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Cambiar al estado de "Eliminados" para ver al 'UsuarioFantasma'
        await page.getByRole('combobox', { name: 'Estado' }).click();
        await page.getByRole('option', { name: 'Eliminados', exact: true }).click();

        const rowDeleted = page.locator('tr', { hasText: 'UsuarioFantasma' });
        const restoreButton = rowDeleted.getByRole('button', { name: 'Restaurar jugador', exact: true });

        // 3. Ejecutar la restauración directa
        await restoreButton.click();

        // 4. Validar que la interfaz responde mostrando el Toast correspondiente de confirmación
        const successToast = page.getByText('¡Jugador restaurado con éxito!');
        await expect(successToast).toBeVisible();
    });
});

import { test, expect } from '@playwright/test';
import { BoardStatus } from '../../src/services/playingArea.service';
import { Federations, GameModes, GameTypes, RegistrationStatus, TournamentStatus } from '../../src/services/tournament.service';

const API_BASE = 'http://localhost:3000/api';

const MOCK_ADMIN = {
    id: 'user-admin-test-123',
    email: 'test-admin@example.com',
    alias: 'TestAdmin',
    role: 'ADMIN',
    registeredAt: '2024-01-02T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-abc123';

const MOCK_PARTICIPANTS = [
    {
        id: '1',
        playerId: 'p1',
        registeredAt: '2026-01-02T00:00:00.000Z',
        checkedInAt: null,
        alias: 'Jugador 1',
        federation: Federations.CASTILLA_Y_LEON,
    },
    {
        id: '2',
        playerId: 'p2',
        registeredAt: '2026-01-02T01:00:00.000Z',
        checkedInAt: null,
        alias: 'Jugador 2',
        federation: Federations.MADRID,
    },
];

const MOCK_TOURNAMENT = {
    id: 'tournament-1',
    name: 'Open Absoluto de Aragón',
    seasonStartYear: 2026,
    createdAt: '2026-01-01T00:00:00.000Z',
    status: TournamentStatus.IN_PROGRESS,
    isDelayed: false,
    info: {
        place: 'Zaragoza',
        dateTime: '2026-08-15T18:00:00.000Z',
        mode: GameModes.MEN_SINGLES,
        game: '501',
        schedule: 'K.O. directo',
        maxPlayers: 64,
        gameType: GameTypes.FIRST_TO,
        numLegs: 3,
        numSets: 1,
        rules: 'Standard',
        info: 'Info del torneo',
        federation: Federations.ARAGON,
    },
    registration: {
        hasCheckIn: false,
        status: RegistrationStatus.CLOSED,
        registrationPeriod: { startsAt: null, endsAt: null, },
    },
};

const PLAYING_AREA_ID = 'area-abc-456';

// Estructura base para simular el salón de juego con dianas
const MOCK_PLAYING_AREA = {
    id: PLAYING_AREA_ID,
    shortId: 'PA-88',
    tournamentId: MOCK_TOURNAMENT.id,
    boards: [
        { number: 1, shortId: 'B-01', status: BoardStatus.AVAILABLE, matchId: null },
        { number: 2, shortId: 'B-02', status: BoardStatus.DISABLED, matchId: null }
    ]
};

// Partidas simuladas vacías para no entorpecer el renderizado inicial
const MOCK_MATCHES: any[] = [];

test.describe('Tournament Playing Area Tab (Salón de Juego)', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Mock GET /auth/me
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

        // 2. Mock POST /auth/login
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

        // 4. Mock GET /tournaments/{id}/participants
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: MOCK_PARTICIPANTS,
                }),
            });
        });

        // 3. Mock GET /tournaments/{id}
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: MOCK_TOURNAMENT,
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // Interceptar la carga inicial de datos del salón de juego
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/playing-areas`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: "true",
                    message: "Playing area fetched successfully",
                    data: MOCK_PLAYING_AREA,
                }),
            });
        });

        // Interceptar las partidas del torneo
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: "true",
                    message: "Matches fetched successfully",
                    data: MOCK_MATCHES,
                }),
            });
        });

        // 6. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 7. Navegar a la pantalla del torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 8. Verificar que estamos en la pantalla del torneo
        const title = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(title).toBeVisible();

        // 9. Navegar al tab de Partidas
        const playingAreaButton = page.getByRole('button', { name: 'SALÓN DE JUEGO', exact: true });
        await expect(playingAreaButton).toBeVisible();
        await playingAreaButton.click();
    });

    test('debe visualizar correctamente las dianas configuradas con su número y shortId', async ({ page }) => {
        // Comprobar encabezado principal e ID del salón de juego
        await expect(page.getByRole('heading', { name: 'Salón de Juego' })).toBeVisible();
        await expect(page.getByText('ID: PA-88')).toBeVisible();

        // Validar Diana 1 (Disponible)
        const boardOneCard = page.locator('div').filter({ hasText: 'B-01' }).first();
        await expect(boardOneCard).toBeVisible();

        // Validar Diana 2 (Deshabilitada)
        const boardTwoCard = page.locator('div').filter({ hasText: 'B-02' }).first();
        await expect(boardTwoCard).toBeVisible();

        // Validar contadores estadísticos de las tarjetas superiores
        await expect(page.getByText('Dianas en total')).toBeVisible();
    });

    test('debe permitir deshabilitar una diana activa', async ({ page }) => {
        // Interceptar la llamada de inutilizar (Diana 1)
        let putRequestTriggered = false;
        await page.route(`${API_BASE}/playing-areas/${PLAYING_AREA_ID}/boards/B-01/disable`, async (route) => {
            putRequestTriggered = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' }),
            });
        });

        // Deshabilitar la Diana 1
        const boardOneCard = page.locator('div').filter({ hasText: 'B-01' }).first();
        const disableButton = boardOneCard.getByRole('button', { name: 'Deshabilitar diana' });
        await expect(disableButton).toBeVisible();
        await disableButton.click();
    });

    test('debe permitir habilitar una diana que se encuentra deshabilitada', async ({ page }) => {
        // Interceptar la llamada de habilitación (Diana 2)
        let putRequestTriggered = false;
        await page.route(`${API_BASE}/playing-areas/${PLAYING_AREA_ID}/boards/B-02/enable`, async (route) => {
            putRequestTriggered = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' }),
            });
        });

        // Habilitar en la Diana 2
        const boardTwoCard = page.locator('div').filter({ hasText: 'B-02' }).first();
        const enableButton = boardTwoCard.getByRole('button', { name: 'Habilitar diana', exact: true });
        await expect(enableButton).toBeVisible();
        await enableButton.click();
    });

    test('debe añadir una nueva diana al salón de juego', async ({ page }) => {
        // Interceptar POST de adición de diana externa
        let postRequestTriggered = false;
        await page.route(`${API_BASE}/playing-areas/${PLAYING_AREA_ID}/boards`, async (route) => {
            if (route.request().method() === 'POST') {
                postRequestTriggered = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' }),
                });
            }
        });

        const addBoardButton = page.getByRole('button', { name: 'Añadir nueva diana', exact: true });
        await expect(addBoardButton).toBeVisible();
        await addBoardButton.click();

        expect(postRequestTriggered).toBeTruthy();
    });

    test('debe eliminar la última diana del salón de juego', async ({ page }) => {
        // Interceptar DELETE de la última diana
        let deleteRequestTriggered = false;
        await page.route(`${API_BASE}/playing-areas/${PLAYING_AREA_ID}/boards/last`, async (route) => {
            if (route.request().method() === 'DELETE') {
                deleteRequestTriggered = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' }),
                });
            }
        });

        const removeBoardButton = page.getByRole('button', { name: 'Eliminar última diana', exact: true });
        await expect(removeBoardButton).toBeVisible();

        // Asegurarse de que no esté deshabilitado si hay dianas en el mock
        await expect(removeBoardButton).toBeEnabled();
        await removeBoardButton.click();

        expect(deleteRequestTriggered).toBeTruthy();
    });
});

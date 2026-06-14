import { test, expect } from '@playwright/test';
import { TournamentStatus, GameModes, GameTypes, Federations, RegistrationStatus } from '../../src/services/tournament.service';
import { BracketStatus } from '../../src/services/bracket.service';

const API_BASE = 'http://localhost:3000/api';

const MOCK_PLAYER = {
    id: 'user-player-test-123',
    email: 'test-player@example.com',
    alias: 'TestPlayer',
    role: 'PLAYER',
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_ADMIN = {
    id: 'user-admin-test-123',
    email: 'test-admin@example.com',
    alias: 'TestAdmin',
    role: 'ADMIN',
    registeredAt: '2024-01-02T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-abc123';

const MOCK_TOURNAMENT = {
    id: 'tournament-1',
    name: 'Open Absoluto de Aragón',
    seasonStartYear: 2026,
    createdAt: '2026-01-01T00:00:00.000Z',
    status: TournamentStatus.FINISHED,
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
        hasCheckIn: true,
        status: RegistrationStatus.CLOSED,
        registrationPeriod: { startsAt: null, endsAt: '2026-08-15T17:50:00.000Z' }
    },
};

const MOCK_RESULTS = {
    id: '1',
    tournamentId: 'tournament-1',
    participantsResults: [
        {
            participantId: 'p1',
            playerId: 'player-1',
            alias: 'Player 1',
            federation: Federations.MADRID,
            finalPosition: 1,
            matchesWon: 5,
            matchesLost: 0,
            setsWon: 6,
            setsLost: 1,
            legsWon: 9,
            legsLost: 4,
        },
        {
            participantId: 'p2',
            playerId: 'player-2',
            alias: 'Player 2',
            federation: Federations.MADRID,
            finalPosition: 2,
            matchesWon: 4,
            matchesLost: 1,
            setsWon: 4,
            setsLost: 3,
            legsWon: 8,
            legsLost: 6,
        },
        {
            participantId: 'p3',
            playerId: 'player-3',
            alias: 'Player 3',
            federation: Federations.MADRID,
            finalPosition: 3,
            matchesWon: 3,
            matchesLost: 1,
            setsWon: 6,
            setsLost: 1,
            legsWon: 9,
            legsLost: 4,
        },
        {
            participantId: 'p4',
            playerId: 'player-4',
            alias: 'Player 4',
            federation: Federations.MADRID,
            finalPosition: 3,
            matchesWon: 3,
            matchesLost: 1,
            setsWon: 4,
            setsLost: 3,
            legsWon: 8,
            legsLost: 6,
        },
        {
            participantId: 'p5',
            playerId: 'player-5',
            alias: 'Player 5',
            federation: Federations.MADRID,
            finalPosition: 5,
            matchesWon: 2,
            matchesLost: 1,
            setsWon: 6,
            setsLost: 1,
            legsWon: 9,
            legsLost: 4,
        },
    ],
};

const MOCK_PARTICIPANTS = [
    {
        id: '1',
        playerId: 'player-1',
        registeredAt: '2026-01-02T00:00:00.000Z',
        checkedInAt: '2026-01-02T00:0:100.000Z',
        alias: 'Player 1',
        federation: Federations.MADRID,
    },
    {
        id: '2',
        playerId: 'player-2',
        registeredAt: '2026-01-02T00:00:00.000Z',
        checkedInAt: '2026-01-02T00:0:100.000Z',
        alias: 'Player 2',
        federation: Federations.MADRID,
    },
    {
        id: '3',
        playerId: 'player-3',
        registeredAt: '2026-01-02T00:00:00.000Z',
        checkedInAt: '2026-01-02T00:0:100.000Z',
        alias: 'Player 3',
        federation: Federations.MADRID,
    },
    {
        id: 'p4',
        playerId: 'player-4',
        registeredAt: '2026-01-02T00:00:00.000Z',
        checkedInAt: '2026-01-02T00:0:100.000Z',
        alias: 'Player 4',
        federation: Federations.MADRID,
    },
    {
        id: '5',
        playerId: 'player-5',
        registeredAt: '2026-01-02T00:00:00.000Z',
        checkedInAt: '2026-01-02T00:0:100.000Z',
        alias: 'Player 5',
        federation: Federations.MADRID,
    },
];


test.describe('Tournaments Results Tab', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Mock GET /auth/me
        await page.route(`${API_BASE}/auth/me`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(MOCK_PLAYER),
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
                            user: MOCK_PLAYER,
                        },
                    }),
                });
            } else {
                await route.continue();
            }
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

        // 5. Mock GET /tournaments/{id}/results
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/results`, async (route) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    message: "Tournament results fetched successfully",
                    data: MOCK_RESULTS,
                }),
            });
        });

        // 6. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_PLAYER.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 7. Navegar a la pantalla del torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 8. Verificar que estamos en la pantalla del torneo
        const title = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(title).toBeVisible();
    });

    test('debe navegar al tab de Resultados y mostrar las posiciones', async ({ page }) => {
        // 1. Navegar al tab de Partidas
        const matchesButton = page.getByRole('button', { name: 'RESULTADOS', exact: true });
        await expect(matchesButton).toBeVisible();
        await matchesButton.click();

        // 2. Verificar que estamos en la pantalla de Resultados
        const title = page.getByRole('heading', { name: 'Clasificación Final', exact: true });
        await expect(title).toBeVisible();

        // 3. Verificar las tarjetas de los 4 mejores clasificados
        await expect(page.getByText('ORO • 1º')).toBeVisible();
        await expect(page.getByText('Player 1').first()).toBeVisible();

        await expect(page.getByText('PLATA • 2º')).toBeVisible();
        await expect(page.getByText('Player 2').first()).toBeVisible();

        await expect(page.getByText('BRONCE • 3º - 4º').first()).toBeVisible();
        await expect(page.getByText('Player 3').first()).toBeVisible();
        await expect(page.getByText('Player 4').first()).toBeVisible();

        // 4. Verificar la tabla con la clasificación completa
        const table = page.getByRole('table');
        await expect(table).toBeVisible();

        await expect(table.getByRole('cell', { name: 'Player 1', exact: true })).toBeVisible();
        await expect(table.getByRole('cell', { name: '1º', exact: true })).toBeVisible();
        await expect(table.getByRole('cell', { name: '5', exact: true })).toBeVisible(); // Victorias
        await expect(table.getByRole('cell', { name: '0', exact: true })).toBeVisible(); // Derrotas

        await expect(table.getByRole('cell', { name: 'Player 2', exact: true })).toBeVisible();
        await expect(table.getByRole('cell', { name: '2º', exact: true })).toBeVisible();
        await expect(table.getByRole('cell', { name: '4', exact: true })).toBeVisible(); // Victorias

        await expect(table.getByRole('cell', { name: 'Player 3', exact: true })).toBeVisible();
        await expect(table.getByRole('cell', { name: 'Player 4', exact: true })).toBeVisible();
        await expect(table.getByRole('cell', { name: '3º - 4º', exact: true })).toHaveCount(2);
        await expect(table.getByRole('cell', { name: '3', exact: true })).toHaveCount(2); // Victorias

        await expect(table.getByRole('cell', { name: 'Player 5', exact: true })).toBeVisible();
        await expect(table.getByRole('cell', { name: '5º - 8º', exact: true })).toBeVisible();
        await expect(table.getByRole('cell', { name: '2', exact: true })).toBeVisible(); // Victorias
    });

    test('debe mostrar el Empty State si la API devuelve lista vacía', async ({ page }) => {
        // 1. Mock GET /tournaments/{id}/results
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/results`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: {
                        id: '1',
                        tournamentId: 'tournament-1',
                        participantsResults: [],
                    }
                }),
            });
        });

        // 2. Forzamos recargar la página
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 3. Ir al tab de Resultados
        const resultsButton = page.getByRole('button', { name: 'RESULTADOS', exact: true });
        await resultsButton.click();

        // 4. Verificar el comportamiento del componente EmptyState
        await expect(page.getByText('Sin resultados', { exact: true })).toBeVisible();
        await expect(page.getByText('Aún no hay resultados para este torneo.', { exact: true })).toBeVisible();
    });

    test('debe mostrar un mensaje de Error si el torneo no tiene resultados registrados', async ({ page }) => {
        // 1. Mock de GET /tournaments/{id}/results
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/results`, async (route) => {
            await route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "error",
                    message: "Tournament result not found",
                }),
            });
        });

        // 2. Forzamos recargar la página
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 3. Ir al tab de Resultados
        const registrationButton = page.getByRole('button', { name: 'RESULTADOS', exact: true });
        await registrationButton.click();

        // 4. Verificar el comportamiento del componente ErrorMessage
        await expect(page.getByText('Resultados del torneo no encontrados')).toBeVisible();
    });
});

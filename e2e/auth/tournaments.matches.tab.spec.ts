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
    status: TournamentStatus.PUBLISHED,
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
        status: RegistrationStatus.OPEN,
        registrationPeriod: { startsAt: null, endsAt: '2026-08-15T17:50:00.000Z' }
    },
};

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

// const MOCK_BRACKET = {
//     id: 'bracket-1',
//     tournamentId: 'tournament-1',
//     status: BracketStatus.PUBLISHED,
//     totalPositions: 4,
//     positions: [
//         { position: 1, participantId: 'p1', participantAlias: 'Player 1', participantFederation: Federations.MADRID },
//         { position: 2, participantId: 'p2', participantAlias: 'Player 2', participantFederation: Federations.GALICIA },
//         { position: 3, participantId: 'p3', participantAlias: 'Player 3', participantFederation: Federations.BALEARES },
//         { position: 4, participantId: 'p4', participantAlias: 'Player 4', participantFederation: Federations.CANARIAS },
//     ],
// };

const MOCK_MATCHES = [
    {
        id: 'm1',
        round: 1,
        matchIndex: 0,
        boardNumber: 1,
        boardShortId: 'SABC-D001',
        startedAt: null,
        finishedAt: null,
        status: 'READY',
        participant1: { id: 'p1', alias: 'Player 1', federation: Federations.MADRID },
        participant2: { id: 'p2', alias: 'Player 2', federation: Federations.GALICIA },
        matchScore: {
            participant1: { setsWon: 0, legsWon: 0, },
            participant2: { setsWon: 0, legsWon: 0, },
        },
    },
    {
        id: 'm2',
        round: 1,
        matchIndex: 1,
        boardNumber: 2,
        boardShortId: 'SABC-D002',
        startedAt: null,
        finishedAt: null,
        status: 'READY',
        participant1: { id: 'p3', alias: 'Player 3', federation: Federations.BALEARES },
        participant2: { id: 'p4', alias: 'Player 4', federation: Federations.CANARIAS },
        matchScore: {
            participant1: { setsWon: 0, legsWon: 0, },
            participant2: { setsWon: 0, legsWon: 0, },
        },
    },
    {
        id: 'm3',
        round: 2,
        matchIndex: 0,
        boardNumber: null,
        boardShortId: null,
        startedAt: null,
        finishedAt: null,
        status: 'PENDING',
        participant1: { id: null, alias: 'Por determinar', federation: 'N/A' },
        participant2: { id: null, alias: 'Por determinar', federation: 'N/A' },
        matchScore: {
            participant1: { setsWon: 0, legsWon: 0, },
            participant2: { setsWon: 0, legsWon: 0, },
        },
    },
];



test.describe('Tournaments Matches Tab', () => {

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

        // 3. Mock GET /tournaments/{id} usando un patrón flexible por los queryParams
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

        // await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
        //     await route.fulfill({
        //         status: 200,
        //         contentType: 'application/json',
        //         body: JSON.stringify({
        //             status: "success",
        //             message: "Bracket fetched successfully",
        //             data: MOCK_BRACKET,
        //         }),
        //     });
        // });

        // 5. Mock GET /tournaments/{id}/matches
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    message: "Matches fetched successfully",
                    data: MOCK_MATCHES,
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

    test('debe navegar al tab de Partidas y mostrar las partidas', async ({ page }) => {
        // 1. Navegar al tab de Partidas
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await expect(matchesButton).toBeVisible();
        await matchesButton.click();

        // 2. Verificar que se muestran los títulos de las secciones
        // await expect(page.getByText('Partidas en curso')).toBeVisible();
        await expect(page.getByText('Partidas pendientes')).toBeVisible();
        // await expect(page.getByText('Partidas finalizadas')).not.toBeVisible();

        const inProgressButton = page.getByRole('button', { name: 'En curso', exact: true });
        await expect(inProgressButton).toBeVisible();
        const pendingButton = page.getByRole('button', { name: 'Pendientes', exact: true });
        await expect(pendingButton).toBeVisible();
        const finishedButton = page.getByRole('button', { name: 'Finalizadas', exact: true });
        await expect(finishedButton).toBeVisible();
    });

    test('debe verificar que todas las partidas aparecen en pendientes cuando su estado es PENDING', async ({ page }) => {
        // 1. Navegar al tab de Partidas
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await expect(matchesButton).toBeVisible();
        await matchesButton.click();

        // 2. Verificar que todos los partidos aparecen en pendientes
        const pendingSection = page.locator('div').filter({ has: page.getByRole('heading', { name: /Partidas pendientes/i }) }).first();
        const countBadge = pendingSection.getByText('3', { exact: true });
        await expect(countBadge).toBeVisible();

        // 3. Verificar que los tres partidos se muestran correctamente

        // --- MATCH CARD 1 (Player 1 vs Player 2) ---
        await expect(pendingSection.getByText('Player 1')).toBeVisible();
        await expect(pendingSection.getByText('Player 2')).toBeVisible();
        await expect(pendingSection.getByText('Diana 1')).toBeVisible();
        await expect(pendingSection.getByText(/^Ronda 1$/).first()).toBeVisible();

        // --- MATCH CARD 2 (Player 3 vs Player 4) ---
        await expect(pendingSection.getByText('Player 3')).toBeVisible();
        await expect(pendingSection.getByText('Player 4')).toBeVisible();
        await expect(pendingSection.getByText('Diana 2')).toBeVisible();

        // --- MATCH CARD 3 (Por determinar vs Por determinar) ---
        await expect(pendingSection.getByText('Diana sin asignar')).toBeVisible();
        await expect(pendingSection.getByText(/^Ronda 2$/)).toBeVisible();
        await expect(pendingSection.getByText('Por determinar')).toHaveCount(2);

        // 4. Verificar que las otras secciones muestran sus "Empty States" correspondientes
        const emptyInProgress = page.getByText('No hay partidas en curso', { exact: false });
        await expect(emptyInProgress).toBeVisible();
        const emptyFinished = page.getByText('No hay partidas finalizadas', { exact: false });
        await expect(emptyFinished).toBeVisible();
    });
});

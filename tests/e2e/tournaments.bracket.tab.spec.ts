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

const MOCK_BRACKET = {
    id: 'bracket-1',
    tournamentId: 'tournament-1',
    status: BracketStatus.PUBLISHED,
    totalPositions: 4,
    positions: [
        { position: 1, participantId: 'p1', participantAlias: 'Player 1', participantFederation: Federations.MADRID },
        { position: 2, participantId: 'p2', participantAlias: 'Player 2', participantFederation: Federations.GALICIA },
        { position: 3, participantId: 'p3', participantAlias: 'Player 3', participantFederation: Federations.BALEARES },
        { position: 4, participantId: 'p4', participantAlias: 'Player 4', participantFederation: Federations.CANARIAS },
    ],
};

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



test.describe('Tournaments Bracket Tab', () => {

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

        // 5. Mock GET /tournaments/{id}/bracket
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    message: "Bracket fetched successfully",
                    data: MOCK_BRACKET,
                }),
            });
        });

        // 6. Mock GET /tournaments/{id}/matches
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


        // 7. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_PLAYER.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 8. Navegar a la pantalla del torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 9. Verificar que estamos en la pantalla del torneo
        const title = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(title).toBeVisible();
    });

    test('debe navegar al tab de Cuadrante y mostrar el cuadrante', async ({ page }) => {
        // 1. Navegar al tab de Cuadrante
        const registrationButton = page.getByRole('button', { name: 'CUADRANTE', exact: true });
        await expect(registrationButton).toBeVisible();
        await registrationButton.click();

        // 2. Verificar se muestran las cabeceras de las rondas
        await expect(page.getByText('RONDA 1')).toBeVisible();
        await expect(page.getByText('FINAL')).toBeVisible();

        // 3. Verificar se muestran los partidos
        const round1Column = page
            .locator('div')
            .filter({ hasText: /^RONDA 1$/i })
            .locator('..');
        const firstMatchCard = round1Column
            .locator('div')
            .filter({ hasText: 'Player 1' })
            .first();
        await expect(firstMatchCard.getByText('Player 2')).toBeVisible();

        const secondMatchCard = round1Column
            .locator('div')
            .filter({ hasText: 'Player 3' })
            .first();
        await expect(secondMatchCard.getByText('Player 4')).toBeVisible();

        const finalColumn = page
            .locator('div')
            .filter({ hasText: /^FINAL$/i })
            .locator('..');
        const thirdMatchCard = finalColumn
            .locator('div')
            .filter({ hasText: 'Por determinar' })
            .first();
        await expect(thirdMatchCard.getByText('Por determinar')).toHaveCount(2);

        // 4. Verificar que se muestran las dianas asignadas a estos partidos
        await expect(page.getByText('Diana 1')).toBeVisible();
        await expect(page.getByText('Diana 2')).toBeVisible();
    });

    test('debe mostrar un mensaje de cuadrante no disponible', async ({ page }) => {
        // 1. Sobreescribir la ruta para que no devuelva ningún cuadrante
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
            await route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "error",
                    message: "Bracket not found",
                    data: null,
                }),
            });
        });

        // 2. Forzamos recargar la página
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 3. Ir al tab de Cuadrante
        const registrationButton = page.getByRole('button', { name: 'CUADRANTE', exact: true });
        await expect(registrationButton).toBeVisible();
        await registrationButton.click();

        // 4. Verificar que se muestra el mensaje de error
        await expect(page.getByText('Cuadrante no disponible')).toBeVisible();
        await expect(page.getByText('Aún no se ha publicado el cuadrante para este torneo. Por favor, vuelve a consultar más tarde.')).toBeVisible();
    });


    test.describe('Vistas de Administrador', () => {
        test.beforeEach(async ({ page }) => {
            // 1. Sobreescribimos la ruta de identificación para que devuelva los datos del ADMIN
            await page.route(`${API_BASE}/auth/me`, async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(MOCK_ADMIN),
                });
            });

            // 2. Forzamos recargar la página
            await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

            // 3. Ir al tab de Cuadrante
            const registrationButton = page.getByRole('button', { name: 'CUADRANTE', exact: true });
            await registrationButton.click();
        });

        test('debe mostrar opciones de generar si el cuadrante no está disponible', async ({ page }) => {
            // 1. Sobreescribir la ruta para que no devuelva ningún cuadrante
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
                await route.fulfill({
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "error",
                        message: "Bracket not found",
                        data: null,
                    }),
                });
            });

            // 2. Forzamos recargar la página
            await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

            // 3. Ir al tab de Cuadrante
            const registrationButton = page.getByRole('button', { name: 'CUADRANTE', exact: true });
            await expect(registrationButton).toBeVisible();
            await registrationButton.click();

            // 4. Verificar que se muestra el mensaje de error
            await expect(page.getByText('Cuadrante no disponible')).toBeVisible();
            await expect(page.getByText('El cuadrante aún no ha sido generado para este torneo. Como administrador, puedes generarlo automáticamente con los participantes inscritos.')).toBeVisible();

            // 5. Verificar botones de acción
            await expect(page.getByRole('button', { name: 'Generar cuadrante automáticamente', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Generar cuadrante manualmente', exact: true })).toBeVisible();
        });

        test('debe permitir al administrador publicar un cuadrante en estado borrador', async ({ page }) => {
            // 1. Forzar que el cuadrante mockeado devuelva estado DRAFT
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: { ...MOCK_BRACKET, status: BracketStatus.DRAFT },
                    }),
                });
            });

            // Mockear la petición de publicación (asumiendo que cambia el estado a PUBLISHED)
            let publishCalled = false;
            await page.route(`${API_BASE}/brackets/${MOCK_BRACKET.id}/publish`, async (route) => {
                if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
                    publishCalled = true;
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ status: "success", message: "Bracket published" }),
                    });
                }
            });

            // 2. Recargar para aplicar el estado DRAFT
            await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);
            await page.getByRole('button', { name: 'CUADRANTE', exact: true }).click();

            // 3. Verificar que se muestra el botón de publicar y el tag correspondiente
            const publishButton = page.getByRole('button', { name: 'Publicar cuadrante', exact: true });
            await expect(publishButton).toBeVisible();

            // 4. Interceptamos el re-fetch que hace el componente tras publicar con éxito
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: { ...MOCK_BRACKET, status: BracketStatus.PUBLISHED }, // Ya publicado
                    }),
                });
            });

            // 5. Hacer click en publicar y verificar flujo
            await publishButton.click();

            // Verificar que se llamó a la API de publicación y desapareció el botón
            expect(publishCalled).toBe(true);
            await expect(page.getByText('¡Cuadrante publicado correctamente!')).toBeVisible();
            await expect(publishButton).not.toBeVisible();
        });

        test('debe permitir al administrador ocultar un cuadrante ya publicado', async ({ page }) => {
            // El MOCK_BRACKET inicial ya viene como BracketStatus.PUBLISHED, lo aprovechamos.

            // Mockear la petición de ocultar (unpublish)
            let unpublishCalled = false;
            await page.route(`${API_BASE}/brackets/${MOCK_BRACKET.id}/unpublish`, async (route) => {
                if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
                    unpublishCalled = true;
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ status: "success", message: "Bracket unpublished" }),
                    });
                }
            });

            // 1. Verificar que se muestra el botón de ocultar
            const hideButton = page.getByRole('button', { name: 'Ocultar cuadrante', exact: true });
            await expect(hideButton).toBeVisible();

            // 2. Interceptamos el re-fetch que hace el componente (devuelve DRAFT de nuevo)
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: { ...MOCK_BRACKET, status: BracketStatus.DRAFT },
                    }),
                });
            });

            // 3. Ocultar el cuadrante
            await hideButton.click();

            // Verificar que se procesó correctamente en el cliente
            expect(unpublishCalled).toBe(true);
            await expect(page.getByText('¡Cuadrante ocultado correctamente!')).toBeVisible();
            await expect(hideButton).not.toBeVisible();
            await expect(page.getByRole('button', { name: 'Publicar cuadrante', exact: true })).toBeVisible();
        });
    });
});

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

const MOCK_MIXED_MATCHES = [
    {
        id: 'match-in-progress',
        round: 1,
        matchIndex: 0,
        boardNumber: 3,
        boardShortId: 'BOARD-003',
        startedAt: '2026-08-15T18:05:00.000Z',
        finishedAt: null,
        status: 'IN_PROGRESS',
        participant1: { id: 'p1', alias: 'Rival Activo 1', federation: Federations.MADRID },
        participant2: { id: 'p2', alias: 'Rival Activo 2', federation: Federations.GALICIA },
        matchScore: {
            participant1: { setsWon: 0, legsWon: 2 },
            participant2: { setsWon: 0, legsWon: 1 },
        },
    },
    {
        id: 'match-pending',
        round: 1,
        matchIndex: 1,
        boardNumber: null,
        boardShortId: null,
        startedAt: null,
        finishedAt: null,
        status: 'PENDING',
        participant1: { id: 'p3', alias: 'Rival Espera 1', federation: Federations.BALEARES },
        participant2: { id: 'p4', alias: 'Rival Espera 2', federation: Federations.CANARIAS },
        matchScore: {
            participant1: { setsWon: 0, legsWon: 0 },
            participant2: { setsWon: 0, legsWon: 0 },
        },
    },
    {
        id: 'match-finished',
        round: 1,
        matchIndex: 2,
        boardNumber: 4,
        boardShortId: 'BOARD-004',
        startedAt: '2026-08-15T18:00:00.000Z',
        finishedAt: '2026-08-15T18:25:00.000Z',
        status: 'FINISHED',
        participant1: { id: 'p5', alias: 'Ganador 1', federation: Federations.ARAGON },
        participant2: { id: 'p6', alias: 'Perdedor 1', federation: Federations.ARAGON },
        matchScore: {
            participant1: { setsWon: 1, legsWon: 3 },
            participant2: { setsWon: 0, legsWon: 1 },
        },
    },
    {
        id: 'match-suspended',
        round: 1,
        matchIndex: 3,
        boardNumber: 5,
        boardShortId: 'BOARD-005',
        startedAt: '2026-08-15T18:10:00.000Z',
        finishedAt: null,
        status: 'SUSPENDED',
        participant1: { id: 'p7', alias: 'Pausado 1', federation: Federations.GALICIA },
        participant2: { id: 'p8', alias: 'Pausado 2', federation: Federations.GALICIA },
        matchScore: {
            participant1: { setsWon: 0, legsWon: 1 },
            participant2: { setsWon: 0, legsWon: 1 },
        },
    }
];


test.describe('Tournaments Matches Tab', () => {

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
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
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

    test('debe clasificar y mostrar correctamente los partidos distribuidos en múltiples secciones simultáneas', async ({ page }) => {
        // 1. Mockear GET /tournaments/{id}/matches
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    message: "Matches fetched successfully",
                    data: MOCK_MIXED_MATCHES,
                }),
            });
        });

        // 2. Navegar a la pestaña de Partidas
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await expect(matchesButton).toBeVisible();
        await matchesButton.click();

        // 3. Verificar sección Partidas en curso
        const inProgressSection = page
            .locator('div')
            .filter({ has: page.getByRole('heading', { name: /Partidas en curso/i }) })
            .first();
        await expect(inProgressSection.getByText('Rival Activo 1')).toBeVisible();
        await expect(inProgressSection.getByText('Rival Activo 2')).toBeVisible();
        await expect(inProgressSection.getByText('Diana 3')).toBeVisible();

        // 4. Verificar sección Partidas pendientes
        const pendingSection = page
            .locator('div')
            .filter({ has: page.getByRole('heading', { name: /Partidas pendientes/i }) })
            .first();
        await expect(pendingSection.getByText('Rival Espera 1')).toBeVisible();
        await expect(pendingSection.getByText('Rival Espera 2')).toBeVisible();
        await expect(pendingSection.getByText('Diana sin asignar')).toBeVisible();

        // 5. Verificar sección Partidas finalizadas
        const finishedSection = page
            .locator('div')
            .filter({ has: page.getByRole('heading', { name: /Partidas finalizadas/i }) })
            .first();
        await expect(finishedSection.getByText('Ganador 1')).toBeVisible();
        await expect(finishedSection.getByText('Perdedor 1')).toBeVisible();
        await expect(finishedSection.getByText('Diana 4')).toBeVisible();

        // 6. Verificar sección Otras partidas
        const othersSection = page
            .locator('div')
            .filter({ has: page.getByRole('heading', { name: /Otras partidas/i }) })
            .first();
        await expect(othersSection.getByText('Pausado 1')).toBeVisible();
        await expect(othersSection.getByText('Pausado 2')).toBeVisible();
        await expect(othersSection.getByText('Diana 5')).toBeVisible();
    });

    test('debe filtrar las secciones de las partidas al alternar los botones de estado', async ({ page }) => {
        // 1. Mockear datos mixtos para tener elementos en todas las secciones
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: MOCK_MIXED_MATCHES,
                }),
            });
        });

        // 2. Ir a la pestaña de PARTIDAS
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await matchesButton.click();

        // 3. Verificar que inicialmente todas las secciones seleccionadas por defecto están visibles
        await expect(page.getByRole('heading', { name: /Partidas en curso/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Partidas pendientes/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Partidas finalizadas/i })).toBeVisible();

        // 4. Desactivar el filtro "En curso" haciendo clic en su botón
        const inProgressFilterButton = page.getByRole('button', { name: 'En curso', exact: true });
        await inProgressFilterButton.click();

        // 5. Verificar que la sección "Partidas en curso" desaparece del DOM
        await expect(page.getByRole('heading', { name: /Partidas en curso/i })).not.toBeVisible();
        await expect(page.getByRole('heading', { name: /Partidas pendientes/i })).toBeVisible();

        // 6. Desactivar el filtro "Pendientes"
        const pendingFilterButton = page.getByRole('button', { name: 'Pendientes', exact: true });
        await pendingFilterButton.click();

        // 7. Verificar que solo queda la sección de finalizadas y otras partidas
        await expect(page.getByRole('heading', { name: /Partidas pendientes/i })).not.toBeVisible();
        await expect(page.getByRole('heading', { name: /Partidas finalizadas/i })).toBeVisible();
    });

    test('debe filtrar las partidas por la ronda seleccionada en el dropdown', async ({ page }) => {
        // 1. Mockear datos mixtos (MOCK_MIXED_MATCHES tiene partidas de Ronda 1, MOCK_MATCHES tiene de Ronda 2)
        const ALL_MATCHES = [...MOCK_MIXED_MATCHES, MOCK_MATCHES[2]];

        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: ALL_MATCHES,
                }),
            });
        });

        // 2. Ir a la pestaña de PARTIDAS
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await matchesButton.click();

        // 3. Localizar el selector de Ronda (buscando por su etiqueta vinculada)
        await page.getByRole('combobox', { name: 'Ronda' }).click();
        await page.getByRole('option', { name: 'Ronda 2', exact: true }).click();

        // 4. Verificar que los elementos de la Ronda 1 ya no son visibles en sus respectivas secciones
        await expect(page.getByText('Rival Activo 1')).not.toBeVisible();

        // 5. Verificar que la partida de la Ronda 2 (Por determinar) ahora es la que se muestra
        const pendingSection = page.locator('div').filter({ has: page.getByRole('heading', { name: /Partidas pendientes/i }) }).first();
        await expect(pendingSection.getByText('Por determinar').first()).toBeVisible();

        // 6. Volver a seleccionar "Todas las rondas" y comprobar que vuelven a aparecer
        await page.getByRole('combobox', { name: 'Ronda' }).click();
        await page.getByRole('option', { name: 'Todas las rondas', exact: true }).click();
        await expect(page.getByText('Rival Activo 1')).toBeVisible();
    });

    test('debe permitir asignar una diana a una partida pendiente desde la pestaña de partidas', async ({ page }) => {
        // 1. Definimos una partida sin diana (boardNumber: null) pero lista para jugar (READY) 
        // para que sea interactuable en la sección de Pendientes
        const MOCK_MATCH_WITHOUT_BOARD = {
            id: 'match-unassigned-123',
            round: 1,
            matchIndex: 4,
            boardNumber: null,
            boardShortId: null,
            startedAt: null,
            finishedAt: null,
            status: 'READY',
            participant1: { id: 'p10', alias: 'Aspirante A', federation: Federations.ARAGON },
            participant2: { id: 'p11', alias: 'Aspirante B', federation: Federations.ARAGON },
            matchScore: {
                participant1: { setsWon: 0, legsWon: 0 },
                participant2: { setsWon: 0, legsWon: 0 },
            },
        };

        // Inyectamos esta partida en el endpoint de consulta
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    message: "Matches fetched successfully",
                    data: [MOCK_MATCH_WITHOUT_BOARD],
                }),
            });
        });

        // 2. Interceptamos la llamada PUT/POST que ejecuta el backend al asignar la diana (ej: Diana número 3)
        let putRequestTriggered = false;
        await page.route(new RegExp(`/matches/${MOCK_MATCH_WITHOUT_BOARD.id}/board`), async (route) => {
            putRequestTriggered = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' }),
            });
        });

        // 3. Navegar a la pantalla del torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 4. Verificar que estamos en la pantalla del torneo
        const title = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(title).toBeVisible();

        // 5. Navegamos explícitamente a la pestaña "PARTIDAS"
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await expect(matchesButton).toBeVisible();
        await matchesButton.click();

        // 6. Localizamos la tarjeta específica de la partida buscando a sus participantes
        const pendingSection = page.locator('div').filter({ has: page.getByRole('heading', { name: /Partidas pendientes/i }) }).first();
        const matchCard = pendingSection.locator('div').filter({ hasText: 'Aspirante A' }).first();
        await expect(matchCard).toBeVisible();

        // Verificamos que inicialmente muestre el estado sin diana
        await expect(matchCard.getByText('Diana sin asignar')).toBeVisible();

        // 7. Buscamos y pulsamos el botón de asignación dentro de esa tarjeta de partida
        const assignBoardButton = matchCard.getByRole('button', { name: 'Asignar diana', exact: true });
        await expect(assignBoardButton).toBeVisible();
        await assignBoardButton.click();

        // 8. Interactuar con el Modal 'Asignar Diana'
        // Validamos que el título del modal sea el correcto
        const modalHeading = page.getByRole('heading', { name: 'Asignar Diana', exact: true });
        await expect(modalHeading).toBeVisible();

        // Localizamos el TextInput mediante su label "Número de diana" e introducimos el valor
        const boardInput = page.getByLabel('Número de diana');
        await expect(boardInput).toBeVisible();
        await boardInput.fill('3');

        // Localizamos el botón de confirmación "Asignar" del modal y hacemos click
        const confirmModalButton = page.getByRole('button', { name: 'Asignar', exact: true });
        await expect(confirmModalButton).toBeEnabled();
        await confirmModalButton.click();

        // 9. Validación de que la API recibió la petición de guardado
        await expect.poll(() => putRequestTriggered).toBeTruthy();

        // Verificamos que tras confirmar, el modal se haya cerrado de la vista
        await expect(modalHeading).not.toBeVisible();
    });

    test('debe permitir cambiar (reasignar) la diana a una partida que ya tiene una asignada', async ({ page }) => {
        // 1. Definimos una partida que ya cuenta con diana inicial asignada (Diana 1)
        const MOCK_MATCH_WITH_BOARD = {
            id: 'match-reassign-456',
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
                participant1: { setsWon: 0, legsWon: 0 },
                participant2: { setsWon: 0, legsWon: 0 },
            },
        };

        // Inyectamos esta partida en el endpoint de consulta
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    message: "Matches fetched successfully",
                    data: [MOCK_MATCH_WITH_BOARD],
                }),
            });
        });

        // 2. Interceptamos la llamada PUT/POST de actualización de diana
        let putRequestTriggered = false;
        await page.route(new RegExp(`/matches/${MOCK_MATCH_WITH_BOARD.id}/board`), async (route) => {
            putRequestTriggered = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' }),
            });
        });

        // 3. Navegar a la pantalla del torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 4. Verificar que estamos en la pantalla del torneo
        const title = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(title).toBeVisible();

        // 5. Navegar a la pestaña "PARTIDAS"
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await expect(matchesButton).toBeVisible();
        await matchesButton.click();

        // 6. Localizar la tarjeta del partido buscando a su primer participante
        const pendingSection = page.locator('div').filter({ has: page.getByRole('heading', { name: /Partidas pendientes/i }) }).first();
        const matchCard = pendingSection.locator('div').filter({ hasText: 'Player 1' }).first();
        await expect(matchCard).toBeVisible();

        // Confirmar que el texto visual inicial muestra la diana que venía en el Mock
        await expect(matchCard.getByText('Diana 1')).toBeVisible();

        // 7. Hacer click en el botón para cambiar o reasignar la diana
        // (Usa una expresión regular flexible por si tu diseño de MatchCard utiliza un botón o icono con texto "Asignar", "Cambiar" o "Diana")
        const reassignBoardButton = matchCard.getByRole('button', { name: /Asignar|Cambiar/i });
        await expect(reassignBoardButton).toBeVisible();
        await reassignBoardButton.click();

        // 8. Gestionar el modal reutilizable 'Asignar Diana'
        const modalHeading = page.getByRole('heading', { name: 'Asignar Diana', exact: true });
        await expect(modalHeading).toBeVisible();

        const boardInput = page.getByLabel('Número de diana');
        await expect(boardInput).toBeVisible();

        // Limpiamos el valor previo que pudiera venir precargado e insertamos la nueva diana (Diana 5)
        await boardInput.clear();
        await boardInput.fill('5');

        // Confirmamos el cambio presionando el botón "Asignar" del modal
        const confirmModalButton = page.getByRole('button', { name: 'Asignar', exact: true });
        await expect(confirmModalButton).toBeEnabled();
        await confirmModalButton.click();

        // 9. Validaciones finales
        // Verificamos que la API haya procesado la petición
        await expect.poll(() => putRequestTriggered).toBeTruthy();

        // Verificamos el cierre del modal
        await expect(modalHeading).not.toBeVisible();
    });

    test('debe permitir suspender una partida en curso', async ({ page }) => {
        // 1. Mock de una partida en curso (IN_PROGRESS)
        const MOCK_IN_PROGRESS_MATCH = {
            id: 'match-to-suspend-999',
            round: 1,
            matchIndex: 0,
            boardNumber: 3,
            boardShortId: 'BOARD-003',
            startedAt: '2026-08-15T18:05:00.000Z',
            finishedAt: null,
            status: 'IN_PROGRESS',
            participant1: { id: 'p1', alias: 'Rival Activo 1', federation: Federations.MADRID },
            participant2: { id: 'p2', alias: 'Rival Activo 2', federation: Federations.GALICIA },
            matchScore: {
                participant1: { setsWon: 0, legsWon: 2 },
                participant2: { setsWon: 0, legsWon: 1 },
            },
        };

        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: [MOCK_IN_PROGRESS_MATCH],
                }),
            });
        });

        // Interceptamos la llamada a la API que realiza la suspensión del partido
        let suspendRequestTriggered = false;
        await page.route(new RegExp(`/matches/${MOCK_IN_PROGRESS_MATCH.id}/suspend`), async (route) => {
            suspendRequestTriggered = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' }),
            });
        });

        // 2. Ir a la pestaña de PARTIDAS
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await matchesButton.click();

        // 3. Localizar la sección "Partidas en curso" y la tarjeta del partido
        const inProgressSection = page.locator('div').filter({ has: page.getByRole('heading', { name: /Partidas en curso/i }) }).first();
        const matchCard = inProgressSection.locator('div').filter({ hasText: 'Rival Activo 1' }).first();
        await expect(matchCard).toBeVisible();

        // 4. Hacer click en el botón de Suspender dentro de la tarjeta
        const suspendButton = matchCard.getByRole('button', { name: /Suspender/i });
        await expect(suspendButton).toBeVisible();
        await suspendButton.click();

        // 5. Validar que se ha ejecutado la petición HTTP correctamente
        await expect.poll(() => suspendRequestTriggered).toBeTruthy();
    });

    test('debe permitir reanudar una partida previamente suspendida', async ({ page }) => {
        // 1. Mock de una partida suspendida (SUSPENDED)
        const MOCK_SUSPENDED_MATCH = {
            id: 'match-to-resume-888',
            round: 1,
            matchIndex: 3,
            boardNumber: 5,
            boardShortId: 'BOARD-005',
            startedAt: '2026-08-15T18:10:00.000Z',
            finishedAt: null,
            status: 'SUSPENDED',
            participant1: { id: 'p7', alias: 'Pausado 1', federation: Federations.GALICIA },
            participant2: { id: 'p8', alias: 'Pausado 2', federation: Federations.GALICIA },
            matchScore: {
                participant1: { setsWon: 0, legsWon: 1 },
                participant2: { setsWon: 0, legsWon: 1 },
            },
        };

        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: [MOCK_SUSPENDED_MATCH],
                }),
            });
        });

        // Interceptamos la llamada a la API que realiza la reanudación del partido
        let resumeRequestTriggered = false;
        await page.route(new RegExp(`/matches/${MOCK_SUSPENDED_MATCH.id}/resume`), async (route) => {
            resumeRequestTriggered = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' }),
            });
        });

        // 2. Ir a la pestaña de PARTIDAS
        const matchesButton = page.getByRole('button', { name: 'PARTIDAS', exact: true });
        await matchesButton.click();

        // 3. Según tu lógica de filtrado, las partidas SUSPENDED van a la sección "Otras partidas"
        const othersSection = page.locator('div').filter({ has: page.getByRole('heading', { name: /Otras partidas/i }) }).first();
        const matchCard = othersSection.locator('div').filter({ hasText: 'Pausado 1' }).first();
        await expect(matchCard).toBeVisible();

        // 4. Hacer click en el botón de Reanudar dentro de la tarjeta
        const resumeButton = matchCard.getByRole('button', { name: /Reanudar/i });
        await expect(resumeButton).toBeVisible();
        await resumeButton.click();

        // 5. Validar que se ha ejecutado la petición HTTP correctamente
        await expect.poll(() => resumeRequestTriggered).toBeTruthy();
    });
});

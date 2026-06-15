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

    test('debe permitir configurar el salón de juego desde cero con 2 dianas', async ({ page }) => {
        await page.route(new RegExp(`/tournaments/${MOCK_TOURNAMENT.id}/matches`), async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success', data: [] }),
            });
        });

        let isAreaConfiguredInBackend = false;
        let postRequestPayload: any = null;
        await page.route(new RegExp(`/tournaments/${MOCK_TOURNAMENT.id}/playing-areas`), async (route) => {
            const method = route.request().method();

            if (method === 'POST') {
                postRequestPayload = route.request().postDataJSON();
                isAreaConfiguredInBackend = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: "true",
                        message: "Playing area created successfully",
                        data: {
                            id: PLAYING_AREA_ID,
                            shortId: 'PA-88',
                            tournamentId: MOCK_TOURNAMENT.id,
                            boards: [
                                { id: "BOARD-01-PA-88", shortId: 'B-01', number: 1, status: BoardStatus.AVAILABLE, matchId: null },
                                { id: "BOARD-02-PA-88", shortId: 'B-02', number: 2, status: BoardStatus.AVAILABLE, matchId: null }
                            ]
                        },
                    }),
                });
            } else if (method === 'GET') {
                if (isAreaConfiguredInBackend) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            id: PLAYING_AREA_ID,
                            shortId: 'PA-88',
                            tournamentId: MOCK_TOURNAMENT.id,
                            boards: [
                                { number: 1, shortId: 'B-01', status: BoardStatus.AVAILABLE, matchId: null },
                                { number: 2, shortId: 'B-02', status: BoardStatus.AVAILABLE, matchId: null }
                            ]
                        }),
                    });
                } else {
                    await route.fulfill({
                        status: 404,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: 'error',
                            message: 'Playing area not found',
                            data: null,
                        }),
                    });
                }
            }
        });

        // 2. Forzar la recarga para que el mock entre en vigor
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 3. Verificar que estamos en la pantalla del torneo
        const title = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(title).toBeVisible();

        // 4. Navegar al tab de Partidas
        const playingAreaButton = page.getByRole('button', { name: 'SALÓN DE JUEGO', exact: true });
        await playingAreaButton.click();

        // 5. Verificar que aparece el estado vacío (Empty State) ahora que la API ya respondió
        await expect(page.getByText('Salón de juego sin configurar')).toBeVisible();

        // 7. Interactuar con el formulario de configuración
        const configurePlayingAreaButton = page.getByRole('button', { name: 'Configurar salón de juego', exact: true });
        await expect(configurePlayingAreaButton).toBeVisible();
        await configurePlayingAreaButton.click();

        const boardsInput = page.getByLabel('Número de dianas');
        await expect(boardsInput).toBeVisible();
        await boardsInput.fill('2');

        // 8. Enviar el formulario esperando proactivamente la llamada a la API
        const saveButton = page.getByRole('button', { name: 'Guardar configuración', exact: true });
        await expect(saveButton).toBeVisible();

        const postResponsePromise = page.waitForResponse(
            response => response.url().includes(`/tournaments/${MOCK_TOURNAMENT.id}/playing-areas`) && response.request().method() === 'POST'
        );

        await saveButton.click();
        await postResponsePromise;

        // 9. Validaciones finales
        await expect(page.getByRole('heading', { name: 'Salón de Juego' })).toBeVisible();
        await expect(page.getByText('ID: PA-88')).toBeVisible();

        // 10. Comprobar que las dianas creadas están en la vista
        await expect(page.locator('div').filter({ hasText: 'B-01' }).first()).toBeVisible();
        await expect(page.locator('div').filter({ hasText: 'B-02' }).first()).toBeVisible();
    });

    test('debe permitir asignar una partida pendiente a una diana disponible', async ({ page }) => {
        // 1. Definimos una partida ficticia que cumpla las condiciones para ser asignada
        const MOCK_ASSIGNABLE_MATCH = {
            id: 'match-xyz-789',
            tournamentId: MOCK_TOURNAMENT.id,
            round: 1,
            matchIndex: 3,
            status: 'READY', // Al estar READY o PENDING aparece en la lista de asignables
            participant1: { alias: 'Jugador 1' },
            participant2: { alias: 'Jugador 2' },
        };

        // Forzamos a que el endpoint de partidas devuelva esta partida elegible
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    data: [MOCK_ASSIGNABLE_MATCH],
                }),
            });
        });

        // 2. Interceptamos el método POST/PUT de asignación que invoca tu 'matchService.assignMatchBoard'
        let assignationPayload: any = null;
        await page.route(new RegExp(`/matches/${MOCK_ASSIGNABLE_MATCH.id}/board`), async (route) => {
            assignationPayload = route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' }),
            });
        });

        // 3. Forzamos un re-fetch simulado del GET tras la asignación para verificar cambios en la UI si fuera necesario
        // (En tu flujo invocas a `fetchData()` tras completar la asignación con éxito)
        let isMatchAssigned = false;
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/playing-areas`, async (route) => {
            if (isMatchAssigned) {
                // Estado simulado después de la asignación exitosa
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        data: {
                            ...MOCK_PLAYING_AREA,
                            boards: [
                                { number: 1, shortId: 'B-01', status: BoardStatus.OCCUPIED, matchId: MOCK_ASSIGNABLE_MATCH.id },
                                { number: 2, shortId: 'B-02', status: BoardStatus.DISABLED, matchId: null }
                            ]
                        }
                    }),
                });
            } else {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success', data: MOCK_PLAYING_AREA }),
                });
            }
        });

        // 2. Forzar la recarga para que el mock entre en vigor
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 3. Verificar que estamos en la pantalla del torneo
        const title = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(title).toBeVisible();

        // Recargamos sutilmente la pestaña para renderizar la partida disponible en los selectores
        const playingAreaButton = page.getByRole('button', { name: 'SALÓN DE JUEGO', exact: true });
        await playingAreaButton.click();

        // 4. Localizar la tarjeta de la Diana 1 (B-01) y abrir el modal
        const boardOneCard = page.locator('div').filter({ hasText: 'B-01' }).first();
        const assignButton = boardOneCard.getByRole('button', { name: 'Asignar partida' });
        await expect(assignButton).toBeVisible();
        await assignButton.click();

        // 5. Verificar la apertura del modal y la visibilidad de los elementos
        await expect(page.getByRole('heading', { name: 'Asignar partida a la Diana 1' })).toBeVisible();

        // Localizamos el selector de partidas
        const selectDropdown = page.getByLabel('Selecciona una partida');
        await expect(selectDropdown).toBeVisible();

        // Cambiamos el estado interno antes de confirmar para simular la persistencia en el re-fetch
        isMatchAssigned = true;

        // 6. Seleccionar la partida del desplegable (usando la opción con el texto correspondiente)
        await page.getByRole('combobox', { name: 'Selecciona una partida' }).click();
        await page.getByRole('option', { name: 'Ronda 1 - Partida 3 (Jugador 1 vs Jugador 2)', exact: true }).click();

        // 7. Hacer click en el botón de confirmación del modal y esperar la petición de red
        const confirmButton = page.getByRole('button', { name: 'Asignar', exact: true });
        await expect(confirmButton).toBeEnabled();

        const assignResponsePromise = page.waitForResponse(
            response => response.url().includes(`/matches/${MOCK_ASSIGNABLE_MATCH.id}/board`)
        );

        await confirmButton.click();
        await assignResponsePromise;

        // 8. Verificaciones finales
        // Validamos que el modal se cerró
        await expect(page.getByRole('heading', { name: 'Asignar partida a la Diana 1' })).not.toBeVisible();

        // Opcional: Validar que el Toast o la UI informen del cambio de estado a ocupado o refleje el éxito
        await expect(page.getByText('Partida asignada correctamente')).toBeVisible();
    });

    test('debe permitir suspender una partida en curso en una diana ocupada', async ({ page }) => {
        const MOCK_ACTIVE_MATCH = {
            id: 'match-live-456',
            tournamentId: MOCK_TOURNAMENT.id,
            round: 1,
            matchIndex: 1,
            status: 'IN_PROGRESS',
            participant1: { alias: 'Jugador 1' },
            participant2: { alias: 'Jugador 2' },
        };

        // 1. Forzar que el salón devuelva la Diana 1 ocupada por esta partida
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/playing-areas`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    data: {
                        ...MOCK_PLAYING_AREA,
                        boards: [
                            { number: 1, shortId: 'B-01', status: BoardStatus.OCCUPIED, matchId: MOCK_ACTIVE_MATCH.id },
                            { number: 2, shortId: 'B-02', status: BoardStatus.DISABLED, matchId: null }
                        ]
                    }
                }),
            });
        });

        await page.route(new RegExp(`/tournaments/${MOCK_TOURNAMENT.id}/matches`), async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [MOCK_ACTIVE_MATCH],
                })
            });
        });

        // 2. Mockear el endpoint del servicio (matchActions / matchService) para suspender la partida
        let suspendRequestTriggered = false;
        await page.route(new RegExp(`/matches/${MOCK_ACTIVE_MATCH.id}/suspend`), async (route) => {
            if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
                suspendRequestTriggered = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' }),
                });
            }
        });

        // 3. Recargar la sección del torneo y navegar al salón de juego
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);
        await page.getByRole('button', { name: 'SALÓN DE JUEGO', exact: true }).click();

        // 4. Localizar la diana ocupada y abrir las acciones de partida (MatchActionModals)
        const boardOneCard = page.locator('div').filter({ hasText: 'B-01' }).first();
        const actionsButton = boardOneCard.getByRole('button', { name: 'Acciones' }).or(boardOneCard.getByRole('button', { name: 'Gestionar partida' }));

        // En caso de que se renderice directamente el botón "Suspender" en la BoardCard:
        const suspendButton = boardOneCard.getByRole('button', { name: 'Suspender', exact: false });
        await expect(suspendButton).toBeVisible();
        await suspendButton.click();

        // 6. Verificar éxito
        expect(suspendRequestTriggered).toBeTruthy();
        await expect(page.getByText('Partida suspendida con éxito.')).toBeVisible();
    });

    test('debe permitir reanudar una partida que ha sido suspendida', async ({ page }) => {
        const MOCK_SUSPENDED_MATCH = {
            id: 'match-suspended-789',
            tournamentId: MOCK_TOURNAMENT.id,
            round: 1,
            matchIndex: 2,
            status: 'SUSPENDED',
            participant1: { alias: 'Jugador 1' },
            participant2: { alias: 'Jugador 2' },
        };

        // 1. Forzar que la Diana 1 tenga la partida asignada (o que aparezca como suspendida en la gestión)
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/playing-areas`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    data: {
                        ...MOCK_PLAYING_AREA,
                        boards: [
                            { number: 1, shortId: 'B-01', status: BoardStatus.OCCUPIED, matchId: MOCK_SUSPENDED_MATCH.id },
                            { number: 2, shortId: 'B-02', status: BoardStatus.DISABLED, matchId: null }
                        ]
                    }
                }),
            });
        });

        await page.route(new RegExp(`/tournaments/${MOCK_TOURNAMENT.id}/matches`), async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [MOCK_SUSPENDED_MATCH],
                })
            });
        });

        // 2. Interceptar la llamada a la API para reanudar la partida
        let resumeRequestTriggered = false;
        await page.route(new RegExp(`/matches/${MOCK_SUSPENDED_MATCH.id}/resume`), async (route) => {
            if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
                resumeRequestTriggered = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' }),
                });
            }
        });

        // 3. Ir a la vista
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);
        await page.getByRole('button', { name: 'SALÓN DE JUEGO', exact: true }).click();

        // 4. Buscar el botón de reanudar en la tarjeta de la Diana 1
        const boardOneCard = page.locator('div').filter({ hasText: 'B-01' }).first();
        const resumeButton = boardOneCard.getByRole('button', { name: 'Reanudar', exact: false });
        await expect(resumeButton).toBeVisible();
        await resumeButton.click();

        // 5. Validar que la petición de red se realizó con éxito
        expect(resumeRequestTriggered).toBeTruthy();
        await expect(page.getByText('Partida reanudada con éxito')).toBeVisible();
    });
});

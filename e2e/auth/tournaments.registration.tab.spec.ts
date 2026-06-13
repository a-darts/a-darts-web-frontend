import { test, expect } from '@playwright/test';
import { TournamentStatus, GameModes, GameTypes, Federations, RegistrationStatus } from '../../src/services/tournament.service';
import { formatDate, formatDateTime, formatTime } from '../../src/utils/shared.utils';
import { getGameTypeLabel } from '../../src/utils/tournament.utils';


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

const MOCK_UNREGISTERED_PLAYERS = [
    {
        id: 'p3',
        userId: '3',
        registrationNumber: '1256',
        federation: Federations.CANARIAS,
        seasonStartYear: 2026,
        userAlias: 'Jugador 3',
    },
    {
        id: 'p4',
        userId: '4',
        registrationNumber: '1257',
        federation: Federations.GALICIA,
        seasonStartYear: 2026,
        userAlias: 'Jugador 4',
    },
];

test.describe('Tournaments Registration Tab', () => {

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

        // 5. Mock GET /tournaments/{id}/unregistered-players
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/unregistered-players`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: MOCK_UNREGISTERED_PLAYERS,
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

    test('debe navegar al tab de Inscripciones y mostrar los jugadores inscritos', async ({ page }) => {
        // 1. Navegar al tab de Inscripciones
        const registrationButton = page.getByRole('button', { name: 'INSCRIPCIONES', exact: true });
        await expect(registrationButton).toBeVisible();
        await registrationButton.click();

        // 2. Verificar que estamos en el tab de Inscripciones
        const title = page.getByRole('heading', { name: 'Jugadores inscritos', exact: true });
        await expect(title).toBeVisible();

        // 3. Verificar que aparecen todos los jugadores inscritos
        await expect(page.getByText(MOCK_PARTICIPANTS[0].alias)).toBeVisible();
        await expect(page.getByText(MOCK_PARTICIPANTS[0].federation)).toBeVisible();
        await expect(page.getByText(MOCK_PARTICIPANTS[1].alias)).toBeVisible();
        await expect(page.getByText(MOCK_PARTICIPANTS[1].federation)).toBeVisible();
        await expect(page.getByText('2 JUGADORES')).toBeVisible();
    });

    test('debe mostrar un mensaje de lista vacía cuando no hay jugadores inscritos', async ({ page }) => {
        // 1. Sobreescribir la ruta para que no devuelva ningún jugador inscrito
        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: [],
                }),
            });
        });

        // 2. Forzamos recargar la página
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 3. Ir al tab de Inscripciones
        const registrationButton = page.getByRole('button', { name: 'INSCRIPCIONES', exact: true });
        await registrationButton.click();

        // 4. Validar que el contador marque 0 y muestre el mensaje de tabla vacía
        await expect(page.getByText('0 JUGADORES')).toBeVisible();
        await expect(page.getByText('No hay jugadores inscritos en este torneo')).toBeVisible();
    });

    test('debe permitir buscar y filtrar participantes por alias', async ({ page }) => {
        // 1. Navegar al tab de Inscripciones
        const registrationButton = page.getByRole('button', { name: 'INSCRIPCIONES', exact: true });
        await registrationButton.click();

        // 2. Localizar el buscador usando el placeholder del componente
        const searchInput = page.getByPlaceholder('Buscar por alias...');
        await expect(searchInput).toBeVisible();

        // 3. CASO 1: Filtrado con coincidencia exacta/parcial
        await searchInput.fill('Jugador 1');

        await expect(page.getByText(MOCK_PARTICIPANTS[0].alias)).toBeVisible();
        await expect(page.getByText(MOCK_PARTICIPANTS[1].alias)).not.toBeVisible();

        // 4. CASO 2: Búsqueda sin ningún resultado
        await searchInput.fill('InexistenteXYZ');

        await expect(page.getByText(MOCK_PARTICIPANTS[0].alias)).not.toBeVisible();
        await expect(page.getByText(MOCK_PARTICIPANTS[1].alias)).not.toBeVisible();

        await expect(page.getByText('No hay jugadores inscritos en este torneo')).toBeVisible();

        // 5. CASO 3: Restaurar el buscador
        await searchInput.fill('');
        await expect(page.getByText(MOCK_PARTICIPANTS[0].alias)).toBeVisible();
        await expect(page.getByText(MOCK_PARTICIPANTS[1].alias)).toBeVisible();
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

            // 3. Ir al tab de Inscripciones
            const registrationButton = page.getByRole('button', { name: 'INSCRIPCIONES', exact: true });
            await registrationButton.click();

            // 4. Verificar que estamos en el tab de Inscripciones
            const title = page.getByRole('heading', { name: 'Jugadores inscritos', exact: true });
            await expect(title).toBeVisible();
        });

        test('debe mostrar que las inscripciones están ABIERTAS y el check-in ACTIVADO', async ({ page }) => {
            // 1. Verificar sección del estado de las inscripciones
            await expect(page.getByText('ESTADO').first()).toBeVisible();
            await expect(page.locator('div', { hasText: /^Inscripciones abiertas$/ })).toBeVisible();
            await expect(page.getByText('APERTURA INSCRIPCIONES')).toBeVisible();
            await expect(page.getByText('Sin programar', { exact: true })).toBeVisible();
            await expect(page.getByText('CIERRE INSCRIPCIONES')).toBeVisible();
            await expect(page.getByText('15 de agosto de 2026 a las 19:50', { exact: true })).toBeVisible();

            // 2. Verificar sección del estado del check-in
            await expect(page.getByText('ESTADO CHECK-IN')).toBeVisible();
            await expect(page.getByText('Activado', { exact: true })).toBeVisible();

            // 3. Verificar botones de acción
            await expect(page.getByRole('button', { name: 'Cerrar inscripciones', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Programar apertura/cierre', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Deshabilitar Check-In', exact: true })).toBeVisible();

            await expect(page.getByRole('button', { name: 'INSCRIBIR PARTICIPANTE', exact: true })).toBeVisible();
        });

        test('debe mostrar que las inscripciones están CERRADAS y el check-in DESACTIVADO', async ({ page }) => {
            // 1. Clonamos y modificamos las propiedades del torneo para simular las inscripciones cerradas
            const MOCK_TOURNAMENT_CLOSED = {
                ...MOCK_TOURNAMENT,
                registration: {
                    hasCheckIn: false,
                    status: RegistrationStatus.CLOSED,
                    registrationPeriod: { startsAt: '2026-06-12T16:32:00.000Z', endsAt: null },
                },
            };

            // 2. Sobreescribimos el endpoint del torneo ANTES de forzar la recarga
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}`, async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: MOCK_TOURNAMENT_CLOSED,
                    }),
                });
            });

            // 3. Recargamos la interfaz para pintar la nueva configuración del API
            await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);
            await page.getByRole('button', { name: 'INSCRIPCIONES', exact: true }).click();

            // 4. Verificar sección del estado de las inscripciones
            await expect(page.getByText('ESTADO').first()).toBeVisible();
            await expect(page.locator('div', { hasText: /^Inscripciones cerradas$/ })).toBeVisible();
            await expect(page.getByText('APERTURA INSCRIPCIONES')).toBeVisible();
            await expect(page.getByText('12 de junio de 2026 a las 18:32', { exact: true })).toBeVisible();
            await expect(page.getByText('CIERRE INSCRIPCIONES')).toBeVisible();
            await expect(page.getByText('Sin programar', { exact: true })).toBeVisible();

            // 5. Verificar sección del estado del check-in
            await expect(page.getByText('ESTADO CHECK-IN')).toBeVisible();
            await expect(page.getByText('Desactivado', { exact: true })).toBeVisible();

            // 6. Verificar botones de acción
            await expect(page.getByRole('button', { name: 'Abrir inscripciones', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Programar apertura/cierre', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Habilitar Check-In', exact: true })).toBeVisible();

            await expect(page.getByRole('button', { name: 'INSCRIBIR PARTICIPANTE', exact: true })).toBeVisible();
        });
    });

    test.describe('Vistas del Player', () => {
        test('un jugador (PLAYER) debe poder inscribirse en un torneo', async ({ page }) => {
            // 1. Preparar los datos que simulan al jugador ya inscrito tras la acción
            const MOCK_NEW_PARTICIPANT = {
                id: '3',
                playerId: 'player-3',
                registeredAt: new Date().toISOString(),
                checkedInAt: null,
                alias: MOCK_PLAYER.alias,
                federation: Federations.ARAGON,
            };

            // Creamos la lista actualizada que el backend devolvería en la segunda llamada
            const UPDATED_PARTICIPANTS = [...MOCK_PARTICIPANTS, MOCK_NEW_PARTICIPANT];

            // 3. Modificamos dinámicamente el GET de participantes para que devuelva la lista con el nuevo jugador
            let hasRegistered = false;
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants`, async (route) => {
                const method = route.request().method();

                if (method === 'POST') {
                    await route.fulfill({
                        status: 201,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            message: "Participant registered successfully",
                            data: null,
                        }),
                    });
                } else if (method === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            data: hasRegistered ? UPDATED_PARTICIPANTS : MOCK_PARTICIPANTS,
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.route(`${API_BASE}/players/users/${MOCK_PLAYER.id}/seasons/${MOCK_TOURNAMENT.seasonStartYear}`, async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            message: "Player data retrieved successfully",
                            data: {
                                id: MOCK_NEW_PARTICIPANT.playerId,
                                userId: MOCK_PLAYER.id,
                                registrationNumber: '3',
                                federation: MOCK_NEW_PARTICIPANT.federation,
                                seasonStartYear: MOCK_TOURNAMENT.seasonStartYear,
                            },
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 4. Navegar a la pestaña de Inscripciones
            await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);
            const registrationButton = page.getByRole('button', { name: 'INSCRIPCIONES', exact: true });
            await registrationButton.click();

            // 5. Verificar que inicialmente no está inscrito (total 2)
            await expect(page.getByText('2 JUGADORES')).toBeVisible();
            const participantsContainer = page.getByRole('table').or(page.locator('.participants-list-container'));
            await expect(participantsContainer.getByText(MOCK_PLAYER.alias)).not.toBeVisible();

            // 6. Hacer clic en el botón de inscripción para Jugadores
            const registerMeButton = page.getByRole('button', { name: 'INSCRIBIRSE', exact: true });
            await expect(registerMeButton).toBeVisible();
            await registerMeButton.click();

            // 7. Verificar que se meustra el modal de doble confirmación
            const modalHeading = page.getByRole('heading', { name: 'INSCRIBIRSE', exact: true });
            await expect(modalHeading).toBeVisible();
            await expect(page.getByText(`Confirma la inscripción al torneo ${MOCK_TOURNAMENT.name}`)).toBeVisible();

            hasRegistered = true;

            // 8. Confirmar la acción en el modal
            const confirmButton = page.getByRole('button', { name: 'Confirmar', exact: true });
            await expect(confirmButton).toBeVisible();
            confirmButton.click()

            // 9. Verificar que se cierra el modal y aparece el jugador inscrito (total 3)
            await expect(modalHeading).not.toBeVisible();
            await expect(page.getByText('3 JUGADORES')).toBeVisible();
            await expect(participantsContainer.getByText(MOCK_PLAYER.alias)).toBeVisible();
        });

        test('un jugador (PLAYER) debe poder desinscribirse de un torneo', async ({ page }) => {
            // 1. Preparar el participante que representa al usuario actual ya inscrito
            const MOCK_MY_PARTICIPANT = {
                id: 'participant-active-123',
                playerId: 'player-mock-id-999', // El ID asignado al perfil de jugador
                registeredAt: '2026-01-02T00:00:00.000Z',
                checkedInAt: null,
                alias: MOCK_PLAYER.alias,
                federation: Federations.ARAGON,
            };

            // Lista inicial donde el jugador SÍ está inscrito
            const INITIAL_PARTICIPANTS = [...MOCK_PARTICIPANTS, MOCK_MY_PARTICIPANT];

            let hasUnregistered = false;

            // 2. Interceptar las peticiones de desinscripción (DELETE) y obtención de participantes (GET)
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants`, async (route) => {
                const method = route.request().method();

                if (method === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            data: hasUnregistered ? MOCK_PARTICIPANTS : INITIAL_PARTICIPANTS,
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // Endpoint DELETE específico que consume tu Front-End usando el id de participante
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants/${MOCK_MY_PARTICIPANT.id}`, async (route) => {
                if (route.request().method() === 'DELETE') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            message: "Participant unregistered successfully",
                            data: null,
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // Mockear el perfil de jugador de la temporada actual para que asocie al usuario con el participante
            await page.route(`${API_BASE}/players/users/${MOCK_PLAYER.id}/seasons/${MOCK_TOURNAMENT.seasonStartYear}`, async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            data: {
                                id: MOCK_MY_PARTICIPANT.playerId,
                                userId: MOCK_PLAYER.id,
                                registrationNumber: '999',
                                federation: MOCK_MY_PARTICIPANT.federation,
                                seasonStartYear: MOCK_TOURNAMENT.seasonStartYear,
                            },
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 3. Forzar carga de la pantalla del torneo y navegar al Tab de inscripciones
            await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);
            const registrationButton = page.getByRole('button', { name: 'INSCRIPCIONES', exact: true });
            await registrationButton.click();

            // 4. Verificar que inicialmente SÍ figura en la lista (Total: 3)
            await expect(page.getByText('3 JUGADORES')).toBeVisible();
            const participantsContainer = page.getByRole('table').or(page.locator('.participants-list-container'));
            await expect(participantsContainer.getByText(MOCK_PLAYER.alias)).toBeVisible();

            // 5. Hacer clic en el botón del Header 'DESINSCRIBIRSE'
            const unregisterMeButton = page.getByRole('button', { name: 'DESINSCRIBIRSE', exact: true });
            await expect(unregisterMeButton).toBeVisible();
            await unregisterMeButton.click();

            // 6. Verificar que se muestra el modal con el texto correspondiente
            const modalHeading = page.getByRole('heading', { name: 'DESINSCRIBIRSE', exact: true })
                .or(page.getByRole('heading', { name: `¿Estás seguro de que deseas desinscribirte del torneo ${MOCK_TOURNAMENT.name}?`, exact: true }));
            await expect(modalHeading).toBeVisible();

            // Cambiamos el flag de control antes de confirmar la acción en el modal
            hasUnregistered = true;

            // 7. Confirmar la acción en el modal
            const confirmButton = page.getByRole('button', { name: 'Desinscribirse', exact: true });
            await expect(confirmButton).toBeVisible();
            await confirmButton.click();

            // 8. Verificar que se cierra el modal, vuelve a haber 2 jugadores y el alias ya no aparece
            await expect(modalHeading).not.toBeVisible();
            await expect(page.getByText('2 JUGADORES')).toBeVisible();
            await expect(participantsContainer.getByText(MOCK_PLAYER.alias)).not.toBeVisible();

            // 9. Verificar que el botón cambia de estado visual a "INSCRIBIRSE"
            await expect(page.getByRole('button', { name: 'INSCRIBIRSE', exact: true })).toBeVisible();
        });
    });
});
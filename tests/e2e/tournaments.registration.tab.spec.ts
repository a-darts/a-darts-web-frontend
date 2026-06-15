import { test, expect } from '@playwright/test';
import { TournamentStatus, GameModes, GameTypes, Federations, RegistrationStatus } from '../../src/services/tournament.service';

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

        test('debe poder cerrar las inscripciones cuando están ABIERTAS', async ({ page }) => {
            // Variable de control local para alternar el estado que devuelve el GET del torneo
            let registrationClosed = false;

            // 1. Redefinimos el GET del torneo de forma dinámica para este test específico
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}`, async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            data: {
                                ...MOCK_TOURNAMENT,
                                registration: {
                                    ...MOCK_TOURNAMENT.registration,
                                    // Retorna CLOSED solo si ya se ha ejecutado con éxito el POST de cierre
                                    status: registrationClosed ? RegistrationStatus.CLOSED : RegistrationStatus.OPEN,
                                }
                            },
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 2. Mockear la acción de cerrar inscripciones (POST)
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/registration/close`, async (route) => {
                if (route.request().method() === 'POST') {
                    // Activamos el flag justo antes de resolver con éxito la mutación en el servidor mock
                    registrationClosed = true;

                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            message: "Registration closed successfully",
                            data: null,
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 3. Forzar una recarga limpia para asegurar que tome la redefinición dinámica del GET
            await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);
            await page.getByRole('button', { name: 'INSCRIPCIONES', exact: true }).click();

            // 4. Verificar el estado inicial de las inscripciones en la tarjeta informativa (Debe ser ABIERTAS)
            await expect(page.getByText('ESTADO').first()).toBeVisible();
            await expect(page.locator('div', { hasText: /^Inscripciones abiertas$/ })).toBeVisible();

            // 5. Localizar el botón de acción y lanzar el evento de cierre
            const closeRegistrationButton = page.getByRole('button', { name: 'Cerrar inscripciones', exact: true });
            await expect(closeRegistrationButton).toBeVisible();
            await closeRegistrationButton.click();

            // 6. Validar que aparezca el Toast de feedback provisto por tu componente React
            const successToast = page.getByText('Inscripciones cerradas correctamente.');
            await expect(successToast).toBeVisible();

            // 7. Verificar el cambio de estado en caliente tras el onRefresh() de la tarjeta informativa (Debe cambiar a CERRADAS)
            await expect(page.getByText('ESTADO').first()).toBeVisible();
            await expect(page.locator('div', { hasText: /^Inscripciones cerradas$/ })).toBeVisible();

            // 8. Verificar que el botón cambia su estado interno automáticamente a "Abrir inscripciones"
            await expect(page.getByRole('button', { name: 'Abrir inscripciones', exact: true })).toBeVisible();
        });

        test('debe poder abrir las inscripciones cuando están CERRADAS', async ({ page }) => {
            // Variable de control local para alternar el estado que devuelve el GET del torneo
            let registrationOpened = false;

            // 1. Redefinimos el GET del torneo de forma dinámica para este test específico
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}`, async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            data: {
                                ...MOCK_TOURNAMENT,
                                registration: {
                                    ...MOCK_TOURNAMENT.registration,
                                    // Comienza estando CERRADO y cambia a OPEN tras el POST de éxito
                                    status: registrationOpened ? RegistrationStatus.OPEN : RegistrationStatus.CLOSED,
                                }
                            },
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 2. Mockear la acción de abrir inscripciones (POST)
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/registration/open`, async (route) => {
                if (route.request().method() === 'POST') {
                    // Activamos el flag justo antes de resolver con éxito la mutación
                    registrationOpened = true;

                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            message: "Registration opened successfully",
                            data: null,
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 3. Forzar una recarga limpia para asegurar que tome la configuración de inscripciones CERRADAS inicial
            await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);
            await page.getByRole('button', { name: 'INSCRIPCIONES', exact: true }).click();

            // 4. Verificar el estado inicial de las inscripciones en la tarjeta informativa (Debe ser CERRADAS)
            await expect(page.getByText('ESTADO').first()).toBeVisible();
            await expect(page.locator('div', { hasText: /^Inscripciones cerradas$/ })).toBeVisible();

            // 5. Localizar el botón de acción "Abrir inscripciones" y hacer clic
            const openRegistrationButton = page.getByRole('button', { name: 'Abrir inscripciones', exact: true });
            await expect(openRegistrationButton).toBeVisible();
            await openRegistrationButton.click();

            // 6. Validar que aparezca el Toast de feedback provisto al abrir las inscripciones con éxito
            const successToast = page.getByText('Inscripciones abiertas correctamente.');
            await expect(successToast).toBeVisible();

            // 7. Verificar el cambio de estado tras el onRefresh() automático (Debe cambiar a ABIERTAS)
            await expect(page.getByText('ESTADO').first()).toBeVisible();
            await expect(page.locator('div', { hasText: /^Inscripciones abiertas$/ })).toBeVisible();

            // 8. Verificar que el botón cambia su etiqueta automáticamente a "Cerrar inscripciones"
            await expect(page.getByRole('button', { name: 'Cerrar inscripciones', exact: true })).toBeVisible();
        });

        test('debe permitir al administrador inscribir a un participante correctamente', async ({ page }) => {
            // 1. Mockear la llamada de la API para registrar al participante (POST)
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants`, async (route) => {
                if (route.request().method() === 'POST') {
                    const body = JSON.parse(route.request().postData() || '{}');
                    // Verificamos que se envía el ID del jugador seleccionado en el modal
                    expect(body.playerId).toBe('p3');

                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ status: 'success' }),
                    });
                } else {
                    await route.continue();
                }
            });

            await expect(page.getByText(MOCK_UNREGISTERED_PLAYERS[0].userAlias)).not.toBeVisible();

            // 2. Hacer clic en el botón para abrir el modal de inscripción
            const registerButton = page.getByRole('button', { name: 'INSCRIBIR PARTICIPANTE', exact: true });
            await expect(registerButton).toBeVisible();
            await registerButton.click();

            // 3. Verificar que el modal se ha abierto
            await expect(page.getByRole('heading', { name: 'INSCRIBIR PARTICIPANTE', exact: true })).toBeVisible();
            await expect(page.getByText(`Elige el jugador al que inscribir al torneo`)).toBeVisible();

            // 4. Seleccionar el jugador del desplegable
            await page.getByRole('combobox', { name: 'Jugador' }).click();
            await page.getByRole('option', { name: 'Jugador 3', exact: true }).click();

            // 5. Confirmar la inscripción
            const confirmButton = page.getByRole('button', { name: 'Confirmar', exact: true });
            await expect(confirmButton).toBeEnabled();
            await confirmButton.click();

            // 6. Verificar que el modal se cierra y se ha inscrito al jugador
            await expect(page.getByRole('heading', { name: 'INSCRIBIR PARTICIPANTE', exact: true })).not.toBeVisible();
            const toast = page.getByText('Participante inscrito correctamente.');
            await expect(toast).toBeVisible();
        });

        test('debe permitir al administrador desinscribir a un participante correctamente', async ({ page }) => {
            const participantToDelete = MOCK_PARTICIPANTS[0];

            // 1. Mockear la llamada de la API para desinscribir (DELETE)
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants/${participantToDelete.id}`, async (route) => {
                if (route.request().method() === 'DELETE') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: 'success',
                            message: 'Participant unregistered successfully',
                            data: null,
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 2. Localizar la fila del primer jugador y su respectivo botón "Desinscribir"
            const tableRow = page.locator('tr', { hasText: participantToDelete.alias });
            const unregisterButton = tableRow.getByRole('button', { name: 'Desinscribir', exact: true });

            await expect(unregisterButton).toBeVisible();
            await unregisterButton.click();

            // 3. Verificar que se abre el modal de confirmación de borrado
            await expect(page.getByRole('heading', { name: 'DESINSCRIBIR JUGADOR', exact: true })).toBeVisible();
            await expect(page.getByText(`¿Estás seguro de que deseas desinscribir a ${participantToDelete.alias} del torneo ${MOCK_TOURNAMENT.name}?`)).toBeVisible();

            // 4. Hacer clic en el botón "Desinscribir" del modal para confirmar la acción
            const modal = page.getByRole('dialog');
            const modalConfirmButton = modal.getByRole('button', { name: 'Desinscribir', exact: true });
            await modalConfirmButton.click();

            // 5. Verificar que el modal se cierra y se ha desinscrito al jugador
            await expect(page.getByRole('heading', { name: 'DESINSCRIBIR JUGADOR', exact: true })).not.toBeVisible();
            const toast = page.getByText('Participante desinscrito correctamente');
            await expect(toast).toBeVisible();
        });

        test('debe permitir al administrador programar las fechas de apertura y cierre correctamente', async ({ page }) => {
            // Variable de control local para simular la respuesta del servidor actualizada
            let scheduleUpdated = false;

            const EXPECTED_STARTS_AT = '2026-07-01T10:00:00.000Z';
            const EXPECTED_ENDS_AT = '2026-07-15T22:30:00.000Z';

            // 1. Redefinimos el GET del torneo de forma dinámica para reflejar los cambios programados al refrescar
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}`, async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            data: {
                                ...MOCK_TOURNAMENT,
                                registration: {
                                    ...MOCK_TOURNAMENT.registration,
                                    registrationPeriod: scheduleUpdated
                                        ? { startsAt: EXPECTED_STARTS_AT, endsAt: EXPECTED_ENDS_AT }
                                        : MOCK_TOURNAMENT.registration.registrationPeriod
                                }
                            },
                        }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 2. Mockear el endpoint PUT del servicio updateRegistrationSchedule
            await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/registration/schedule`, async (route) => {
                if (route.request().method() === 'PUT') {
                    const payload = JSON.parse(route.request().postData() || '{}');

                    // Validamos que el Front-End envíe la estructura esperada hacia tu backend
                    expect(payload.newRegistrationPeriod).toBeDefined();

                    scheduleUpdated = true; // Cambiamos el flag al recibir la petición con éxito

                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ status: 'success' }),
                    });
                } else {
                    await route.continue();
                }
            });

            // 3. Hacer clic en el botón para abrir el modal de programación
            const scheduleButton = page.getByRole('button', { name: 'Programar apertura/cierre', exact: true });
            await expect(scheduleButton).toBeVisible();
            await scheduleButton.click();

            // 4. Validar que el modal se abre con su título en mayúsculas
            const modalHeading = page.getByRole('heading', { name: 'PROGRAMAR CIERRE/APERTURA DE INSCRIPCIONES', exact: true });
            await expect(modalHeading).toBeVisible();

            // --- SECCIÓN: CONFIGURAR APERTURA ---
            // Localizamos el primer select (Apertura) dentro del contenedor modal
            await page.getByRole('combobox', { name: '¿Deseas programar la apertura de las inscripciones?' }).click();
            await page.getByRole('option', { name: 'Sí', exact: true }).click();

            // Rellenamos la fecha y la hora de apertura que emergen condicionalmente
            await page.getByLabel('Fecha de apertura').fill('2026-07-01');
            await page.getByLabel('Hora de apertura').fill('10:00');

            // --- SECCIÓN: CONFIGURAR CIERRE ---
            // Localizamos el segundo select (Cierre)
            await page.getByRole('combobox', { name: '¿Deseas programar el cierre de las inscripciones?' }).click();
            await page.getByRole('option', { name: 'Sí', exact: true }).click();

            // Rellenamos la fecha y la hora de cierre correspondientes
            await page.getByLabel('Fecha de cierre').fill('2026-07-15');
            await page.getByLabel('Hora de cierre').fill('22:30');

            // 5. Hacer clic en el botón de "Confirmar" del Modal
            const confirmButton = page.getByRole('dialog').getByRole('button', { name: 'Confirmar', exact: true });
            await confirmButton.click();

            // 6. Verificar que aparece el Toast informativo de éxito enviado por el componente
            const successToast = page.getByText('Inscripciones programadas correctamente');
            await expect(successToast).toBeVisible();

            // 7. Verificar que el modal se cierra satisfactoriamente
            await expect(modalHeading).not.toBeVisible();

            // 8. Verificar que las tarjetas informativas muestran el cambio de hora formateado tras el onRefresh()
            await expect(page.getByText('1 de julio de 2026 a las 12:00')).toBeVisible();
            await expect(page.getByText('16 de julio de 2026 a las 00:30')).toBeVisible();
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
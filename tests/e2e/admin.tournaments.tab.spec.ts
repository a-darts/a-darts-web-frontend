import { test, expect } from '@playwright/test';
import { TournamentStatus, GameModes, GameTypes, Federations, RegistrationStatus } from '../../src/services/tournament.service';

const API_BASE = 'http://localhost:3000/api';

const MOCK_USER = {
    id: 'user-test-123',
    email: 'test@example.com',
    alias: 'TestAdmin',
    role: 'ADMIN',
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-abc123';

const MOCK_TOURNAMENTS = [
    {
        id: 'tournament-draft',
        name: 'Torneo de Prueba Borrador',
        seasonStartYear: 2026,
        createdAt: '2026-01-01T00:00:00.000Z',
        status: TournamentStatus.DRAFT,
        isDelayed: false,
        info: {
            place: 'Zaragoza',
            dateTime: '2026-09-15T18:00:00.000Z',
            mode: GameModes.MEN_SINGLES,
            game: '501',
            schedule: 'K.O. directo',
            maxPlayers: 32,
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
            registrationPeriod: { startsAt: null, endsAt: null }
        },
    },
    {
        id: 'tournament-published',
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
            registrationPeriod: { startsAt: null, endsAt: null }
        },
    },
    {
        id: 'tournament-inprogress',
        name: 'Criterium de Verano',
        seasonStartYear: 2026,
        createdAt: '2026-01-01T00:00:00.000Z',
        status: TournamentStatus.IN_PROGRESS,
        isDelayed: false,
        info: {
            place: 'Madrid',
            dateTime: '2026-06-11T12:00:00.000Z',
            mode: GameModes.MIXED_SINGLES,
            game: 'Cricket',
            schedule: 'K.O. directo',
            maxPlayers: 32,
            gameType: GameTypes.BEST_OF,
            numLegs: 5,
            numSets: 1,
            rules: 'Standard',
            info: 'Info del torneo',
            federation: Federations.MADRID,
        },
        registration: {
            hasCheckIn: false,
            status: RegistrationStatus.CLOSED,
            registrationPeriod: { startsAt: null, endsAt: null }
        },
    },
    {
        id: 'tournament-finished',
        name: 'Torneo de Invierno Pasado',
        seasonStartYear: 2025,
        createdAt: '2025-11-01T00:00:00.000Z',
        status: TournamentStatus.FINISHED,
        isDelayed: false,
        info: {
            place: 'Valencia',
            dateTime: '2025-12-10T10:00:00.000Z',
            mode: GameModes.SINGLE,
            game: '501',
            schedule: 'K.O. directo',
            maxPlayers: 128,
            gameType: GameTypes.FIRST_TO,
            numLegs: 3,
            numSets: 1,
            rules: 'Standard',
            info: 'Info',
            federation: Federations.COMUNIDAD_VALENCIANA,
        },
        registration: {
            hasCheckIn: true,
            status: RegistrationStatus.CLOSED,
            registrationPeriod: { startsAt: null, endsAt: null },
        },
    },
    {
        id: 'tournament-cancelled',
        name: 'Torneo Suspendido de Primavera',
        seasonStartYear: 2026,
        createdAt: '2026-03-01T00:00:00.000Z',
        status: TournamentStatus.CANCELLED,
        isDelayed: false,
        info: {
            place: 'Barcelona',
            dateTime: '2026-04-10T10:00:00.000Z',
            mode: GameModes.SINGLE,
            game: '501',
            schedule: 'K.O. directo',
            maxPlayers: 32,
            gameType: GameTypes.FIRST_TO,
            numLegs: 3,
            numSets: 1,
            rules: 'Standard',
            info: 'Cancelado por fuerza mayor',
            federation: Federations.CATALUÑA,
        },
        registration: {
            hasCheckIn: false,
            status: RegistrationStatus.CLOSED,
            registrationPeriod: { startsAt: null, endsAt: null },
        },
    },
    {
        id: 'tournament-deleted',
        name: 'Torneo Eliminado Permanentemente',
        seasonStartYear: 2026,
        createdAt: '2026-01-01T00:00:00.000Z',
        status: TournamentStatus.DELETED,
        isDelayed: false,
        info: {
            place: 'Galicia',
            dateTime: '2026-02-10T10:00:00.000Z',
            mode: GameModes.SINGLE,
            game: '501',
            schedule: 'K.O. directo',
            maxPlayers: 16,
            gameType: GameTypes.FIRST_TO,
            numLegs: 3,
            numSets: 1,
            rules: 'Standard',
            info: 'Borrable',
            federation: Federations.GALICIA,
        },
        registration: {
            hasCheckIn: false,
            status: RegistrationStatus.CLOSED,
            registrationPeriod: { startsAt: null, endsAt: null },
        },
    },
];

test.describe('Admin Tournaments Tab', () => {

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
                            user: MOCK_USER,
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
                    body: JSON.stringify(MOCK_USER),
                });
            } else {
                await route.continue();
            }
        });

        // 3. Mock GET /tournaments usando un patrón flexible por los queryParams
        await page.route(new RegExp(`${API_BASE}/tournaments`), async (route) => {
            if (route.request().method() === 'GET') {
                const url = new URL(route.request().url());
                const statusParam = url.searchParams.get('status');
                const federationParam = url.searchParams.get('federation');
                const modeParam = url.searchParams.get('mode');

                // Empezamos con todos los torneos mockeados
                let filteredTournaments = [...MOCK_TOURNAMENTS];

                // 1. Filtrar por estados si el parámetro existe
                if (statusParam) {
                    const activeStatuses = statusParam.split(',');
                    filteredTournaments = filteredTournaments.filter(t =>
                        activeStatuses.includes(t.status)
                    );
                }

                // 2. Filtrar por federación
                if (federationParam) {
                    filteredTournaments = filteredTournaments.filter(t => {
                        if (!t.info?.federation) return false;
                        const tournamentFed = t.info.federation.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                        const paramFed = federationParam.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                        return tournamentFed === paramFed;
                    });
                }

                // 3. Filtrar por modalidad
                if (modeParam) {
                    filteredTournaments = filteredTournaments.filter(t => {
                        if (!t.info?.mode) return false;
                        const currentModeValue = t.info.mode;
                        const matchKey = Object.keys(GameModes).find(key => GameModes[key as keyof typeof GameModes] === currentModeValue);
                        return t.info.mode === modeParam || matchKey === modeParam;
                    });
                }

                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: filteredTournaments,
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_USER.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 5. Navegar al panel de administración
        await page.goto('/admin');

        // 6. Verificar la estructura inicial y título de la pantalla
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 7. Navegar al panel de torneos
        const tournamentsButton = page.getByRole('button', { name: 'Torneos', exact: true });
        await expect(tournamentsButton).toBeVisible();
        await tournamentsButton.click();

        // 8. Verificar el título de la pantalla
        const titleTournaments = page.getByRole('heading', { name: 'Panel de Torneos', exact: true });
        await expect(titleTournaments).toBeVisible();
    });

    test('debe mostrar el listado de torneos', async ({ page }) => {
        // 1. Validar que aparecen los torneos en el listado (Por defecto, todos menos 'Cancelado' y 'Eliminado')
        await expect(page.getByText('Torneo de Prueba Borrador')).toBeVisible();
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).toBeVisible();
        await expect(page.getByText('Torneo Suspendido de Primavera')).not.toBeVisible();
        await expect(page.getByText('Torneo Eliminado Permanentemente')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del buscador', async ({ page }) => {
        // 1. Verificar el funcionamiento del buscador
        const searchInput = page.getByPlaceholder('Buscar por nombre o modalidad...');

        await searchInput.fill('Aragón');

        await expect(page.getByText('Torneo de Prueba Borrador')).not.toBeVisible();
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).not.toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).not.toBeVisible();
        await expect(page.getByText('Torneo Suspendido de Primavera')).not.toBeVisible();
        await expect(page.getByText('Torneo Eliminado Permanentemente')).not.toBeVisible();

        await searchInput.fill('');

        await expect(page.getByText('Torneo de Prueba Borrador')).toBeVisible();
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).toBeVisible();
        await expect(page.getByText('Torneo Suspendido de Primavera')).not.toBeVisible();
        await expect(page.getByText('Torneo Eliminado Permanentemente')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por estado', async ({ page }) => {
        // 1. Verificar el funcionamiento de los botones de filtro por estado
        const draftButton = page.getByRole('button', { name: 'Borrador' });
        await expect(draftButton).toBeVisible();
        const publishedButton = page.getByRole('button', { name: 'Publicado' });
        await expect(publishedButton).toBeVisible();
        const inProgressButton = page.getByRole('button', { name: 'En curso' });
        await expect(inProgressButton).toBeVisible();
        const cancelledButton = page.getByRole('button', { name: 'Cancelado' });
        await expect(cancelledButton).toBeVisible();
        const finishedButton = page.getByRole('button', { name: 'Finalizado' });
        await expect(finishedButton).toBeVisible();
        const deletedButton = page.getByRole('button', { name: 'Eliminado' });
        await expect(deletedButton).toBeVisible();

        // 2. Desactivar el filtro de los torneos finalizados
        await finishedButton.click();

        // 3. Validar que no aparece el torneo finalizado en el listado
        await expect(page.getByText('Torneo de Prueba Borrador')).toBeVisible();
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).not.toBeVisible();
        await expect(page.getByText('Torneo Suspendido de Primavera')).not.toBeVisible();
        await expect(page.getByText('Torneo Eliminado Permanentemente')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por federación', async ({ page }) => {
        // 1. Verificar el funcionamiento de los botones de filtro
        await page.getByRole('combobox', { name: 'Federación' }).click();
        await page.getByRole('option', { name: 'Aragón', exact: true }).click();

        // 2. Validar que sólo aparece el torneo de Aragón en el listado
        await expect(page.getByText('Torneo de Prueba Borrador')).toBeVisible();
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).not.toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).not.toBeVisible();
        await expect(page.getByText('Torneo Suspendido de Primavera')).not.toBeVisible();
        await expect(page.getByText('Torneo Eliminado Permanentemente')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por modalidad', async ({ page }) => {
        // 1. Asegurar que inicialmente se ven todos los torneos esperados
        await expect(page.getByText('Torneo de Prueba Borrador')).toBeVisible();
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).toBeVisible();
        await expect(page.getByText('Torneo Suspendido de Primavera')).not.toBeVisible();
        await expect(page.getByText('Torneo Eliminado Permanentemente')).not.toBeVisible();

        // 2. Verificar el funcionamiento del filtro por modalidad
        await page.getByRole('combobox', { name: 'Modalidad' }).click();
        await page.getByRole('option', { name: 'Individual Masculino', exact: true }).click();

        // 3. Validar que la tabla se filtra correctamente y solo muestran los torneos correspondientes
        await expect(page.getByText('Torneo de Prueba Borrador')).toBeVisible();
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).not.toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).not.toBeVisible();
        await expect(page.getByText('Torneo Suspendido de Primavera')).not.toBeVisible();
        await expect(page.getByText('Torneo Eliminado Permanentemente')).not.toBeVisible();
    });

    test('debe mostrar las acciones correctas para cada estado del torneo', async ({ page }) => {
        // 1. Verificar el funcionamiento de los botones de filtro por estado
        await page.getByRole('button', { name: 'Cancelado' }).click();
        await page.getByRole('button', { name: 'Eliminado' }).click();

        // ---- 2. Estado: BORRADOR (DRAFT) ----
        // Permite: Ver más información, Editar, Eliminar
        const rowDraft = page.locator('tr', { hasText: 'Torneo de Prueba Borrador' });
        await expect(rowDraft.getByRole('button', { name: /ver más información/i })).toBeVisible();
        await expect(rowDraft.getByRole('button', { name: /editar torneo/i })).toBeVisible();
        await expect(rowDraft.getByRole('button', { name: /eliminar torneo/i })).toBeVisible();
        await expect(rowDraft.getByRole('button', { name: /restaurar torneo/i })).not.toBeVisible();

        // ---- 3. Estado: PUBLICADO (PUBLISHED) ----
        // Permite: Ver más información, Editar, Eliminar
        const rowPublished = page.locator('tr', { hasText: 'Open Absoluto de Aragón' });
        await expect(rowPublished.getByRole('button', { name: /ver más información/i })).toBeVisible();
        await expect(rowPublished.getByRole('button', { name: /editar torneo/i })).toBeVisible();
        await expect(rowPublished.getByRole('button', { name: /eliminar torneo/i })).toBeVisible();
        await expect(rowPublished.getByRole('button', { name: /restaurar torneo/i })).not.toBeVisible();

        // ---- 4. Estado: EN CURSO (IN_PROGRESS) ----
        // Permite: Ver más información, Editar 
        const rowInProgress = page.locator('tr', { hasText: 'Criterium de Verano' });
        await expect(rowInProgress.getByRole('button', { name: /ver más información/i })).toBeVisible();
        await expect(rowInProgress.getByRole('button', { name: /editar torneo/i })).toBeVisible();
        await expect(rowInProgress.getByRole('button', { name: /eliminar torneo/i })).not.toBeVisible();
        await expect(rowInProgress.getByRole('button', { name: /restaurar torneo/i })).not.toBeVisible();

        // ---- 5. Estado: FINALIZADO (FINISHED) ----
        // Permite: Ver más información 
        const rowFinished = page.locator('tr', { hasText: 'Torneo de Invierno Pasado' });
        await expect(rowFinished.getByRole('button', { name: /ver más información/i })).toBeVisible();
        await expect(rowFinished.getByRole('button', { name: /editar torneo/i })).not.toBeVisible();
        await expect(rowFinished.getByRole('button', { name: /eliminar torneo/i })).not.toBeVisible();
        await expect(rowFinished.getByRole('button', { name: /restaurar torneo/i })).not.toBeVisible();

        // ---- 6. Estado: CANCELADO (CANCELLED) ----
        // Permite: Ver más información 
        const rowCancelled = page.locator('tr', { hasText: 'Torneo Suspendido de Primavera' });
        await expect(rowCancelled.getByRole('button', { name: /ver más información/i })).toBeVisible();
        await expect(rowCancelled.getByRole('button', { name: /editar torneo/i })).not.toBeVisible();
        await expect(rowCancelled.getByRole('button', { name: /eliminar torneo/i })).not.toBeVisible();
        await expect(rowCancelled.getByRole('button', { name: /restaurar torneo/i })).not.toBeVisible();

        // ---- 7. Estado: ELIMINADO (DELETED) ----
        // Permite: Ver más información 
        const rowDeleted = page.locator('tr', { hasText: 'Torneo Eliminado Permanentemente' });
        await expect(rowDeleted.getByRole('button', { name: /ver más información/i })).toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: /editar torneo/i })).not.toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: /eliminar torneo/i })).not.toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: /restaurar torneo/i })).toBeVisible();
    });

    test('debe permitir eliminar un torneo en estado borrador', async ({ page }) => {
        const draftTournament = MOCK_TOURNAMENTS.find(t => t.id === 'tournament-draft');

        // 1. Mockear la petición DELETE del torneo y el GET posterior con la lista actualizada
        await page.route(new RegExp(`${API_BASE}/tournaments`), async (route) => {
            const method = route.request().method();
            const url = route.request().url();

            if (method === 'DELETE' && url.includes(draftTournament?.id ?? '')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        message: "Tournament deleted successfully",
                        data: null,
                    }),
                });
            } else if (method === 'GET') {
                const url2 = new URL(route.request().url());
                const statusParam = url2.searchParams.get('status');
                let filtered = MOCK_TOURNAMENTS.filter(t => t.id !== 'tournament-draft');
                if (statusParam) {
                    const activeStatuses = statusParam.split(',');
                    filtered = filtered.filter(t => activeStatuses.includes(t.status));
                }
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: "success", data: filtered }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Localizar la fila del torneo borrador y hacer clic en el botón de eliminar (icono papelera)
        const rowDraft = page.locator('tr', { hasText: 'Torneo de Prueba Borrador' });
        const deleteButton = rowDraft.getByRole('button', { name: /eliminar torneo/i });
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();

        // 3. Validar que se abre el modal de confirmación
        const modalTitle = page.getByRole('heading', { name: 'Eliminar torneo', exact: true });
        await expect(modalTitle).toBeVisible();

        // 4. Hacer clic en el botón de confirmar del modal
        const confirmButton = page.getByRole('button', { name: 'Eliminar', exact: true });
        await confirmButton.click();

        // 5. Verificar que el modal se cierra y el torneo ya no aparece en el listado
        await expect(modalTitle).not.toBeVisible();
        await expect(page.getByText('Torneo de Prueba Borrador')).not.toBeVisible();
    });

    test('debe permitir restaurar un torneo en estado eliminado', async ({ page }) => {
        const deletedTournament = MOCK_TOURNAMENTS.find(t => t.id === 'tournament-deleted');

        // Flag para saber si la restauración ya se ha confirmado
        let restored = false;

        // 1. Mockear la petición POST de restauración y el GET posterior con la lista actualizada
        await page.route(new RegExp(`${API_BASE}/tournaments`), async (route) => {
            const method = route.request().method();
            const url = route.request().url();

            if (method === 'POST' && url.includes(`${deletedTournament?.id}/restore`)) {
                restored = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        message: "Tournament restored successfully",
                        data: null,
                    }),
                });
            } else if (method === 'GET') {
                const url2 = new URL(route.request().url());
                const statusParam = url2.searchParams.get('status');
                // Solo devolver el estado actualizado DESPUÉS de la restauración
                let tournaments = restored
                    ? MOCK_TOURNAMENTS.map(t =>
                        t.id === 'tournament-deleted' ? { ...t, status: TournamentStatus.DRAFT } : t
                    )
                    : [...MOCK_TOURNAMENTS];
                if (statusParam) {
                    const activeStatuses = statusParam.split(',');
                    tournaments = tournaments.filter(t => activeStatuses.includes(t.status));
                }
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: "success", data: tournaments }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Activar el filtro 'Eliminado' para poder ver el torneo mockeado en la tabla
        const deletedFilterButton = page.getByRole('button', { name: 'Eliminado' });
        await deletedFilterButton.click();

        // 3. Localizar la fila del torneo eliminado y hacer clic en restaurar (icono RefreshCw)
        const rowDeleted = page.locator('tr', { hasText: 'Torneo Eliminado Permanentemente' });
        const restoreButton = rowDeleted.getByRole('button', { name: /restaurar torneo/i });
        await expect(restoreButton).toBeVisible();
        await restoreButton.click();

        // 4. Validar que se abre el modal de confirmación de restauración
        const modalTitle = page.getByRole('heading', { name: 'Restaurar torneo', exact: true });
        await expect(modalTitle).toBeVisible();

        // 5. Hacer clic en el botón de confirmar del modal
        const confirmButton = page.getByRole('button', { name: 'Restaurar', exact: true });
        await confirmButton.click();

        // 6. Verificar que el modal se cierra
        await expect(modalTitle).not.toBeVisible();

        // Como el filtro 'Eliminado' sigue activo y ahora su estado simulado es DRAFT, ya no debería verse en esta vista filtrada
        await expect(page.getByText('Torneo Eliminado Permanentemente')).not.toBeVisible();
    });
});

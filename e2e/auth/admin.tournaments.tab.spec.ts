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
        // Próximo
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
            registrationPeriod: { startsAt: null, endsAt: null }
        },
    },
    {
        // En curso
        id: 'tournament-2',
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
        // Finalizado
        id: 'tournament-3',
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
                const statusParam = url.searchParams.get('status');       // Ej: "PUBLISHED,IN_PROGRESS"
                const federationParam = url.searchParams.get('federation'); // Ej: "MADRID"
                const modeParam = url.searchParams.get('mode');             // Ej: "MEN_SINGLES"

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
    });

    test('debe mostrar el listado de torneos', async ({ page }) => {
        // 1. Navegar al panel de administración
        await page.goto('/admin');

        // 2. Verificar la estructura inicial y título de la pantalla
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 3. Navegar al panel de torneos
        const tournamentsButton = page.getByRole('button', { name: 'Torneos', exact: true });
        await expect(tournamentsButton).toBeVisible();
        await tournamentsButton.click();

        // 4. Verificar el título de la pantalla
        const titleTournaments = page.getByRole('heading', { name: 'Panel de Torneos', exact: true });
        await expect(titleTournaments).toBeVisible();

        // 5. Validar que aparecen los torneos en el listado (Por defecto, todos menos 'Cancelado' y 'Eliminado')
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).toBeVisible();
    });

    test('debe comprobar el funcionamiento del buscador', async ({ page }) => {
        // 1. Navegar al panel de administración
        await page.goto('/admin');

        // 2. Verificar la estructura inicial y título de la pantalla
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 3. Navegar al panel de torneos
        const tournamentsButton = page.getByRole('button', { name: 'Torneos', exact: true });
        await expect(tournamentsButton).toBeVisible();
        await tournamentsButton.click();

        // 4. Verificar el título de la pantalla
        const titleTournaments = page.getByRole('heading', { name: 'Panel de Torneos', exact: true });
        await expect(titleTournaments).toBeVisible();

        // 5. Verificar el funcionamiento del buscador
        const searchInput = page.getByPlaceholder('Buscar por nombre o modalidad...');

        await searchInput.fill('Aragón');

        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).not.toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).not.toBeVisible();

        await searchInput.fill('');

        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por estado', async ({ page }) => {
        // 1. Navegar al panel de administración
        await page.goto('/admin');

        // 2. Verificar la estructura inicial y título de la pantalla
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 3. Navegar al panel de torneos
        const tournamentsButton = page.getByRole('button', { name: 'Torneos', exact: true });
        await expect(tournamentsButton).toBeVisible();
        await tournamentsButton.click();

        // 4. Verificar el título de la pantalla
        const titleTournaments = page.getByRole('heading', { name: 'Panel de Torneos', exact: true });
        await expect(titleTournaments).toBeVisible();

        // 5. Verificar el funcionamiento de los botones de filtro por estado
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

        // 6. Desactivar el filtro de los torneos finalizados
        await finishedButton.click();

        // 7. Validar que no aparece el torneo finalizado en el listado
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por federación', async ({ page }) => {
        // 1. Navegar al panel de administración
        await page.goto('/admin');

        // 2. Verificar la estructura inicial y título de la pantalla
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 3. Navegar al panel de torneos
        const tournamentsButton = page.getByRole('button', { name: 'Torneos', exact: true });
        await expect(tournamentsButton).toBeVisible();
        await tournamentsButton.click();

        // 4. Verificar el título de la pantalla
        const titleTournaments = page.getByRole('heading', { name: 'Panel de Torneos', exact: true });
        await expect(titleTournaments).toBeVisible();

        // 5. Verificar el funcionamiento de los botones de filtro
        await page.getByRole('combobox', { name: 'Federación' }).click();
        await page.getByRole('option', { name: 'Aragón', exact: true }).click();

        // 6. Validar que sólo aparece el torneo de Aragón en el listado
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).not.toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por modalidad', async ({ page }) => {
        // 1. Navegar al panel de administración
        await page.goto('/admin');

        // 2. Verificar la estructura inicial y título de la pantalla
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 3. Navegar al panel de torneos
        const tournamentsButton = page.getByRole('button', { name: 'Torneos', exact: true });
        await expect(tournamentsButton).toBeVisible();
        await tournamentsButton.click();

        // 4. Verificar el título de la pantalla e itera sobre la carga inicial
        const titleTournaments = page.getByRole('heading', { name: 'Panel de Torneos', exact: true });
        await expect(titleTournaments).toBeVisible();

        // Asegurar que inicialmente se ven todos los torneos esperados
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();

        // 5. Verificar el funcionamiento del filtro por modalidad
        await page.getByRole('combobox', { name: 'Modalidad' }).click();
        await page.getByRole('option', { name: 'Individual Masculino', exact: true }).click();

        // 6. Validar que la tabla se filtra correctamente y solo muestra el torneo correspondiente
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).not.toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).not.toBeVisible();
    });
});

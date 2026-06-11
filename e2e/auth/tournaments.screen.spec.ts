import { test, expect } from '@playwright/test';
import { TournamentStatus, GameModes, GameTypes, Federations, RegistrationStatus } from '../../src/services/tournament.service';

const API_BASE = 'http://localhost:3000/api';

const MOCK_USER_PLAYER = {
    id: 'user-test-123',
    email: 'test@example.com',
    alias: 'TestPlayer',
    role: 'PLAYER',
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_USER_ADMIN = {
    id: 'admin-test-123',
    email: 'testAdmin@example.com',
    alias: 'TestAdmin',
    role: 'ADMIN',
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN_PLAYER = 'mock-jwt-token-abc123';
const MOCK_TOKEN_ADMIN = 'mock-jwt-token-def456';

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
    {
        // Borrador
        id: 'tournament-4',
        name: 'Liga Secreta en Desarrollo',
        seasonStartYear: 2026,
        createdAt: '2026-05-01T00:00:00.000Z',
        status: TournamentStatus.DRAFT,
        isDelayed: false,
        info: {
            place: 'Barcelona',
            dateTime: '2026-09-20T15:00:00.000Z',
            mode: GameModes.YOUTH_SINGLES,
            game: '301',
            schedule: 'K.O. directo',
            maxPlayers: 16,
            gameType: GameTypes.BEST_OF,
            numLegs: 3,
            numSets: 1,
            rules: 'Standard',
            info: 'Draft',
            federation: Federations.CATALUÑA,
        },
        registration: {
            hasCheckIn: false,
            status: RegistrationStatus.CLOSED,
            registrationPeriod: { startsAt: null, endsAt: null },
        },
    },
];

test.describe('Tournaments Screen', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Mock GET /auth/me
        await page.route(`${API_BASE}/auth/me`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(MOCK_USER_ADMIN),
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
                            token: MOCK_TOKEN_ADMIN,
                            user: MOCK_USER_ADMIN,
                        },
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 3. Mock GET /tournaments usando un patrón flexible por los queryParams
        await page.route(`${API_BASE}/tournaments`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: MOCK_TOURNAMENTS,
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_USER_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');
    });

    test('debe mostrar el listado de torneos respetando los filtros por defecto', async ({ page }) => {
        // 1. Navegar a la pantalla de torneos
        await page.goto('/tournaments');

        // 2. Verificar la estructura inicial y título de la pantalla
        const title = page.getByRole('heading', { name: 'Torneos', exact: true });
        await expect(title).toBeVisible();

        // 3. Comprobar que los botones de filtro por defecto están renderizados
        const allButton = page.getByRole('button', { name: 'Todos' })
        await expect(allButton).toBeVisible();
        const inProgressButton = page.getByRole('button', { name: 'En curso' });
        await expect(inProgressButton).toBeVisible();
        const nextButton = page.getByRole('button', { name: 'Próximos' });
        await expect(nextButton).toBeVisible();
        const finishedButton = page.getByRole('button', { name: 'Finalizados' });
        await expect(finishedButton).toBeVisible();

        // 4. Validar que aparecen los torneos en el listado (Por defecto, sólo 'En curso' y 'Próximos')
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();

        // 5. Activar el filtro Todos
        await allButton.click();

        // 6. Verificar que todos los torneos aparecen en el listado
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();
        await expect(page.getByText('Criterium de Verano')).toBeVisible();
        await expect(page.getByText('Torneo de Invierno Pasado')).toBeVisible();
    });

    test('debe filtrar los torneos interactivamente mediante la barra de búsqueda', async ({ page }) => {
        await page.goto('/tournaments');

        // 1. Localizar la barra de búsqueda mediante el placeholder genérico o su rol
        const searchInput = page.getByRole('textbox');
        await searchInput.fill('Aragón');

        // 2. Verificar que el torneo que coincide sigue visible
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();

        // 3. Verificar que el torneo que NO coincide desaparece de la vista
        await expect(page.getByText('Criterium de Verano')).not.toBeVisible();
    });

    test('debe mostrar el mensaje de error si el servicio de la API falla', async ({ page }) => {
        // Sobrescribimos el mock de torneos para forzar un error de servidor (500)
        await page.route(`${API_BASE}/tournaments`, async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Error interno del servidor al recuperar el listado' }),
            });
        });

        await page.goto('/tournaments');

        // Verificar que el componente ErrorMessage se renderiza correctamente en pantalla
        await expect(page.getByText('Error interno del servidor al recuperar el listado')).toBeVisible();
        // Asegurar que no se pinta la rejilla de tarjetas
        await expect(page.getByText('Open Absoluto de Aragón')).not.toBeVisible();
    });
});

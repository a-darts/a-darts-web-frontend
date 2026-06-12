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
        registrationPeriod: { startsAt: null, endsAt: null }
    },
};

test.describe('Tournaments Info Tab', () => {

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

        await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });

        await page.route(`${API_BASE}/players`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PLAYER),
            });
        });

        // 4. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_PLAYER.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 5. Navegar a la pantalla del torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 6. Verificar que estamos en la pantalla del torneo
        const title = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(title).toBeVisible();
    });

    test('debe mostrar la información del torneo', async ({ page }) => {
        // 1. Verificar que estamos en el tab de Información
        const title = page.getByRole('heading', { name: 'Información General', exact: true });
        await expect(title).toBeVisible();

        // 2. Verificar que se muestran todos los datos de info
        await expect(page.getByText('LUGAR')).toBeVisible();
        await expect(page.getByText(MOCK_TOURNAMENT.info.place)).toBeVisible();
        await expect(page.getByText('FECHA')).toBeVisible();
        await expect(page.getByText(formatDate(MOCK_TOURNAMENT.info.dateTime))).toBeVisible();
        await expect(page.getByText('HORA')).toBeVisible();
        await expect(page.getByText(formatTime(MOCK_TOURNAMENT.info.dateTime))).toBeVisible();
        await expect(page.getByText('MODALIDAD')).toBeVisible();
        await expect(page.getByText(MOCK_TOURNAMENT.info.mode)).toBeVisible();
        await expect(page.getByText('MÁX. JUGADORES')).toBeVisible();
        await expect(page.getByText(MOCK_TOURNAMENT.info.maxPlayers.toString())).toBeVisible();
        await expect(page.getByText('JUEGO')).toBeVisible();
        await expect(page.getByText(MOCK_TOURNAMENT.info.game)).toBeVisible();
        await expect(page.getByText('TIPO DE CUADRANTE')).toBeVisible();
        await expect(page.getByText(MOCK_TOURNAMENT.info.schedule)).toBeVisible();
        await expect(page.getByText('LEGS').first()).toBeVisible();
        await expect(page.getByText(`A ganar ${MOCK_TOURNAMENT.info.numLegs} legs`)).toBeVisible();
        await expect(page.getByText('SETS').first()).toBeVisible();
        await expect(page.getByText(`A ganar ${MOCK_TOURNAMENT.info.numSets} sets`)).toBeVisible();
    });
});

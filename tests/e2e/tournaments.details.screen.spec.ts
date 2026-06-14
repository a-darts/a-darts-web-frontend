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
    isDelayed: true,
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

const MOCK_TOURNAMENT_2 = {
    id: 'tournament-2',
    name: 'Criterium de Verano',
    seasonStartYear: 2026,
    createdAt: '2026-01-01T00:00:00.000Z',
    status: TournamentStatus.PUBLISHED,
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
};

test.describe('Tournaments Details Screen', () => {

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

        // 3. Mock GET /tournaments usando un patrón flexible por los queryParams
        await page.route(`${API_BASE}/tournaments`, async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: [MOCK_TOURNAMENT, MOCK_TOURNAMENT_2],
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Mock GET /tournaments/{id} usando un patrón flexible por los queryParams
        await page.route(new RegExp(`${API_BASE}/tournaments/([^/]+)$`), async (route) => {
            if (route.request().method() === 'GET') {
                const url = route.request().url();

                // Determinamos dinámicamente qué torneo devolver inspeccionando la URL
                let tournamentData = null;
                if (url.includes(MOCK_TOURNAMENT.id)) {
                    tournamentData = MOCK_TOURNAMENT;
                } else if (url.includes(MOCK_TOURNAMENT_2.id)) {
                    tournamentData = MOCK_TOURNAMENT_2;
                }

                if (tournamentData) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            status: "success",
                            data: tournamentData,
                        }),
                    });
                } else {
                    await route.fulfill({ status: 404, body: 'Tournament not found' });
                }
            } else {
                await route.continue();
            }
        });

        // 5. Mock GET /tournaments/{id}/participants
        await page.route(`${API_BASE}/tournaments/*/participants`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });

        // 6. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_PLAYER.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');
    });

    test('debe navegar a la pantalla del torneo desde el listado', async ({ page }) => {
        // 1. Navegar a la pantalla de torneos
        await page.goto('/tournaments');

        // 2. Verificar que estamos en la pantalla de torneos
        const title = page.getByRole('heading', { name: 'Torneos', exact: true });
        await expect(title).toBeVisible();

        // 4. Verificar que aparece el torneo en el listado
        await expect(page.getByText('Open Absoluto de Aragón')).toBeVisible();

        // 5. Verificar que aparece el botón Ver más
        const aragonCard = page.locator('div[style*="cursor: pointer"]').filter({
            has: page.getByRole('heading', { name: 'Open Absoluto de Aragón', level: 3 })
        });
        const seeMoreButton = aragonCard.getByRole('button', { name: 'Ver más' });
        await expect(seeMoreButton).toBeVisible();

        // 6. Hacer clic en el botón "Ver más"
        await seeMoreButton.click();

        // 7. Verificar que navega a la pantalla del torneo
        await expect(page).toHaveURL(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 8. Verificar que estamos en la pantalla del torneo
        const titleTournament = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(titleTournament).toBeVisible();

        // 9. Verificar que estamos en el tab de Información (Por defecto)
        const titleTab = page.getByRole('heading', { name: 'Información General', exact: true });
        await expect(titleTab).toBeVisible();
    });

    test('debe mostrar la información del torneo junto al título', async ({ page }) => {
        // 1. Navegar a la pantalla del torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 2. Verificar que estamos en la pantalla del torneo
        const titleTournament = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(titleTournament).toBeVisible();

        // 3. Verificar que se muestra la información
        await expect(page.getByText('PUBLICADO')).toBeVisible();
        await expect(page.getByText('CON RETRASO')).toBeVisible();
        await expect(page.getByText('INSCRIPCIONES ABIERTAS')).toBeVisible();
        await expect(page.getByText('Aragón').last()).toBeVisible();
        await expect(page.getByText('Temporada 2026/2027')).toBeVisible();
    });

    test('debe mostrar INSCRIPCIONES ABIERTAS o INSCRIPCIONES CERRADAS', async ({ page }) => {
        // 1. Navegar a la pantalla del torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT.id}`);

        // 2. Verificar que estamos en la pantalla del torneo
        const titleTournament = page.getByRole('heading', { name: `${MOCK_TOURNAMENT.name}`, exact: true });
        await expect(titleTournament).toBeVisible();

        // 3. Verificar que se muestra INSCRIPCIONES ABIERTAS
        await expect(page.getByText('INSCRIPCIONES ABIERTAS')).toBeVisible();

        // 4. Navegar a la pantalla del otro torneo
        await page.goto(`/tournaments/${MOCK_TOURNAMENT_2.id}`);

        // 5. Verificar que estamos en la pantalla del otro torneo
        const titleTournament2 = page.getByRole('heading', { name: `${MOCK_TOURNAMENT_2.name}`, exact: true });
        await expect(titleTournament2).toBeVisible();

        // 6. Verificar que se muestra INSCRIPCIONES CERRADAS
        await expect(page.getByText('INSCRIPCIONES CERRADAS')).toBeVisible();
    });
});

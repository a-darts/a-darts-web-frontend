import { test, expect } from '@playwright/test';
import { Federations } from '../../src/services/tournament.service';

const API_BASE = 'http://localhost:3000/api';

const MOCK_USER = {
    id: 'user-player-stats-789',
    email: 'player-stats@example.com',
    alias: 'DartMaster',
    role: 'PLAYER',
};

const MOCK_TOKEN = 'mock-jwt-token-abc123';

// Mock de datos con estadísticas reales pobladas
const MOCK_STATS_DATA = {
    totalTournaments: 5,
    totalMatchesPlayed: 20,
    totalMatchesWon: 15,
    totalSetsWon: 30,
    totalLegsWon: 90,
    bestPositions: [
        {
            tournamentId: 'tournament-gold',
            tournamentName: 'Open de Zaragoza 2026',
            tournamentDate: '2026-04-10T10:00:00.000Z',
            tournamentFederation: Federations.ARAGON,
            position: 1
        },
        {
            tournamentId: 'tournament-silver',
            tournamentName: 'Master de Andalucía',
            tournamentDate: '2026-05-15T12:00:00.000Z',
            tournamentFederation: Federations.ANDALUCIA,
            position: 2
        }
    ],
    allPositions: [
        {
            tournamentId: 'tournament-gold',
            tournamentName: 'Open de Zaragoza 2026',
            tournamentDate: '2026-04-10T10:00:00.000Z',
            tournamentFederation: Federations.ARAGON,
            position: 1
        },
        {
            tournamentId: 'tournament-silver',
            tournamentName: 'Master de Andalucía',
            tournamentDate: '2026-05-15T12:00:00.000Z',
            tournamentFederation: Federations.ANDALUCIA,
            position: 2
        }
    ]
};

test.describe('Stats Screen (Mis Estadísticas)', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Mock GET /auth/me
        await page.route(`${API_BASE}/auth/me`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_USER),
            });
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
                            user: MOCK_USER,
                        },
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // Proceso automático de Login o inyección de sesión si fuese necesario
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_USER.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');
    });

    test('debe mostrar un estado vacío (EmptyState) cuando el usuario no tiene estadísticas', async ({ page }) => {
        // 1. Interceptamos la llamada para que devuelva un array vacío según tu validación: Array.isArray(data) && data.length === 0
        await page.route(`${API_BASE}/users/${MOCK_USER.id}/stats`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });

        // 2. Navegar directamente a la pantalla de estadísticas
        await page.goto('/stats'); // Ajusta la ruta a la de tu sistema

        // 3. Verificar el título de la vista
        await expect(page.getByRole('heading', { name: 'Mis Estadísticas', exact: true })).toBeVisible();

        // 4. Comprobar que el componente EmptyState renderiza los textos correctos
        await expect(page.getByText('Aún no tienes estadísticas')).toBeVisible();
        await expect(page.getByText('Tus estadísticas aparecerán aquí una vez que participes en algún torneo.')).toBeVisible();

        // 5. Asegurar que las secciones de tablas o resúmenes no se despliegan
        await expect(page.getByText('Resumen general')).not.toBeVisible();
        await expect(page.getByText('Torneos Jugados')).not.toBeVisible();
    });

    test('debe cargar y renderizar correctamente todo el desglose de métricas y posiciones', async ({ page }) => {
        // 1. Interceptamos la llamada para proveer el objeto estructurado de estadísticas pobladas
        await page.route(`${API_BASE}/users/${MOCK_USER.id}/stats`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_STATS_DATA),
            });
        });

        // 2. Navegar a la pantalla de estadísticas
        await page.goto('/stats');

        // 3. Verificar encabezados de sección principales
        await expect(page.getByRole('heading', { name: 'Mis Estadísticas', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Resumen general', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Mejores posiciones (Top 3)', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Todas las posiciones', exact: true })).toBeVisible();

        // 4. Validar las tarjetas de información general (InfoCard)
        // Validamos el título de la tarjeta y el contenido numérico mockeado
        await expect(page.locator('div').filter({ hasText: /Torneos Jugados/i }).getByText('5', { exact: true })).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /Partidos Jugados/i }).getByText('20', { exact: true })).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /Partidos Ganados/i }).getByText('15', { exact: true })).toBeVisible();

        // Validar el cálculo de porcentaje de victorias
        await expect(page.locator('div').filter({ hasText: /Victorias/i }).getByText('75%', { exact: true })).toBeVisible();

        // 5. Validar los datos distribuidos dentro de las tablas
        // Verificamos las posiciones con el formato ordinal ("1º", "2º")
        await expect(page.getByText('1º').first()).toBeVisible();
        await expect(page.getByText('2º').first()).toBeVisible();

        // Verificar que los nombres de los torneos aparecen reflejados
        await expect(page.getByText('Open de Zaragoza 2026').first()).toBeVisible();
        await expect(page.getByText('Master de Andalucía').first()).toBeVisible();

        // 6. Verificar la interacción: hacer clic en el nombre del torneo debe redirigir a sus detalles
        const tournamentLink = page.getByText('Open de Zaragoza 2026').first();
        await tournamentLink.click();

        // Confirmar redirección exitosa usando el ID correspondiente
        await expect(page).toHaveURL(`/tournaments/${MOCK_STATS_DATA.bestPositions[0].tournamentId}`);
    });
});

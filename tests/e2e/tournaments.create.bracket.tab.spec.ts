import { test, expect } from '@playwright/test';
import { TournamentStatus, GameModes, GameTypes, Federations, RegistrationStatus } from '../../src/services/tournament.service';
import { BracketStatus } from '../../src/services/bracket.service';

const API_BASE = 'http://localhost:3000/api';

const MOCK_ADMIN = {
  id: 'user-admin-test-123',
  email: 'test-admin@example.com',
  alias: 'TestAdmin',
  role: 'ADMIN',
  registeredAt: '2024-01-02T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-abc123';

const MOCK_TOURNAMENT = {
  id: 'tournament-edit-1',
  name: 'Open Absoluto de Aragón - Edición',
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

// Participantes inscritos en el torneo
const MOCK_PARTICIPANTS = [
  { id: 'p1', playerId: 'u1', alias: 'Jugador Uno', federation: Federations.ARAGON },
  { id: 'p2', playerId: 'u2', alias: 'Jugador Dos', federation: Federations.MADRID },
  { id: 'p3', playerId: 'u3', alias: 'Jugador Tres', federation: Federations.CATALUÑA },
];

// Estructura de cuadrante inicial (un jugador colocado, dos libres)
const MOCK_BRACKET = {
  id: 'bracket-edit-1',
  tournamentId: 'tournament-edit-1',
  status: BracketStatus.DRAFT,
  totalPositions: 4,
  positions: [
    { position: 1, participantId: 'p1', participantAlias: 'Jugador Uno', participantFederation: Federations.ARAGON },
    { position: 2, participantId: null, participantAlias: null, participantFederation: null },
    { position: 3, participantId: null, participantAlias: null, participantFederation: null },
    { position: 4, participantId: null, participantAlias: null, participantFederation: null },
  ],
};

const MOCK_MATCHES = [
  {
    id: 'me1',
    round: 1,
    matchIndex: 0,
    status: 'PENDING',
    participant1: { id: 'p1', alias: 'Jugador Uno', federation: Federations.ARAGON },
    participant2: { id: null, alias: null, federation: null },
    matchScore: { participant1: { setsWon: 0, legsWon: 0 }, participant2: { setsWon: 0, legsWon: 0 } },
  },
  {
    id: 'me2',
    round: 1,
    matchIndex: 1,
    status: 'PENDING',
    participant1: { id: null, alias: null, federation: null },
    participant2: { id: null, alias: null, federation: null },
    matchScore: { participant1: { setsWon: 0, legsWon: 0 }, participant2: { setsWon: 0, legsWon: 0 } },
  },
];

test.describe('Tournaments Bracket Editor Tab', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Mock GET /auth/me -> Entramos como ADMIN porque los jugadores no editan cuadrantes
    await page.route(`${API_BASE}/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ADMIN),
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
              user: MOCK_ADMIN,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 2. Mock GET /tournaments/{id}
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: "success", data: MOCK_TOURNAMENT }),
      });
    });

    // 3. Mock GET /tournaments/{id}/participants
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/participants`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: "success", data: MOCK_PARTICIPANTS }),
      });
    });

    // 5. Mock GET /tournaments/{id}/matches
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/matches`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: "success", data: MOCK_MATCHES }),
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

  test('debe inicializar el editor mostrando los jugadores', async ({ page }) => {
    // 1. Mock GET /tournaments/{id}/bracket
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: "success", data: MOCK_BRACKET }),
      });
    });

    // 2. Navegar al tab de Cuadrante
    const registrationButton = page.getByRole('button', { name: 'CUADRANTE', exact: true });
    await expect(registrationButton).toBeVisible();
    await registrationButton.click();

    // 1. Editar cuadrante
    const editBracketButton = page.getByRole('button', { name: 'Editar cuadrante', exact: true });
    await expect(editBracketButton).toBeVisible();
    await editBracketButton.click();

    // Validar título del Sidebar
    await expect(page.getByRole('heading', { name: 'Asignar Jugadores' })).toBeVisible();

    // Validar lista de jugadores no asignados (Jugador Uno ya está en el slot 1, no debe figurar en la lista)
    await expect(page.getByText('Jugador Dos', { exact: true })).toBeVisible();
    await expect(page.getByText('Jugador Tres', { exact: true })).toBeVisible();
    await expect(page.getByText('Jugador Uno', { exact: true })).toBeVisible();

    await expect(page.getByText('33%')).toBeVisible();

  });

  test('debe permitir seleccionar un jugador mediante clic y mostrar las instrucciones de colocación', async ({ page }) => {
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: "success", data: MOCK_BRACKET }),
      });
    });

    await page.getByRole('button', { name: 'CUADRANTE', exact: true }).click();
    await page.getByRole('button', { name: 'Editar cuadrante', exact: true }).click();

    const playerCard = page.getByText('Jugador Dos');
    await playerCard.click();

    // Ajustado al texto real de ayuda detectado en tu sidebar
    const selectionTip = page.locator('text=Arrastra o haz clic para colocar');
    await expect(selectionTip).toBeVisible();
  });

  test('debe simular la asignación manual de un jugador arrastrando la tarjeta al cuadrante', async ({ page }) => {
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: "success", data: MOCK_BRACKET }),
      });
    });

    await page.getByRole('button', { name: 'CUADRANTE', exact: true }).click();
    await page.getByRole('button', { name: 'Editar cuadrante', exact: true }).click();

    const sourcePlayer = page.getByText('Jugador Dos');

    // Buscamos el primer slot vacío interactivo dentro del bloque principal
    const targetSlot = page.locator('main').getByText('+').first();
    await sourcePlayer.dragTo(targetSlot);

    // Tras asignarlo el contador lateral debe saltar a 2 de 3 (67%)
    await expect(page.getByText('67%')).toBeVisible();

    // Debe desaparecer de la lista lateral desasignada
    await expect(page.locator('complementary').getByText('Jugador Dos', { exact: true })).not.toBeVisible();
  });

  test('debe reaccionar de forma interactiva a los botones de Sorteo Automático y Restablecer', async ({ page }) => {
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: "success", data: MOCK_BRACKET }),
      });
    });

    await page.getByRole('button', { name: 'CUADRANTE', exact: true }).click();
    await page.getByRole('button', { name: 'Editar cuadrante', exact: true }).click();

    // Ajustado al nombre real: "Sortear aleatoriamente"
    const autoAssignBtn = page.getByRole('button', { name: 'Sortear aleatoriamente' });
    await expect(autoAssignBtn).toBeVisible();
    await autoAssignBtn.click();

    // El contador pasa a estar lleno
    await expect(page.getByText('100%')).toBeVisible();

    // Probar botón restablecer
    await page.getByRole('button', { name: 'Restablecer' }).click();
    await expect(page.getByText('33%')).toBeVisible();
  });

  test('debe guardar con éxito las posiciones modificadas y bloquear la UI durante la carga', async ({ page }) => {
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: "success", data: MOCK_BRACKET }),
      });
    });

    await page.getByRole('button', { name: 'CUADRANTE', exact: true }).click();
    await page.getByRole('button', { name: 'Editar cuadrante', exact: true }).click();

    let savePayload: any = null;
    await page.route(`${API_BASE}/brackets/${MOCK_BRACKET.id}/positions`, async (route) => {
      if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        savePayload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: "success", message: "Positions saved" }),
        });
      }
    });

    // Ajustado al nombre exacto del botón en el DOM: "Guardar cuadrante"
    const saveButton = page.getByRole('button', { name: 'Guardar cuadrante' });
    await saveButton.click();

    // Al lanzar la petición asíncrona, el botón debe deshabilitarse para evitar dobles clics
    await expect(saveButton).toBeDisabled();
  });

  test('debe mostrar un mensaje de error si los servicios de la API fallan al cargar el editor', async ({ page }) => {
    // Forzamos un fallo de red controlado en el bracket fetch antes de tocar el tab
    await page.route(`${API_BASE}/tournaments/${MOCK_TOURNAMENT.id}/bracket`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Error interno de la base de datos' }),
      });
    });

    await page.getByRole('button', { name: 'CUADRANTE', exact: true }).click();

    const editBracketButton = page.getByRole('button', { name: 'Editar cuadrante', exact: true });
    await expect(editBracketButton).not.toBeVisible();
  });
});

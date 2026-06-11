import { test, expect } from '@playwright/test';
import { UserRoles, UserStatus } from '../../src/context/AuthContext';

const API_BASE = 'http://localhost:3000/api';

const MOCK_ADMIN = {
    id: 'admin-test-123',
    email: 'admin@example.com',
    alias: 'SuperAdmin',
    role: UserRoles.ADMIN,
    registeredAt: '2024-01-01T00:00:00.000Z',
};

const MOCK_TOKEN = 'mock-jwt-token-xyz789';

const MOCK_USERS = [
    {
        id: 'user-active-1',
        alias: 'DardoMaestro',
        email: 'dardo.maestro@example.com',
        role: UserRoles.PLAYER,
        registeredAt: '2026-01-15T10:00:00.000Z',
        status: UserStatus.ACTIVE,
    },
    {
        id: 'user-active-2',
        alias: 'DianaZaragoza',
        email: 'diana.zgz@example.com',
        role: UserRoles.ADMIN,
        registeredAt: '2026-02-20T11:30:00.000Z',
        status: UserStatus.ACTIVE,
    },
    {
        id: 'user-blocked',
        alias: 'TrollDardos',
        email: 'troll@example.com',
        role: UserRoles.PLAYER,
        registeredAt: '2026-03-05T09:15:00.000Z',
        status: UserStatus.BLOCKED,
    },
    {
        id: 'user-deleted',
        alias: 'UsuarioFantasma',
        email: 'deleted.user@example.com',
        role: UserRoles.PLAYER,
        registeredAt: '2025-12-01T14:00:00.000Z',
        status: UserStatus.DELETED,
    },
];


test.describe('Admin Users Tab', () => {

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
                            user: MOCK_ADMIN,
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
                    body: JSON.stringify(MOCK_ADMIN),
                });
            } else {
                await route.continue();
            }
        });

        // 3. Mock GET /users (Paginado y simulando filtros internos)
        await page.route(new RegExp(`${API_BASE}/users`), async (route) => {
            if (route.request().method() === 'GET') {
                // Devolvemos la estructura esperada por tu userService.getUsers
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        data: {
                            users: MOCK_USERS,
                            pagination: {
                                totalPages: 1,
                                page: 1,
                                limit: 16
                            }
                        }
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');
    });

    test('debe mostrar el listado completo de usuarios', async ({ page }) => {
        // 1. Navegar al panel de administración (por defecto carga la pestaña de usuarios)
        await page.goto('/admin');

        // 2. Validar que estemos en la pantalla de los usuarios
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 3. Validar que se renderizan los alias del set de mocks
        await expect(page.getByText('DardoMaestro')).toBeVisible();
        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('TrollDardos')).toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).toBeVisible();
    });

    test('debe comprobar el funcionamiento del buscador por alias o email', async ({ page }) => {
        // 1. Navegar al panel de administración (por defecto carga la pestaña de usuarios)
        await page.goto('/admin');

        // 2. Validar que funciona el buscador por alias
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('Zaragoza');

        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();

        // 3. Validar que funciona el buscador por correo
        await searchInput.clear();
        await searchInput.fill('dardo.maestro@');

        await expect(page.getByText('DianaZaragoza')).not.toBeVisible();
        await expect(page.getByText('DardoMaestro')).toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por rol', async ({ page }) => {
        await page.goto('/admin');

        // Interactuar con el Select de Rol
        await page.getByRole('combobox', { name: 'Rol' }).click();
        await page.getByRole('option', { name: 'Administrador', exact: true }).click();

        // Verificar filtrado afectando la vista
        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();
    });

    // test('debe mostrar las acciones correctas para cada estado del usuario (activo, bloqueado, eliminado)', async ({ page }) => {
    //     await page.goto('/admin');

    //     // ---- 1. Estado: ACTIVO (UserStatus.ACTIVE) ----
    //     // Permite: Editar usuario, Bloquear usuario. NO permite: Desbloquear, Restaurar.
    //     const rowActive = page.locator('tr', { hasText: 'DardoMaestro' });
    //     await expect(rowActive.getByRole('button', { name: /editar usuario/i })).toBeVisible();
    //     await expect(rowActive.getByRole('button', { name: /bloquear usuario/i })).toBeVisible();

    //     await expect(rowActive.getByRole('button', { name: /desbloquear usuario/i })).not.toBeVisible();
    //     await expect(rowActive.getByRole('button', { name: /restaurar usuario/i })).not.toBeVisible();

    //     // ---- 2. Estado: BLOQUEADO (UserStatus.BLOCKED) ----
    //     // Permite: Editar usuario, Desbloquear usuario, Eliminar usuario. NO permite: Bloquear directo, Restaurar.
    //     const rowBlocked = page.locator('tr', { hasText: 'TrollDardos' });
    //     await expect(rowBlocked.getByRole('button', { name: /editar usuario/i })).toBeVisible();
    //     await expect(rowBlocked.getByRole('button', { name: /desbloquear usuario/i })).toBeVisible();
    //     await expect(rowBlocked.getByRole('button', { name: /eliminar usuario/i })).toBeVisible();

    //     await expect(rowBlocked.getByRole('button', { name: /bloquear usuario/i })).not.toBeVisible();

    //     // ---- 3. Estado: ELIMINADO (UserStatus.DELETED) ----
    //     // Permite: Únicamente "Restaurar usuario" según los condicionales del renderizado. 
    //     // NO permite: Editar, Bloquear, Desbloquear.
    //     const rowDeleted = page.locator('tr', { hasText: 'UsuarioFantasma' });
    //     // { u.status !== UserStatus.DELETED && ...Editar } -> O sea, oculto si está eliminado
    //     await expect(rowDeleted.getByRole('button', { name: /editar usuario/i })).not.toBeVisible();
    //     await expect(rowDeleted.getByRole('button', { name: /bloquear usuario/i })).not.toBeVisible();
    //     await expect(rowDeleted.getByRole('button', { name: /desbloquear usuario/i })).not.toBeVisible();

    //     // u.status === UserStatus.DELETED && Restaurar
    //     await expect(rowDeleted.getByRole('button', { name: /restaurar usuario/i })).toBeVisible();
    // });
});

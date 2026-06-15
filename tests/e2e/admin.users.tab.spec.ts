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
        id: 'user-inactive-2',
        alias: 'DianaZaragoza',
        email: 'diana.zgz@example.com',
        role: UserRoles.ADMIN,
        registeredAt: '2026-02-20T11:30:00.000Z',
        status: UserStatus.INACTIVE,
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
            if (route.request().method() !== 'GET') {
                return route.continue();
            }

            const url = new URL(route.request().url());
            // Extraer parámetros idénticos a los que envía tu userService
            const search = url.searchParams.get('search')?.toLowerCase() || '';
            const status = url.searchParams.get('status') || '';
            const role = url.searchParams.get('role') || '';

            // Aplicar la lógica del servidor de forma simulada
            let filteredUsers = [...MOCK_USERS];

            if (search) {
                filteredUsers = filteredUsers.filter(u =>
                    u.alias.toLowerCase().includes(search) ||
                    u.email.toLowerCase().includes(search)
                );
            }

            if (status) {
                filteredUsers = filteredUsers.filter(u => u.status === status);
            }

            if (role) {
                filteredUsers = filteredUsers.filter(u => u.role === role);
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: "success",
                    data: {
                        users: filteredUsers,
                        pagination: {
                            totalPages: 1,
                            page: 1,
                            limit: 16
                        }
                    }
                }),
            });
        });

        // 4. Proceso automático de Login previo
        await page.goto('/login');
        await page.getByLabel('Correo electrónico').fill(MOCK_ADMIN.email);
        await page.getByLabel('Contraseña').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL('/');

        // 5. Navegar al panel de administración (por defecto carga la pestaña de usuarios)
        await page.goto('/admin');
    });

    test('debe mostrar el listado completo de usuarios', async ({ page }) => {
        // 1. Validar que estemos en la pantalla de los usuarios
        const title = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(title).toBeVisible();

        // 2. Validar que se renderizan los alias del set de mocks
        await expect(page.getByText('DardoMaestro')).toBeVisible();
        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('TrollDardos')).toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).toBeVisible();
    });

    test('debe comprobar el funcionamiento del buscador por alias o email', async ({ page }) => {
        // 1. Validar que funciona el buscador por alias
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('Zaragoza');

        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();

        // 2. Validar que funciona el buscador por correo
        await searchInput.clear();
        await searchInput.fill('dardo.maestro@');

        await expect(page.getByText('DianaZaragoza')).not.toBeVisible();
        await expect(page.getByText('DardoMaestro')).toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por rol', async ({ page }) => {
        // 1. Verificar que funciona el filtro por Rol
        await page.getByRole('combobox', { name: 'Rol' }).click();
        await page.getByRole('option', { name: 'Administrador', exact: true }).click();

        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();
    });

    test('debe comprobar el funcionamiento del filtro por estado', async ({ page }) => {
        // 1. Verificar que funciona el filtro por Estado (Activos)
        await page.getByRole('combobox', { name: 'Estado' }).click();
        await page.getByRole('option', { name: 'Activos', exact: true }).click();

        await expect(page.getByText('DardoMaestro')).toBeVisible();
        await expect(page.getByText('DianaZaragoza')).not.toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();

        // 2. Verificar que funciona el filtro por Estado (Inactivos)
        await page.getByRole('combobox', { name: 'Estado' }).click();
        await page.getByRole('option', { name: 'Inactivos', exact: true }).click();

        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('DianaZaragoza')).toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();

        // 3. Verificar que funciona el filtro por Estado (Bloqueados)
        await page.getByRole('combobox', { name: 'Estado' }).click();
        await page.getByRole('option', { name: 'Bloqueados', exact: true }).click();

        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('DianaZaragoza')).not.toBeVisible();
        await expect(page.getByText('TrollDardos')).toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).not.toBeVisible();

        // 4. Verificar que funciona el filtro por Estado (Eliminados)
        await page.getByRole('combobox', { name: 'Estado' }).click();
        await page.getByRole('option', { name: 'Eliminados', exact: true }).click();

        await expect(page.getByText('DardoMaestro')).not.toBeVisible();
        await expect(page.getByText('DianaZaragoza')).not.toBeVisible();
        await expect(page.getByText('TrollDardos')).not.toBeVisible();
        await expect(page.getByText('UsuarioFantasma')).toBeVisible();
    });

    test('debe mostrar las acciones correctas para cada estado del usuario (activo, bloqueado, eliminado)', async ({ page }) => {
        // ---- 1. Estado: ACTIVO (UserStatus.ACTIVE) ----
        // Permite: Editar, Bloquear, Eliminar
        const rowActive = page.locator('tr', { hasText: 'DardoMaestro' });
        await expect(rowActive.getByRole('button', { name: 'Editar usuario', exact: true })).toBeVisible();
        await expect(rowActive.getByRole('button', { name: 'Bloquear usuario', exact: true })).toBeVisible();
        await expect(rowActive.getByRole('button', { name: 'Desbloquear usuario', exact: true })).not.toBeVisible();
        await expect(rowActive.getByRole('button', { name: 'Eliminar usuario', exact: true })).toBeVisible();
        await expect(rowActive.getByRole('button', { name: 'Restaurar usuario', exact: true })).not.toBeVisible();

        // ---- 2. Estado: INACTIVO (UserStatus.INACTIVE) ----
        // Permite: Editar, Eliminar
        const rowInactive = page.locator('tr', { hasText: 'DianaZaragoza' });
        await expect(rowInactive.getByRole('button', { name: 'Editar usuario', exact: true })).toBeVisible();
        await expect(rowInactive.getByRole('button', { name: 'Bloquear usuario', exact: true })).not.toBeVisible();
        await expect(rowInactive.getByRole('button', { name: 'Desbloquear usuario', exact: true })).not.toBeVisible();
        await expect(rowInactive.getByRole('button', { name: 'Eliminar usuario', exact: true })).toBeVisible();
        await expect(rowInactive.getByRole('button', { name: 'Restaurar usuario', exact: true })).not.toBeVisible();

        // ---- 3. Estado: BLOQUEADO (UserStatus.BLOCKED) ----
        // Permite: Editar, Desbloquear, Eliminar
        const rowBlocked = page.locator('tr', { hasText: 'TrollDardos' });
        await expect(rowBlocked.getByRole('button', { name: 'Editar usuario', exact: true })).toBeVisible();
        await expect(rowBlocked.getByRole('button', { name: 'Bloquear usuario', exact: true })).not.toBeVisible();
        await expect(rowBlocked.getByRole('button', { name: 'Desbloquear usuario', exact: true })).toBeVisible();
        await expect(rowBlocked.getByRole('button', { name: 'Eliminar usuario', exact: true })).toBeVisible();
        await expect(rowBlocked.getByRole('button', { name: 'Restaurar usuario', exact: true })).not.toBeVisible();

        // ---- 4. Estado: ELIMINADO (UserStatus.DELETED) ----
        // Permite: Editar, Desbloquear, Eliminar
        const rowDeleted = page.locator('tr', { hasText: 'UsuarioFantasma' });
        await expect(rowDeleted.getByRole('button', { name: 'Editar usuario', exact: true })).not.toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: 'Bloquear usuario', exact: true })).not.toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: 'Desbloquear usuario', exact: true })).not.toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: 'Eliminar usuario', exact: true })).not.toBeVisible();
        await expect(rowDeleted.getByRole('button', { name: 'Restaurar usuario', exact: true })).toBeVisible();
    });

    test('debe navegar a la pantalla de Editar Usuario', async ({ page }) => {
        const rowActive = page.locator('tr', { hasText: 'DardoMaestro' });

        // 1. Seleccionar el botón de editar
        const editButton = rowActive.getByRole('button', { name: 'Editar usuario', exact: true });
        await expect(editButton).toBeVisible();
        await editButton.click();

        // 2. Verificar que se navega a la pantalla de Editar Usuario
        await expect(page).toHaveURL(`/admin/usuarios/editar/${MOCK_USERS[0].id}`);
        const formTitle = page.getByRole('heading', { name: 'Editar Usuario', exact: true });
        await expect(formTitle).toBeVisible();
    });

    test('debe abrir el modal de bloquear, confirmar la acción y mostrar el toast de éxito', async ({ page }) => {
        const targetUser = MOCK_USERS[0]; // DardoMaestro (ACTIVE)
        const rowActive = page.locator('tr', { hasText: targetUser.alias });

        // 1. Mockear la llamada POST al endpoint de bloquear usuario
        await page.route(`${API_BASE}/users/${targetUser.id}/block`, async (route) => {
            expect(route.request().method()).toBe('POST');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' })
            });
        });

        // 2. Abrir el modal haciendo clic en el botón de la fila
        await rowActive.getByRole('button', { name: 'Bloquear usuario', exact: true }).click();

        // 3. Validar contenido del modal genérico
        const modal = page.locator('div[role="dialog"]'); // O la estructura de tu componente Modal
        await expect(modal.getByRole('heading', { name: 'Bloquear usuario' })).toBeVisible();
        await expect(modal.getByText(targetUser.alias)).toBeVisible();

        // 4. Confirmar la acción en el modal
        await modal.getByRole('button', { name: 'Bloquear', exact: true }).click();

        // 5. Verificar que el toast de éxito aparece en pantalla
        await expect(page.getByText('¡Usuario documento bloqueado con éxito!').or(page.getByText('¡Usuario bloqueado con éxito!'))).toBeVisible();
    });

    test('debe abrir el modal de desbloquear, confirmar la acción y mostrar el toast de éxito', async ({ page }) => {
        const targetUser = MOCK_USERS[2]; // TrollDardos (BLOCKED)
        const rowBlocked = page.locator('tr', { hasText: targetUser.alias });

        // 1. Mockear la llamada POST al endpoint de desbloquear usuario
        await page.route(`${API_BASE}/users/${targetUser.id}/unblock`, async (route) => {
            expect(route.request().method()).toBe('POST');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' })
            });
        });

        // 2. Abrir el modal haciendo clic en el botón de la fila
        await rowBlocked.getByRole('button', { name: 'Desbloquear usuario', exact: true }).click();

        // 3. Validar contenido del modal genérico
        const modal = page.locator('div[role="dialog"]');
        await expect(modal.getByRole('heading', { name: 'Desbloquear usuario' })).toBeVisible();
        await expect(modal.getByText(targetUser.alias)).toBeVisible();

        // 4. Confirmar la acción en el modal
        await modal.getByRole('button', { name: 'Desbloquear', exact: true }).click();

        // 5. Verificar toast de éxito
        await expect(page.getByText('¡Usuario desbloqueado con éxito!')).toBeVisible();
    });

    test('debe abrir el modal de eliminar, confirmar la acción y mostrar el toast de éxito', async ({ page }) => {
        const targetUser = MOCK_USERS[0]; // DardoMaestro
        const rowActive = page.locator('tr', { hasText: targetUser.alias });

        // 1. Mockear la llamada DELETE al endpoint de eliminar usuario
        await page.route(`${API_BASE}/users/${targetUser.id}`, async (route) => {
            expect(route.request().method()).toBe('DELETE');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' })
            });
        });

        // 2. Abrir el modal haciendo clic en el botón de la fila
        await rowActive.getByRole('button', { name: 'Eliminar usuario', exact: true }).click();

        // 3. Validar contenido del modal genérico
        const modal = page.locator('div[role="dialog"]');
        await expect(modal.getByRole('heading', { name: 'Eliminar usuario' })).toBeVisible();
        await expect(modal.getByText(targetUser.alias)).toBeVisible();

        // 4. Confirmar la acción en el modal
        await modal.getByRole('button', { name: 'Eliminar', exact: true }).click();

        // 5. Verificar toast de éxito
        await expect(page.getByText('¡Usuario eliminado con éxito!')).toBeVisible();
    });

    test('debe abrir el modal específico de restaurar, requerir el email, enviarlo correctamente y mostrar el toast de éxito', async ({ page }) => {
        const targetUser = MOCK_USERS[3]; // UsuarioFantasma (DELETED)
        const rowDeleted = page.locator('tr', { hasText: targetUser.alias });
        const NEW_RESTORE_EMAIL = 'fantasma.renacido@example.com';

        // 1. Mockear la llamada POST/PUT al endpoint de restaurar usuario
        await page.route(`${API_BASE}/users/${targetUser.id}/restore`, async (route) => {
            expect(route.request().method() === 'POST' || route.request().method() === 'PUT').toBeTruthy();

            // Validamos que el frontend envíe el email introducido en el body
            const payload = JSON.parse(route.request().postData() || '{}');
            expect(payload.email).toBe(NEW_RESTORE_EMAIL);

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'success' })
            });
        });

        // 2. Abrir el modal haciendo clic en el botón de restaurar
        await rowDeleted.getByRole('button', { name: 'Restaurar usuario', exact: true }).click();

        // 3. Localizar el modal específico de restauración
        const modal = page.locator('div[role="dialog"]');
        await expect(modal.getByRole('heading', { name: 'Restaurar usuario' })).toBeVisible();
        await expect(modal.getByText(targetUser.alias)).toBeVisible();

        // 4. Intentar enviar vacío para validar el error del cliente en el TextInput
        const submitButton = modal.getByRole('button', { name: 'Restaurar', exact: true });
        await submitButton.click();
        await expect(modal.getByText('El correo electrónico es requerido.')).toBeVisible();

        // 5. Rellenar el input con el nuevo email de confirmación y guardar
        const emailInput = modal.getByLabel('Correo electrónico');
        await emailInput.fill(NEW_RESTORE_EMAIL);
        await submitButton.click();

        // 6. Verificar toast final de éxito
        await expect(page.getByText('¡Usuario restaurado con éxito!')).toBeVisible();
    });
});

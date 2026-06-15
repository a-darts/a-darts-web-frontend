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

test.describe('Admin Create User Screen', () => {

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

    test('debe navegar desde el panel, rellenar el formulario y crear un nuevo usuario con éxito', async ({ page }) => {
        const NEW_USER_DATA = {
            alias: 'PepeDardos',
            email: 'pepe.dardos@example.com',
            role: 'PLAYER'
        };

        // 1. Interceptar el endpoint POST de creación de usuario (userService.registerByAdmin)
        await page.route(`${API_BASE}/users`, async (route) => {
            if (route.request().method() === 'POST') {
                const payload = JSON.parse(route.request().postData() || '{}');

                // Validamos que el frontend envíe exactamente los campos correctos al backend
                expect(payload.alias).toBe(NEW_USER_DATA.alias);
                expect(payload.email).toBe(NEW_USER_DATA.email);
                expect(payload.role).toBe(NEW_USER_DATA.role);

                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "success",
                        message: "User registered successfully",
                        data: {
                            id: 'user-new-999',
                            ...NEW_USER_DATA,
                            status: 'ACTIVE',
                            registeredAt: new Date().toISOString(),
                        }
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Verificar que estamos inicialmente en el panel general de usuarios
        const userPanelTitle = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(userPanelTitle).toBeVisible();

        // 3. Localizar y pulsar el botón "Crear usuario" que se encuentra en la parte superior derecha de la tabla
        const navigateToCreateButton = page.getByRole('button', { name: 'Crear usuario', exact: true });
        await expect(navigateToCreateButton).toBeVisible();
        await navigateToCreateButton.click();

        // 4. Validar que la URL cambia o que entramos a la pantalla del formulario de creación
        const formTitle = page.getByRole('heading', { name: 'Crear Nuevo Usuario', exact: true });
        await expect(formTitle).toBeVisible();

        // 5. Rellenar los campos del formulario utilizando sus labels correspondientes
        await page.getByLabel('Alias del usuario').fill(NEW_USER_DATA.alias);
        await page.getByLabel('Correo electrónico').fill(NEW_USER_DATA.email);
        await page.getByRole('combobox', { name: 'Rol del usuario' }).click();
        await page.getByRole('option', { name: `${NEW_USER_DATA.role}`, exact: true }).click();

        // 6. Hacer clic en el botón de submit para enviar el formulario
        const submitButton = page.getByRole('button', { name: 'Crear usuario', exact: true });
        await expect(submitButton).toBeVisible();
        await submitButton.click();

        // 7. Validar el Toast de confirmación de éxito provisto por el context
        const successToast = page.getByText('¡Usuario creado con éxito!');
        await expect(successToast).toBeVisible();

        // 8. Confirmar que la aplicación nos redirigió automáticamente de vuelta al panel general
        await expect(userPanelTitle).toBeVisible();
        await expect(formTitle).not.toBeVisible();
    });

    test('debe mostrar un error en el toast si el correo electrónico ya está registrado', async ({ page }) => {
        const DUPLICATED_USER_DATA = {
            alias: 'DardoRepetido',
            email: 'dardo.maestro@example.com', // Este correo ya existe en MOCK_USERS
            role: 'PLAYER'
        };

        // 1. Interceptar el POST para simular un fallo de conflicto en el servidor (Email Duplicado)
        await page.route(`${API_BASE}/users`, async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 409, // Conflict
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: "error",
                        message: "El correo ya está en uso"
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // 2. Ir desde el Panel de Usuarios hacia el formulario
        await page.getByRole('button', { name: 'Crear usuario', exact: true }).click();

        const formTitle = page.getByRole('heading', { name: 'Crear Nuevo Usuario', exact: true });
        await expect(formTitle).toBeVisible();

        // 3. Rellenar los inputs del formulario
        await page.getByLabel('Alias del usuario').fill(DUPLICATED_USER_DATA.alias);
        await page.getByLabel('Correo electrónico').fill(DUPLICATED_USER_DATA.email);

        // 4. Intentar realizar el envío del formulario
        const submitButton = page.getByRole('button', { name: 'Crear usuario', exact: true });
        await submitButton.click();

        // 5. Validar que aparece el Toast de error con el mensaje devuelto por el servicio/API
        const errorToast = page.getByText('El correo ya está en uso');
        await expect(errorToast).toBeVisible();

        // 6. Validar que NO hubo redirección
        await expect(formTitle).toBeVisible();

        const userPanelTitle = page.getByRole('heading', { name: 'Panel de Usuarios', exact: true });
        await expect(userPanelTitle).not.toBeVisible();
    });
});
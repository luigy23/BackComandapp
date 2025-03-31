import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../user.controller';

// Mock de PrismaClient
vi.mock('@prisma/client', () => {
    const PrismaClient = vi.fn();
    PrismaClient.prototype.user = {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        count: vi.fn()
    };
    PrismaClient.prototype.role = {
        findUnique: vi.fn()
    };
    return { PrismaClient };
});

// Mock de bcrypt
vi.mock('bcrypt', () => ({
    default: {
        genSalt: vi.fn().mockResolvedValue('salt'),
        hash: vi.fn().mockResolvedValue('hashedPassword')
    }
}));

describe('Módulo de Usuarios', () => {
    let prisma;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Reset de los mocks
        vi.clearAllMocks();

        // Crear instancia de Prisma
        prisma = new PrismaClient();

        // Mock de request y response
        mockReq = {
            body: {},
            params: {},
            user: { id: 1 }
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    describe('createUser', () => {
        it('debería crear un usuario exitosamente', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                roleId: 1
            };

            mockReq.body = userData;
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: 1,
                ...userData,
                role: { name: 'Admin' },
                isActive: true
            });

            await createUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Usuario creado exitosamente',
                user: expect.objectContaining({
                    id: 1,
                    name: userData.name,
                    email: userData.email,
                    role: 'Admin',
                    isActive: true
                })
            });
        });

        it('debería retornar error si el email ya existe', async () => {
            const userData = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123',
                roleId: 1
            };

            mockReq.body = userData;
            prisma.user.findUnique.mockResolvedValue({ id: 1, email: userData.email });

            await createUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'El email ya está registrado'
            });
        });
    });

    describe('getAllUsers', () => {
        it('debería retornar la lista de usuarios', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: 'User 1',
                    email: 'user1@example.com',
                    isActive: true,
                    role: { name: 'Admin' }
                },
                {
                    id: 2,
                    name: 'User 2',
                    email: 'user2@example.com',
                    isActive: true,
                    role: { name: 'User' }
                }
            ];

            prisma.user.findMany.mockResolvedValue(mockUsers);

            await getAllUsers(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
        });
    });

    describe('getUserById', () => {
        it('debería retornar un usuario por ID', async () => {
            const mockUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                isActive: true,
                role: { name: 'Admin' }
            };

            mockReq.params.id = '1';
            prisma.user.findUnique.mockResolvedValue(mockUser);

            await getUserById(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(mockUser);
        });

        it('debería retornar 404 si el usuario no existe', async () => {
            mockReq.params.id = '999';
            prisma.user.findUnique.mockResolvedValue(null);

            await getUserById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Usuario no encontrado'
            });
        });
    });

    describe('updateUser', () => {
        it('debería actualizar un usuario exitosamente', async () => {
            const updateData = {
                name: 'Updated Name',
                email: 'updated@example.com'
            };

            mockReq.params.id = '1';
            mockReq.body = updateData;

            // Primero devuelve el usuario existente
            prisma.user.findUnique
                .mockResolvedValueOnce({
                    id: 1,
                    email: 'old@example.com'
                })
                // Segundo findUnique debe devolver null para indicar que el email no está en uso
                .mockResolvedValueOnce(null);

            prisma.user.update.mockResolvedValue({
                id: 1,
                ...updateData,
                role: { name: 'Admin' },
                isActive: true
            });

            await updateUser(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Usuario actualizado exitosamente',
                user: expect.objectContaining({
                    id: 1,
                    ...updateData,
                    role: 'Admin',
                    isActive: true
                })
            });
        });

        it('debería retornar error si el email ya está en uso', async () => {
            const updateData = {
                email: 'existing@example.com'
            };

            mockReq.params.id = '1';
            mockReq.body = updateData;

            prisma.user.findUnique
                .mockResolvedValueOnce({ id: 1, email: 'old@example.com' })
                .mockResolvedValueOnce({ id: 2, email: updateData.email });

            await updateUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'El email ya está en uso'
            });
        });
    });

    describe('deleteUser', () => {
        it('debería desactivar un usuario exitosamente', async () => {
            mockReq.params.id = '1';

            prisma.user.findUnique.mockResolvedValue({
                id: 1,
                roleId: 2 // No es admin
            });
            prisma.user.update.mockResolvedValue({
                id: 1,
                isActive: false
            });

            await deleteUser(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Usuario desactivado exitosamente'
            });
        });

        it('debería retornar error si es el último administrador activo', async () => {
            mockReq.params.id = '1';

            prisma.user.findUnique.mockResolvedValue({
                id: 1,
                roleId: 1 // Es admin
            });
            prisma.user.count.mockResolvedValue(1);

            await deleteUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'No se puede eliminar al único administrador activo'
            });
        });
    });
}); 
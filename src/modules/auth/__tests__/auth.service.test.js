import { expect, describe, test, beforeEach, vi } from 'vitest';
import { register, login } from '../auth.service.js';
import { findByEmail, create } from '../auth.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock de las dependencias
vi.mock('../auth.repository.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('Auth Service', () => {
    const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedPassword',
        roleId: 1,
        isActive: true
    };

    beforeEach(() => {
        // Limpiar todos los mocks antes de cada prueba
        vi.clearAllMocks();
    });

    describe('register', () => {
        const userData = {
            email: 'test@example.com',
            password: 'Test123!@#',
            name: 'Test User',
            roleId: 1
        };

        test('debería registrar un usuario exitosamente', async () => {
            vi.mocked(findByEmail).mockResolvedValue(null);
            vi.mocked(create).mockResolvedValue(mockUser);
            vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword');
            vi.mocked(jwt.sign).mockReturnValue('mockToken');

            const result = await register(userData);

            expect(findByEmail).toHaveBeenCalledWith(userData.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(create).toHaveBeenCalledWith({
                ...userData,
                passwordHash: 'hashedPassword',
                isActive: true
            });
            expect(jwt.sign).toHaveBeenCalled();
            expect(result).toBe('mockToken');
        });

        test('debería rechazar registro si el usuario ya existe', async () => {
            vi.mocked(findByEmail).mockResolvedValue(mockUser);

            await expect(register(userData)).rejects.toThrow('El usuario ya existe');
        });

        test('debería rechazar contraseña inválida', async () => {
            vi.mocked(findByEmail).mockResolvedValue(null);
            const invalidUserData = {
                ...userData,
                password: 'weak'
            };

            await expect(register(invalidUserData)).rejects.toThrow('Contraseña inválida');
        });
    });

    describe('login', () => {
        const credentials = {
            email: 'test@example.com',
            password: 'Test123!@#'
        };

        test('debería hacer login exitosamente', async () => {
            vi.mocked(findByEmail).mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(true);
            vi.mocked(jwt.sign).mockReturnValue('mockToken');

            const result = await login(credentials.email, credentials.password);

            expect(findByEmail).toHaveBeenCalledWith(credentials.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.passwordHash);
            expect(jwt.sign).toHaveBeenCalled();
            expect(result).toBe('mockToken');
        });

        test('debería rechazar credenciales inválidas', async () => {
            vi.mocked(findByEmail).mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(false);

            await expect(login(credentials.email, credentials.password))
                .rejects.toThrow('Credenciales inválidas');
        });

        test('debería rechazar usuario no existente', async () => {
            vi.mocked(findByEmail).mockResolvedValue(null);

            await expect(login(credentials.email, credentials.password))
                .rejects.toThrow('Credenciales inválidas');
        });
    });
}); 
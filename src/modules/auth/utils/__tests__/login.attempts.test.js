import { expect, describe, test, beforeEach } from 'vitest';
import { checkLoginAttempts, recordFailedAttempt, resetLoginAttempts } from '../login.attempts.js';

describe('Login Attempts System', () => {
    const testEmail = 'test@example.com';

    beforeEach(() => {
        // Limpiar intentos antes de cada prueba
        resetLoginAttempts(testEmail);
    });

    test('debería permitir login en primer intento', () => {
        const result = checkLoginAttempts(testEmail);
        expect(result.canLogin).toBe(true);
    });

    test('debería permitir login después de 4 intentos fallidos', () => {
        for (let i = 0; i < 4; i++) {
            recordFailedAttempt(testEmail);
        }
        const result = checkLoginAttempts(testEmail);
        expect(result.canLogin).toBe(true);
    });

    test('debería bloquear después de 5 intentos fallidos', () => {
        for (let i = 0; i < 5; i++) {
            recordFailedAttempt(testEmail);
        }
        const result = checkLoginAttempts(testEmail);
        expect(result.canLogin).toBe(false);
        expect(result.message).toContain('Cuenta bloqueada');
    });

    test('debería resetear intentos después del bloqueo', () => {
        // Simular bloqueo
        for (let i = 0; i < 5; i++) {
            recordFailedAttempt(testEmail);
        }
        
        // Resetear intentos
        resetLoginAttempts(testEmail);
        
        const result = checkLoginAttempts(testEmail);
        expect(result.canLogin).toBe(true);
    });
}); 
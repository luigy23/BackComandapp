import { expect, describe, test } from 'vitest';
import { validatePassword } from '../password.validator.js';

describe('Password Validator', () => {
    test('debería aceptar una contraseña válida', () => {
        const password = 'Test123!@#';
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('debería rechazar contraseña sin mayúsculas', () => {
        const password = 'test123!@#';
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('La contraseña debe contener al menos una mayúscula');
    });

    test('debería rechazar contraseña sin minúsculas', () => {
        const password = 'TEST123!@#';
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('La contraseña debe contener al menos una minúscula');
    });

    test('debería rechazar contraseña sin números', () => {
        const password = 'TestTest!@#';
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('La contraseña debe contener al menos un número');
    });

    test('debería rechazar contraseña sin caracteres especiales', () => {
        const password = 'TestTest123';
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('La contraseña debe contener al menos un carácter especial');
    });

    test('debería rechazar contraseña muy corta', () => {
        const password = 'Test1!';
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });
}); 
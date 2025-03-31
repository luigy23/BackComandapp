import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findByEmail, create } from './auth.repository.js';
import { validatePassword } from './utils/password.validator.js';
import { checkLoginAttempts, recordFailedAttempt, resetLoginAttempts } from './utils/login.attempts.js';

export const register = async (userData) => {
    const existingUser = await findByEmail(userData.email);
    if (existingUser) {
        throw new Error('El usuario ya existe');
    }

    // Validar contraseña
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
        throw new Error(`Contraseña inválida: ${passwordValidation.errors.join(', ')}`);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await create({
        ...userData,
        passwordHash: hashedPassword,
        isActive: true
    });

    return generateToken(user);
};

export const login = async (email, password) => {
    // Verificar intentos de login
    const loginCheck = checkLoginAttempts(email);
    if (!loginCheck.canLogin) {
        throw new Error(loginCheck.message);
    }

    const user = await findByEmail(email);
    if (!user) {
        recordFailedAttempt(email);
        throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
        recordFailedAttempt(email);
        throw new Error('Credenciales inválidas');
    }

    // Resetear intentos si el login es exitoso
    resetLoginAttempts(email);
    return generateToken(user);
};

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            roleId: user.roleId 
        },
        process.env.JWT_SECRET || 'tu-secreto-seguro',
        { expiresIn: '24h' }
    );
}; 
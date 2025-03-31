// Simulamos una base de datos en memoria para los intentos
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutos en milisegundos

export const checkLoginAttempts = (email) => {
    const attempts = loginAttempts.get(email);
    
    if (!attempts) {
        return { canLogin: true };
    }
    
    if (attempts.count >= MAX_ATTEMPTS) {
        const timeLeft = attempts.blockUntil - Date.now();
        if (timeLeft > 0) {
            return {
                canLogin: false,
                message: `Cuenta bloqueada. Intente nuevamente en ${Math.ceil(timeLeft / 60000)} minutos`
            };
        } else {
            // Resetear intentos si ya pasó el tiempo de bloqueo
            loginAttempts.delete(email);
            return { canLogin: true };
        }
    }
    
    return { canLogin: true };
};

export const recordFailedAttempt = (email) => {
    const attempts = loginAttempts.get(email) || { count: 0 };
    attempts.count++;
    
    if (attempts.count >= MAX_ATTEMPTS) {
        attempts.blockUntil = Date.now() + BLOCK_TIME;
    }
    
    loginAttempts.set(email, attempts);
};

export const resetLoginAttempts = (email) => {
    loginAttempts.delete(email);
}; 
export const validatePassword = (password) => {
    const errors = [];
    
    // Longitud mínima de 8 caracteres
    if (password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    // Debe contener al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una mayúscula');
    }
    
    // Debe contener al menos una minúscula
    if (!/[a-z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una minúscula');
    }
    
    // Debe contener al menos un número
    if (!/[0-9]/.test(password)) {
        errors.push('La contraseña debe contener al menos un número');
    }
    
    // Debe contener al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const isAdmin = async (req, res, next) => {
    try {
        // Verificamos que req.user exista
        if (!req.user) {
            return res.status(401).json({
                message: 'Usuario no autenticado'
            });
        }

        // Obtenemos el roleId del usuario
        const roleId = req.user.roleId;

        if (!roleId) {
            return res.status(401).json({
                message: 'Información de rol no disponible'
            });
        }

        // Verificar si el usuario es administrador (roleId 1 corresponde a ADMIN)
        if (roleId !== 1) {
            return res.status(403).json({ 
                message: 'Acceso denegado. Se requiere rol de administrador.' 
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        res.status(500).json({ message: 'Error al verificar permisos' });
    }
};

export {
    isAdmin
}; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const isAdmin = async (req, res, next) => {
    try {
        // Asumimos que el ID del usuario está en req.user (seteado por el middleware de autenticación principal)
        const userId = req.user.id;

        // Buscar el usuario y su rol
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario es administrador
        if (user.role.name.toLowerCase() !== 'admin') {
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
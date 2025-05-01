import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const checkProductAccess = async (req, res, next) => {
    try {
        const userId = req.user.id; // Asumiendo que el ID del usuario está en req.user después de la autenticación

        // Obtener el rol del usuario
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si el usuario tiene rol de Admin o Manager
        if (user.role.name !== 'Admin' && user.role.name !== 'Manager') {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar permisos' });
    }
};

export {
    checkProductAccess
}; 
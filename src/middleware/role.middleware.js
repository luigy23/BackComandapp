export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user.role.name;
            
            if (!userRole || !allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para realizar esta acción'
                });
            }
            
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al verificar los permisos',
                error: error.message
            });
        }
    };
}; 
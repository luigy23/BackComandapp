import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Token no proporcionado' 
            });
        }

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'tu-secreto-seguro'
        );

        req.user = decoded;
        console.log("Token decodificado:", decoded);
        next();
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(401).json({ 
            error: 'Token inválido',
            details: error.message
        });
    }
};

export default authMiddleware; 
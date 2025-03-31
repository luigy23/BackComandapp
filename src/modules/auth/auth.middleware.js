import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
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
        next();
    } catch (error) {
        res.status(401).json({ 
            error: 'Token inválido' 
        });
    }
};

export default authMiddleware; 
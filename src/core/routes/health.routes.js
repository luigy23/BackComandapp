import { Router } from 'express';

const router = Router();

// Middleware específico para las rutas de health
router.use((req, res, next) => {
    console.log('Health route middleware called');
    next();
});

// Ruta principal de health check
router.get('/', (req, res) => {
    console.log('Health check endpoint called');
    return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Server is running'
    });
});

// Ruta de prueba
router.get('/test', (req, res) => {
    console.log('Health test endpoint called');
    return res.status(200).json({
        message: 'Health test route working'
    });
});

export default router; 
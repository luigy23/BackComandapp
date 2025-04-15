import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/users/user.routes.js';
import roleRoutes from './src/modules/users/role.routes.js';
import tableRoutes from './src/modules/tables/table.routes.js';
import tableCategoryRoutes from './src/modules/tables/table-category.routes.js';
import productRoutes from './src/modules/products/product.routes.js';
import productCategoryRoutes from './src/modules/products/category.routes.js';
import healthRoutes from './src/core/routes/health.routes.js';
import authMiddleware from './src/modules/auth/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Configuración básica de CORS para desarrollo
app.use(cors({
    origin: true,
    credentials: true
}));

// Configuración para servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Middleware para parsear JSON
app.use(express.json());
// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: true }));


// Middleware para logging de todas las peticiones
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`\x1b[36m%s\x1b[0m`, `[${new Date().toISOString()}]`,
            `\x1b[33m${req.method}\x1b[0m`,
            `${req.originalUrl}`,
            `\x1b[${res.statusCode < 400 ? '32' : '31'}m${res.statusCode}\x1b[0m`,
            `+${duration}ms`,
            req.body && Object.keys(req.body).length ? `\nBody: ${JSON.stringify(req.body, null, 2)}` : ''
        );
    });
    next();
});

// Rutas de autenticación (no requieren autenticación)
app.use('/api/auth', authRoutes);

// Rutas de health check (no requieren autenticación)
app.use('/api/health', healthRoutes);

// Aplicar middleware de autenticación a todas las rutas protegidas
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/roles', authMiddleware, roleRoutes);
app.use('/api/tables', authMiddleware, tableRoutes);
app.use('/api/table-categories', authMiddleware, tableCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-categories', productCategoryRoutes);

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Hola! Esta es una prueba de hot-reload con nodemon genial', 
    timestamp: new Date().toISOString() 
  });
});

// Manejador de errores para rutas no encontradas
app.use('*', (req, res) => {
    console.log(`404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log('=================================');
  console.log(`¡Servidor iniciado exitosamente en http://localhost:${port}! 🚀`);
  console.log('Rutas principales:');
  console.log('- GET /');
  console.log('- GET /api/health');
  console.log('- GET /api/health/test');
  console.log('=================================');
});


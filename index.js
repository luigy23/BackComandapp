import express from 'express';
import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/users/user.routes.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: true }));
// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Hola! Esta es una prueba de hot-reload con nodemon genial', 
    timestamp: new Date().toISOString() 
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`¡Servidor iniciado exitosamente en http://localhost:${port}! 🚀`);
});


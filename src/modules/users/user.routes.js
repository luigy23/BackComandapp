import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from './user.controller.js';
import { isAdmin } from './auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(isAdmin);

// Rutas CRUD de usuarios
router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 
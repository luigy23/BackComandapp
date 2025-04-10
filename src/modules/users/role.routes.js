import express from 'express';
import { 
    getAllRoles, 
    getRoleById, 
    createRole, 
    updateRole, 
    deleteRole,
    getAllPermissions
} from './role.controller.js';
import { isAdmin } from './auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(isAdmin);

// Rutas para roles
router.get('/', getAllRoles);
router.get('/permissions', getAllPermissions);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router; 
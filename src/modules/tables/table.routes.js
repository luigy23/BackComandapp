import { Router } from 'express';
import { checkTableAccess } from './auth.middleware.js';
import {
    getAllTables,
    getTableById,
    createTable,
    updateTable,
    deleteTable,
    getTablesByCategory
} from './table.controller.js';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/', getAllTables);
router.get('/:id', getTableById);

// Rutas protegidas (requieren autenticación y permisos)
router.post('/', checkTableAccess, createTable);
router.put('/:id', checkTableAccess, updateTable);
router.delete('/:id', checkTableAccess, deleteTable);

router.get('/category/:categoryId', getTablesByCategory);

export default router; 
import { Router } from 'express';
import { checkTableAccess } from './auth.middleware.js';
import {
    getAllTableCategories,
    getTableCategoryById,
    createTableCategory,
    updateTableCategory,
    deleteTableCategory
} from './table-category.controller.js';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/', getAllTableCategories);
router.get('/:id', getTableCategoryById);

// Rutas protegidas (requieren autenticación y permisos)
router.post('/', checkTableAccess, createTableCategory);
router.put('/:id', checkTableAccess, updateTableCategory);
router.delete('/:id', checkTableAccess, deleteTableCategory);

export default router; 
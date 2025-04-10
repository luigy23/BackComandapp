import { Router } from 'express';
import { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from './category.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { checkRole } from '../../middleware/role.middleware.js';

const router = Router();

// Rutas públicas
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Rutas protegidas (solo admin y manager)
router.post('/', authenticateToken, checkRole(['ADMIN', 'MANAGER']), createCategory);
router.put('/:id', authenticateToken, checkRole(['ADMIN', 'MANAGER']), updateCategory);
router.delete('/:id', authenticateToken, checkRole(['ADMIN', 'MANAGER']), deleteCategory);

export default router; 
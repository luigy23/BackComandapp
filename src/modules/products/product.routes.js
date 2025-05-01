import { Router } from 'express';
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from './product.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { checkRole } from '../../middleware/role.middleware.js';

const router = Router();

// Rutas públicas
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas protegidas (solo admin y manager)
router.post('/', authenticateToken, checkRole(['ADMIN', 'MANAGER']), createProduct);
router.put('/:id', authenticateToken, checkRole(['ADMIN', 'MANAGER']), updateProduct);
router.delete('/:id', authenticateToken, checkRole(['ADMIN', 'MANAGER']), deleteProduct);

export default router; 
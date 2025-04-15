import { Router } from 'express';
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from './product.controller.js';
import upload from '../../middleware/multer.js';

const router = Router();

// Rutas para productos
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
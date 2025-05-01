import { Router } from 'express';
import { 
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrdersByTable,
    getOrdersByWaiter,
    getOrdersByStatus,
    updateOrderItemStatus,
    getCurrentOrder
} from './order.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { checkRole } from '../../middleware/role.middleware.js';

const router = Router();

// Rutas protegidas que requieren autenticación
//router.use(authenticateToken);

// Rutas básicas CRUD
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

// Rutas adicionales
router.get('/table/:tableId', getOrdersByTable);
router.get('/waiter/:waiterId', getOrdersByWaiter);
router.get('/status/:status', getOrdersByStatus);
router.put('/:orderId/items/:itemId/status', updateOrderItemStatus);
router.get('/current/:tableId', getCurrentOrder);


export default router; 
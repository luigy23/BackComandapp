import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';

// Mock de PrismaClient
const mockPrismaClient = {
    product: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    },
    orderItem: {
        findFirst: vi.fn()
    }
};

vi.mock('@prisma/client', () => ({
    PrismaClient: vi.fn(() => mockPrismaClient)
}));

// Importamos después del mock
import { prisma } from '../product.controller.js';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../product.controller.js';

describe('Product Module', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Reset de los mocks
        vi.clearAllMocks();

        // Mock de request y response
        mockReq = {
            body: {},
            params: {},
            query: {}
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    describe('getAllProducts', () => {
        it('debería obtener todos los productos', async () => {
            const mockProducts = [
                {
                    id: 1,
                    name: 'Test Product 1',
                    description: 'Description 1',
                    price: 10.99,
                    categoryId: 1,
                    stock: 10,
                    status: 'ACTIVE',
                    category: { name: 'Test Category' }
                },
                {
                    id: 2,
                    name: 'Test Product 2',
                    description: 'Description 2',
                    price: 15.99,
                    categoryId: 1,
                    stock: 5,
                    status: 'ACTIVE',
                    category: { name: 'Test Category' }
                }
            ];

            mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

            await getAllProducts(mockReq, mockRes);

            expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith({
                where: {},
                include: { category: true },
                orderBy: { name: 'asc' }
            });
            expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
        });

        it('debería filtrar productos por estado', async () => {
            mockReq.query.status = 'ACTIVE';
            const mockProducts = [
                {
                    id: 1,
                    name: 'Test Product 1',
                    status: 'ACTIVE',
                    category: { name: 'Test Category' }
                }
            ];
            mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

            await getAllProducts(mockReq, mockRes);

            expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith({
                where: { status: 'ACTIVE' },
                include: { category: true },
                orderBy: { name: 'asc' }
            });
            expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
        });

        it('debería rechazar un estado inválido', async () => {
            mockReq.query.status = 'INVALID';
            await getAllProducts(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Estado inválido. Debe ser ACTIVE, INACTIVE o OUT_OF_STOCK'
            });
        });
    });

    describe('createProduct', () => {
        it('debería crear un nuevo producto', async () => {
            const productData = {
                name: 'New Product',
                description: 'Description',
                price: 10.99,
                categoryId: 1,
                stock: 10
            };

            const createdProduct = {
                id: 1,
                ...productData,
                status: 'ACTIVE',
                category: { name: 'Test Category' }
            };

            mockReq.body = productData;
            mockPrismaClient.product.findFirst.mockResolvedValue(null);
            mockPrismaClient.product.create.mockResolvedValue(createdProduct);

            await createProduct(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(createdProduct);
        });

        it('debería crear un producto sin stock como OUT_OF_STOCK', async () => {
            const productData = {
                name: 'No Stock Product',
                description: 'Description',
                price: 10.99,
                categoryId: 1,
                stock: 0
            };

            const createdProduct = {
                id: 2,
                ...productData,
                status: 'OUT_OF_STOCK',
                category: { name: 'Test Category' }
            };

            mockReq.body = productData;
            mockPrismaClient.product.findFirst.mockResolvedValue(null);
            mockPrismaClient.product.create.mockResolvedValue(createdProduct);

            await createProduct(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(createdProduct);
        });

        it('no debería crear un producto con nombre duplicado', async () => {
            const productData = {
                name: 'Duplicate Product',
                price: 10.99,
                categoryId: 1
            };

            mockReq.body = productData;
            mockPrismaClient.product.findFirst.mockResolvedValue({ id: 1, name: 'Duplicate Product' });

            await createProduct(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Ya existe un producto con ese nombre en esta categoría'
            });
        });
    });

    describe('updateProduct', () => {
        it('debería actualizar un producto', async () => {
            const updateData = {
                name: 'Updated Product',
                price: 12.99,
                stock: 5
            };

            const existingProduct = {
                id: 1,
                name: 'Original Product',
                status: 'ACTIVE'
            };

            const updatedProduct = {
                id: 1,
                ...updateData,
                status: 'ACTIVE',
                category: { name: 'Test Category' }
            };

            mockReq.params.id = '1';
            mockReq.body = updateData;

            mockPrismaClient.product.findUnique.mockResolvedValue(existingProduct);
            mockPrismaClient.product.findFirst.mockResolvedValue(null);
            mockPrismaClient.product.update.mockResolvedValue(updatedProduct);

            await updateProduct(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(updatedProduct);
        });

        it('debería cambiar a OUT_OF_STOCK cuando el stock llega a 0', async () => {
            const updateData = {
                stock: 0
            };

            const existingProduct = {
                id: 1,
                name: 'Test Product',
                status: 'ACTIVE'
            };

            const updatedProduct = {
                id: 1,
                name: 'Test Product',
                stock: 0,
                status: 'OUT_OF_STOCK'
            };

            mockReq.params.id = '1';
            mockReq.body = updateData;

            mockPrismaClient.product.findUnique.mockResolvedValue(existingProduct);
            mockPrismaClient.product.update.mockResolvedValue(updatedProduct);

            await updateProduct(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(updatedProduct);
        });
    });

    describe('deleteProduct', () => {
        it('debería eliminar un producto sin pedidos históricos', async () => {
            mockReq.params.id = '1';

            mockPrismaClient.product.findUnique.mockResolvedValue({ id: 1 });
            mockPrismaClient.orderItem.findFirst.mockResolvedValue(null);
            mockPrismaClient.product.delete.mockResolvedValue({ id: 1 });

            await deleteProduct(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Producto eliminado correctamente'
            });
        });

        it('debería marcar como inactivo un producto con pedidos históricos', async () => {
            mockReq.params.id = '1';

            mockPrismaClient.product.findUnique.mockResolvedValue({ id: 1 });
            mockPrismaClient.orderItem.findFirst.mockResolvedValue({ id: 1 });
            mockPrismaClient.product.update.mockResolvedValue({
                id: 1,
                status: 'INACTIVE'
            });

            await deleteProduct(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Producto marcado como inactivo debido a pedidos históricos'
            });
        });
    });
}); 
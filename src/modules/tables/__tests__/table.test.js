import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
    getAllTables,
    getTableById,
    createTable,
    updateTable,
    deleteTable
} from '../table.controller';

// Mock de PrismaClient
vi.mock('@prisma/client', () => {
    const PrismaClient = vi.fn();
    PrismaClient.prototype.diningTable = {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    };
    PrismaClient.prototype.order = {
        findFirst: vi.fn()
    };
    return { PrismaClient };
});

describe('Módulo de Mesas', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Reset de los mocks
        vi.clearAllMocks();

        // Mock de request y response
        mockReq = {
            body: {},
            params: {}
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    describe('getAllTables', () => {
        it('debería retornar la lista de mesas ordenadas por número', async () => {
            const mockTables = [
                {
                    id: 1,
                    number: '1',
                    capacity: 4,
                    status: 'AVAILABLE',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 2,
                    number: '2',
                    capacity: 6,
                    status: 'OCCUPIED',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            const prisma = new PrismaClient();
            prisma.diningTable.findMany.mockResolvedValue(mockTables);

            await getAllTables(mockReq, mockRes);

            expect(prisma.diningTable.findMany).toHaveBeenCalledWith({
                orderBy: { number: 'asc' }
            });
            expect(mockRes.json).toHaveBeenCalledWith(mockTables);
        });
    });

    describe('getTableById', () => {
        it('debería retornar una mesa por ID', async () => {
            const mockTable = {
                id: 1,
                number: '1',
                capacity: 4,
                status: 'AVAILABLE',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockReq.params.id = '1';
            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue(mockTable);

            await getTableById(mockReq, mockRes);

            expect(prisma.diningTable.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(mockRes.json).toHaveBeenCalledWith(mockTable);
        });

        it('debería retornar 404 si la mesa no existe', async () => {
            mockReq.params.id = '999';
            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue(null);

            await getTableById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Mesa no encontrada'
            });
        });
    });

    describe('createTable', () => {
        it('debería crear una mesa exitosamente', async () => {
            const tableData = {
                number: '3',
                capacity: 4,
                status: 'AVAILABLE'
            };

            mockReq.body = tableData;
            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue(null);
            prisma.diningTable.create.mockResolvedValue({
                id: 3,
                ...tableData,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await createTable(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 3,
                    ...tableData
                })
            );
        });

        it('debería retornar error si el número de mesa ya existe', async () => {
            const tableData = {
                number: '1',
                capacity: 4
            };

            mockReq.body = tableData;
            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue({
                id: 1,
                number: '1'
            });

            await createTable(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Ya existe una mesa con ese número'
            });
        });
    });

    describe('updateTable', () => {
        it('debería actualizar una mesa exitosamente', async () => {
            const updateData = {
                capacity: 6,
                status: 'OCCUPIED'
            };

            mockReq.params.id = '1';
            mockReq.body = updateData;

            const prisma = new PrismaClient();
            // Primero devuelve la mesa existente
            prisma.diningTable.findUnique
                .mockResolvedValueOnce({
                    id: 1,
                    number: '1',
                    status: 'AVAILABLE'
                });

            prisma.order.findFirst.mockResolvedValue(null);

            prisma.diningTable.update.mockResolvedValue({
                id: 1,
                number: '1',
                ...updateData,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await updateTable(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    ...updateData
                })
            );
        });

        it('debería retornar error si la mesa no existe', async () => {
            mockReq.params.id = '999';
            mockReq.body = { status: 'OCCUPIED' };

            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue(null);

            await updateTable(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Mesa no encontrada'
            });
        });

        it('debería retornar error si la mesa tiene pedidos activos', async () => {
            mockReq.params.id = '1';
            mockReq.body = { status: 'OCCUPIED' };

            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue({
                id: 1,
                number: '1',
                status: 'AVAILABLE'
            });

            prisma.order.findFirst.mockResolvedValue({
                id: 1,
                status: 'OPEN'
            });

            await updateTable(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'No se puede cambiar el estado de la mesa mientras tenga pedidos activos'
            });
        });
    });

    describe('deleteTable', () => {
        it('debería eliminar una mesa exitosamente', async () => {
            mockReq.params.id = '1';

            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue({
                id: 1,
                number: '1',
                status: 'AVAILABLE'
            });

            prisma.order.findFirst.mockResolvedValue(null);

            await deleteTable(mockReq, mockRes);

            expect(prisma.diningTable.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Mesa eliminada correctamente'
            });
        });

        it('debería retornar error si la mesa no existe', async () => {
            mockReq.params.id = '999';
            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue(null);

            await deleteTable(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Mesa no encontrada'
            });
        });

        it('debería retornar error si la mesa tiene pedidos activos', async () => {
            mockReq.params.id = '1';

            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue({
                id: 1,
                number: '1',
                status: 'AVAILABLE'
            });

            prisma.order.findFirst.mockResolvedValue({
                id: 1,
                status: 'OPEN'
            });

            await deleteTable(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'No se puede eliminar una mesa con pedidos activos'
            });
        });

        it('debería retornar error si la mesa está ocupada', async () => {
            mockReq.params.id = '1';

            const prisma = new PrismaClient();
            prisma.diningTable.findUnique.mockResolvedValue({
                id: 1,
                number: '1',
                status: 'OCCUPIED'
            });

            await deleteTable(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'No se puede eliminar una mesa que está ocupada o pendiente de pago'
            });
        });
    });
}); 
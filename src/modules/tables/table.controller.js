import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las mesas
export const getAllTables = async (req, res) => {
    try {
        const { categoryId } = req.query;
        const where = categoryId ? { categoryId: parseInt(categoryId) } : {};

        const tables = await prisma.diningTable.findMany({
            where,
            include: {
                category: true
            },
            orderBy: [
                { number: 'asc' },
                { description: 'asc' }
            ]
        });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las mesas' });
    }
};

// Obtener una mesa por ID
export const getTableById = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await prisma.diningTable.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true
            }
        });

        if (!table) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        res.json(table);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la mesa' });
    }
};

// Crear una nueva mesa
export const createTable = async (req, res) => {
    try {
        const { number, capacity, status, description, categoryId } = req.body;

        // Validar que el número de mesa sea único
        const existingTable = await prisma.diningTable.findUnique({
            where: { number }
        });

        if (existingTable) {
            return res.status(400).json({ error: 'Ya existe una mesa con ese número' });
        }

        const table = await prisma.diningTable.create({
            data: {
                number,
                description,
                capacity: parseInt(capacity),
                status: status || 'AVAILABLE',
                categoryId: categoryId ? parseInt(categoryId) : null
            },
            include: {
                category: true
            }
        });

        res.status(201).json(table);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la mesa' });
    }
};

// Actualizar una mesa
export const updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const { number, capacity, status, description, categoryId } = req.body;

        // Verificar si la mesa existe
        const existingTable = await prisma.diningTable.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingTable) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        // Si se está cambiando el número, verificar que sea único
        if (number && number !== existingTable.number) {
            const tableWithNumber = await prisma.diningTable.findUnique({
                where: { number }
            });

            if (tableWithNumber) {
                return res.status(400).json({ error: 'Ya existe una mesa con ese número' });
            }
        }

        // Verificar si la mesa tiene pedidos activos antes de cambiar su estado
        if (status && status !== existingTable.status) {
            const activeOrders = await prisma.order.findFirst({
                where: {
                    tableId: parseInt(id),
                    status: 'OPEN'
                }
            });

            if (activeOrders) {
                return res.status(400).json({ 
                    error: 'No se puede cambiar el estado de la mesa mientras tenga pedidos activos' 
                });
            }
        }

        const updatedTable = await prisma.diningTable.update({
            where: { id: parseInt(id) },
            data: {
                number,
                description,
                capacity: capacity ? parseInt(capacity) : undefined,
                status,
                categoryId: categoryId !== undefined ? (categoryId ? parseInt(categoryId) : null) : undefined
            },
            include: {
                category: true
            }
        });

        res.json(updatedTable);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la mesa' });
    }
};

// Eliminar una mesa
export const deleteTable = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si la mesa existe
        const table = await prisma.diningTable.findUnique({
            where: { id: parseInt(id) }
        });

        if (!table) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        // Verificar si la mesa está ocupada o pendiente de pago
        if (table.status === 'OCCUPIED' || table.status === 'BILL_PENDING') {
            return res.status(400).json({ 
                error: 'No se puede eliminar una mesa que está ocupada o pendiente de pago' 
            });
        }

        // Verificar si la mesa tiene pedidos activos
        const activeOrders = await prisma.order.findFirst({
            where: {
                tableId: parseInt(id),
                status: 'OPEN'
            }
        });

        if (activeOrders) {
            return res.status(400).json({ 
                error: 'No se puede eliminar una mesa con pedidos activos' 
            });
        }

        await prisma.diningTable.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Mesa eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la mesa' });
    }
}; 
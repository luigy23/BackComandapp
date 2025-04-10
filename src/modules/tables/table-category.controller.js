import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las categorías de mesas
export const getAllTableCategories = async (req, res) => {
    try {
        const categories = await prisma.tableCategory.findMany({
            include: {
                tables: true
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías de mesas' });
    }
};

// Obtener una categoría por ID
export const getTableCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.tableCategory.findUnique({
            where: { id: parseInt(id) },
            include: {
                tables: true
            }
        });

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la categoría' });
    }
};

// Crear una nueva categoría
export const createTableCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        // Validar que el nombre sea único
        const existingCategory = await prisma.tableCategory.findUnique({
            where: { name }
        });

        if (existingCategory) {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        }

        const category = await prisma.tableCategory.create({
            data: {
                name,
                description,
                status: status || 'ACTIVE'
            }
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
};

// Actualizar una categoría
export const updateTableCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        // Verificar si la categoría existe
        const existingCategory = await prisma.tableCategory.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingCategory) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        // Si se está cambiando el nombre, verificar que sea único
        if (name && name !== existingCategory.name) {
            const categoryWithName = await prisma.tableCategory.findUnique({
                where: { name }
            });

            if (categoryWithName) {
                return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
            }
        }

        const updatedCategory = await prisma.tableCategory.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                status
            },
            include: {
                tables: true
            }
        });

        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
};

// Eliminar una categoría
export const deleteTableCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si la categoría existe
        const category = await prisma.tableCategory.findUnique({
            where: { id: parseInt(id) },
            include: {
                tables: true
            }
        });

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        // Verificar si hay mesas asociadas
        if (category.tables.length > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar una categoría que tiene mesas asociadas' 
            });
        }

        await prisma.tableCategory.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
}; 
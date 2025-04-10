import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const where = !includeInactive ? { status: 'ACTIVE' } : {};

        const categories = await prisma.category.findMany({
            where,
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

// Obtener una categoría por ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(category);
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({ error: 'Error al obtener la categoría' });
    }
};

// Crear una nueva categoría
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validar que el nombre sea único
        const existingCategory = await prisma.category.findFirst({
            where: { name }
        });

        if (existingCategory) {
            return res.status(400).json({ 
                error: 'Ya existe una categoría con ese nombre' 
            });
        }

        // Crear la categoría
        const category = await prisma.category.create({
            data: {
                name,
                description,
                status: 'ACTIVE'
            }
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
};

// Actualizar una categoría
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        // Verificar si la categoría existe
        const existingCategory = await prisma.category.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingCategory) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        // Si se está cambiando el nombre, verificar que sea único
        if (name && name !== existingCategory.name) {
            const categoryWithName = await prisma.category.findFirst({
                where: {
                    name,
                    NOT: { id: parseInt(id) }
                }
            });

            if (categoryWithName) {
                return res.status(400).json({ 
                    error: 'Ya existe una categoría con ese nombre' 
                });
            }
        }

        // Validar el status si se proporciona
        if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({
                error: 'El estado debe ser ACTIVE o INACTIVE'
            });
        }

        // Actualizar la categoría
        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(status && { status })
            }
        });

        res.json(updatedCategory);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
};

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si la categoría existe
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        // Verificar si la categoría tiene productos asociados
        if (category._count.products > 0) {
            // En lugar de eliminar, marcar como inactiva
            const updatedCategory = await prisma.category.update({
                where: { id: parseInt(id) },
                data: { status: 'INACTIVE' }
            });

            return res.json({ 
                message: 'Categoría marcada como inactiva debido a productos asociados',
                category: updatedCategory
            });
        }

        // Si no tiene productos, eliminar la categoría
        await prisma.category.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
}; 
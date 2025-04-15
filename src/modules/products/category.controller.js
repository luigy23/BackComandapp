import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await prisma.category.create({
            data: { name, description }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name, description }
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
};


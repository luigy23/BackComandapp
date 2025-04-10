import { PrismaClient } from '@prisma/client';

// Exportamos la instancia de prisma para poder mockearla en las pruebas
export const prisma = new PrismaClient();

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
    try {
        const { categoryId, search, status } = req.query;
        
        // Construir el objeto where para los filtros
        const where = {};
        if (categoryId) where.categoryId = parseInt(categoryId);
        if (status) {
            if (!['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'].includes(status)) {
                return res.status(400).json({ 
                    error: 'Estado inválido. Debe ser ACTIVE, INACTIVE o OUT_OF_STOCK' 
                });
            }
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

// Crear un nuevo producto
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, categoryId, stock, imageUrl } = req.body;

        // Validar que el precio sea positivo
        if (!price || parseFloat(price) <= 0) {
            return res.status(400).json({ 
                error: 'El precio debe ser un valor positivo' 
            });
        }

        // Validar que el nombre sea único dentro de la categoría
        const existingProduct = await prisma.product.findFirst({
            where: {
                name,
                categoryId: parseInt(categoryId)
            }
        });

        if (existingProduct) {
            return res.status(400).json({ 
                error: 'Ya existe un producto con ese nombre en esta categoría' 
            });
        }

        // Determinar el estado inicial basado en el stock
        let initialStatus = 'ACTIVE';
        if (stock !== undefined && stock <= 0) {
            initialStatus = 'OUT_OF_STOCK';
        }

        // Crear el producto
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                categoryId: parseInt(categoryId),
                stock: stock ? parseInt(stock) : null,
                imageUrl,
                status: initialStatus
            },
            include: {
                category: true
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// Actualizar un producto
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, categoryId, stock, imageUrl, status } = req.body;

        // Verificar si el producto existe
        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Si se está cambiando el nombre, verificar que sea único en la categoría
        if (name && name !== existingProduct.name) {
            const productWithName = await prisma.product.findFirst({
                where: {
                    name,
                    categoryId: categoryId ? parseInt(categoryId) : existingProduct.categoryId,
                    NOT: { id: parseInt(id) }
                }
            });

            if (productWithName) {
                return res.status(400).json({ 
                    error: 'Ya existe un producto con ese nombre en esta categoría' 
                });
            }
        }

        // Validar que el precio sea positivo si se está actualizando
        if (price && parseFloat(price) <= 0) {
            return res.status(400).json({ 
                error: 'El precio debe ser un valor positivo' 
            });
        }

        // Validar el status si se proporciona
        if (status && !['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'].includes(status)) {
            return res.status(400).json({
                error: 'Estado inválido. Debe ser ACTIVE, INACTIVE o OUT_OF_STOCK'
            });
        }

        // Verificar si el producto tiene pedidos históricos antes de inactivarlo
        if (status === 'INACTIVE' && existingProduct.status === 'ACTIVE') {
            const hasHistoricalOrders = await prisma.orderItem.findFirst({
                where: {
                    productId: parseInt(id)
                }
            });

            if (hasHistoricalOrders) {
                return res.status(400).json({ 
                    error: 'No se puede desactivar un producto que tiene pedidos históricos' 
                });
            }
        }

        // Determinar el estado basado en el stock si se está actualizando
        let updatedStatus = status;
        if (stock !== undefined && stock <= 0 && !status) {
            updatedStatus = 'OUT_OF_STOCK';
        } else if (stock !== undefined && stock > 0 && existingProduct.status === 'OUT_OF_STOCK') {
            updatedStatus = 'ACTIVE';
        }

        // Actualizar el producto
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(categoryId && { categoryId: parseInt(categoryId) }),
                ...(stock !== undefined && { stock: parseInt(stock) }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(updatedStatus && { status: updatedStatus })
            },
            include: {
                category: true
            }
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

// Eliminar/Desactivar un producto
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el producto existe
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Verificar si el producto tiene pedidos históricos
        const hasHistoricalOrders = await prisma.orderItem.findFirst({
            where: {
                productId: parseInt(id)
            }
        });

        if (hasHistoricalOrders) {
            // Marcar como inactivo en lugar de eliminar
            await prisma.product.update({
                where: { id: parseInt(id) },
                data: { status: 'INACTIVE' }
            });
            return res.json({ 
                message: 'Producto marcado como inactivo debido a pedidos históricos' 
            });
        }

        // Si no tiene pedidos históricos, eliminar el producto
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
}; 
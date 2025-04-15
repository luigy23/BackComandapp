import { PrismaClient } from '@prisma/client';
import { procesarImagen, eliminarImagen } from '../../utils/imageUtils.js';

const prisma = new PrismaClient();

export const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true
            }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

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
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

// model Product {
//     id           Int       @id @default(autoincrement())
//     name         String    // Nombre único dentro de la categoría sería ideal, pero lo dejamos flexible por ahora
//     description  String?
//     price        Decimal   @db.Decimal(10, 2) // Precio (ej. 12.50)
//     imageUrl     String?   // URL de la imagen del producto (opcional)
//     stock        Int?      // Cantidad en stock (opcional, para control de inventario)
//     status       ProductStatus @default(ACTIVE)
//     createdAt    DateTime  @default(now())
//     updatedAt    DateTime  @updatedAt
  
//     categoryId Int      // Foreign Key para Category
//     category   Category @relation(fields: [categoryId], references: [id]) // Relación: Un producto pertenece a una categoría
  
//     // Relaciones inversas
//     orderItems OrderItem[] // Relación: Un producto puede estar en muchos items de pedido
//   }

// esto es lo que se envia desde el frontend
// export interface CreateProductData {
//     name: string;
//     description: string;
//     price: number;
//     stock: number;
//     categoryId: number;
//     imageUrl?: string;
//     status: ProductStatus;
//     file?: File;
// }


export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, status } = req.body;
        
        // Crear el producto primero
        const product = await prisma.product.create({
            data: { 
                name, 
                description, 
                price: parseFloat(price), 
                stock: parseInt(stock), 
                categoryId: parseInt(categoryId),
                status,
            }
        });

        // Si hay imagen, procesarla
        if (req.file) {
            const imageUrl = await procesarImagen(req.file, product.id);
            
            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl }
            });
        }

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, categoryId, status } = req.body;

        // Obtener el producto actual para verificar si tiene imagen
        const productoActual = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!productoActual) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Si hay una nueva imagen, procesarla
        let imageUrl = null;
        if (req.file) {
            try {
                // Eliminar imagen antigua si existe
                if (productoActual.imageUrl) {
                    await eliminarImagen(parseInt(id));
                }
                
                // Procesar nueva imagen
                imageUrl = await procesarImagen(req.file, parseInt(id));
            } catch (error) {
                console.error('Error al procesar la nueva imagen:', error);
                return res.status(500).json({ error: 'Error al procesar la nueva imagen' });
            }
        }

        const updateData = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            categoryId: parseInt(categoryId),
            status
        };

        // Si hay nueva imagen, agregarla al update
        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json(product);
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Eliminar imagen asociada
        await eliminarImagen(parseInt(id));
        
        // Eliminar el producto
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });
        
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};














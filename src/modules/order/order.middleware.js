const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware para validar que el usuario tiene permiso para gestionar órdenes
const validateOrderPermission = async (req, res, next) => {
  try {
    const user = req.user; // Asumiendo que el usuario está en req.user después de la autenticación

    // Verificar si el usuario tiene el permiso MANAGE_ORDERS
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: 'MANAGE_ORDERS'
      }
    });

    if (!rolePermission) {
      return res.status(403).json({ message: 'No tienes permiso para gestionar órdenes' });
    }

    next();
  } catch (error) {
    console.error('Error al validar permisos de orden:', error);
    res.status(500).json({ message: 'Error al validar permisos' });
  }
};

// Middleware para validar que la mesa está disponible
const validateTableAvailability = async (req, res, next) => {
  try {
    const { tableId } = req.body;

    const table = await prisma.diningTable.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    if (table.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'La mesa no está disponible' });
    }

    next();
  } catch (error) {
    console.error('Error al validar disponibilidad de mesa:', error);
    res.status(500).json({ message: 'Error al validar disponibilidad de mesa' });
  }
};

// Middleware para validar que los productos existen y están activos
const validateProducts = async (req, res, next) => {
  try {
    const { items } = req.body;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado` });
      }

      if (product.status !== 'ACTIVE') {
        return res.status(400).json({ message: `El producto ${product.name} no está activo` });
      }
    }

    next();
  } catch (error) {
    console.error('Error al validar productos:', error);
    res.status(500).json({ message: 'Error al validar productos' });
  }
};

module.exports = {
  validateOrderPermission,
  validateTableAvailability,
  validateProducts
}; 
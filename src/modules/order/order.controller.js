import { PrismaClient } from '@prisma/client';

// Exportamos la instancia de prisma para poder mockearla en las pruebas
export const prisma = new PrismaClient();

// Crear una nueva orden
export const createOrder = async (req, res) => {
  try {
    const { tableId, waiterId, items } = req.body;

    // Validar que la mesa existe y está disponible
    const table = await prisma.diningTable.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    if (table.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'La mesa no está disponible' });
    }

    // Crear la orden con sus items
    const order = await prisma.order.create({
      data: {
        tableId,
        waiterId,
        items: {
          create: items.map(item => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes,
            productId: item.productId
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        table: true,
        waiter: true
      }
    });

    // Actualizar el estado de la mesa
    await prisma.diningTable.update({
      where: { id: tableId },
      data: { status: 'OCCUPIED' }
    });

    //Notificacion a la cocina (proximamente)   
    notifyKitchen(order);


    res.status(201).json(order);
  } catch (error) {
    console.error('Error al crear la orden:', error);
    res.status(500).json({ message: 'Error al crear la orden' });
  }
};

// Obtener todas las órdenes
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        table: true,
        waiter: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes' });
  }
};

// Obtener una orden por ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true
          }
        },
        table: true,
        waiter: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    res.status(500).json({ message: 'Error al obtener la orden' });
  }
};

// Actualizar una orden
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, items } = req.body;

    // Verificar si la orden existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }


    // Actualizar la orden
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status,
        items: {
          update: items.map(item => ({
            where: { id: item.id },
            data: {
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              notes: item.notes,
              status: item.status
            }
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        table: true,
        waiter: true
      }
    });

    //Notificacion a la cocina (proximamente)   
    notifyKitchen(order);

    res.json(order);
  } catch (error) {
    console.error('Error al actualizar la orden:', error);
    res.status(500).json({ message: 'Error al actualizar la orden' });
  }
};

// Eliminar una orden
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener la orden para saber a qué mesa pertenece
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Eliminar la orden
    await prisma.order.delete({
      where: { id: parseInt(id) }
    });

    // Actualizar el estado de la mesa a disponible
    await prisma.diningTable.update({
      where: { id: order.tableId },
      data: { status: 'AVAILABLE' }
    });

    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la orden:', error);
    res.status(500).json({ message: 'Error al eliminar la orden' });
  }
};

// Obtener órdenes por mesa
export const getOrdersByTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const orders = await prisma.order.findMany({
      where: { tableId: parseInt(tableId) },
      include: {
        items: {
          include: {
            product: true
          }
        },
        table: true,
        waiter: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener las órdenes de la mesa:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes de la mesa' });
  }
};

//obtener orden actual de la mesa
export const getCurrentOrder = async (req, res) => {
  try {
    const { tableId } = req.params;
    const order = await prisma.order.findFirst({
      where: { tableId: parseInt(tableId), status: 'OPEN' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    res.json(order);
  } catch (error) {
    console.error('Error al obtener la orden actual de la mesa:', error);
    res.status(500).json({ message: 'Error al obtener la orden actual de la mesa' });
  }
};


// Obtener órdenes por mesero
export const getOrdersByWaiter = async (req, res) => {
  try {
    const { waiterId } = req.params;
    const orders = await prisma.order.findMany({
      where: { waiterId: parseInt(waiterId) },
      include: {
        items: {
          include: {
            product: true
          }
        },
        table: true,
        waiter: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener las órdenes del mesero:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes del mesero' });
  }
};

// Obtener órdenes por estado
export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await prisma.order.findMany({
      where: { status },
      include: {
        items: {
          include: {
            product: true
          }
        },
        table: true,
        waiter: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener las órdenes por estado:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes por estado' });
  }
};

// Actualizar el estado de un item de la orden
export const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const orderItem = await prisma.orderItem.update({
      where: {
        id: parseInt(itemId),
        orderId: parseInt(orderId)
      },
      data: { status },
      include: {
        product: true
      }
    });

    res.json(orderItem);
  } catch (error) {
    console.error('Error al actualizar el estado del item:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del item' });
  }
}; 

//Notificacion a la cocina (proximamente)   
const notifyKitchen = async (order) => {
    // solo si hay items pendientes
    const itemsPendientes = order.items.filter(item => item.status === 'PENDING');
    if (itemsPendientes.length > 0) {
        console.log('Notificacion a la cocina:', order);
    }   
};
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        // Crear roles
        const adminRole = await prisma.role.create({
            data: {
                name: 'ADMIN',
                description: 'Administrador del sistema'
            }
        });

        const managerRole = await prisma.role.create({
            data: {
                name: 'MANAGER',
                description: 'Gerente del restaurante'
            }
        });

        const waiterRole = await prisma.role.create({
            data: {
                name: 'WAITER',
                description: 'Mesero'
            }
        });

        const kitchenRole = await prisma.role.create({
            data: {
                name: 'KITCHEN',
                description: 'Personal de cocina'
            }
        });

        // Crear usuario administrador
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await prisma.user.create({
            data: {
                name: 'Admin System',
                email: 'admin@comandapp.com',
                passwordHash: hashedPassword,
                isActive: true,
                roleId: adminRole.id
            }
        });

        // Crear categorías de productos
        const categories = await Promise.all([
            prisma.category.create({
                data: {
                    name: 'Entradas',
                    description: 'Platos para empezar',
                    status: 'ACTIVE'
                }
            }),
            prisma.category.create({
                data: {
                    name: 'Platos Principales',
                    description: 'Platos fuertes',
                    status: 'ACTIVE'
                }
            }),
            prisma.category.create({
                data: {
                    name: 'Postres',
                    description: 'Dulces y postres',
                    status: 'ACTIVE'
                }
            }),
            prisma.category.create({
                data: {
                    name: 'Bebidas',
                    description: 'Bebidas y refrescos',
                    status: 'ACTIVE'
                }
            })
        ]);

        // Crear algunos productos de ejemplo
        const products = await Promise.all([
            // Entradas
            prisma.product.create({
                data: {
                    name: 'Tequeños',
                    description: 'Deditos de queso envueltos en masa de trigo',
                    price: 8.99,
                    categoryId: categories[0].id,
                    status: 'ACTIVE'
                }
            }),
            prisma.product.create({
                data: {
                    name: 'Ensalada César',
                    description: 'Lechuga romana, crutones, queso parmesano y aderezo César',
                    price: 12.99,
                    categoryId: categories[0].id,
                    status: 'ACTIVE'
                }
            }),
            // Platos Principales
            prisma.product.create({
                data: {
                    name: 'Pasta Carbonara',
                    description: 'Espaguetis con salsa carbonara, panceta y queso parmesano',
                    price: 15.99,
                    categoryId: categories[1].id,
                    status: 'ACTIVE'
                }
            }),
            prisma.product.create({
                data: {
                    name: 'Pechuga a la Plancha',
                    description: 'Pechuga de pollo a la plancha con guarnición',
                    price: 14.99,
                    categoryId: categories[1].id,
                    status: 'ACTIVE'
                }
            }),
            // Postres
            prisma.product.create({
                data: {
                    name: 'Tiramisú',
                    description: 'Postre italiano con café y mascarpone',
                    price: 7.99,
                    categoryId: categories[2].id,
                    status: 'ACTIVE'
                }
            }),
            // Bebidas
            prisma.product.create({
                data: {
                    name: 'Limonada Natural',
                    description: 'Limonada fresca preparada al momento',
                    price: 3.99,
                    categoryId: categories[3].id,
                    status: 'ACTIVE'
                }
            })
        ]);

        // Crear algunas mesas
        const tables = await Promise.all([
            prisma.diningTable.create({
                data: {
                    number: "1",
                    description: "Mesa Principal",
                    capacity: 4,
                    status: 'AVAILABLE'
                }
            }),
            prisma.diningTable.create({
                data: {
                    number: "2",
                    description: "Mesa Romántica",
                    capacity: 2,
                    status: 'AVAILABLE'
                }
            }),
            prisma.diningTable.create({
                data: {
                    number: "3",
                    description: "Mesa Familiar",
                    capacity: 6,
                    status: 'AVAILABLE'
                }
            }),
            prisma.diningTable.create({
                data: {
                    number: "4",
                    description: "Mesa Terraza",
                    capacity: 4,
                    status: 'AVAILABLE'
                }
            })
        ]);

        console.log('¡Datos de prueba creados exitosamente! 🌱');
    } catch (error) {
        console.error('Error al crear los datos de prueba:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 
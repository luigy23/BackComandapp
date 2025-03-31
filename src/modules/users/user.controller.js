import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Crear un nuevo usuario
const createUser = async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;

        // Validar que el email sea único
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Crear el usuario
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                roleId,
                isActive: true
            },
            include: {
                role: true
            }
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                role: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });

        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                role: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, roleId, isActive } = req.body;

        // Verificar si el usuario existe
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el email ya está en uso por otro usuario
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email }
            });

            if (emailExists) {
                return res.status(400).json({ message: 'El email ya está en uso' });
            }
        }

        // Preparar los datos de actualización
        const updateData = {
            name,
            email,
            roleId,
            isActive
        };

        // Si se proporciona una nueva contraseña, encriptarla
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(password, salt);
        }

        // Actualizar el usuario
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                role: true
            }
        });

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role.name,
                isActive: updatedUser.isActive
            }
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
};

// Eliminar/Desactivar un usuario
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el usuario existe
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si es el último administrador activo
        if (user.roleId === 1) { // Asumiendo que 1 es el ID del rol de administrador
            const adminCount = await prisma.user.count({
                where: {
                    roleId: 1,
                    isActive: true
                }
            });

            if (adminCount <= 1) {
                return res.status(400).json({ 
                    message: 'No se puede eliminar al único administrador activo' 
                });
            }
        }

        // En lugar de eliminar, desactivamos el usuario
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });

        res.json({ message: 'Usuario desactivado exitosamente' });
    } catch (error) {
        console.error('Error al desactivar usuario:', error);
        res.status(500).json({ message: 'Error al desactivar el usuario' });
    }
};

export {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}; 
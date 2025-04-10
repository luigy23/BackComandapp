import { PrismaClient, Permission } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los roles con sus permisos
const getAllRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                permissions: {
                    select: {
                        permission: true
                    }
                }
            }
        });

        // Transformar la respuesta para un formato más limpio
        const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(p => p.permission)
        }));

        res.json(formattedRoles);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ message: 'Error al obtener los roles' });
    }
};

// Obtener un rol específico con sus permisos
const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await prisma.role.findUnique({
            where: { id: parseInt(id) },
            include: {
                permissions: {
                    select: {
                        permission: true
                    }
                }
            }
        });

        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Transformar la respuesta
        const formattedRole = {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(p => p.permission)
        };

        res.json(formattedRole);
    } catch (error) {
        console.error('Error al obtener rol:', error);
        res.status(500).json({ message: 'Error al obtener el rol' });
    }
};

// Crear un nuevo rol con permisos
const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Verificar si el rol ya existe
        const existingRole = await prisma.role.findUnique({
            where: { name }
        });

        if (existingRole) {
            return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
        }

        // Crear el rol con sus permisos
        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissions: {
                    create: permissions.map(permission => ({
                        permission
                    }))
                }
            },
            include: {
                permissions: {
                    select: {
                        permission: true
                    }
                }
            }
        });

        // Transformar la respuesta
        const formattedRole = {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(p => p.permission)
        };

        res.status(201).json({
            message: 'Rol creado exitosamente',
            role: formattedRole
        });
    } catch (error) {
        console.error('Error al crear rol:', error);
        res.status(500).json({ message: 'Error al crear el rol' });
    }
};

// Actualizar un rol y sus permisos
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        // Verificar si el rol existe
        const existingRole = await prisma.role.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingRole) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Verificar si el nuevo nombre ya existe (si se está cambiando el nombre)
        if (name !== existingRole.name) {
            const nameExists = await prisma.role.findUnique({
                where: { name }
            });

            if (nameExists) {
                return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
            }
        }

        // Actualizar el rol y sus permisos
        // Primero eliminamos todos los permisos existentes
        await prisma.rolePermission.deleteMany({
            where: { roleId: parseInt(id) }
        });

        // Luego actualizamos el rol y creamos los nuevos permisos
        const updatedRole = await prisma.role.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                permissions: {
                    create: permissions.map(permission => ({
                        permission
                    }))
                }
            },
            include: {
                permissions: {
                    select: {
                        permission: true
                    }
                }
            }
        });

        // Transformar la respuesta
        const formattedRole = {
            id: updatedRole.id,
            name: updatedRole.name,
            description: updatedRole.description,
            permissions: updatedRole.permissions.map(p => p.permission)
        };

        res.json({
            message: 'Rol actualizado exitosamente',
            role: formattedRole
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ message: 'Error al actualizar el rol' });
    }
};

// Eliminar un rol
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el rol existe
        const role = await prisma.role.findUnique({
            where: { id: parseInt(id) },
            include: {
                users: true
            }
        });

        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Verificar si hay usuarios usando este rol
        if (role.users.length > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar el rol porque hay usuarios asignados a él' 
            });
        }

        // Eliminar los permisos del rol
        await prisma.rolePermission.deleteMany({
            where: { roleId: parseInt(id) }
        });

        // Eliminar el rol
        await prisma.role.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Rol eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        res.status(500).json({ message: 'Error al eliminar el rol' });
    }
};

// Obtener todos los permisos disponibles
const getAllPermissions = async (req, res) => {
    try {
        // Obtener todos los valores del enum Permission
        const permissions = Object.values(Permission);
        res.json(permissions);
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({ message: 'Error al obtener los permisos' });
    }
};

export {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions
}; 
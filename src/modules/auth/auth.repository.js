import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
        include: {
            role: {
                select: {
                    name: true,
                    id: true
                }
            }
        }
    });
};

export const create = async (userData) => {
    return await prisma.user.create({
        data: userData
    });
}; 
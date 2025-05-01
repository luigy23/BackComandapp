import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../../../index.js';
import { generateToken } from '../../../utils/jwt.js';

const prisma = new PrismaClient();

describe('Category Module', () => {
    let adminToken;
    let testCategory;

    beforeAll(async () => {
        // Crear un usuario admin para las pruebas
        const admin = await prisma.user.create({
            data: {
                name: 'Admin Test',
                email: 'admin.test@example.com',
                password: 'password123',
                roleId: 1 // ADMIN
            }
        });
        adminToken = generateToken(admin);
    });

    afterAll(async () => {
        // Limpiar datos de prueba
        await prisma.category.deleteMany({
            where: {
                name: {
                    contains: 'Test'
                }
            }
        });
        await prisma.user.deleteMany({
            where: {
                email: 'admin.test@example.com'
            }
        });
        await prisma.$disconnect();
    });

    describe('getAllCategories', () => {
        it('debería obtener todas las categorías', async () => {
            const response = await request(app)
                .get('/api/categories');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('createCategory', () => {
        it('debería crear una nueva categoría', async () => {
            const categoryData = {
                name: 'Test Category',
                description: 'Test Description'
            };

            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(categoryData);

            expect(response.status).toBe(201);
            expect(response.body.name).toBe(categoryData.name);
            expect(response.body.description).toBe(categoryData.description);

            testCategory = response.body;
        });

        it('no debería crear una categoría con nombre duplicado', async () => {
            const categoryData = {
                name: 'Test Category',
                description: 'Another Description'
            };

            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(categoryData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Ya existe una categoría con ese nombre');
        });

        it('no debería crear una categoría sin autenticación', async () => {
            const categoryData = {
                name: 'Test Category 2',
                description: 'Test Description'
            };

            const response = await request(app)
                .post('/api/categories')
                .send(categoryData);

            expect(response.status).toBe(401);
        });
    });

    describe('getCategoryById', () => {
        it('debería obtener una categoría por ID', async () => {
            const response = await request(app)
                .get(`/api/categories/${testCategory.id}`);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe(testCategory.name);
        });

        it('debería retornar 404 para una categoría inexistente', async () => {
            const response = await request(app)
                .get('/api/categories/999999');

            expect(response.status).toBe(404);
        });
    });

    describe('updateCategory', () => {
        it('debería actualizar una categoría', async () => {
            const updateData = {
                name: 'Test Category Updated',
                description: 'Updated Description'
            };

            const response = await request(app)
                .put(`/api/categories/${testCategory.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe(updateData.name);
            expect(response.body.description).toBe(updateData.description);
        });

        it('no debería actualizar una categoría sin autenticación', async () => {
            const updateData = {
                name: 'Test Category Updated Again'
            };

            const response = await request(app)
                .put(`/api/categories/${testCategory.id}`)
                .send(updateData);

            expect(response.status).toBe(401);
        });
    });

    describe('deleteCategory', () => {
        it('no debería eliminar una categoría con productos asociados', async () => {
            // Crear un producto asociado a la categoría
            await prisma.product.create({
                data: {
                    name: 'Test Product',
                    description: 'Test Product Description',
                    price: 10.99,
                    categoryId: testCategory.id
                }
            });

            const response = await request(app)
                .delete(`/api/categories/${testCategory.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('No se puede eliminar una categoría que tiene productos asociados');

            // Limpiar el producto de prueba
            await prisma.product.deleteMany({
                where: {
                    name: 'Test Product'
                }
            });
        });

        it('debería eliminar una categoría sin productos', async () => {
            const response = await request(app)
                .delete(`/api/categories/${testCategory.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Categoría eliminada correctamente');
        });
    });
}); 
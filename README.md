# BackComandapp

Este proyecto está desarrollado con una arquitectura modular y orientada a capas, siguiendo las mejores prácticas de desarrollo.

## Estructura del Proyecto

El proyecto está organizado en las siguientes capas:

- **Capa de Presentación**: Maneja las rutas y controladores
- **Capa de Servicios**: Contiene la lógica de negocio
- **Capa de Repositorio**: Gestiona el acceso a datos
- **Capa de Modelos**: Define las entidades y esquemas de datos

## Tecnologías Principales

- Node.js
- Express
- Prisma ORM
- MySQL

## Estructura de Carpetas

```
├── src/           # Código fuente principal
├── config/        # Configuraciones
├── docs/          # Documentación
├── prisma/        # Esquemas y migraciones de Prisma
└── node_modules/  # Dependencias
```

## Requisitos

- Node.js
- MySQL
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en `.env`
4. Ejecutar migraciones: `npx prisma migrate dev`
5. Iniciar el servidor: `npm start` 
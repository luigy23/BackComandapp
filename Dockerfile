# Stage 1: Dependencias y build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Stage 2: Imagen final
FROM node:18-alpine

WORKDIR /app

# Copiar solo los archivos necesarios desde el stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.js ./

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto
EXPOSE $PORT

# Script para esperar MySQL y ejecutar migraciones antes de iniciar la app
COPY --from=builder /app/scripts/wait-for-it.sh ./scripts/
RUN chmod +x ./scripts/wait-for-it.sh

# Comando para iniciar la aplicación
CMD ["npm", "start"] 
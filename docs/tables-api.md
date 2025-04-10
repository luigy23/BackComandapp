# Documentación API de Mesas y Categorías

## Categorías de Mesas

### Obtener todas las categorías
```http
GET /api/table-categories
```

**Respuesta exitosa (200)**
```json
[
  {
    "id": 1,
    "name": "1er Piso",
    "description": "Mesas del primer piso",
    "status": "ACTIVE",
    "createdAt": "2024-04-10T01:23:57.000Z",
    "updatedAt": "2024-04-10T01:23:57.000Z",
    "tables": [
      {
        "id": 1,
        "number": "101",
        "description": "Mesa junto a la ventana",
        "capacity": 4,
        "status": "AVAILABLE"
      }
    ]
  }
]
```

### Obtener una categoría por ID
```http
GET /api/table-categories/:id
```

**Respuesta exitosa (200)**
```json
{
  "id": 1,
  "name": "1er Piso",
  "description": "Mesas del primer piso",
  "status": "ACTIVE",
  "createdAt": "2024-04-10T01:23:57.000Z",
  "updatedAt": "2024-04-10T01:23:57.000Z",
  "tables": []
}
```

### Crear nueva categoría
```http
POST /api/table-categories
```

**Body**
```json
{
  "name": "2do Piso",
  "description": "Mesas del segundo piso",
  "status": "ACTIVE"
}
```

**Respuesta exitosa (201)**
```json
{
  "id": 2,
  "name": "2do Piso",
  "description": "Mesas del segundo piso",
  "status": "ACTIVE",
  "createdAt": "2024-04-10T01:23:57.000Z",
  "updatedAt": "2024-04-10T01:23:57.000Z"
}
```

### Actualizar categoría
```http
PUT /api/table-categories/:id
```

**Body**
```json
{
  "name": "Segundo Piso",
  "description": "Mesas del área del segundo piso",
  "status": "ACTIVE"
}
```

**Respuesta exitosa (200)**
```json
{
  "id": 2,
  "name": "Segundo Piso",
  "description": "Mesas del área del segundo piso",
  "status": "ACTIVE",
  "createdAt": "2024-04-10T01:23:57.000Z",
  "updatedAt": "2024-04-10T01:24:57.000Z"
}
```

### Eliminar categoría
```http
DELETE /api/table-categories/:id
```

**Respuesta exitosa (200)**
```json
{
  "message": "Categoría eliminada correctamente"
}
```

## Mesas

### Obtener todas las mesas
```http
GET /api/tables
```

**Parámetros de consulta opcionales**
- `categoryId`: Filtrar mesas por categoría

**Respuesta exitosa (200)**
```json
[
  {
    "id": 1,
    "number": "101",
    "description": "Mesa junto a la ventana",
    "capacity": 4,
    "status": "AVAILABLE",
    "categoryId": 1,
    "createdAt": "2024-04-10T01:23:57.000Z",
    "updatedAt": "2024-04-10T01:23:57.000Z",
    "category": {
      "id": 1,
      "name": "1er Piso",
      "description": "Mesas del primer piso"
    }
  }
]
```

### Obtener una mesa por ID
```http
GET /api/tables/:id
```

**Respuesta exitosa (200)**
```json
{
  "id": 1,
  "number": "101",
  "description": "Mesa junto a la ventana",
  "capacity": 4,
  "status": "AVAILABLE",
  "categoryId": 1,
  "createdAt": "2024-04-10T01:23:57.000Z",
  "updatedAt": "2024-04-10T01:23:57.000Z",
  "category": {
    "id": 1,
    "name": "1er Piso",
    "description": "Mesas del primer piso"
  }
}
```

### Crear nueva mesa
```http
POST /api/tables
```

**Body**
```json
{
  "number": "102",
  "description": "Mesa central",
  "capacity": 6,
  "status": "AVAILABLE",
  "categoryId": 1
}
```

**Respuesta exitosa (201)**
```json
{
  "id": 2,
  "number": "102",
  "description": "Mesa central",
  "capacity": 6,
  "status": "AVAILABLE",
  "categoryId": 1,
  "createdAt": "2024-04-10T01:23:57.000Z",
  "updatedAt": "2024-04-10T01:23:57.000Z",
  "category": {
    "id": 1,
    "name": "1er Piso",
    "description": "Mesas del primer piso"
  }
}
```

### Actualizar mesa
```http
PUT /api/tables/:id
```

**Body**
```json
{
  "number": "102",
  "description": "Mesa central actualizada",
  "capacity": 8,
  "status": "AVAILABLE",
  "categoryId": 2
}
```

**Respuesta exitosa (200)**
```json
{
  "id": 2,
  "number": "102",
  "description": "Mesa central actualizada",
  "capacity": 8,
  "status": "AVAILABLE",
  "categoryId": 2,
  "createdAt": "2024-04-10T01:23:57.000Z",
  "updatedAt": "2024-04-10T01:24:57.000Z",
  "category": {
    "id": 2,
    "name": "2do Piso",
    "description": "Mesas del segundo piso"
  }
}
```

### Eliminar mesa
```http
DELETE /api/tables/:id
```

**Respuesta exitosa (200)**
```json
{
  "message": "Mesa eliminada correctamente"
}
```

## Enums y Tipos

### TableStatus
- `AVAILABLE`: Mesa disponible
- `OCCUPIED`: Mesa ocupada
- `BILL_PENDING`: Mesa ocupada, esperando pago
- `DISABLED`: Mesa deshabilitada (fuera de servicio)

### TableCategoryStatus
- `ACTIVE`: Categoría activa
- `INACTIVE`: Categoría inactiva

## Notas importantes

1. Todas las rutas requieren autenticación. Se debe enviar el token JWT en el header:
```http
Authorization: Bearer <token>
```

2. Validaciones importantes:
   - No se puede eliminar una categoría que tenga mesas asociadas
   - No se puede eliminar una mesa que esté ocupada o pendiente de pago
   - No se puede eliminar una mesa que tenga pedidos activos
   - El número de mesa debe ser único
   - El nombre de la categoría debe ser único

3. Los campos `createdAt` y `updatedAt` son generados automáticamente

4. El campo `categoryId` en las mesas es opcional 
# API de Órdenes

## Descripción
Este módulo maneja todas las operaciones relacionadas con las órdenes del restaurante, incluyendo su creación, actualización, eliminación y consulta. También gestiona los estados de las mesas y los items de las órdenes.

## Base URL
```
/api/orders
```

## Autenticación
Todas las rutas requieren autenticación mediante token JWT en el header:
```
Authorization: Bearer <token>
```

## Roles Permitidos
- ADMIN
- MANAGER
- WAITER

## Endpoints

### 1. Crear Orden
```http
POST /api/orders
```

**Body:**
```json
{
    "tableId": 1,
    "waiterId": 1,
    "items": [
        {
            "quantity": 2,
            "unitPrice": 15.99,
            "notes": "Sin cebolla",
            "productId": 1
        }
    ]
}
```

**Respuesta (201 Created):**
```json
{
    "id": 1,
    "status": "OPEN",
    "totalAmount": 31.98,
    "createdAt": "2024-03-20T10:00:00Z",
    "table": {
        "id": 1,
        "number": "M1",
        "status": "OCCUPIED"
    },
    "waiter": {
        "id": 1,
        "name": "Juan Pérez"
    },
    "items": [
        {
            "id": 1,
            "quantity": 2,
            "unitPrice": 15.99,
            "notes": "Sin cebolla",
            "status": "PENDING",
            "product": {
                "id": 1,
                "name": "Hamburguesa Clásica"
            }
        }
    ]
}
```

### 2. Obtener Todas las Órdenes
```http
GET /api/orders
```

**Respuesta (200 OK):**
```json
[
    {
        "id": 1,
        "status": "OPEN",
        "totalAmount": 31.98,
        "createdAt": "2024-03-20T10:00:00Z",
        "table": {
            "id": 1,
            "number": "M1"
        },
        "waiter": {
            "id": 1,
            "name": "Juan Pérez"
        },
        "items": [
            {
                "id": 1,
                "quantity": 2,
                "unitPrice": 15.99,
                "notes": "Sin cebolla",
                "status": "PENDING",
                "product": {
                    "id": 1,
                    "name": "Hamburguesa Clásica"
                }
            }
        ]
    }
]
```

### 3. Obtener Orden por ID
```http
GET /api/orders/:id
```

**Respuesta (200 OK):**
```json
{
    "id": 1,
    "status": "OPEN",
    "totalAmount": 31.98,
    "createdAt": "2024-03-20T10:00:00Z",
    "table": {
        "id": 1,
        "number": "M1"
    },
    "waiter": {
        "id": 1,
        "name": "Juan Pérez"
    },
    "items": [
        {
            "id": 1,
            "quantity": 2,
            "unitPrice": 15.99,
            "notes": "Sin cebolla",
            "status": "PENDING",
            "product": {
                "id": 1,
                "name": "Hamburguesa Clásica"
            }
        }
    ]
}
```

### 4. Actualizar Orden
```http
PUT /api/orders/:id
```

**Body:**
```json
{
    "status": "CLOSED",
    "items": [
        {
            "id": 1,
            "quantity": 2,
            "unitPrice": 15.99,
            "notes": "Sin cebolla",
            "status": "DELIVERED"
        }
    ]
}
```

**Respuesta (200 OK):**
```json
{
    "id": 1,
    "status": "CLOSED",
    "totalAmount": 31.98,
    "updatedAt": "2024-03-20T11:00:00Z",
    "table": {
        "id": 1,
        "number": "M1"
    },
    "waiter": {
        "id": 1,
        "name": "Juan Pérez"
    },
    "items": [
        {
            "id": 1,
            "quantity": 2,
            "unitPrice": 15.99,
            "notes": "Sin cebolla",
            "status": "DELIVERED",
            "product": {
                "id": 1,
                "name": "Hamburguesa Clásica"
            }
        }
    ]
}
```

### 5. Eliminar Orden
```http
DELETE /api/orders/:id
```

**Respuesta (200 OK):**
```json
{
    "message": "Orden eliminada correctamente"
}
```

### 6. Obtener Órdenes por Mesa
```http
GET /api/orders/table/:tableId
```

**Respuesta (200 OK):**
```json
[
    {
        "id": 1,
        "status": "OPEN",
        "totalAmount": 31.98,
        "createdAt": "2024-03-20T10:00:00Z",
        "table": {
            "id": 1,
            "number": "M1"
        },
        "waiter": {
            "id": 1,
            "name": "Juan Pérez"
        },
        "items": [...]
    }
]
```

### 7. Obtener Órdenes por Mesero
```http
GET /api/orders/waiter/:waiterId
```

**Respuesta (200 OK):**
```json
[
    {
        "id": 1,
        "status": "OPEN",
        "totalAmount": 31.98,
        "createdAt": "2024-03-20T10:00:00Z",
        "table": {
            "id": 1,
            "number": "M1"
        },
        "waiter": {
            "id": 1,
            "name": "Juan Pérez"
        },
        "items": [...]
    }
]
```

### 8. Obtener Órdenes por Estado
```http
GET /api/orders/status/:status
```

**Estados válidos:**
- OPEN
- CLOSED
- CANCELLED

**Respuesta (200 OK):**
```json
[
    {
        "id": 1,
        "status": "OPEN",
        "totalAmount": 31.98,
        "createdAt": "2024-03-20T10:00:00Z",
        "table": {
            "id": 1,
            "number": "M1"
        },
        "waiter": {
            "id": 1,
            "name": "Juan Pérez"
        },
        "items": [...]
    }
]
```

### 9. Actualizar Estado de Item
```http
PUT /api/orders/:orderId/items/:itemId/status
```

**Body:**
```json
{
    "status": "PREPARING"
}
```

**Estados válidos para items:**
- PENDING
- PREPARING
- READY
- DELIVERED
- CANCELLED

**Respuesta (200 OK):**
```json
{
    "id": 1,
    "quantity": 2,
    "unitPrice": 15.99,
    "notes": "Sin cebolla",
    "status": "PREPARING",
    "product": {
        "id": 1,
        "name": "Hamburguesa Clásica"
    }
}
```

## Códigos de Error

### 400 Bad Request
```json
{
    "message": "La mesa no está disponible"
}
```

### 401 Unauthorized
```json
{
    "message": "No autorizado"
}
```

### 403 Forbidden
```json
{
    "message": "No tienes permiso para realizar esta acción"
}
```

### 404 Not Found
```json
{
    "message": "Orden no encontrada"
}
```

### 500 Internal Server Error
```json
{
    "message": "Error al procesar la solicitud"
}
```

## Notas Importantes

1. Todas las fechas se manejan en formato ISO 8601
2. Los precios se manejan con 2 decimales
3. Las cantidades deben ser números enteros positivos
4. Los IDs deben ser números enteros positivos
5. Las notas son opcionales y pueden ser strings vacíos
6. El estado de la mesa se actualiza automáticamente al crear/eliminar órdenes
7. Los items de una orden no pueden ser eliminados individualmente, solo actualizados

## Ejemplos de Uso

### Crear una nueva orden
```javascript
const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        tableId: 1,
        waiterId: 1,
        items: [
            {
                quantity: 2,
                unitPrice: 15.99,
                notes: "Sin cebolla",
                productId: 1
            }
        ]
    })
});
```

### Actualizar estado de un item
```javascript
const response = await fetch('/api/orders/1/items/1/status', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        status: 'PREPARING'
    })
});
```

## Consideraciones de Seguridad

1. Todas las rutas requieren autenticación
2. Solo usuarios con roles específicos pueden realizar ciertas acciones
3. Se valida la existencia y disponibilidad de las mesas
4. Se valida la existencia y estado de los productos
5. Se mantiene un registro de cambios en los estados de las órdenes 
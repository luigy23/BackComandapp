# API de Productos

Esta documentación describe los endpoints disponibles para la gestión de productos en el sistema.

## Base URL

```
http://localhost:3000/api/products
```

## Endpoints

### Obtener todos los productos

```http
GET /api/products
```

Obtiene una lista de todos los productos disponibles en el sistema.

#### Parámetros de consulta

| Parámetro | Tipo    | Descripción                                                                 |
|-----------|---------|-----------------------------------------------------------------------------|
| categoryId | number  | Filtra productos por ID de categoría                                        |
| search    | string  | Busca productos por nombre o descripción (búsqueda insensible a mayúsculas) |
| status    | string  | Filtra por estado (ACTIVE, INACTIVE, OUT_OF_STOCK)                         |

#### Respuesta exitosa

```json
[
  {
    "id": 1,
    "name": "Hamburguesa Clásica",
    "description": "Hamburguesa con queso, lechuga y tomate",
    "price": 12.50,
    "imageUrl": "https://ejemplo.com/hamburguesa.jpg",
    "stock": 50,
    "status": "ACTIVE",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Hamburguesas",
      "description": "Variedad de hamburguesas",
      "status": "ACTIVE"
    }
  }
]
```

### Obtener un producto por ID

```http
GET /api/products/:id
```

Obtiene los detalles de un producto específico.

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción          |
|-----------|---------|----------------------|
| id        | number  | ID del producto      |

#### Respuesta exitosa

```json
{
  "id": 1,
  "name": "Hamburguesa Clásica",
  "description": "Hamburguesa con queso, lechuga y tomate",
  "price": 12.50,
  "imageUrl": "https://ejemplo.com/hamburguesa.jpg",
  "stock": 50,
  "status": "ACTIVE",
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Hamburguesas",
    "description": "Variedad de hamburguesas",
    "status": "ACTIVE"
  }
}
```

### Crear un nuevo producto

```http
POST /api/products
```

Crea un nuevo producto en el sistema.

#### Cuerpo de la solicitud

| Campo       | Tipo    | Descripción                                                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| name        | string  | Nombre del producto (debe ser único dentro de la categoría)                 |
| description | string  | Descripción del producto (opcional)                                         |
| price       | number  | Precio del producto (debe ser positivo)                                     |
| categoryId  | number  | ID de la categoría a la que pertenece el producto                           |
| stock       | number  | Cantidad en stock (opcional)                                                |
| imageUrl    | string  | URL de la imagen del producto (opcional)                                    |

#### Respuesta exitosa

```json
{
  "id": 1,
  "name": "Hamburguesa Clásica",
  "description": "Hamburguesa con queso, lechuga y tomate",
  "price": 12.50,
  "imageUrl": "https://ejemplo.com/hamburguesa.jpg",
  "stock": 50,
  "status": "ACTIVE",
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Hamburguesas",
    "description": "Variedad de hamburguesas",
    "status": "ACTIVE"
  }
}
```

### Actualizar un producto

```http
PUT /api/products/:id
```

Actualiza los datos de un producto existente.

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción          |
|-----------|---------|----------------------|
| id        | number  | ID del producto      |

#### Cuerpo de la solicitud

| Campo       | Tipo    | Descripción                                                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| name        | string  | Nuevo nombre del producto (debe ser único dentro de la categoría)           |
| description | string  | Nueva descripción del producto                                              |
| price       | number  | Nuevo precio del producto (debe ser positivo)                               |
| categoryId  | number  | Nueva categoría del producto                                                |
| stock       | number  | Nueva cantidad en stock                                                     |
| imageUrl    | string  | Nueva URL de la imagen del producto                                         |
| status      | string  | Nuevo estado del producto (ACTIVE, INACTIVE, OUT_OF_STOCK)                 |

#### Respuesta exitosa

```json
{
  "id": 1,
  "name": "Hamburguesa Clásica",
  "description": "Hamburguesa con queso, lechuga y tomate",
  "price": 12.50,
  "imageUrl": "https://ejemplo.com/hamburguesa.jpg",
  "stock": 50,
  "status": "ACTIVE",
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Hamburguesas",
    "description": "Variedad de hamburguesas",
    "status": "ACTIVE"
  }
}
```

### Eliminar/Desactivar un producto

```http
DELETE /api/products/:id
```

Elimina o desactiva un producto del sistema.

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción          |
|-----------|---------|----------------------|
| id        | number  | ID del producto      |

#### Respuesta exitosa

Si el producto no tiene pedidos históricos:
```json
{
  "message": "Producto eliminado exitosamente"
}
```

Si el producto tiene pedidos históricos:
```json
{
  "message": "Producto marcado como inactivo debido a pedidos históricos"
}
```

## Códigos de estado HTTP

| Código | Descripción                                                                 |
|--------|-----------------------------------------------------------------------------|
| 200    | OK - La solicitud se completó exitosamente                                  |
| 201    | Created - El recurso fue creado exitosamente                               |
| 400    | Bad Request - La solicitud es inválida o contiene datos incorrectos         |
| 404    | Not Found - El recurso solicitado no existe                                |
| 500    | Internal Server Error - Error interno del servidor                         |

## Validaciones

1. El nombre del producto debe ser único dentro de su categoría
2. El precio debe ser un valor positivo
3. El estado (status) solo puede ser uno de los siguientes:
   - ACTIVE
   - INACTIVE
   - OUT_OF_STOCK
4. No se puede eliminar un producto que tiene pedidos históricos (se marca como INACTIVE)
5. No se puede desactivar un producto que tiene pedidos históricos

## Notas importantes

- Los productos con stock <= 0 se marcan automáticamente como OUT_OF_STOCK
- Los productos con stock > 0 y estado OUT_OF_STOCK se marcan automáticamente como ACTIVE
- La eliminación de productos es lógica (marcado como INACTIVE) cuando existen pedidos históricos
- Todos los precios se manejan con 2 decimales 
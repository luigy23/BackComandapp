# API de Categorías

Esta documentación describe los endpoints disponibles para la gestión de categorías de productos en el sistema.

## Base URL

```
http://localhost:3000/api/categories
```

## Endpoints

### Obtener todas las categorías

```http
GET /api/categories
```

Obtiene una lista de todas las categorías disponibles en el sistema.

#### Parámetros de consulta

| Parámetro      | Tipo    | Descripción                                                                 |
|----------------|---------|-----------------------------------------------------------------------------|
| includeInactive | boolean | Si es true, incluye categorías inactivas. Por defecto solo muestra activas  |

#### Respuesta exitosa

```json
[
  {
    "id": 1,
    "name": "Hamburguesas",
    "description": "Variedad de hamburguesas",
    "status": "ACTIVE",
    "_count": {
      "products": 5
    }
  }
]
```

### Obtener una categoría por ID

```http
GET /api/categories/:id
```

Obtiene los detalles de una categoría específica.

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción          |
|-----------|---------|----------------------|
| id        | number  | ID de la categoría   |

#### Respuesta exitosa

```json
{
  "id": 1,
  "name": "Hamburguesas",
  "description": "Variedad de hamburguesas",
  "status": "ACTIVE",
  "_count": {
    "products": 5
  }
}
```

### Crear una nueva categoría

```http
POST /api/categories
```

Crea una nueva categoría en el sistema.

#### Cuerpo de la solicitud

| Campo       | Tipo    | Descripción                                                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| name        | string  | Nombre de la categoría (debe ser único)                                     |
| description | string  | Descripción de la categoría (opcional)                                      |

#### Respuesta exitosa

```json
{
  "id": 1,
  "name": "Hamburguesas",
  "description": "Variedad de hamburguesas",
  "status": "ACTIVE"
}
```

### Actualizar una categoría

```http
PUT /api/categories/:id
```

Actualiza los datos de una categoría existente.

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción          |
|-----------|---------|----------------------|
| id        | number  | ID de la categoría   |

#### Cuerpo de la solicitud

| Campo       | Tipo    | Descripción                                                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| name        | string  | Nuevo nombre de la categoría (debe ser único)                               |
| description | string  | Nueva descripción de la categoría                                           |
| status      | string  | Nuevo estado de la categoría (ACTIVE o INACTIVE)                           |

#### Respuesta exitosa

```json
{
  "id": 1,
  "name": "Hamburguesas",
  "description": "Variedad de hamburguesas",
  "status": "ACTIVE"
}
```

### Eliminar una categoría

```http
DELETE /api/categories/:id
```

Elimina o desactiva una categoría del sistema.

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción          |
|-----------|---------|----------------------|
| id        | number  | ID de la categoría   |

#### Respuesta exitosa

Si la categoría no tiene productos asociados:
```json
{
  "message": "Categoría eliminada correctamente"
}
```

Si la categoría tiene productos asociados:
```json
{
  "message": "Categoría marcada como inactiva debido a productos asociados",
  "category": {
    "id": 1,
    "name": "Hamburguesas",
    "description": "Variedad de hamburguesas",
    "status": "INACTIVE"
  }
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

1. El nombre de la categoría debe ser único en todo el sistema
2. El estado (status) solo puede ser uno de los siguientes:
   - ACTIVE
   - INACTIVE
3. No se puede eliminar una categoría que tiene productos asociados (se marca como INACTIVE)

## Notas importantes

- Por defecto, la lista de categorías solo muestra las categorías activas
- Al eliminar una categoría con productos asociados, se marca como INACTIVE en lugar de eliminarla
- El conteo de productos se incluye en las respuestas de GET para facilitar la gestión
- Las categorías se ordenan alfabéticamente por nombre 
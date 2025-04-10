# Documentación API de Roles

Esta documentación describe los endpoints disponibles para la gestión de roles y permisos en el sistema.

## Base URL
```
/api/roles
```

## Endpoints

### Listar Todos los Roles
Obtiene una lista de todos los roles con sus permisos.

```http
GET /api/roles
```

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "name": "ADMIN",
    "description": "Administrador del sistema",
    "permissions": ["MANAGE_USERS", "MANAGE_ROLES", "MANAGE_TABLES"]
  }
]
```

### Obtener Permisos Disponibles
Obtiene la lista de todos los permisos disponibles en el sistema.

```http
GET /api/roles/permissions
```

#### Respuesta Exitosa (200)
```json
[
  "MANAGE_USERS",
  "MANAGE_ROLES",
  "MANAGE_TABLES",
  "MANAGE_CATEGORIES",
  "MANAGE_PRODUCTS",
  "MANAGE_ORDERS",
  "MANAGE_RESERVATIONS",
  "VIEW_REPORTS",
  "PROCESS_PAYMENTS",
  "KITCHEN_ACCESS"
]
```

### Obtener Rol por ID
Obtiene un rol específico con sus permisos.

```http
GET /api/roles/:id
```

#### Parámetros de URL
- `id`: ID del rol (número)

#### Respuesta Exitosa (200)
```json
{
  "id": 1,
  "name": "ADMIN",
  "description": "Administrador del sistema",
  "permissions": ["MANAGE_USERS", "MANAGE_ROLES", "MANAGE_TABLES"]
}
```

#### Respuesta de Error (404)
```json
{
  "message": "Rol no encontrado"
}
```

### Crear Nuevo Rol
Crea un nuevo rol con sus permisos.

```http
POST /api/roles
```

#### Body de la Petición
```json
{
  "name": "SUPERVISOR",
  "description": "Supervisor de operaciones",
  "permissions": ["MANAGE_ORDERS", "VIEW_REPORTS", "PROCESS_PAYMENTS"]
}
```

#### Respuesta Exitosa (201)
```json
{
  "message": "Rol creado exitosamente",
  "role": {
    "id": 2,
    "name": "SUPERVISOR",
    "description": "Supervisor de operaciones",
    "permissions": ["MANAGE_ORDERS", "VIEW_REPORTS", "PROCESS_PAYMENTS"]
  }
}
```

#### Respuesta de Error (400)
```json
{
  "message": "Ya existe un rol con ese nombre"
}
```

### Actualizar Rol
Actualiza un rol existente y sus permisos.

```http
PUT /api/roles/:id
```

#### Parámetros de URL
- `id`: ID del rol (número)

#### Body de la Petición
```json
{
  "name": "SUPERVISOR",
  "description": "Supervisor de operaciones actualizado",
  "permissions": ["MANAGE_ORDERS", "VIEW_REPORTS", "PROCESS_PAYMENTS", "KITCHEN_ACCESS"]
}
```

#### Respuesta Exitosa (200)
```json
{
  "message": "Rol actualizado exitosamente",
  "role": {
    "id": 2,
    "name": "SUPERVISOR",
    "description": "Supervisor de operaciones actualizado",
    "permissions": ["MANAGE_ORDERS", "VIEW_REPORTS", "PROCESS_PAYMENTS", "KITCHEN_ACCESS"]
  }
}
```

#### Respuestas de Error
- 404: Rol no encontrado
- 400: Ya existe un rol con ese nombre

### Eliminar Rol
Elimina un rol específico.

```http
DELETE /api/roles/:id
```

#### Parámetros de URL
- `id`: ID del rol (número)

#### Respuesta Exitosa (200)
```json
{
  "message": "Rol eliminado exitosamente"
}
```

#### Respuestas de Error
- 404: Rol no encontrado
- 400: No se puede eliminar el rol porque hay usuarios asignados a él

## Notas Importantes

1. Todos los endpoints requieren autenticación mediante token JWT.
2. Solo los usuarios con el permiso `MANAGE_ROLES` pueden acceder a estos endpoints.
3. No se puede eliminar un rol si hay usuarios asignados a él.
4. Los nombres de roles deben ser únicos en el sistema.

## Lista de Permisos Disponibles

- `MANAGE_USERS`: Gestionar usuarios
- `MANAGE_ROLES`: Gestionar roles y permisos
- `MANAGE_TABLES`: Gestionar mesas
- `MANAGE_CATEGORIES`: Gestionar categorías de productos
- `MANAGE_PRODUCTS`: Gestionar productos
- `MANAGE_ORDERS`: Gestionar pedidos
- `MANAGE_RESERVATIONS`: Gestionar reservas
- `VIEW_REPORTS`: Ver reportes y estadísticas
- `PROCESS_PAYMENTS`: Procesar pagos
- `KITCHEN_ACCESS`: Acceso a vista de cocina 
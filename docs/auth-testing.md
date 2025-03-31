# Pruebas de Autenticación con Postman

Este documento describe cómo probar el módulo de autenticación usando Postman.

## Configuración Inicial

1. Asegúrate de que el servidor esté corriendo:
```bash
npm run dev
```

2. El servidor estará disponible en: `http://localhost:3000`

## Endpoints de Autenticación

### 1. Registro de Usuario

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "email": "usuario@ejemplo.com",
    "password": "Test123!@#",
    "name": "Usuario Ejemplo",
    "roleId": 1
}
```

**Respuesta Exitosa (201):**
```json
{
    "message": "Usuario registrado exitosamente",
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Posibles Errores:**
- 400: "El usuario ya existe"
- 400: "Contraseña inválida: [detalles de la validación]"
- 400: "Todos los campos son requeridos"

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "email": "usuario@ejemplo.com",
    "password": "Test123!@#"
}
```

**Respuesta Exitosa (200):**
```json
{
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Posibles Errores:**
- 401: "Credenciales inválidas"
- 401: "Cuenta bloqueada por demasiados intentos fallidos"
- 400: "Email y contraseña son requeridos"

## Características de Seguridad

1. **Validación de Contraseña:**
   - Debe contener al menos una mayúscula
   - Debe contener al menos una minúscula
   - Debe contener al menos un número
   - Debe contener al menos un carácter especial
   - Longitud mínima de 8 caracteres

2. **Sistema de Intentos de Login:**
   - Bloqueo automático después de 5 intentos fallidos
   - El bloqueo se resetea después de 15 minutos
   - Mensaje específico cuando la cuenta está bloqueada

3. **Tokens JWT:**
   - Los tokens tienen una validez de 24 horas
   - Contienen la información del usuario (id, email, roleId)
   - Se deben incluir en el header `Authorization: Bearer <token>` para rutas protegidas

## Ejemplos de Uso

### 1. Registro de Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
    "email": "usuario@ejemplo.com",
    "password": "Test123!@#",
    "name": "Usuario Ejemplo",
    "roleId": 1
}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "email": "usuario@ejemplo.com",
    "password": "Test123!@#"
}'
```

## Notas Importantes

1. Guarda el token recibido en las respuestas exitosas para usarlo en futuras peticiones autenticadas
2. El sistema implementa rate limiting para prevenir ataques de fuerza bruta
3. Las contraseñas se almacenan hasheadas en la base de datos
4. Los tokens JWT son firmados con una clave secreta configurada en las variables de entorno 
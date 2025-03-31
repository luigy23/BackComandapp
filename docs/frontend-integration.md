# Integración Frontend con Backend

Este documento describe cómo integrar el frontend con el sistema de autenticación y autorización del backend.

## Autenticación

### 1. Registro de Usuario

**Endpoint:** `POST /api/auth/register`

**Headers:**
```javascript
{
    'Content-Type': 'application/json'
}
```

**Body:**
```javascript
{
    email: string,
    password: string,    // Debe cumplir con los requisitos de validación
    name: string,
    roleId: number
}
```

**Respuesta Exitosa (201):**
```javascript
{
    message: "Usuario registrado exitosamente",
    token: "eyJhbGciOiJIUzI1NiIs..." // JWT Token
}
```

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Headers:**
```javascript
{
    'Content-Type': 'application/json'
}
```

**Body:**
```javascript
{
    email: string,
    password: string
}
```

**Respuesta Exitosa (200):**
```javascript
{
    message: "Login exitoso",
    token: "eyJhbGciOiJIUzI1NiIs..." // JWT Token
}
```

## Manejo del Token JWT

### 1. Almacenamiento
- Guardar el token en localStorage o sessionStorage
- Ejemplo de implementación:
```javascript
// Almacenar token
localStorage.setItem('token', response.token);

// Obtener token
const token = localStorage.getItem('token');
```

### 2. Uso en Peticiones
- Incluir el token en el header Authorization
- Ejemplo con Axios:
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### 3. Interceptor para Axios
```javascript
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
```

## Manejo de Errores

### 1. Errores de Autenticación
```javascript
// 401 - No autorizado
{
    error: "Token no proporcionado"
}

// 401 - Token inválido
{
    error: "Token inválido"
}

// 401 - Credenciales inválidas
{
    error: "Credenciales inválidas"
}
```

### 2. Errores de Autorización
```javascript
// 403 - Sin permisos
{
    error: "No tienes permisos para esta acción"
}
```

## Roles y Permisos

### 1. Estructura del Token
El token JWT contiene:
```javascript
{
    id: number,      // ID del usuario
    email: string,   // Email del usuario
    roleId: number,  // ID del rol
    iat: number,     // Fecha de emisión
    exp: number      // Fecha de expiración
}
```

### 2. Roles Disponibles
```javascript
const ROLES = {
    ADMIN: 1,
    USER: 2,
    // Agregar más roles según necesidad
};
```

### 3. Ejemplo de Verificación de Rol
```javascript
const checkUserRole = (userRoleId) => {
    return userRoleId === ROLES.ADMIN;
};
```

## Rutas Protegidas

### 1. Middleware de Autenticación
- Todas las rutas protegidas requieren el token JWT
- El token debe enviarse en el header Authorization

### 2. Middleware de Roles
- Algunas rutas requieren roles específicos
- Verificar el roleId del token antes de hacer la petición

## Ejemplos de Implementación

### 1. Contexto de Autenticación (React)
```javascript
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });
            
            const { token } = response.data;
            setToken(token);
            localStorage.setItem('token', token);
            
            // Decodificar token y establecer usuario
            const decoded = jwt_decode(token);
            setUser(decoded);
            
            return true;
        } catch (error) {
            console.error('Error en login:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

### 2. Componente de Ruta Protegida
```javascript
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    if (requiredRole && user.roleId !== requiredRole) {
        return <Navigate to="/unauthorized" />;
    }
    
    return children;
};
```

### 3. Uso de Rutas Protegidas
```javascript
<Routes>
    <Route path="/login" element={<Login />} />
    <Route 
        path="/admin" 
        element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <AdminDashboard />
            </ProtectedRoute>
        } 
    />
    <Route 
        path="/profile" 
        element={
            <ProtectedRoute>
                <UserProfile />
            </ProtectedRoute>
        } 
    />
</Routes>
```

## Notas Importantes

1. **Seguridad:**
   - Nunca almacenar información sensible en localStorage
   - Implementar refresh tokens para mayor seguridad
   - Manejar la expiración del token

2. **Manejo de Estado:**
   - Mantener el estado de autenticación sincronizado
   - Limpiar el estado al cerrar sesión
   - Manejar la persistencia del estado

3. **UX:**
   - Mostrar mensajes de error claros
   - Implementar redirecciones automáticas
   - Manejar estados de carga

4. **Testing:**
   - Probar diferentes escenarios de autenticación
   - Verificar el manejo de errores
   - Probar la persistencia del estado 

## Gestión de Usuarios

### 1. Crear Usuario

**Endpoint:** `POST /api/users`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>' // Requiere rol de administrador
}
```

**Body:**
```javascript
{
    name: string,      // Nombre del usuario
    email: string,     // Email único
    password: string,  // Contraseña inicial
    roleId: number     // ID del rol (1: Admin, 2: Mesero, 3: Cocina, 4: Cajero)
}
```

**Respuesta Exitosa (201):**
```javascript
{
    message: "Usuario creado exitosamente",
    user: {
        id: number,
        name: string,
        email: string,
        role: string,
        isActive: boolean
    }
}
```

### 2. Listar Usuarios

**Endpoint:** `GET /api/users`

**Headers:**
```javascript
{
    'Authorization': 'Bearer <token>' // Requiere rol de administrador
}
```

**Respuesta Exitosa (200):**
```javascript
[
    {
        id: number,
        name: string,
        email: string,
        isActive: boolean,
        role: {
            name: string
        }
    }
]
```

### 3. Obtener Usuario por ID

**Endpoint:** `GET /api/users/:id`

**Headers:**
```javascript
{
    'Authorization': 'Bearer <token>' // Requiere rol de administrador
}
```

**Respuesta Exitosa (200):**
```javascript
{
    id: number,
    name: string,
    email: string,
    isActive: boolean,
    role: {
        name: string
    }
}
```

### 4. Actualizar Usuario

**Endpoint:** `PUT /api/users/:id`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>' // Requiere rol de administrador
}
```

**Body:**
```javascript
{
    name: string,      // Opcional
    email: string,     // Opcional, debe ser único
    password: string,  // Opcional, nueva contraseña
    roleId: number,    // Opcional
    isActive: boolean  // Opcional
}
```

**Respuesta Exitosa (200):**
```javascript
{
    message: "Usuario actualizado exitosamente",
    user: {
        id: number,
        name: string,
        email: string,
        role: string,
        isActive: boolean
    }
}
```

### 5. Desactivar Usuario

**Endpoint:** `DELETE /api/users/:id`

**Headers:**
```javascript
{
    'Authorization': 'Bearer <token>' // Requiere rol de administrador
}
```

**Respuesta Exitosa (200):**
```javascript
{
    message: "Usuario desactivado exitosamente"
}
```

### 6. Manejo de Errores

```javascript
// 400 - Email duplicado
{
    message: "El email ya está registrado"
}

// 400 - No se puede eliminar último admin
{
    message: "No se puede eliminar al único administrador activo"
}

// 403 - Sin permisos
{
    message: "Acceso denegado. Se requiere rol de administrador."
}

// 404 - Usuario no encontrado
{
    message: "Usuario no encontrado"
}
```

### 7. Ejemplo de Implementación en React

```javascript
// Hook personalizado para gestión de usuarios
const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (userData) => {
        try {
            const response = await axios.post('/api/users', userData);
            setUsers([...users, response.data.user]);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Error al crear usuario');
            throw error;
        }
    };

    const updateUser = async (id, userData) => {
        try {
            const response = await axios.put(`/api/users/${id}`, userData);
            setUsers(users.map(user => 
                user.id === id ? response.data.user : user
            ));
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Error al actualizar usuario');
            throw error;
        }
    };

    const deactivateUser = async (id) => {
        try {
            await axios.delete(`/api/users/${id}`);
            setUsers(users.map(user => 
                user.id === id ? { ...user, isActive: false } : user
            ));
        } catch (error) {
            setError(error.response?.data?.message || 'Error al desactivar usuario');
            throw error;
        }
    };

    return {
        users,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deactivateUser
    };
};

// Componente de Lista de Usuarios
const UserList = () => {
    const { users, loading, error, fetchUsers, deactivateUser } = useUsers();

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Gestión de Usuarios</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role.name}</td>
                            <td>{user.isActive ? 'Activo' : 'Inactivo'}</td>
                            <td>
                                <button onClick={() => deactivateUser(user.id)}>
                                    Desactivar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}; 
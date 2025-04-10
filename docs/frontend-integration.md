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

## Gestión de Mesas

### 1. Listar Mesas

**Endpoint:** `GET /api/tables`

**Headers:**
```javascript
{
    'Content-Type': 'application/json'
}
```

**Respuesta Exitosa (200):**
```javascript
[
    {
        id: number,
        number: string,
        capacity: number,
        status: "AVAILABLE" | "OCCUPIED" | "BILL_PENDING" | "DISABLED",
        createdAt: string,
        updatedAt: string
    }
]
```

### 2. Obtener Mesa por ID

**Endpoint:** `GET /api/tables/:id`

**Headers:**
```javascript
{
    'Content-Type': 'application/json'
}
```

**Respuesta Exitosa (200):**
```javascript
{
    id: number,
    number: string,
    capacity: number,
    status: "AVAILABLE" | "OCCUPIED" | "BILL_PENDING" | "DISABLED",
    createdAt: string,
    updatedAt: string
}
```

### 3. Crear Mesa

**Endpoint:** `POST /api/tables`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
}
```

**Body:**
```javascript
{
    number: string,    // Número o identificador único de la mesa
    capacity: number,  // Capacidad de comensales
    status?: string    // Opcional, por defecto "AVAILABLE"
}
```

**Respuesta Exitosa (201):**
```javascript
{
    id: number,
    number: string,
    capacity: number,
    status: string,
    createdAt: string,
    updatedAt: string
}
```

### 4. Actualizar Mesa

**Endpoint:** `PUT /api/tables/:id`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
}
```

**Body:**
```javascript
{
    number?: string,    // Opcional
    capacity?: number,  // Opcional
    status?: string     // Opcional
}
```

**Respuesta Exitosa (200):**
```javascript
{
    id: number,
    number: string,
    capacity: number,
    status: string,
    createdAt: string,
    updatedAt: string
}
```

### 5. Eliminar Mesa

**Endpoint:** `DELETE /api/tables/:id`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
}
```

**Respuesta Exitosa (200):**
```javascript
{
    message: "Mesa eliminada correctamente"
}
```

### 6. Estados de Mesa

```javascript
const TABLE_STATUS = {
    AVAILABLE: "AVAILABLE",     // Disponible
    OCCUPIED: "OCCUPIED",       // Ocupada
    BILL_PENDING: "BILL_PENDING", // Pendiente de pago
    DISABLED: "DISABLED"        // Deshabilitada
};
```

### 7. Restricciones y Validaciones

1. **Creación y Actualización:**
   - El número de mesa debe ser único
   - La capacidad debe ser un número positivo
   - El estado debe ser uno de los valores permitidos

2. **Eliminación:**
   - No se puede eliminar una mesa con pedidos activos
   - No se puede eliminar una mesa ocupada o pendiente de pago

3. **Permisos:**
   - Solo usuarios con rol Admin o Manager pueden crear/actualizar/eliminar mesas
   - La lectura de mesas está disponible para todos los usuarios autenticados

### 8. Ejemplo de Implementación en React

```javascript
// Hook personalizado para gestionar mesas
const useTables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTables = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/tables');
            setTables(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al cargar las mesas');
        } finally {
            setLoading(false);
        }
    };

    const createTable = async (tableData) => {
        try {
            const response = await axios.post('/api/tables', tableData);
            setTables([...tables, response.data]);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.error || 'Error al crear la mesa');
            throw error;
        }
    };

    const updateTable = async (id, tableData) => {
        try {
            const response = await axios.put(`/api/tables/${id}`, tableData);
            setTables(tables.map(table => 
                table.id === id ? response.data : table
            ));
            return response.data;
        } catch (error) {
            setError(error.response?.data?.error || 'Error al actualizar la mesa');
            throw error;
        }
    };

    const deleteTable = async (id) => {
        try {
            await axios.delete(`/api/tables/${id}`);
            setTables(tables.filter(table => table.id !== id));
        } catch (error) {
            setError(error.response?.data?.error || 'Error al eliminar la mesa');
            throw error;
        }
    };

    return {
        tables,
        loading,
        error,
        fetchTables,
        createTable,
        updateTable,
        deleteTable
    };
};

## Módulo de Productos

### 1. Obtener Productos

**Endpoint:** `GET /api/products`

**Query Parameters:**
```javascript
{
    categoryId?: number,    // Filtrar por categoría
    search?: string,       // Buscar en nombre y descripción
    status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'  // Filtrar por estado
}
```

**Respuesta Exitosa (200):**
```javascript
[
    {
        id: number,
        name: string,
        description: string,
        price: number,
        imageUrl: string | null,
        stock: number | null,
        status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK',
        categoryId: number,
        category: {
            id: number,
            name: string,
            // ... otros campos de categoría
        }
    }
]
```

### 2. Obtener Producto por ID

**Endpoint:** `GET /api/products/:id`

**Respuesta Exitosa (200):**
```javascript
{
    id: number,
    name: string,
    description: string,
    price: number,
    imageUrl: string | null,
    stock: number | null,
    status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK',
    categoryId: number,
    category: {
        id: number,
        name: string,
        // ... otros campos de categoría
    }
}
```

### 3. Crear Producto

**Endpoint:** `POST /api/products`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
}
```

**Body:**
```javascript
{
    name: string,           // Requerido, único en la categoría
    description?: string,   // Opcional
    price: number,         // Requerido, positivo
    categoryId: number,    // Requerido
    stock?: number,        // Opcional
    imageUrl?: string      // Opcional
}
```

**Respuesta Exitosa (201):**
```javascript
{
    id: number,
    name: string,
    description: string,
    price: number,
    imageUrl: string | null,
    stock: number | null,
    status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK',
    categoryId: number,
    category: {
        id: number,
        name: string
    }
}
```

### 4. Actualizar Producto

**Endpoint:** `PUT /api/products/:id`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
}
```

**Body:**
```javascript
{
    name?: string,
    description?: string,
    price?: number,
    categoryId?: number,
    stock?: number,
    imageUrl?: string,
    status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
}
```

**Respuesta Exitosa (200):**
```javascript
{
    id: number,
    name: string,
    description: string,
    price: number,
    imageUrl: string | null,
    stock: number | null,
    status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK',
    categoryId: number,
    category: {
        id: number,
        name: string
    }
}
```

### 5. Eliminar/Desactivar Producto

**Endpoint:** `DELETE /api/products/:id`

**Headers:**
```javascript
{
    'Authorization': 'Bearer <token>'
}
```

**Respuesta Exitosa (200):**
```javascript
// Si el producto no tiene pedidos históricos
{
    message: "Producto eliminado correctamente"
}

// Si el producto tiene pedidos históricos
{
    message: "Producto marcado como inactivo debido a pedidos históricos"
}
```

### 6. Manejo de Errores

```javascript
// 400 - Nombre duplicado en categoría
{
    error: "Ya existe un producto con ese nombre en esta categoría"
}

// 400 - Precio inválido
{
    error: "El precio debe ser un valor positivo"
}

// 400 - Estado inválido
{
    error: "Estado inválido. Debe ser ACTIVE, INACTIVE o OUT_OF_STOCK"
}

// 401 - No autenticado
{
    error: "Token no proporcionado"
}

// 403 - Sin permisos
{
    error: "No tienes permisos para realizar esta acción"
}

// 404 - No encontrado
{
    error: "Producto no encontrado"
}
```

### 7. Ejemplo de Uso con React

```javascript
// Hook personalizado para gestionar productos
const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = async (filters = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.status) queryParams.append('status', filters.status);

            const response = await axios.get(`/api/products?${queryParams}`);
            setProducts(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async (productData) => {
        try {
            const response = await axios.post('/api/products', productData);
            setProducts([...products, response.data]);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error al crear producto');
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const response = await axios.put(`/api/products/${id}`, productData);
            setProducts(products.map(prod => 
                prod.id === id ? response.data : prod
            ));
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error al actualizar producto');
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await axios.delete(`/api/products/${id}`);
            if (response.data.message.includes('inactivo')) {
                // Actualizar el estado del producto a INACTIVE
                setProducts(products.map(prod => 
                    prod.id === id ? { ...prod, status: 'INACTIVE' } : prod
                ));
            } else {
                // Eliminar el producto de la lista
                setProducts(products.filter(prod => prod.id !== id));
            }
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error al eliminar producto');
        }
    };

    return {
        products,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct
    };
};

// Componente de lista de productos
const ProductList = () => {
    const { 
        products, 
        loading, 
        error, 
        fetchProducts,
        deleteProduct 
    } = useProducts();
    const [filters, setFilters] = useState({
        categoryId: '',
        search: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchProducts(filters);
    }, [filters]);

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'green';
            case 'INACTIVE': return 'red';
            case 'OUT_OF_STOCK': return 'yellow';
            default: return 'gray';
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className="filters">
                <select 
                    value={filters.status} 
                    onChange={e => setFilters({...filters, status: e.target.value})}
                >
                    <option value="ACTIVE">Activos</option>
                    <option value="INACTIVE">Inactivos</option>
                    <option value="OUT_OF_STOCK">Sin Stock</option>
                </select>
                {/* Otros filtros... */}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Categoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>${product.price}</td>
                            <td>{product.stock ?? 'N/A'}</td>
                            <td>
                                <span className={`badge ${getStatusBadgeColor(product.status)}`}>
                                    {product.status}
                                </span>
                            </td>
                            <td>{product.category.name}</td>
                            <td>
                                <button onClick={() => deleteProduct(product.id)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

## Módulo de Categorías

### 1. Obtener Categorías

**Endpoint:** `GET /api/categories`

**Respuesta Exitosa (200):**
```javascript
[
    {
        id: number,
        name: string,
        description: string,
        _count: {
            products: number // Cantidad de productos en la categoría
        }
    }
]
```

### 2. Obtener Categoría por ID

**Endpoint:** `GET /api/categories/:id`

**Respuesta Exitosa (200):**
```javascript
{
    id: number,
    name: string,
    description: string,
    _count: {
        products: number
    }
}
```

### 3. Crear Categoría

**Endpoint:** `POST /api/categories`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
}
```

**Body:**
```javascript
{
    name: string,       // Requerido, único
    description: string // Opcional
}
```

**Respuesta Exitosa (201):**
```javascript
{
    id: number,
    name: string,
    description: string
}
```

### 4. Actualizar Categoría

**Endpoint:** `PUT /api/categories/:id`

**Headers:**
```javascript
{
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
}
```

**Body:**
```javascript
{
    name?: string,       // Opcional
    description?: string // Opcional
}
```

**Respuesta Exitosa (200):**
```javascript
{
    id: number,
    name: string,
    description: string
}
```

### 5. Eliminar Categoría

**Endpoint:** `DELETE /api/categories/:id`

**Headers:**
```javascript
{
    'Authorization': 'Bearer <token>'
}
```

**Respuesta Exitosa (200):**
```javascript
{
    message: "Categoría eliminada correctamente"
}
```

### 6. Manejo de Errores

```javascript
// 400 - Nombre duplicado
{
    error: "Ya existe una categoría con ese nombre"
}

// 400 - Productos asociados
{
    error: "No se puede eliminar una categoría que tiene productos asociados"
}

// 401 - No autenticado
{
    error: "Token no proporcionado"
}

// 403 - Sin permisos
{
    error: "No tienes permisos para realizar esta acción"
}

// 404 - No encontrado
{
    error: "Categoría no encontrada"
}
```

### 7. Ejemplo de Uso con React

```javascript
// Hook personalizado para gestionar categorías
const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    const createCategory = async (categoryData) => {
        try {
            const response = await axios.post('/api/categories', categoryData);
            setCategories([...categories, response.data]);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error al crear categoría');
        }
    };

    const updateCategory = async (id, categoryData) => {
        try {
            const response = await axios.put(`/api/categories/${id}`, categoryData);
            setCategories(categories.map(cat => 
                cat.id === id ? response.data : cat
            ));
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error al actualizar categoría');
        }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`/api/categories/${id}`);
            setCategories(categories.filter(cat => cat.id !== id));
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error al eliminar categoría');
        }
    };

    return {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    };
};

// Componente de lista de categorías
const CategoryList = () => {
    const { 
        categories, 
        loading, 
        error, 
        fetchCategories,
        deleteCategory 
    } = useCategories();

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Categorías</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Productos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(category => (
                        <tr key={category.id}>
                            <td>{category.name}</td>
                            <td>{category.description}</td>
                            <td>{category._count.products}</td>
                            <td>
                                <button onClick={() => deleteCategory(category.id)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Componente de formulario de categoría
const CategoryForm = ({ category, onSubmit }) => {
    const [formData, setFormData] = useState(category || {
        name: '',
        description: ''
    });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            <div>
                <label>Nombre:</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({
                        ...prev,
                        name: e.target.value
                    }))}
                    required
                />
            </div>
            <div>
                <label>Descripción:</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({
                        ...prev,
                        description: e.target.value
                    }))}
                />
            </div>
            <button type="submit">
                {category ? 'Actualizar' : 'Crear'} Categoría
            </button>
        </form>
    );
}; 
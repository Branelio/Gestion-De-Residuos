# Sistema de Autenticación Backend - Latacunga Waste Management

## 📋 Resumen

Se ha implementado un sistema completo de autenticación JWT para el backend de la aplicación de gestión de residuos de Latacunga.

## 🎯 Componentes Implementados

### Backend

#### 1. **Repositorio de Usuarios** (`MongoUserRepository.ts`)
- Implementa la interfaz `UserRepository`
- Métodos:
  - `findById(id: UserId)`: Buscar usuario por ID
  - `findByEmail(email: string)`: Buscar usuario por email
  - `findByEmailWithPassword(email: string)`: Buscar usuario con contraseña hasheada
  - `save(user: User, password: string)`: Crear o actualizar usuario
  - `findAll()`: Listar todos los usuarios
  - `delete(id: UserId)`: Eliminar usuario
  - `update(user: User)`: Actualizar usuario

#### 2. **Rutas de Autenticación** (`/api/auth`)  

##### **POST /api/auth/register**
Registra un nuevo usuario como ciudadano.

**Request:**
```json
{
  "email": "nuevo@example.com",
  "password": "password123",
  "name": "Nombre Completo"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-generado",
      "email": "nuevo@example.com",
      "name": "Nombre Completo",
      "role": "citizen"
    }
  },
  "message": "Usuario registrado exitosamente"
}
```

**Errores:**
- 400: Datos inválidos (campos faltantes, contraseña < 6 caracteres)
- 409: Email ya registrado
- 500: Error del servidor

##### **POST /api/auth/login**
Inicia sesión con credenciales existentes.

**Request:**
```json
{
  "email": "ciudadano1@gmail.com",
  "password": "Latacunga2025!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c8c9e001-citi-zen1-0000-000000000001",
      "email": "ciudadano1@gmail.com",
      "name": "María González",
      "role": "citizen"
    }
  },
  "message": "Login exitoso"
}
```

**Errores:**
- 400: Campos faltantes
- 401: Credenciales inválidas o usuario inactivo
- 500: Error del servidor

##### **GET /api/auth/me**
Obtiene la información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "c8c9e001-citi-zen1-0000-000000000001",
    "email": "ciudadano1@gmail.com",
    "name": "María González",
    "role": "citizen"
  }
}
```

**Errores:**
- 401: Token no proporcionado, inválido o usuario no encontrado
- 500: Error del servidor

### Mobile App

#### 1. **Servicio de Autenticación** (`authService.ts`)
Cliente para consumir la API de autenticación.

**Métodos:**
- `login(credentials)`: Iniciar sesión
- `register(data)`: Registrar nuevo usuario
- `getCurrentUser(token)`: Obtener usuario actual

#### 2. **LoginScreen**
Pantalla de login/registro integrada con:
- Conexión a API real del backend
- Manejo de errores con alertas
- Almacenamiento de token en AsyncStorage
- Navegación automática al login exitoso

## 🔒 Seguridad

### JWT (JSON Web Tokens)
- **Secret:** Configurable vía `JWT_SECRET` env variable (default: 'latacunga-waste-secret-2025')
- **Expiración:** 30 días
- **Payload:** `{ userId, email, role }`

### Contraseñas
- **Hash:** bcrypt con 10 salt rounds
- **Validación:** Mínimo 6 caracteres
- **Comparación:** Usando `bcrypt.compare()` para verificar

### Middleware de Autenticación
- Token enviado en header: `Authorization: Bearer <token>`
- Verificación con `jwt.verify()`
- Acceso a información del usuario autenticado

## 👥 Usuarios de Prueba

### Administradores
```
Email: admin@latacunga.gob.ec
Password: Latacunga2025!
Role: admin

Email: admin.sistemas@latacunga.gob.ec
Password: Latacunga2025!
Role: admin
```

### Operadores
```
Email: operador1@latacunga.gob.ec
Password: Latacunga2025!
Role: operator

Email: operador2@latacunga.gob.ec
Password: Latacunga2025!
Role: operator

Email: operador3@latacunga.gob.ec
Password: Latacunga2025!
Role: operator
```

### Ciudadanos
```
Email: ciudadano1@gmail.com
Name: María González
Password: Latacunga2025!
Role: citizen

Email: ciudadano2@hotmail.com
Name: Carlos Pérez
Password: Latacunga2025!
Role: citizen

Email: ciudadano3@yahoo.com
Name: Ana Rodríguez
Password: Latacunga2025!
Role: citizen

... (total 10 ciudadanos)
```

## 🧪 Pruebas

### 1. Probar Registro (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Usuario Test"
  }'
```

### 2. Probar Login (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ciudadano1@gmail.com",
    "password": "Latacunga2025!"
  }'
```

### 3. Probar Usuario Actual (cURL)
```bash
# Reemplazar <TOKEN> con el token recibido del login
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Probar desde la App Móvil

#### Opción A: Login con usuario existente
1. Abrir app móvil
2. Ingresar credenciales:
   - Email: `ciudadano1@gmail.com`
   - Password: `Latacunga2025!`
3. Presionar "Iniciar Sesión"
4. Verificar navegación a pantalla principal

#### Opción B: Registro de nuevo usuario
1. Abrir app móvil
2. Presionar "Crear cuenta nueva"
3. Ingresar datos:
   - Nombre: `Test User`
   - Email: `testuser@example.com`
   - Password: `test123456`
4. Presionar "Registrarse"
5. Verificar navegación a pantalla principal

#### Verificación
- En la consola de Metro/Expo deberías ver:
  ```
  🌐 API Request: POST /api/auth/login
  ✅ API Response: /api/auth/login - 200
  🔄 Unwrapping response.data.data
  ✅ Login exitoso: [Nombre del usuario]
  ```

## 📦 Dependencias

### Backend
- `jsonwebtoken`: Generación y verificación de JWT
- `@types/jsonwebtoken`: Tipos TypeScript
- `bcryptjs`: Hash de contraseñas (ya instalado)

### Mobile
- `@react-native-async-storage/async-storage`: Almacenamiento local del token

## 🚀 Estado del Servidor

**Backend:** ✅ Corriendo en http://localhost:3000
- Conectado a MongoDB Atlas
- Base de datos: `latacunga_waste_management`
- 15 usuarios seed disponibles

**Mobile:** Metro Bundler en http://192.168.0.147:8081

## 🔄 Flujo de Autenticación

```
┌─────────────┐
│ LoginScreen │
└──────┬──────┘
       │
       │ 1. Ingresa email/password
       │
       v
┌──────────────┐
│ authService  │
└──────┬───────┘
       │
       │ 2. POST /api/auth/login
       │
       v
┌──────────────┐
│   Backend    │
│  Auth Route  │
└──────┬───────┘
       │
       │ 3. Verifica con bcrypt
       │
       v
┌──────────────┐
│   MongoDB    │
│ (UserModel)  │
└──────┬───────┘
       │
       │ 4. Usuario encontrado
       │
       v
┌──────────────┐
│   Backend    │
│ Genera JWT   │
└──────┬───────┘
       │
       │ 5. Retorna {token, user}
       │
       v
┌──────────────┐
│ LoginScreen  │
│ AsyncStorage │
└──────┬───────┘
       │
       │ 6. Guarda token
       │
       v
┌──────────────┐
│   Tabs       │
│  (App Home)  │
└──────────────┘
```

## ⚠️ Notas Importantes

1. **JWT Secret en Producción:** Cambiar el secret por una variable de entorno segura
2. **HTTPS:** En producción usar HTTPS para todas las peticiones
3. **Token Refresh:** Considerar implementar refresh tokens para sesiones largas
4. **Rate Limiting:** Implementar límites de intentos de login
5. **Email Verification:** Considerar agregar verificación de email
6. **Password Reset:** Implementar flujo de recuperación de contraseña

## 📝 Próximos Pasos

- [ ] Agregar middleware de autenticación a rutas protegidas
- [ ] Implementar control de acceso basado en roles (RBAC)
- [ ] Agregar verificación de email
- [ ] Implementar recuperación de contraseña
- [ ] Agregar refresh tokens
- [ ] Implementar cierre de sesión (logout)
- [ ] Crear panel de administración de usuarios

## 🐛 Resolución de Problemas

### Error: "Cannot read package.json"
- **Solución:** Asegurarse de estar en el directorio correcto (`backend/`)

### Error: "ERESOLVE could not resolve"
- **Solución:** Instalar con flag `--legacy-peer-deps`

### Error: "Duplicate schema index"
- **Causa:** UserModel tiene `unique: true` en el schema y también `schema.index()`
- **Impacto:** Solo un warning, no afecta funcionalidad

### Error: "Network Error" en mobile
- **Solución:** Verificar que `BASE_URL` en httpClient.ts apunte a tu IP local
- **Verificación:** Probar `http://192.168.0.147:3000/health` desde el navegador del dispositivo

### Token no funciona
- **Verificación:** Revisar que el token se guardó en AsyncStorage
- **Debug:** Agregar `console.log` en authService

## 📚 Referencias

- [JWT.io](https://jwt.io/) - JSON Web Tokens
- [bcrypt](https://www.npmjs.com/package/bcryptjs) - Password Hashing
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - React Native Storage

---

**Última actualización:** Diciembre 1, 2025
**Estado:** ✅ Sistema de autenticación backend completamente funcional

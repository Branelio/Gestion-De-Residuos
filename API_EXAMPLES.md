# 📡 Ejemplos de API - Latacunga Limpia

Colección de ejemplos de uso de los endpoints de la API.

## 🔐 Autenticación

### Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!",
  "name": "Juan Pérez",
  "phone": "0987654321"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "userId": "CIT-1234567890",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  }
}
```

### Iniciar Sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "CIT-1234567890",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "points": 150,
      "role": "CITIZEN"
    }
  }
}
```

## 📍 Puntos de Acopio

### Encontrar Punto Más Cercano
```http
POST /api/collection-points/nearest
Authorization: Bearer {token}
Content-Type: application/json

{
  "userLatitude": -0.9346,
  "userLongitude": -78.6156,
  "radiusKm": 5,
  "includeFullPoints": false
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "CP-1637845920123-abc123",
    "name": "Centro de Acopio La Matriz",
    "type": "COLLECTION_CENTER",
    "address": "Av. Eloy Alfaro y Quito, Latacunga",
    "coordinates": {
      "latitude": -0.9350,
      "longitude": -78.6160
    },
    "distance": 0.52,
    "fillPercentage": 45,
    "status": "AVAILABLE",
    "isRural": false
  }
}
```

### Listar Todos los Puntos
```http
GET /api/collection-points
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "CP-1637845920123-abc123",
      "name": "Centro de Acopio La Matriz",
      "type": "COLLECTION_CENTER",
      "coordinates": {
        "latitude": -0.9350,
        "longitude": -78.6160
      },
      "fillPercentage": 45,
      "status": "AVAILABLE"
    },
    {
      "id": "CP-1637845920456-def456",
      "name": "Contenedor San Felipe",
      "type": "CONTAINER",
      "coordinates": {
        "latitude": -0.9280,
        "longitude": -78.6120
      },
      "fillPercentage": 85,
      "status": "FULL"
    }
  ],
  "total": 24
}
```

### Crear Punto de Acopio (Admin)
```http
POST /api/collection-points
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Nuevo Centro de Acopio",
  "type": "COLLECTION_CENTER",
  "latitude": -0.9400,
  "longitude": -78.6200,
  "address": "Calle Nueva y Av. Principal",
  "capacity": 5000,
  "isRural": false
}
```

### Actualizar Estado de Punto
```http
PUT /api/collection-points/CP-1637845920123-abc123/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "MAINTENANCE"
}
```

## 📝 Reportes de Residuos

### Crear Reporte
```http
POST /api/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "OVERFLOW",
  "description": "Contenedor desbordado con basura en el exterior",
  "latitude": -0.9346,
  "longitude": -78.6156,
  "address": "Av. Amazonas y Cotopaxi",
  "photoUrl": "https://storage.example.com/reports/photo123.jpg"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "reportId": "REP-1637845920789-xyz789",
    "userId": "CIT-1234567890",
    "type": "OVERFLOW",
    "coordinates": {
      "latitude": -0.9346,
      "longitude": -78.6156
    },
    "status": "PENDING",
    "createdAt": "2025-11-20T15:30:00.000Z"
  }
}
```

### Mis Reportes
```http
GET /api/reports/my-reports
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "REP-1637845920789-xyz789",
      "type": "OVERFLOW",
      "description": "Contenedor desbordado...",
      "status": "RESOLVED",
      "verifiedByAI": true,
      "pointsAwarded": 10,
      "createdAt": "2025-11-20T15:30:00.000Z",
      "resolvedAt": "2025-11-21T10:15:00.000Z"
    }
  ],
  "total": 5,
  "totalPoints": 50
}
```

### Actualizar Estado de Reporte (Admin/Collector)
```http
PUT /api/reports/REP-1637845920789-xyz789/status
Authorization: Bearer {collector-token}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Verificar Reporte con IA
```http
POST /api/reports/REP-1637845920789-xyz789/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "isValid": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "reportId": "REP-1637845920789-xyz789",
    "verifiedByAI": true,
    "pointsAwarded": 10,
    "userTotalPoints": 160
  }
}
```

## 🚛 Rutas de Recolección

### Optimizar Nueva Ruta
```http
POST /api/routes/optimize
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "startLatitude": -0.9346,
  "startLongitude": -78.6156,
  "collectionPointIds": [
    "CP-1637845920123-abc123",
    "CP-1637845920456-def456",
    "CP-1637845920789-ghi789",
    "CP-1637845921012-jkl012"
  ],
  "vehicleId": "VEH-001",
  "driverId": "DRV-001",
  "scheduledDate": "2025-11-21T08:00:00.000Z",
  "routeName": "Ruta Centro 21-Nov"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "routeId": "ROUTE-1637845921234-mno234",
    "totalDistance": 12.5,
    "estimatedDuration": 45,
    "estimatedFuelConsumption": 1.88,
    "optimizationPercentage": 9.4,
    "waypoints": [
      {
        "collectionPointId": "CP-1637845920123-abc123",
        "order": 1,
        "coordinates": {
          "latitude": -0.9350,
          "longitude": -78.6160
        }
      },
      {
        "collectionPointId": "CP-1637845920789-ghi789",
        "order": 2,
        "coordinates": {
          "latitude": -0.9320,
          "longitude": -78.6140
        }
      }
    ]
  }
}
```

### Listar Rutas
```http
GET /api/routes?status=PLANNED&date=2025-11-21
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ROUTE-1637845921234-mno234",
      "name": "Ruta Centro 21-Nov",
      "totalDistance": 12.5,
      "estimatedDuration": 45,
      "status": "PLANNED",
      "scheduledDate": "2025-11-21T08:00:00.000Z",
      "waypointsCount": 4
    }
  ],
  "total": 3
}
```

### Iniciar Ruta
```http
PUT /api/routes/ROUTE-1637845921234-mno234/start
Authorization: Bearer {driver-token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "routeId": "ROUTE-1637845921234-mno234",
    "status": "IN_PROGRESS",
    "startedAt": "2025-11-21T08:05:00.000Z"
  }
}
```

### Completar Ruta
```http
PUT /api/routes/ROUTE-1637845921234-mno234/complete
Authorization: Bearer {driver-token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "routeId": "ROUTE-1637845921234-mno234",
    "status": "COMPLETED",
    "completedAt": "2025-11-21T08:50:00.000Z",
    "actualDuration": 45,
    "efficiencyScore": 92
  }
}
```

## 👤 Perfil de Usuario

### Obtener Perfil
```http
GET /api/users/profile
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "CIT-1234567890",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "phone": "0987654321",
    "role": "CITIZEN",
    "points": 160,
    "reportsCount": 12,
    "verifiedReports": 8,
    "canRedeemDiscount": true,
    "createdAt": "2025-10-15T10:00:00.000Z"
  }
}
```

### Canjear Puntos
```http
POST /api/users/redeem-points
Authorization: Bearer {token}
Content-Type: application/json

{
  "points": 100,
  "reason": "Descuento en tasa municipal"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "pointsRedeemed": 100,
    "remainingPoints": 60,
    "redemptionId": "RED-1637845921567-pqr567"
  }
}
```

## 📊 Dashboard y Estadísticas (Admin)

### Estadísticas Generales
```http
GET /api/dashboard/stats
Authorization: Bearer {admin-token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalCollectionPoints": 24,
    "fullPoints": 3,
    "activeReports": 156,
    "resolvedReports": 432,
    "activeRoutes": 8,
    "totalUsers": 1240,
    "averageOptimization": 9.2,
    "totalFuelSavings": 145.6
  }
}
```

### Reportes por Zona
```http
GET /api/dashboard/reports-by-zone
Authorization: Bearer {admin-token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "zone": "Centro",
      "reportsCount": 45,
      "pendingCount": 8,
      "avgResolutionTime": 24
    },
    {
      "zone": "San Felipe",
      "reportsCount": 32,
      "pendingCount": 5,
      "avgResolutionTime": 18
    }
  ]
}
```

## ⚠️ Manejo de Errores

### Error de Validación
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "latitude",
      "message": "Latitude must be between -90 and 90"
    }
  ]
}
```

### Error de Autenticación
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### Error de Permisos
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### Error de Recurso No Encontrado
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Collection point not found"
}
```

## 🔧 Códigos de Estado HTTP

- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos de entrada inválidos
- `401` - Unauthorized: Autenticación requerida o inválida
- `403` - Forbidden: Sin permisos suficientes
- `404` - Not Found: Recurso no encontrado
- `500` - Internal Server Error: Error del servidor

---

**Nota**: Todos los ejemplos usan JSON. Los tokens JWT deben incluirse en el header `Authorization: Bearer {token}` para endpoints protegidos.

# 🔗 Guía de Integración Completa - API de Reportes

## ✅ Estado de Integración

La aplicación móvil ahora está completamente integrada con la API de EPAGAL para gestión de incidencias y reportes de residuos.

## 📦 Servicios Implementados

### 1. **incidenciasService** (`src/services/incidenciasService.ts`)

Servicio principal para interactuar con la API externa de EPAGAL.

#### Configuración
```typescript
BASE_URL: 'https://epagal-backend-routing-latest.onrender.com'
TIMEOUT: 15000ms (15 segundos)
```

#### Métodos Disponibles

##### Crear Incidencia
```typescript
await incidenciasService.crearIncidencia({
  tipo: TipoIncidencia.CONTENEDOR_LLENO,
  gravedad: 3, // 1-5
  descripcion: 'Descripción del problema',
  lat: -0.9346,
  lon: -78.6157,
  zona: ZonaIncidencia.CENTRO,
  usuario_id: 1,
  foto_url: 'https://...',
  ventana_inicio: new Date().toISOString(),
  ventana_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});
```

##### Listar Incidencias
```typescript
// Todas las incidencias
const incidencias = await incidenciasService.listarIncidencias(0, 100);

// Por usuario
const misIncidencias = await incidenciasService.listarIncidenciasPorUsuario(userId, 0, 100);

// Por zona
const incidenciasZona = await incidenciasService.listarIncidenciasPorZona(ZonaIncidencia.CENTRO, 0, 100);
```

##### Obtener Estadísticas
```typescript
const stats = await incidenciasService.obtenerEstadisticas();
// Retorna: {
//   total_incidencias, pendientes, en_proceso, resueltas, 
//   rechazadas, por_tipo, por_zona, gravedad_promedio
// }
```

##### Determinar Zona Automáticamente
```typescript
const zona = incidenciasService.determinarZona(lat, lon);
// Retorna: ZonaIncidencia.NORTE | SUR | CENTRO | ESTE | OESTE
```

#### Enums Disponibles

```typescript
// Tipos de Incidencia
TipoIncidencia {
  CONTENEDOR_LLENO
  RESIDUO_PELIGROSO
  BASURA_ESPARCIDA
  FALTA_RECOLECCION
  PUNTO_CRITICO
  OTRO
}

// Estados
EstadoIncidencia {
  PENDIENTE
  EN_PROCESO
  RESUELTA
  RECHAZADA
}

// Zonas de Latacunga
ZonaIncidencia {
  NORTE
  SUR
  CENTRO
  ESTE
  OESTE
}
```

---

### 2. **wasteReportService** (`src/services/wasteReportService.ts`)

Servicio adaptador que mantiene compatibilidad con el código existente mientras usa la API de EPAGAL internamente.

#### Métodos Disponibles

##### Crear Reporte
```typescript
const report = await wasteReportService.createReport({
  userId: 1,
  type: ReportType.OVERFLOW,
  description: 'Descripción',
  coordinates: { latitude: -0.9346, longitude: -78.6157 },
  photoUrl: 'https://...',
  severity: 3
});
```

##### Obtener Reportes
```typescript
// Todos los reportes
const allReports = await wasteReportService.getAllReports();

// Reportes del usuario
const userReports = await wasteReportService.getUserReports(userId);

// Reportes cercanos
const nearbyReports = await wasteReportService.getNearbyReports(lat, lon, radiusKm);
```

##### Estadísticas
```typescript
const stats = await wasteReportService.getStats();
// Retorna: { total, pending, inProgress, resolved, rejected, byStatus }
```

##### Manejo de Errores Mejorado
El servicio incluye `formatErrorMessage()` que convierte errores técnicos en mensajes amigables:
- Error 400: "Datos inválidos. Por favor verifica la información."
- Error 401: "No tienes autorización. Por favor inicia sesión."
- Error 404: "No se encontró el recurso solicitado."
- Error 500: "Error en el servidor. Por favor intenta más tarde."
- Error de red: "No se pudo conectar al servidor. Verifica tu conexión a internet."

---

## 🖥️ Pantallas Implementadas

### 1. **ReportScreen** (`src/screens/ReportScreen.tsx`)

Pantalla para crear nuevos reportes.

#### Características
- ✅ Selección de tipo de reporte con iconos visuales
- ✅ Descripción del problema (máx. 500 caracteres)
- ✅ Captura de foto (cámara o galería)
- ✅ Obtención de ubicación GPS con manejo robusto de errores
- ✅ Ubicación de prueba para desarrollo (centro de Latacunga)
- ✅ Validación completa del formulario
- ✅ Envío a API de EPAGAL con logging detallado
- ✅ Feedback visual de éxito con datos del reporte creado

#### Flujo de Uso
1. Usuario selecciona tipo de problema
2. Describe el problema
3. Toma o selecciona foto
4. Captura ubicación GPS
5. Envía el reporte
6. Recibe confirmación con ID de incidencia

---

### 2. **MyReportsScreen** (`src/screens/MyReportsScreen.tsx`)

Pantalla para ver todos los reportes del usuario.

#### Características
- ✅ Lista de todos los reportes del usuario
- ✅ Estadísticas resumidas (Total, Pendientes, En Proceso, Resueltas)
- ✅ Tarjetas visuales con:
  - Icono según tipo de reporte
  - Estado con color distintivo
  - Zona y ubicación
  - Nivel de gravedad (estrellas)
  - Fecha relativa (Hoy, Ayer, Hace X días)
- ✅ Pull-to-refresh para actualizar datos
- ✅ Estado vacío con botón para crear primer reporte
- ✅ Botón flotante (+) para crear nuevo reporte
- ✅ Tap en tarjeta muestra detalles completos

#### Navegación
```typescript
navigation.navigate('MyReports');
```

---

### 3. **ProfileScreen** (Actualizada)

Perfil de usuario ahora integrado con datos reales de la API.

#### Mejoras
- ✅ Carga real de reportes desde la API
- ✅ Estadísticas actualizadas automáticamente
- ✅ Cálculo de puntos basado en reportes resueltos (gravedad × 5)
- ✅ Pull-to-refresh para actualizar datos
- ✅ Botón "Ver Todos" navega a MyReportsScreen
- ✅ Estados de loading y empty con mensajes apropiados
- ✅ Fallback a datos de ejemplo si falla la API

---

## 🔧 Configuración para Desarrollo

### Cambiar URL de la API (si es necesario)

**Para desarrollo local:**
```typescript
// frontend/mobile/src/services/httpClient.ts
const API_CONFIG = {
  BASE_URL: 'http://192.168.100.4:3000', // Tu IP local
  TIMEOUT: 10000,
};
```

**Para API de EPAGAL (ya configurado):**
```typescript
// frontend/mobile/src/services/incidenciasService.ts
const EPAGAL_API_CONFIG = {
  BASE_URL: 'https://epagal-backend-routing-latest.onrender.com',
  TIMEOUT: 15000,
};
```

### Configurar Usuario ID

Actualmente usa `userId = 1` como valor de prueba. Actualizar cuando haya autenticación:

```typescript
// En cada pantalla
const userId = 1; // TODO: Obtener del contexto de autenticación
```

Implementar contexto de autenticación:
```typescript
// Futuro: src/contexts/AuthContext.tsx
const { user } = useAuth();
const userId = user.id;
```

---

## 🧪 Cómo Probar

### 1. Crear un Reporte

```bash
# Navegar a ReportScreen
# 1. Seleccionar tipo: "Contenedor Lleno"
# 2. Escribir: "Contenedor desbordado en la esquina"
# 3. Tomar/seleccionar foto
# 4. Capturar ubicación GPS
# 5. Tap en "📤 Enviar Reporte"
```

**Salida Esperada:**
```
📤 ========== ENVIANDO REPORTE A API EPAGAL ==========
📍 Ubicación capturada: { latitude: -0.9346, longitude: -78.6157 }
📦 Datos del reporte: {...}
✅ ========== REPORTE CREADO EXITOSAMENTE ==========
🆔 ID de incidencia: 123
```

### 2. Ver Mis Reportes

```bash
# Navegar a MyReportsScreen o tap "Ver Todos" en Profile
```

**Debe mostrar:**
- Estadísticas en la parte superior
- Lista de reportes con tarjetas visuales
- Pull-to-refresh funcional

### 3. Ver Estadísticas

```bash
# En EjemploIncidenciaScreen (pantalla de prueba)
# Tap en "Obtener Estadísticas"
```

**Salida Esperada:**
```
Total: 45
Pendientes: 12
En proceso: 8
Resueltas: 23
Gravedad promedio: 3.2
```

---

## 📊 Logging y Debugging

### Logs en Consola

El sistema incluye logging detallado con emojis para facilitar debugging:

```
🌐 EPAGAL API Request: POST /api/incidencias/
✅ EPAGAL API Response: 201
📥 Cargando reportes del usuario: 1
📦 Datos del reporte: {...}
✅ Reportes cargados: 12
❌ Error creando reporte: [mensaje]
```

### Ver Logs en Desarrollo

```bash
# Terminal 1: Metro Bundler
npm start

# Terminal 2: Ver logs detallados
npx react-native log-android  # Android
npx react-native log-ios      # iOS

# O usa la consola del navegador en Expo
```

---

## 🚀 Flujo Completo de Datos

```
┌─────────────────┐
│  ReportScreen   │  Usuario crea reporte
└────────┬────────┘
         │
         v
┌─────────────────────────┐
│ wasteReportService      │  Formatea datos
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│ incidenciasService      │  Llama API
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│ API EPAGAL              │  Guarda en BD
│ epagal-backend-routing  │
└────────┬────────────────┘
         │
         v
┌─────────────────┐
│ MyReportsScreen │  Muestra reportes
└─────────────────┘
         │
         v
┌─────────────────┐
│ ProfileScreen   │  Muestra stats
└─────────────────┘
```

---

## ⚠️ Consideraciones Importantes

### Ubicación GPS
- Requiere permisos de ubicación
- Funciona mejor al aire libre
- Incluye ubicación de prueba para desarrollo
- Timeout de 15 segundos
- Manejo robusto de errores

### Conectividad
- API externa puede tardar (timeout 15s)
- Incluye reintentos automáticos en interceptores
- Mensajes de error amigables al usuario

### Autenticación
- Actualmente usa `usuario_id: 1` hardcodeado
- API de EPAGAL puede requerir autenticación en el futuro
- Preparado para agregar tokens vía `setToken()`

### Fotos
- Actualmente envía URL de foto local
- TODO: Implementar subida de imágenes a servidor
- Considerar usar Cloudinary, AWS S3, o similar

---

## 📝 TODOs Pendientes

1. **Autenticación**
   - [ ] Implementar contexto de autenticación
   - [ ] Integrar login/registro
   - [ ] Guardar token en AsyncStorage
   - [ ] Auto-refresh de token

2. **Subida de Imágenes**
   - [ ] Servicio para subir imágenes
   - [ ] Compresión de imágenes
   - [ ] Indicador de progreso de subida

3. **Offline Support**
   - [ ] Guardar reportes en AsyncStorage
   - [ ] Sincronizar cuando hay conexión
   - [ ] Indicador de reportes pendientes

4. **Notificaciones**
   - [ ] Push notifications cuando cambia estado
   - [ ] Notificar puntos ganados

5. **Mejoras UX**
   - [ ] Mapa para ver ubicación
   - [ ] Fotos múltiples por reporte
   - [ ] Editar reporte existente
   - [ ] Filtros y búsqueda en MyReportsScreen

---

## 🐛 Problemas Conocidos y Soluciones

### Error: "No se pudo obtener ubicación"
**Solución:** 
- Verificar permisos en configuración del dispositivo
- Activar GPS
- Salir al exterior para mejor señal
- Usar "Ubicación de Prueba" para desarrollo

### Error: "No se pudo conectar al servidor"
**Solución:**
- Verificar conexión a internet
- API de EPAGAL puede estar temporalmente caída
- Verificar URL en incidenciasService.ts

### Error: "Datos inválidos"
**Solución:**
- Verificar formato de coordenadas (lat, lon)
- Asegurar que gravedad está entre 1-5
- Verificar que tipo es un TipoIncidencia válido

---

## 📚 Recursos Adicionales

- **API Docs:** https://epagal-backend-routing-latest.onrender.com/docs
- **OpenAPI Spec:** https://epagal-backend-routing-latest.onrender.com/openapi.json
- **Documentación Detallada:** `INTEGRACION_API_EPAGAL.md`

---

## ✅ Checklist de Integración Completa

- [x] Servicio incidenciasService implementado
- [x] Servicio wasteReportService como adaptador
- [x] ReportScreen conectada a API
- [x] MyReportsScreen muestra reportes reales
- [x] ProfileScreen con datos reales
- [x] Manejo robusto de errores
- [x] Logging detallado para debugging
- [x] Determinación automática de zona
- [x] Cálculo de puntos por gravedad
- [x] Estados de loading y empty
- [x] Pull-to-refresh en listas
- [x] Documentación completa

---

**Estado:** ✅ **INTEGRACIÓN COMPLETA Y FUNCIONAL**

La aplicación móvil está completamente integrada con la API de EPAGAL y lista para crear, listar y gestionar reportes de incidencias de residuos en tiempo real.

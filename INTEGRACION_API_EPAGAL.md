# 🔗 Integración API Externa de Incidencias EPAGAL

Guía completa para integrar la API externa de gestión de incidencias de EPAGAL Latacunga en tu aplicación móvil.

## 📋 Tabla de Contenidos

- [Información de la API](#información-de-la-api)
- [Configuración](#configuración)
- [Uso del Servicio](#uso-del-servicio)
- [Ejemplos de Código](#ejemplos-de-código)
- [Tipos y Enums](#tipos-y-enums)
- [Manejo de Errores](#manejo-de-errores)

## 🌐 Información de la API

### Base URL
```
https://epagal-backend-routing-latest.onrender.com
```

### Documentación
- **Swagger UI**: https://epagal-backend-routing-latest.onrender.com/docs
- **OpenAPI Spec**: https://epagal-backend-routing-latest.onrender.com/openapi.json

### Endpoints Principales

#### Incidencias
- `POST /api/incidencias/` - Crear incidencia
- `GET /api/incidencias/` - Listar incidencias
- `GET /api/incidencias/{id}` - Obtener incidencia
- `PATCH /api/incidencias/{id}` - Actualizar incidencia
- `DELETE /api/incidencias/{id}` - Eliminar incidencia
- `GET /api/incidencias/stats` - Obtener estadísticas
- `GET /api/incidencias/zona/{zona}/umbral` - Verificar umbral de zona

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

## ⚙️ Configuración

### 1. Importar el Servicio

```typescript
import { 
  incidenciasService, 
  TipoIncidencia, 
  ZonaIncidencia,
  EstadoIncidencia 
} from '../services/incidenciasService';
```

### 2. Configurar Autenticación (Opcional)

Si la API requiere autenticación:

```typescript
// Opción 1: Login directo en la API de EPAGAL
const loginResult = await incidenciasService.login('email@ejemplo.com', 'password');
console.log('Token:', loginResult.access_token);

// Opción 2: Usar token existente
incidenciasService.setToken('tu-token-aqui');
```

## 🚀 Uso del Servicio

### Crear una Incidencia

```typescript
import { incidenciasService, TipoIncidencia, ZonaIncidencia } from '../services/incidenciasService';

const crearIncidencia = async () => {
  try {
    const nuevaIncidencia = await incidenciasService.crearIncidencia({
      tipo: TipoIncidencia.CONTENEDOR_LLENO,
      gravedad: 4, // 1-5
      descripcion: 'Contenedor desbordado en la esquina de la calle X',
      lat: -0.9346, // Latitud de Latacunga
      lon: -78.6157, // Longitud de Latacunga
      zona: ZonaIncidencia.CENTRO,
      usuario_id: 123, // ID del usuario autenticado
      foto_url: 'https://tu-servidor.com/foto.jpg', // Opcional
      ventana_inicio: new Date().toISOString(),
      ventana_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    console.log('✅ Incidencia creada:', nuevaIncidencia);
    Alert.alert('Éxito', `Incidencia #${nuevaIncidencia.id} creada`);
  } catch (error) {
    console.error('❌ Error:', error);
    Alert.alert('Error', error.message);
  }
};
```

### Listar Incidencias

```typescript
const listarIncidencias = async () => {
  try {
    const incidencias = await incidenciasService.listarIncidencias(0, 50);
    console.log(`Encontradas ${incidencias.length} incidencias`);
    return incidencias;
  } catch (error) {
    console.error('Error al listar:', error);
  }
};
```

### Obtener una Incidencia Específica

```typescript
const obtenerDetalles = async (id: number) => {
  try {
    const incidencia = await incidenciasService.obtenerIncidencia(id);
    console.log('Detalles:', incidencia);
    return incidencia;
  } catch (error) {
    console.error('Error al obtener:', error);
  }
};
```

### Actualizar una Incidencia

```typescript
const actualizarIncidencia = async (id: number) => {
  try {
    const actualizada = await incidenciasService.actualizarIncidencia(id, {
      estado: EstadoIncidencia.EN_PROCESO,
      gravedad: 5,
      descripcion: 'Situación crítica - actualizado',
    });
    console.log('Actualizada:', actualizada);
  } catch (error) {
    console.error('Error al actualizar:', error);
  }
};
```

### Obtener Estadísticas

```typescript
const verEstadisticas = async () => {
  try {
    const stats = await incidenciasService.obtenerEstadisticas();
    console.log('Estadísticas:', {
      total: stats.total_incidencias,
      pendientes: stats.pendientes,
      resueltas: stats.resueltas,
      gravedadPromedio: stats.gravedad_promedio,
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Verificar Umbral de Zona

```typescript
const verificarZona = async () => {
  try {
    const resultado = await incidenciasService.verificarUmbralZona(ZonaIncidencia.CENTRO);
    if (resultado.umbral_superado) {
      Alert.alert('⚠️ Alerta', `La zona ${resultado.zona} ha superado el umbral`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 📝 Tipos y Enums

### TipoIncidencia

```typescript
enum TipoIncidencia {
  CONTENEDOR_LLENO = 'CONTENEDOR_LLENO',
  RESIDUO_PELIGROSO = 'RESIDUO_PELIGROSO',
  BASURA_ESPARCIDA = 'BASURA_ESPARCIDA',
  FALTA_RECOLECCION = 'FALTA_RECOLECCION',
  PUNTO_CRITICO = 'PUNTO_CRITICO',
  OTRO = 'OTRO',
}
```

### EstadoIncidencia

```typescript
enum EstadoIncidencia {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTA = 'RESUELTA',
  RECHAZADA = 'RECHAZADA',
}
```

### ZonaIncidencia

```typescript
enum ZonaIncidencia {
  NORTE = 'NORTE',
  SUR = 'SUR',
  CENTRO = 'CENTRO',
  ESTE = 'ESTE',
  OESTE = 'OESTE',
}
```

### IncidenciaCreate

```typescript
interface IncidenciaCreate {
  tipo: TipoIncidencia;
  gravedad: number; // 1-5
  descripcion: string;
  foto_url?: string;
  lat: number;
  lon: number;
  zona: ZonaIncidencia;
  ventana_inicio?: string; // ISO 8601
  ventana_fin?: string; // ISO 8601
  usuario_id: number;
}
```

### IncidenciaResponse

```typescript
interface IncidenciaResponse {
  id: number;
  tipo: string;
  gravedad: number;
  descripcion: string;
  foto_url?: string;
  lat: number;
  lon: number;
  zona: string;
  estado: string;
  ventana_inicio?: string;
  ventana_fin?: string;
  reportado_en: string;
  usuario_id: number;
  created_at: string;
}
```

## 🗺️ Helpers Útiles

### Determinar Zona por Coordenadas

```typescript
const zona = incidenciasService.determinarZona(-0.9346, -78.6157);
console.log('Zona:', zona); // CENTRO, NORTE, SUR, ESTE, u OESTE
```

### Obtener Nivel de Gravedad Descriptivo

```typescript
const nivel = incidenciasService.obtenerNivelGravedad(4);
console.log('Nivel:', nivel); // "Alta"
```

Escalas:
- 1: Muy Baja
- 2: Baja
- 3: Media
- 4: Alta
- 5: Crítica

## 🎯 Ejemplo Completo en un Componente React Native

```typescript
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import * as Location from 'expo-location';
import { incidenciasService, TipoIncidencia } from '../services/incidenciasService';

export default function ReportScreen() {
  const [loading, setLoading] = useState(false);

  const reportarIncidencia = async () => {
    try {
      setLoading(true);

      // 1. Obtener ubicación actual
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permiso de ubicación denegado');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 2. Determinar zona automáticamente
      const zona = incidenciasService.determinarZona(latitude, longitude);

      // 3. Crear incidencia
      const incidencia = await incidenciasService.crearIncidencia({
        tipo: TipoIncidencia.CONTENEDOR_LLENO,
        gravedad: 3,
        descripcion: 'Contenedor lleno reportado desde la app móvil',
        lat: latitude,
        lon: longitude,
        zona: zona,
        usuario_id: 1, // Obtén esto de tu sistema de autenticación
        ventana_inicio: new Date().toISOString(),
        ventana_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      Alert.alert('✅ Éxito', `Incidencia #${incidencia.id} reportada`);
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button
        title={loading ? 'Reportando...' : 'Reportar Incidencia'}
        onPress={reportarIncidencia}
        disabled={loading}
      />
    </View>
  );
}
```

## ❌ Manejo de Errores

El servicio maneja errores automáticamente y los transforma en mensajes legibles:

```typescript
try {
  await incidenciasService.crearIncidencia(data);
} catch (error: any) {
  // El error.message contendrá un mensaje descriptivo en español
  console.error(error.message);
  Alert.alert('Error', error.message);
}
```

Tipos de errores comunes:
- **401 Unauthorized**: Token inválido o expirado
- **422 Validation Error**: Datos inválidos
- **404 Not Found**: Incidencia no encontrada
- **500 Internal Server Error**: Error del servidor

## 🔒 Consideraciones de Seguridad

1. **Autenticación**: Si la API requiere autenticación, asegúrate de manejar los tokens correctamente
2. **Almacenamiento seguro**: Usa `@react-native-async-storage/async-storage` para guardar tokens
3. **HTTPS**: La API ya usa HTTPS, no modificar a HTTP
4. **Validación**: Valida los datos antes de enviarlos

## 📱 Integración con tu App Actual

### Opción 1: Reemplazar el Sistema Actual

Reemplaza las llamadas a `wasteReportService` con `incidenciasService`:

```typescript
// Antes
await wasteReportService.createReport(data);

// Ahora
await incidenciasService.crearIncidencia({
  tipo: TipoIncidencia.CONTENEDOR_LLENO,
  // ... otros campos
});
```

### Opción 2: Usar Ambos Sistemas

Mantén ambos servicios y usa el apropiado según el contexto:

```typescript
// Para reportes locales
await wasteReportService.createReport(localData);

// Para sincronizar con EPAGAL
await incidenciasService.crearIncidencia(epagalData);
```

## 🧪 Testing

Para probar la integración, usa el componente de ejemplo:

```typescript
import EjemploIncidenciaScreen from './screens/EjemploIncidenciaScreen';

// Agregar a tu navegación
<Stack.Screen name="EjemploIncidencia" component={EjemploIncidenciaScreen} />
```

## 📞 Soporte

- **Documentación API**: https://epagal-backend-routing-latest.onrender.com/docs
- **OpenAPI Spec**: https://epagal-backend-routing-latest.onrender.com/openapi.json

## ✅ Checklist de Implementación

- [x] Servicio de incidencias creado
- [x] Tipos TypeScript definidos
- [x] Ejemplo de uso implementado
- [x] Documentación completa
- [ ] Integrar con tu pantalla de reportes
- [ ] Probar creación de incidencias
- [ ] Probar listado de incidencias
- [ ] Implementar manejo de fotos
- [ ] Configurar autenticación
- [ ] Testing en dispositivo real

---

**¡Listo para usar!** 🎉

Consulta el archivo `EjemploIncidenciaScreen.tsx` para ver una implementación completa funcionando.

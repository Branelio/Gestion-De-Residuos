# 🌱 Sistema de Seed - Puntos de Acopio de Latacunga

## 📋 Descripción

Este módulo contiene los datos de inicialización (seed) para los **22 puntos de acopio y recolección de residuos** distribuidos en el cantón Latacunga, Ecuador.

Los datos incluyen:
- Centros de acopio principales (3)
- Contenedores urbanos zona centro (4)
- Puntos barriales (3)
- Puntos rurales (5)
- Zonas industriales/comerciales (2)
- Instituciones educativas (2)
- Centros de salud (1)
- Parques y áreas recreativas (2)

---

## 🗂️ Estructura de Archivos

```
backend/src/infrastructure/database/seeds/
├── collectionPointsSeed.ts    # Datos de los 22 puntos de acopio
├── runSeed.ts                 # Script de ejecución del seed
└── README_SEEDS.md            # Esta documentación
```

---

## 📊 Datos Incluidos

### Estadísticas Generales
- **Total de puntos**: 22
- **Capacidad total**: 35,300 kg
- **Población servida**: ~98,000 habitantes
- **Cobertura**: ~85% del cantón

### Distribución por Zona
- **Urbana**: 7 puntos
- **Periurbana**: 2 puntos
- **Rural**: 5 puntos
- **Industrial**: 1 punto
- **Comercial**: 2 puntos
- **Institucional**: 3 puntos
- **Recreativa**: 2 puntos

---

## 🚀 Uso del Seed

### Prerrequisitos

1. **MongoDB corriendo** (local o Docker):
```powershell
# Con Docker Compose (recomendado)
cd c:\Users\Branel\Documents\Proyectos\Prototipo2
docker-compose up -d mongodb

# O MongoDB local
mongod --dbpath="C:\data\db"
```

2. **Dependencias instaladas**:
```powershell
cd c:\Users\Branel\Documents\Proyectos\Prototipo2\backend
npm install
```

3. **Variables de entorno** (opcional, usa localhost por defecto):
```env
MONGODB_URI=mongodb://localhost:27017/waste_management
```

---

### Comandos Disponibles

#### 1. Insertar datos (mantiene existentes)
```powershell
cd c:\Users\Branel\Documents\Proyectos\Prototipo2\backend
npm run seed:collection-points
```

**Salida esperada**:
```
✅ Conectado a MongoDB
🌱 Iniciando seed de puntos de acopio...
✅ 22 puntos de acopio insertados correctamente

📊 ESTADÍSTICAS DE SEED:
   Total de puntos: 22
   Capacidad total: 35,300 kg
   Carga actual: 12,070 kg
   Promedio de llenado: 34%

📍 DISTRIBUCIÓN POR ZONA:
   URBANA: 7 puntos
   PERIURBANA: 2 puntos
   RURAL: 5 puntos
   ...

🗺️  Índices creados: _id_, id_1, location_2dsphere

🔍 VERIFICACIÓN DE DATOS:
   Total documentos: 22
   Puntos urbanos: 7
   Puntos rurales: 5

📍 5 PUNTOS MÁS CERCANOS AL CENTRO (Parque Vicente León):
   1. Contenedor Parque Vicente León - Parque Vicente León (frente a la Catedral)
   2. Contenedor Plaza Santo Domingo - Plaza Santo Domingo
   3. Contenedor Mercado El Salto - Mercado El Salto, Av. Amazonas
   ...

✅ Puntos disponibles: 22
🔴 Puntos llenos: 0

✨ Proceso completado exitosamente
👋 Conexión cerrada
```

#### 2. Limpiar y reinsertar (borra todo primero)
```powershell
cd c:\Users\Branel\Documents\Proyectos\Prototipo2\backend
npm run seed:clear
```

**⚠️ ADVERTENCIA**: Este comando **elimina todos los puntos de acopio existentes** antes de insertar los nuevos.

---

## 🗺️ Índices Geoespaciales

El seed automáticamente crea un **índice 2dsphere** en el campo `location`, permitiendo:

### Búsqueda por proximidad
```javascript
// Encontrar puntos cerca de una ubicación
const nearestPoints = await CollectionPoint.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [-78.6156, -0.9346] // [lng, lat]
      },
      $maxDistance: 5000 // 5 km en metros
    }
  }
}).limit(5);
```

### Búsqueda dentro de un radio
```javascript
// Puntos dentro de 3 km
const pointsInRadius = await CollectionPoint.find({
  location: {
    $geoWithin: {
      $centerSphere: [
        [-78.6156, -0.9346], // [lng, lat]
        3 / 6378.1 // 3 km convertido a radianes
      ]
    }
  }
});
```

---

## 📍 Datos de Ejemplo

### Punto Urbano - Centro
```typescript
{
  id: 'CP-004-VLEON',
  name: 'Contenedor Parque Vicente León',
  location: {
    type: 'Point',
    coordinates: [-78.6156, -0.9346] // [longitude, latitude]
  },
  address: 'Parque Vicente León (frente a la Catedral)',
  capacity: 800,
  currentLoad: 320,
  status: 'AVAILABLE',
  wasteTypes: ['GENERAL'],
  zone: 'URBANA',
  parish: 'La Matriz',
  description: 'Contenedor en centro histórico, recolección diaria',
  isActive: true,
  lastEmptied: '2025-01-15',
  createdAt: '2024-01-01',
  updatedAt: '2025-01-15'
}
```

### Punto Rural
```typescript
{
  id: 'CP-011-PASTOCALLE',
  name: 'Centro de Acopio Pastocalle',
  location: {
    type: 'Point',
    coordinates: [-78.6000, -0.8650]
  },
  address: 'Parroquia Pastocalle, Centro',
  capacity: 3000,
  currentLoad: 800,
  status: 'AVAILABLE',
  wasteTypes: ['GENERAL', 'RECYCLABLE', 'ORGANIC'],
  schedule: {
    tuesday: { open: '09:00', close: '15:00' },
    friday: { open: '09:00', close: '15:00' }
  },
  zone: 'RURAL',
  parish: 'Pastocalle',
  description: 'Centro de acopio rural con atención martes y viernes',
  isActive: true,
  ...
}
```

---

## 🔍 Verificación de Datos

### Verificar en MongoDB Compass
1. Abrir MongoDB Compass
2. Conectar a `mongodb://localhost:27017`
3. Seleccionar database `waste_management`
4. Abrir colección `collectionpoints`
5. Verificar 22 documentos

### Verificar con mongo shell
```powershell
mongosh mongodb://localhost:27017/waste_management
```

```javascript
// Contar documentos
db.collectionpoints.countDocuments()
// Resultado: 22

// Ver todos los puntos
db.collectionpoints.find().pretty()

// Buscar puntos urbanos
db.collectionpoints.find({ zone: "URBANA" }).count()
// Resultado: 7

// Buscar puntos cerca del centro (índice geoespacial)
db.collectionpoints.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-78.6156, -0.9346]
      },
      $maxDistance: 2000
    }
  }
}).limit(5)
```

---

## 🛠️ Personalización

### Agregar Nuevos Puntos

Edita `collectionPointsSeed.ts`:

```typescript
export const collectionPointsData: CollectionPointSeedData[] = [
  // ... puntos existentes ...
  
  // Nuevo punto
  {
    id: 'CP-023-NUEVO',
    name: 'Mi Nuevo Punto',
    location: {
      type: 'Point',
      coordinates: [-78.XXXX, -0.XXXX] // ⚠️ IMPORTANTE: [lng, lat]
    },
    address: 'Dirección completa',
    capacity: 1000,
    currentLoad: 0,
    status: 'AVAILABLE',
    wasteTypes: ['GENERAL'],
    zone: 'URBANA',
    parish: 'Nombre Parroquia',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
```

### Modificar Datos Existentes

1. Edita los valores en `collectionPointsSeed.ts`
2. Ejecuta con `--clear` para reemplazar:
```powershell
npm run seed:clear
```

---

## ⚠️ Notas Importantes

### Coordenadas GPS

**CRÍTICO**: Las coordenadas deben estar en formato GeoJSON:
- **[longitude, latitude]** ← Orden correcto para MongoDB
- **NO [latitude, longitude]** ← Orden incorrecto

Ejemplo correcto para Latacunga centro:
```typescript
coordinates: [-78.6156, -0.9346]
// ↑ longitud  ↑ latitud
```

### Validación en Campo

⚠️ **Las coordenadas en el seed son aproximadas** basadas en investigación web.

**Para datos precisos**:
1. Visitar cada punto físicamente
2. Usar GPS del celular o dispositivo profesional
3. Registrar coordenadas exactas
4. Fotografiar el punto
5. Validar capacidad y horarios con personal de EPAGAL
6. Actualizar el archivo `collectionPointsSeed.ts`
7. Re-ejecutar el seed con `npm run seed:clear`

### Backup de Datos

Antes de ejecutar `seed:clear`, hacer backup:

```powershell
# Exportar colección completa
mongodump --uri="mongodb://localhost:27017/waste_management" --collection=collectionpoints --out=backup

# Restaurar si es necesario
mongorestore --uri="mongodb://localhost:27017/waste_management" backup/waste_management/collectionpoints.bson
```

---

## 🔗 Integración con la Aplicación

### Use Case: FindNearestCollectionPoint

El seed prepara los datos para el use case:

```typescript
// backend/src/application/use-cases/FindNearestCollectionPointUseCase.ts
const result = await this.useCase.execute({
  latitude: -0.9346,  // Usuario en Parque Vicente León
  longitude: -78.6156,
  radiusKm: 5,
  filterFullPoints: true
});

// Resultado: Contenedor Parque Vicente León (el más cercano)
```

### Mobile App: MapScreen

```typescript
// frontend/mobile/src/screens/MapScreen.tsx
// Los marcadores en el mapa provienen del backend
// que usa los datos del seed
const response = await api.get('/collection-points/nearby', {
  params: { lat, lng, radius: 10 }
});
```

---

## 📚 Referencias

- **Documento fuente**: `PUNTOS_ACOPIO_LATACUNGA.md`
- **Contacto EPAGAL**: (03) 2990018 Ext. 5015
- **MongoDB Geospatial**: https://www.mongodb.com/docs/manual/geospatial-queries/
- **GeoJSON Spec**: https://geojson.org/

---

## ✅ Checklist de Validación

Después de ejecutar el seed:

- [ ] 22 documentos insertados
- [ ] Índice 2dsphere creado
- [ ] Búsqueda por proximidad funciona
- [ ] Puntos visibles en MongoDB Compass
- [ ] Use case FindNearestPoint retorna resultados
- [ ] MapScreen en mobile muestra marcadores

---

**Elaborado por**: Brandon Sangoluisa, Byron Chuquitarco  
**Fecha**: Enero 2025  
**Proyecto**: Sistema de Gestión de Residuos - Latacunga  
**Universidad**: ESPE - Tesis de Grado

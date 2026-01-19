# 🌿 Latacunga Limpia - Sistema de Gestión de Residuos Sólidos

Sistema integral de geolocalización y gestión de residuos sólidos para el cantón Latacunga, Ecuador. Desarrollado con arquitectura hexagonal, DDD y metodologías modernas.

## 📋 Descripción del Proyecto

Este proyecto implementa un sistema de cuatro módulos que funciona de manera coordinada:

### Módulos Principales

1. **Geolocalización de Puntos Críticos**: Aplicación móvil que registra la ubicación exacta de contenedores saturados y zonas sucias mediante coordenadas GPS.

2. **Optimización de Rutas de Recolección**: Algoritmo que reduce la distancia recorrida hasta en un 9.4% y el consumo de combustible en un 11.6%.

3. **Trazabilidad y Panel Web**: Dashboard responsivo que centraliza reportes y rutas planificadas para análisis de indicadores clave.

4. **Verificación Automática e Incentivos**: Sistema de IA que valida fotografías y otorga "puntos limpios" canjeables por descuentos en tasas municipales.

## 🏗️ Arquitectura del Proyecto

```
Prototipo2/
├── backend/                    # API REST con Node.js + TypeScript
│   ├── src/
│   │   ├── domain/            # Capa de Dominio (DDD)
│   │   │   ├── entities/      # Entidades del negocio
│   │   │   ├── repositories/  # Interfaces de repositorios
│   │   │   ├── services/      # Servicios de dominio
│   │   │   └── events/        # Eventos de dominio
│   │   ├── application/       # Capa de Aplicación
│   │   │   ├── use-cases/     # Casos de uso (CQRS)
│   │   │   ├── commands/      # Comandos
│   │   │   ├── queries/       # Consultas
│   │   │   └── dto/           # Data Transfer Objects
│   │   ├── infrastructure/    # Capa de Infraestructura
│   │   │   ├── persistence/   # Implementación de persistencia
│   │   │   ├── repositories/  # Implementación de repositorios
│   │   │   ├── http/          # Controllers, Middlewares, Routes
│   │   │   ├── database/      # Seeds y configuración DB
│   │   │   │   └── seeds/     # Datos iniciales (22 puntos de acopio)
│   │   │   └── config/        # Configuraciones
│   │   └── index.ts           # Punto de entrada
│   ├── tests/                 # Tests unitarios e integración
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                  # Aplicaciones Frontend
│   ├── web/                   # Aplicación Web con React + Vite
│   │   ├── src/
│   │   │   ├── presentation/  # Capa de Presentación
│   │   │   │   ├── components/  # Componentes reutilizables
│   │   │   │   ├── pages/       # Páginas de la aplicación
│   │   │   │   └── layouts/     # Layouts
│   │   │   ├── application/   # Capa de Aplicación
│   │   │   │   ├── hooks/     # Custom hooks
│   │   │   │   └── services/  # Servicios de aplicación
│   │   │   └── infrastructure/  # Capa de Infraestructura
│   │   │       ├── api/       # Cliente HTTP
│   │   │       └── config/    # Configuraciones
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── Dockerfile
│   │
│   └── mobile/                # Aplicación Móvil con Expo + React Native
│       ├── src/
│       │   ├── screens/       # Pantallas de la app
│       │   │   ├── HomeScreen.tsx      # Dashboard principal
│       │   │   ├── MapScreen.tsx       # Mapa con puntos de acopio
│       │   │   ├── ReportScreen.tsx    # Formulario de reportes
│       │   │   └── ProfileScreen.tsx   # Perfil y recompensas
│       │   ├── theme/         # Sistema de diseño
│       │   │   ├── index.ts   # Colores EPAGAL, tipografía
│       │   │   └── styles.ts  # Estilos comunes
│       │   └── types/         # Definiciones TypeScript
│       ├── App.tsx            # Navegación con React Navigation
│       ├── app.json           # Configuración Expo
│       ├── package.json
│       ├── tsconfig.json
│       └── README_MOBILE.md   # Documentación móvil
│
├── docs/                      # Documentación del proyecto
│   ├── ARQUITECTURA_Y_METODOLOGIA.md  # Documento técnico completo
│   ├── QUICKSTART.md          # Guía rápida de inicio
│   └── API_EXAMPLES.md        # Ejemplos de uso de API
│
├── PUNTOS_ACOPIO_LATACUNGA.md  # Datos de 22 puntos de acopio
├── docker-compose.yml         # Orquestación de contenedores
├── .gitignore
├── .editorconfig
└── README.md                  # Esta documentación
```

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js 18+** con **TypeScript 5.3**
- **Express.js** - Framework web
- **MongoDB** con **Mongoose** - Base de datos
- **Inversify** - Inyección de dependencias
- **Zod** - Validación de esquemas
- **Jest** - Testing
- **JWT** - Autenticación
- **Firebase Admin** - Notificaciones push

### Frontend Web
- **React 18** con **TypeScript**
- **Vite** - Build tool
- **React Router DOM** - Enrutamiento
- **Leaflet** + **React Leaflet** - Mapas interactivos
- **Zustand** - Estado global
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

### Frontend Mobile
- **Expo SDK ~51.0.0** - Framework React Native
- **React Native 0.74.0** con **TypeScript**
- **React Navigation** - Navegación entre pantallas
- **React Native Maps** - Mapas con Google Maps
- **Expo Location** - Geolocalización GPS
- **Expo Camera** - Captura de fotos
- **Expo Image Picker** - Selección de imágenes
- **SafeAreaContext** - Soporte para pantallas modernas

### DevOps
- **Docker** & **Docker Compose** - Contenedorización
- **ESLint** & **Prettier** - Linting y formateo
- **Git** - Control de versiones

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- npm 9 o superior
- Docker y Docker Compose (opcional)
- MongoDB 7.0 (si no usas Docker)

### Opción 1: Instalación con Docker (Recomendado)

```powershell
# Clonar el repositorio
git clone <repository-url>
cd Prototipo2

# Construir y levantar contenedores
docker-compose up --build

# La API estará disponible en http://localhost:3000
# El frontend estará disponible en http://localhost:5173
```

### Opción 2: Instalación Manual

#### Backend

```powershell
cd backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
Copy-Item .env.example .env

# Editar .env con tus configuraciones
# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Compilar para producción
npm run build
npm start
```

#### Frontend

```powershell
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env
New-Item .env

# Agregar variables de entorno
@"
VITE_API_URL=http://localhost:3000
"@ | Out-File -FilePath .env

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
npm run preview
```

## 🧪 Testing

```powershell
# Backend - Tests unitarios e integración
cd backend
npm test

# Backend - Tests con cobertura
npm run test:coverage

# Backend - Tests en modo watch
npm run test:watch
```

## 📖 Uso del Sistema

### Endpoints Principales de la API

#### Puntos de Acopio
```
GET    /api/collection-points           # Listar todos los puntos
GET    /api/collection-points/nearest   # Encontrar punto más cercano
POST   /api/collection-points           # Crear nuevo punto
PUT    /api/collection-points/:id       # Actualizar punto
DELETE /api/collection-points/:id       # Eliminar punto
```

#### Reportes de Residuos
```
GET    /api/reports                     # Listar reportes
POST   /api/reports                     # Crear reporte
GET    /api/reports/my-reports          # Mis reportes
PUT    /api/reports/:id/status          # Actualizar estado
```

#### Optimización de Rutas
```
GET    /api/routes                      # Listar rutas
POST   /api/routes/optimize             # Optimizar nueva ruta
GET    /api/routes/:id                  # Detalle de ruta
PUT    /api/routes/:id/start            # Iniciar ruta
PUT    /api/routes/:id/complete         # Completar ruta
```

### Ejemplo de Uso - Encontrar Punto Más Cercano

```typescript
// Request
POST /api/collection-points/nearest
{
  "userLatitude": -0.9346,
  "userLongitude": -78.6156,
  "radiusKm": 10,
  "includeFullPoints": false
}

// Response
{
  "success": true,
  "data": {
    "id": "CP-123456",
    "name": "Punto de Acopio Centro",
    "type": "COLLECTION_CENTER",
    "address": "Av. Eloy Alfaro y Quito",
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

## 🎯 Objetivos del Proyecto

### Objetivo General
Diseñar e integrar un sistema de geolocalización en la aplicación móvil que permita a los usuarios identificar el basurero o punto de acopio más cercano en tiempo real.

### Objetivos Específicos

1. **Levantamiento de Información**: Coordinar con autoridades locales (EPAGAL) para obtener ubicación exacta de todos los puntos de acopio.

2. **Desarrollo de Funcionalidad**: Implementar geolocalización que permita visualizar ubicación y recibir sugerencias automáticas.

3. **Pruebas y Optimización**: Realizar pruebas de precisión en distintas zonas de Latacunga y optimizar tiempos de respuesta.

## 📊 Metodología

- **Enfoque**: Investigación cuantitativa de tipo aplicado
- **Alcance**: Explicativo y correlacional
- **Diseño**: No experimental, transeccional, tecnológico-propositivo
- **Fuentes**: Primarias (encuestas, GPS) y secundarias (INEC, literatura académica)
- **Técnicas**: Estadística descriptiva, análisis de correlación, geo-análisis con SIG

## 🤝 Colaboradores

### Estudiantes
- **Brandon Joel Sangoluisa Diaz** ([@Branelio](https://github.com/Branelio)) - bjsangoluisa@espe.edu.ec
- **Byron Wladimir Chuquitarco Abata** ([@ByonAbata](https://github.com/ByonAbata)) - bwchuquitarco@espe.edu.ec

### Tutor
- **Ing. Franklin Javier Montaluisa Yugla** - fjmontaluisa@espe.edu.ec

### Entidad Co-participante
- **EPAGAL (Empresa Pública de Aseo y Gestión Ambiental del Cantón Latacunga)**
- Contacto: Ing. Juan Salgado - juan.salgado@epagal.gob.ec

Para más información sobre los colaboradores y cómo contribuir, consulta [CONTRIBUTORS.md](CONTRIBUTORS.md).

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

## 🔗 Referencias

1. Castro et al. (2021) - Optimización de rutas de recolección en zonas rurales
2. González & Martínez (2019) - Sistemas georreferenciados en gestión de residuos
3. Zhang et al. (2020) - Incentivos para clasificación de residuos
4. CEPAL (2021) - Participación comunitaria en gestión ambiental
5. INEC (2022) - Indicadores de gestión de residuos en Ecuador

---

**Universidad de las Fuerzas Armadas ESPE**  
**Departamento de Ciencias de la Computación**  
**Carrera de Ingeniería de Software**  
Latacunga, Ecuador - 2025

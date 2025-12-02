# 📱 Aplicación Móvil - Sistema de Gestión de Residuos Latacunga

## 📋 Descripción

Aplicación móvil desarrollada con **Expo** y **React Native** para ciudadanos de Latacunga. Permite encontrar puntos de acopio cercanos, reportar problemas con residuos, ganar puntos por participación y canjear recompensas.

---

## 🎨 Características Principales

### ✅ Pantallas Implementadas

1. **🏠 HomeScreen** - Dashboard principal
   - Puntos acumulados del usuario
   - Acciones rápidas (Encontrar punto cercano, Reportar problema)
   - Estadísticas de la comunidad
   - Información educativa sobre reciclaje

2. **🗺️ MapScreen** - Mapa interactivo
   - Ubicación actual del usuario con GPS
   - Marcadores de todos los puntos de acopio
   - Indicador de estado (verde=disponible, rojo=lleno)
   - Panel inferior con información del punto más cercano
   - Botón para obtener direcciones

3. **📸 ReportScreen** - Reportar problemas
   - 5 tipos de reportes (Contenedor lleno, basurero clandestino, contenedor dañado, recolección perdida, otro)
   - Captura de foto con cámara o desde galería
   - Descripción detallada del problema
   - Captura automática de ubicación GPS
   - Validación de formulario
   - Gamificación: puntos por reportar

4. **👤 ProfileScreen** - Perfil del usuario
   - Avatar y datos del usuario
   - Estadísticas: puntos, reportes, ranking
   - Historial de reportes recientes
   - Sistema de recompensas (descuentos, productos, experiencias)
   - Impacto ambiental personal
   - Configuración y ajustes

---

## 🎨 Diseño UX/UI

### Paleta de Colores EPAGAL

Basada en los colores institucionales de EPAGAL y la temática ambiental:

```typescript
Primary (Verde Ambiental):
- 50: '#E8F5E9'  (Fondo claro)
- 100: '#C8E6C9' (Hover)
- 600: '#4CAF50' (Principal)
- 700: '#388E3C' (Pressed)
- 800: '#2E7D32' (Dark)
- 900: '#1B5E20' (Darkest)

Secondary (Azul Institucional):
- 50: '#E3F2FD'
- 600: '#2196F3' (Principal)
- 900: '#0D47A1'

Status Colors:
- Success: #4CAF50 (Verde)
- Warning: #FF9800 (Naranja)
- Error: #F44336 (Rojo)
```

### Principios de Diseño

- **Minimalista y Limpio**: Interfaz clara sin elementos innecesarios
- **Iconografía con Emojis**: Uso de emojis para comunicación visual rápida
- **Cards y Espaciado**: Sistema de tarjetas con sombras sutiles
- **Jerarquía Visual**: Tipografía clara con pesos diferentes
- **Bottom Sheets**: Información contextual en paneles deslizables
- **Feedback Visual**: Indicadores de estado y animaciones sutiles

---

## 🛠️ Stack Tecnológico

### Core
- **Expo SDK**: ~51.0.0
- **React Native**: 0.74.0
- **TypeScript**: 5.3.3

### Navegación
- `@react-navigation/native`: ^6.1.7
- `@react-navigation/bottom-tabs`: ^6.5.8
- `react-native-screens`: ~3.31.0
- `react-native-safe-area-context`: 4.10.0

### Mapas y Ubicación
- `react-native-maps`: 1.14.0
- `expo-location`: ~17.0.0

### Cámara e Imágenes
- `expo-camera`: ~15.0.0
- `expo-image-picker`: ~15.0.0

### UI Components
- Componentes nativos de React Native
- Custom components con StyleSheet

---

## 📦 Instalación

### Prerrequisitos

1. **Node.js** 18+ y npm 9+
2. **Expo CLI** (se instala automáticamente)
3. **Expo Go** app en tu celular:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

### Pasos de Instalación

```powershell
# 1. Navegar a la carpeta mobile
cd c:\Users\Branel\Documents\Proyectos\Prototipo2\frontend\mobile

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm start
```

---

## 🚀 Ejecución

### Modo Desarrollo con Expo Go

```powershell
cd c:\Users\Branel\Documents\Proyectos\Prototipo2\frontend\mobile
npm start
```

Esto abrirá **Expo Dev Tools** en tu navegador. Opciones:

1. **Escanear QR con Expo Go** (Recomendado para pruebas rápidas)
   - Abrir app Expo Go en tu celular
   - Escanear el código QR que aparece en terminal/navegador
   - La app se cargará en tu celular

2. **Android Emulator**
   ```powershell
   npm run android
   ```

3. **iOS Simulator** (Solo macOS)
   ```powershell
   npm run ios
   ```

### Scripts Disponibles

```json
{
  "start": "expo start",              // Iniciar servidor de desarrollo
  "android": "expo start --android",  // Abrir en emulador Android
  "ios": "expo start --ios",          // Abrir en simulador iOS
  "web": "expo start --web"           // Abrir en navegador web
}
```

---

## 📁 Estructura del Proyecto

```
mobile/
├── src/
│   ├── screens/              # Pantallas de la aplicación
│   │   ├── HomeScreen.tsx       # Dashboard principal
│   │   ├── MapScreen.tsx        # Mapa con puntos de acopio
│   │   ├── ReportScreen.tsx     # Formulario de reportes
│   │   └── ProfileScreen.tsx    # Perfil y recompensas
│   ├── theme/                # Sistema de diseño
│   │   ├── index.ts             # Colores, tipografía, espaciado
│   │   └── styles.ts            # Estilos comunes reutilizables
│   └── types/                # Definiciones TypeScript
│       └── index.ts             # Interfaces y tipos
├── App.tsx                   # Punto de entrada con navegación
├── app.json                  # Configuración de Expo
├── package.json              # Dependencias
├── tsconfig.json             # Configuración TypeScript
└── README_MOBILE.md          # Esta documentación
```

---

## 🔑 Permisos Necesarios

La app requiere los siguientes permisos (se solicitan en tiempo de ejecución):

### Android
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### iOS
```xml
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a tu cámara para tomar fotos de reportes</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a tu galería para seleccionar fotos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para mostrar puntos de acopio cercanos</string>
```

Todos estos permisos están configurados en `app.json`.

---

## 📲 Uso de la Aplicación

### Flujo Principal

1. **Inicio** → Ver puntos acumulados y acciones rápidas
2. **Encontrar Punto Cercano** → Navegar al mapa con ubicación actual
3. **Ver Punto en Mapa** → Seleccionar punto y ver detalles
4. **Reportar Problema**:
   - Seleccionar tipo de problema
   - Describir el problema
   - Tomar/seleccionar foto
   - Capturar ubicación GPS
   - Enviar reporte
   - ✅ Ganar puntos
5. **Ver Perfil** → Revisar puntos, reportes, recompensas
6. **Canjear Recompensas** → Usar puntos para obtener beneficios

---

## 🔗 Integración con Backend

### Endpoints a Integrar

```typescript
// TODO: Implementar cliente API

// Puntos de Acopio
GET /api/collection-points/nearby?lat=-0.9346&lng=-78.6156&radius=10
GET /api/collection-points/:id

// Reportes
POST /api/waste-reports
GET /api/waste-reports/my-reports
GET /api/waste-reports/:id

// Usuario
GET /api/users/me
PATCH /api/users/me
GET /api/users/stats

// Recompensas
GET /api/rewards
POST /api/rewards/:id/redeem
```

### Implementación Pendiente

Crear archivo `src/services/api.ts`:

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://tu-backend-url/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Interceptor para agregar token JWT
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 🧪 Testing (Pendiente)

### Unit Tests con Jest
```powershell
npm test
```

### E2E Tests con Detox
```powershell
npm run test:e2e
```

---

## 📦 Build para Producción

### Android APK
```powershell
# Configurar EAS Build
npm install -g eas-cli
eas login
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### iOS IPA
```powershell
# Build IPA (requiere cuenta Apple Developer)
eas build --platform ios --profile preview
```

### Publish to Stores
```powershell
# Play Store
eas submit --platform android

# App Store
eas submit --platform ios
```

---

## 🐛 Troubleshooting

### Error: "Expo Go no puede cargar la app"
```powershell
# Limpiar caché
npm start -- --clear

# Reinstalar dependencias
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: "Permisos de ubicación no funcionan"
- Verificar que el GPS esté activado en el celular
- Verificar permisos en Configuración → Apps → Expo Go → Permisos
- Reiniciar la app después de otorgar permisos

### Error: "Cámara no se abre"
- Verificar permisos de cámara en configuración del dispositivo
- Verificar que la cámara no esté siendo usada por otra app
- Reiniciar Expo Go

---

## 🔄 Próximos Pasos

### Funcionalidades Pendientes

- [ ] Sistema de autenticación (Login/Register)
- [ ] Integración completa con API backend
- [ ] Notificaciones push con Firebase
- [ ] Modo offline con AsyncStorage
- [ ] Sincronización de datos
- [ ] Tests unitarios y E2E
- [ ] Animaciones con React Native Reanimated
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Analytics con Firebase Analytics

### Optimizaciones

- [ ] Lazy loading de pantallas
- [ ] Optimización de imágenes
- [ ] Caché de mapas
- [ ] Reducción del tamaño del bundle
- [ ] Performance profiling

---

## 📚 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

---

## 👥 Equipo de Desarrollo

- **Brandon Sangoluisa** - Desarrollador Full Stack
- **Byron Chuquitarco** - Desarrollador Full Stack
- **Universidad**: ESPE - Escuela Politécnica del Ejército
- **Proyecto**: Tesis de Grado - Sistema de Gestión de Residuos Sólidos
- **Año**: 2024-2025

---

## 📄 Licencia

Este proyecto es parte de una tesis de grado y está destinado para uso de EPAGAL y el Municipio de Latacunga.

---

**¡Mantengamos Latacunga limpia! 🌿♻️🌍**

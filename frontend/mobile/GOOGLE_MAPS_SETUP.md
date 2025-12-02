# Configuración de Google Maps API para Rutas

## Pasos para obtener una API Key de Google Maps

1. **Ve a Google Cloud Console**
   - Visita: https://console.cloud.google.com/

2. **Crea un nuevo proyecto o selecciona uno existente**
   - Haz clic en el selector de proyecto en la parte superior
   - Crea un nuevo proyecto llamado "Latacunga Waste Management"

3. **Habilita las APIs necesarias**
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca y habilita las siguientes APIs:
     - **Maps SDK for Android** (si usas Android)
     - **Maps SDK for iOS** (si usas iOS)
     - **Directions API** (necesaria para trazar rutas)
     - **Geocoding API** (opcional, para convertir direcciones)

4. **Crea una API Key**
   - Ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "Crear credenciales" > "Clave de API"
   - Copia la clave generada

5. **Restringe tu API Key (Recomendado para producción)**
   - Haz clic en la API key recién creada
   - En "Restricciones de aplicación":
     - Para Android: Selecciona "Aplicaciones de Android" y agrega tu package name
     - Para iOS: Selecciona "Aplicaciones de iOS" y agrega tu Bundle ID
   - En "Restricciones de API":
     - Selecciona "Restringir clave" y marca:
       - Directions API
       - Maps SDK for Android
       - Maps SDK for iOS

6. **Configura la facturación**
   - Google Maps requiere una cuenta de facturación vinculada
   - Ve a "Facturación" y vincula o crea una cuenta
   - Nota: Google ofrece $200 USD de crédito mensual gratuito
   - Las rutas cuestan aproximadamente $0.005 por solicitud

7. **Agrega tu API Key al proyecto**
   - Abre `frontend/mobile/src/screens/MapScreen.tsx`
   - Reemplaza la línea:
     ```typescript
     const GOOGLE_MAPS_API_KEY = 'TU_GOOGLE_MAPS_API_KEY_AQUI';
     ```
   - Con tu API key real:
     ```typescript
     const GOOGLE_MAPS_API_KEY = 'AIzaSy...tu-clave-aquí';
     ```

## Alternativa: Usar rutas sin Google Maps API

Si no quieres usar Google Maps API (por costos o limitaciones), puedes:

### Opción 1: Dibujar líneas rectas
- Usa `<Polyline>` de `react-native-maps` para dibujar una línea recta entre tu ubicación y el punto de acopio
- No requiere API key
- No sigue las calles reales

### Opción 2: Usar OpenStreetMap + OSRM
- Servicio gratuito de enrutamiento
- Requiere configurar un servidor OSRM propio o usar el público
- Más complejo pero completamente gratuito

### Opción 3: Integrar con Google Maps externa
- En lugar de dibujar la ruta en el mapa, abre Google Maps nativa
- Código de ejemplo:
```typescript
import { Linking, Platform } from 'react-native';

const openGoogleMaps = (lat: number, lng: number) => {
  const scheme = Platform.select({
    ios: 'maps:0,0?q=',
    android: 'geo:0,0?q='
  });
  const latLng = `${lat},${lng}`;
  const label = 'Punto de Acopio';
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`
  });
  
  Linking.openURL(url!);
};
```

## Costos de Google Maps Directions API

- **$200 USD gratis mensuales** (crédito de Google Cloud)
- Después del crédito: **$5 USD por 1000 solicitudes**
- Para una app municipal pequeña, probablemente nunca excedas el límite gratuito

## Notas importantes

⚠️ **No subas tu API key a GitHub**
- Agrega `GOOGLE_MAPS_SETUP.md` al `.gitignore` una vez agregues tu key real
- O mejor aún, usa variables de entorno con `expo-constants`

✅ **Buenas prácticas**
- Siempre restringe tu API key por aplicación y por API
- Monitorea el uso en Google Cloud Console
- Habilita alertas de facturación para evitar cargos inesperados

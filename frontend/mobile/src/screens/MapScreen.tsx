import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { collectionPointService, CollectionPoint } from '../services/collectionPointService';

// Demo data - Fuera del componente para mejor rendimiento
const collectionPoints: CollectionPoint[] = [];

export default function MapScreen({ navigation, route }: any) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [nearbyPoints, setNearbyPoints] = useState<CollectionPoint[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeMode, setRouteMode] = useState<'foot' | 'car'>('foot'); // foot-walking o car
  const mapRef = useRef<MapView>(null);

  const handleMarkerPress = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setShowRoute(false);
    setRouteCoordinates([]);
  };

  const getRoute = async (start: {latitude: number, longitude: number}, end: {latitude: number, longitude: number}, mode: 'foot' | 'car') => {
    try {
      setIsLoadingRoute(true);
      
      // Para modo a pie: usar perfil 'foot' de OSRM que optimiza para peatones
      // ignorando sentidos de vías pero siguiendo caminos peatonales
      // Para vehículo: usar 'driving' que respeta sentidos y reglas de tránsito
      const profile = mode === 'foot' ? 'foot' : 'driving';
      const url = `https://router.project-osrm.org/route/v1/${profile}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Convertir coordenadas de GeoJSON a formato de React Native Maps
        const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        setRouteCoordinates(coordinates);
        setRouteDistance(`${(route.distance / 1000).toFixed(1)} km`);
        setRouteDuration(`${Math.round(route.duration / 60)} min`);
        setShowRoute(true);
        
        // Ajustar el mapa para mostrar toda la ruta
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 100,
            right: 50,
            bottom: 350,
            left: 50,
          },
          animated: true,
        });
      } else {
        throw new Error('No se pudo encontrar una ruta');
      }
    } catch (error) {
      console.error('Error obteniendo ruta:', error);
      Alert.alert('Error', 'No se pudo trazar la ruta. Intenta nuevamente.');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleNavigate = () => {
    if (selectedPoint && location) {
      getRoute(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        selectedPoint.coordinates,
        routeMode
      );
    } else {
      Alert.alert('Error', 'No se puede trazar la ruta. Verifica tu ubicación.');
    }
  };

  // Efecto para manejar parámetros de navegación
  useEffect(() => {
    if (route?.params?.selectedPointId && nearbyPoints.length > 0) {
      const point = nearbyPoints.find(p => {
        const id = typeof p.id === 'string' ? p.id : p.id.value;
        return id === route.params.selectedPointId;
      });
      if (point) {
        setSelectedPoint(point);
        // Animar el mapa al punto seleccionado
        mapRef.current?.animateToRegion({
          latitude: point.coordinates.latitude,
          longitude: point.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }
    }
  }, [route?.params?.selectedPointId, nearbyPoints]);

  useEffect(() => {
    // Primero mostrar el mapa con ubicación por defecto
    setLoading(false);
    
    // Luego obtener ubicación y cargar puntos cercanos en segundo plano
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación');
          return;
        }

        // Usar ubicación de baja precisión primero para mayor velocidad
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);
        
        // Cargar puntos cercanos desde la API
        const points = await collectionPointService.getNearbyPoints(
          loc.coords.latitude,
          loc.coords.longitude,
          5 // 5 km de radio
        );
        
        setNearbyPoints(points);
        
        // Animar el mapa a la ubicación del usuario
        mapRef.current?.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      } catch (error) {
        console.log('Error obteniendo ubicación o puntos:', error);
        Alert.alert('Error', 'No se pudieron cargar los puntos de acopio');
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: -0.9346,
            longitude: -78.6156,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          showsMyLocationButton
          loadingEnabled
          loadingIndicatorColor={colors.primary[500]}
          moveOnMarkerPress={false}
        >
          {/* Marcador del usuario */}
          {location && (
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={500}
              strokeColor={colors.primary[500]}
              fillColor="rgba(76, 175, 80, 0.2)"
            />
          )}

          {/* Marcadores de puntos de acopio */}
          {nearbyPoints.map((point) => (
            <Marker
              key={typeof point.id === 'string' ? point.id : point.id.value}
              coordinate={point.coordinates}
              onPress={() => handleMarkerPress(point)}
              pinColor={point.status === 'FULL' ? colors.error : colors.primary[500]}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerEmoji}>📍</Text>
              </View>
            </Marker>
          ))}

          {/* Ruta de navegación */}
          {showRoute && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={routeMode === 'foot' ? 3 : 4}
              strokeColor={routeMode === 'foot' ? colors.success : colors.primary[600]}
              lineDashPattern={routeMode === 'foot' ? [10, 10] : undefined}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapView>

        {/* Panel inferior con información */}
        {selectedPoint && (
          <View style={styles.bottomPanel}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedPoint(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.pointInfo}>
              <View style={styles.pointHeader}>
                <Text style={styles.pointLabel}>Punto de Acopio</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: colors.pointStatus[selectedPoint.status.toLowerCase() as keyof typeof colors.pointStatus] }
                ]}>
                  <Text style={styles.statusText}>
                    {selectedPoint.status === 'AVAILABLE' ? 'Disponible' : 'Lleno'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.pointName}>{selectedPoint.name}</Text>
              <Text style={styles.pointAddress}>📍 {selectedPoint.address}</Text>
              
              {/* Selector de modo de transporte */}
              <View style={styles.transportModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    routeMode === 'foot' && styles.modeButtonActive
                  ]}
                  onPress={() => {
                    setRouteMode('foot');
                    if (showRoute) {
                      // Recalcular ruta con nuevo modo
                      setShowRoute(false);
                      setRouteCoordinates([]);
                    }
                  }}
                >
                  <Text style={styles.modeEmoji}>🚶</Text>
                  <Text style={[
                    styles.modeText,
                    routeMode === 'foot' && styles.modeTextActive
                  ]}>A pie</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    routeMode === 'car' && styles.modeButtonActive
                  ]}
                  onPress={() => {
                    setRouteMode('car');
                    if (showRoute) {
                      // Recalcular ruta con nuevo modo
                      setShowRoute(false);
                      setRouteCoordinates([]);
                    }
                  }}
                >
                  <Text style={styles.modeEmoji}>🚗</Text>
                  <Text style={[
                    styles.modeText,
                    routeMode === 'car' && styles.modeTextActive
                  ]}>Vehículo</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.pointStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{routeDistance || '0.5 km'}</Text>
                  <Text style={styles.statLabel}>Distancia</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{routeDuration || '~5 min'}</Text>
                  <Text style={styles.statLabel}>{showRoute ? 'Tiempo' : 'Estimado'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.listButton]}
                onPress={() => navigation.navigate('PointsList')}
              >
                <Text style={styles.buttonText}>📋 Ver Lista</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.directionsButton, isLoadingRoute && styles.buttonDisabled]}
                onPress={handleNavigate}
                disabled={isLoadingRoute}
              >
                {isLoadingRoute ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Text style={[styles.buttonText, styles.buttonTextWhite]}>
                    {showRoute ? '✓ Ruta Activa' : '🧭 Navegar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 95,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    ...shadows.lg,
  },
  pointInfo: {
    marginBottom: spacing.md,
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pointLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  pointName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  pointAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  transportModeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  modeButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  modeEmoji: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  modeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  modeTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
  },
  pointStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  listButton: {
    backgroundColor: colors.neutral[200],
  },
  directionsButton: {
    backgroundColor: colors.primary[500],
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  buttonTextWhite: {
    color: colors.text.inverse,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEmoji: {
    fontSize: 32,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.bold,
  },
});

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
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { collectionPointService, CollectionPoint } from '../services/collectionPointService';
import { routeOptimizationService } from '../services/routeOptimizationService';

// Demo data - Fuera del componente para mejor rendimiento
const collectionPoints: CollectionPoint[] = [];

export default function MapScreen({ navigation, route }: any) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [nearbyPoints, setNearbyPoints] = useState<CollectionPoint[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number, longitude: number }>>([]);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeMode, setRouteMode] = useState<'foot' | 'car'>('foot');
  const mapRef = useRef<MapView>(null);

  const calculateEstimatedTime = (point: CollectionPoint, mode: 'foot' | 'car') => {
    if (!location) return '~5 min';

    try {
      const { distance, duration } = routeOptimizationService.estimateTravelTime(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        point.coordinates,
        mode === 'foot' ? 'on_foot' : 'driving'
      );

      return `${duration} min`;
    } catch (error) {
      console.error('Error calculando tiempo estimado:', error);
      return '~5 min';
    }
  };

  const handleMarkerPress = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setShowRoute(false);
    setRouteCoordinates([]);
    const estimatedTime = calculateEstimatedTime(point, routeMode);
    setRouteDuration(estimatedTime);
  };

  const getRoute = async (start: { latitude: number, longitude: number }, end: { latitude: number, longitude: number }, mode: 'foot' | 'car') => {
    try {
      setIsLoadingRoute(true);

      const profile = mode === 'foot' ? 'foot' : 'driving';
      const url = `https://router.project-osrm.org/route/v1/${profile}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));

        setRouteCoordinates(coordinates);
        setShowRoute(true);

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

  const handleModeChange = (newMode: 'foot' | 'car') => {
    setRouteMode(newMode);
    if (selectedPoint) {
      const estimatedTime = calculateEstimatedTime(selectedPoint, newMode);
      setRouteDuration(estimatedTime);
      if (showRoute) {
        setShowRoute(false);
        setRouteCoordinates([]);
      }
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
        const estimatedTime = calculateEstimatedTime(point, routeMode);
        setRouteDuration(estimatedTime);
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
    setLoading(false);

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);

        const points = await collectionPointService.getNearbyPoints(
          loc.coords.latitude,
          loc.coords.longitude,
          5
        );

        setNearbyPoints(points);

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
                <View style={[
                  styles.markerIcon,
                  point.status === 'FULL' && styles.markerIconFull
                ]}>
                  <Ionicons
                    name="location-sharp"
                    size={24}
                    color="#fff"
                  />
                </View>
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

        {/* Botón "Ver Lista" flotante — esquina superior izquierda */}
        <TouchableOpacity
          style={styles.listFloatingButton}
          onPress={() => navigation.navigate('PointsList')}
          activeOpacity={0.85}
        >
          <Ionicons name="list" size={20} color={colors.primary[700]} />
          <Text style={styles.listFloatingText}>Ver Lista</Text>
        </TouchableOpacity>

        {/* Panel inferior con información */}
        {selectedPoint && (
          <View style={styles.bottomPanel}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPoint(null)}
            >
              <Ionicons name="close" size={20} color={colors.text.secondary} />
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
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.pointAddress}>{selectedPoint.address}</Text>
              </View>

              {/* Selector de modo de transporte */}
              <View style={styles.transportModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    routeMode === 'foot' && styles.modeButtonActive
                  ]}
                  onPress={() => handleModeChange('foot')}
                >
                  <Ionicons
                    name="walk"
                    size={20}
                    color={routeMode === 'foot' ? colors.primary[700] : colors.neutral[500]}
                  />
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
                  onPress={() => handleModeChange('car')}
                >
                  <Ionicons
                    name="car"
                    size={20}
                    color={routeMode === 'car' ? colors.primary[700] : colors.neutral[500]}
                  />
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
                style={[styles.actionButton, styles.directionsButton, isLoadingRoute && styles.buttonDisabled]}
                onPress={handleNavigate}
                disabled={isLoadingRoute}
              >
                {isLoadingRoute ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <View style={styles.navButtonContent}>
                    <Ionicons
                      name={showRoute ? 'checkmark-circle' : 'navigate'}
                      size={20}
                      color={colors.text.inverse}
                    />
                    <Text style={[styles.buttonText, styles.buttonTextWhite]}>
                      {showRoute ? 'Ruta Activa' : 'Navegar'}
                    </Text>
                  </View>
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
  // Floating "Ver Lista" Button — top-left corner
  listFloatingButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    ...shadows.md,
    elevation: 5,
  },
  listFloatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[700],
  },
  // Markers
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.sm,
  },
  markerIconFull: {
    backgroundColor: colors.error,
  },
  // Bottom Panel
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  pointAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
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
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
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
  directionsButton: {
    backgroundColor: colors.primary[500],
  },
  navButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});

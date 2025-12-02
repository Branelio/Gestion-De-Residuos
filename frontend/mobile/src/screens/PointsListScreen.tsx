import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { collectionPointService, CollectionPoint } from '../services/collectionPointService';

export default function PointsListScreen({ navigation }: any) {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const loadPoints = async () => {
    try {
      // Obtener ubicación actual
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);

        // Cargar puntos cercanos (radio de 50km para mostrar todos en Latacunga)
        const nearbyPoints = await collectionPointService.getNearbyPoints(
          loc.coords.latitude,
          loc.coords.longitude,
          50
        );
        setPoints(nearbyPoints);
      } else {
        // Si no hay permisos, cargar todos los puntos sin orden
        const allPoints = await collectionPointService.getAllPoints();
        setPoints(allPoints);
      }
    } catch (error) {
      console.error('Error cargando puntos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPoints();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'FULL':
        return 'Lleno';
      case 'MAINTENANCE':
        return 'Mantenimiento';
      case 'OUT_OF_SERVICE':
        return 'Fuera de Servicio';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return colors.success;
      case 'FULL':
        return colors.error;
      case 'MAINTENANCE':
        return colors.warning;
      case 'OUT_OF_SERVICE':
        return colors.neutral[400];
      default:
        return colors.neutral[400];
    }
  };

  const renderPoint = ({ item, index }: { item: CollectionPoint; index: number }) => {
    const pointId = typeof item.id === 'string' ? item.id : item.id.value;
    
    return (
      <TouchableOpacity
        style={styles.pointCard}
        onPress={() => {
          // Navegar de vuelta al mapa y cerrar la lista
          navigation.goBack();
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.pointName} numberOfLines={2}>
              {item.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.pointAddress} numberOfLines={2}>
          📍 {item.address}
        </Text>

        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>
            📏 {location ? 'Calculando distancia...' : 'Ver en mapa'}
          </Text>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Cargando puntos de acopio...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Puntos de Acopio</Text>
          <Text style={styles.subtitle}>
            {points.length} {points.length === 1 ? 'punto' : 'puntos'} disponibles
          </Text>
        </View>

        <FlatList
          data={points}
          renderItem={renderPoint}
          keyExtractor={(item) =>
            typeof item.id === 'string' ? item.id : item.id.value
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[500]]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No se encontraron puntos de acopio
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backText: {
    fontSize: typography.fontSize.md,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.md,
  },
  pointCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  indexText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pointName: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
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
  pointAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginLeft: 40, // Alineado con el nombre (32px badge + 8px margin)
  },
  distanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 40,
  },
  distanceText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  arrowText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[600],
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

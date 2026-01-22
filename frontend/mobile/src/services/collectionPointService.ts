import { httpClient } from './httpClient';
import {
  routeOptimizationService,
  OptimizedRoute,
  CollectionPointWithDistance,
  Coordinate,
} from './routeOptimizationService';

/**
 * Interfaces para las respuestas de la API
 */
export interface CollectionPoint {
  id: { value: string } | string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  capacity: number;
  currentLoad: number;
  fillPercentage: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
}

export interface CollectionPointsResponse {
  success: boolean;
  data: CollectionPoint[];
  count: number;
}

export interface NearbyPointsResponse extends CollectionPointsResponse {
  searchRadius: number;
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface CollectionPointResponse {
  success: boolean;
  data: CollectionPoint;
}

export interface StatsResponse {
  total: number;
  available: number;
  full: number;
  totalCapacity: number;
  totalLoad: number;
  averageFillPercentage: number;
}

export interface OptimizedRouteResponse {
  success: boolean;
  data: {
    optimizedWaypoints: Array<{
      collectionPointId: string;
      order: number;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    }>;
    totalDistance: number;
    estimatedDuration: number;
    estimatedFuelConsumption: number;
    optimizationPercentage: number;
    pointsProcessed?: number;
  };
}

/**
 * Servicio para interactuar con la API de Puntos de Acopio
 */
class CollectionPointService {
  /**
   * Obtener todos los puntos de acopio
   */
  async getAllPoints(): Promise<CollectionPoint[]> {
    try {
      const response = await httpClient.get<CollectionPoint[]>('/api/collection-points');
      console.log('📊 getAllPoints response:', response);
      return response;
    } catch (error) {
      console.error('Error getting all points:', error);
      throw error;
    }
  }

  /**
   * Buscar puntos de acopio cercanos
   */
  async getNearbyPoints(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<CollectionPoint[]> {
    try {
      const response = await httpClient.get<CollectionPoint[]>(
        `/api/collection-points/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`
      );
      console.log('📍 getNearbyPoints response:', response);
      return response;
    } catch (error) {
      console.error('Error getting nearby points:', error);
      throw error;
    }
  }

  /**
   * Obtener un punto de acopio por ID
   */
  async getPointById(id: string): Promise<CollectionPoint> {
    try {
      const response = await httpClient.get<CollectionPoint>(
        `/api/collection-points/${id}`
      );
      console.log('🎯 getPointById response:', response);
      return response;
    } catch (error) {
      console.error('Error obteniendo punto de acopio:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales
   */
  async getStats(): Promise<StatsResponse> {
    try {
      const response = await httpClient.get<StatsResponse>(
        '/api/collection-points/stats/summary'
      );
      console.log('📈 getStats full response:', response);
      return response;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Optimizar ruta de recolección con puntos específicos
   */
  async optimizeRoute(
    startLocation: { latitude: number; longitude: number },
    collectionPointIds: string[],
    returnToStart: boolean = true
  ): Promise<OptimizedRouteResponse['data']> {
    try {
      const response = await httpClient.post<OptimizedRouteResponse['data']>(
        '/api/routes/optimize',
        {
          startLocation,
          collectionPointIds,
          returnToStart,
        }
      );
      return response;
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      throw error;
    }
  }

  /**
   * Optimizar ruta con puntos cercanos
   */
  async optimizeNearbyRoute(
    startLocation: { latitude: number; longitude: number },
    radius: number = 10,
    maxPoints: number = 10,
    returnToStart: boolean = true
  ): Promise<OptimizedRouteResponse['data']> {
    try {
      const response = await httpClient.post<OptimizedRouteResponse['data']>(
        '/api/routes/optimize-nearby',
        {
          startLocation,
          radius,
          maxPoints,
          returnToStart,
        }
      );
      return response;
    } catch (error) {
      console.error('Error optimizando ruta cercana:', error);
      throw error;
    }
  }

  /**
   * Obtener estimaciones para una distancia
   */
  async getEstimates(distanceKm: number): Promise<{
    distance: number;
    estimatedDuration: number;
    estimatedFuelConsumption: number;
    estimatedCost: number;
    averageSpeed: number;
  }> {
    try {
      const response = await httpClient.get<{
        distance: number;
        estimatedDuration: number;
        estimatedFuelConsumption: number;
        estimatedCost: number;
        averageSpeed: number;
      }>(
        `/api/routes/estimate?distance=${distanceKm}`
      );
      return response;
    } catch (error) {
      console.error('Error obteniendo estimaciones:', error);
      throw error;
    }
  }

  /**
   * Optimizar ruta de recolección
   */
  async optimizeCollectionRoute(
    userLocation: Coordinate,
    points: CollectionPoint[]
  ): Promise<OptimizedRoute> {
    try {
      const normalizedPoints = points.map((p) => ({
        id: typeof p.id === 'string' ? p.id : p.id.value,
        name: p.name,
        coordinates: p.coordinates,
        fillPercentage: p.fillPercentage,
        status: p.status.toLowerCase(),
      }));

      const optimizedRoute = routeOptimizationService.optimizeRoute(
        userLocation,
        normalizedPoints
      );

      console.log('🗺️ Ruta optimizada:', optimizedRoute);
      return optimizedRoute;
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      throw error;
    }
  }

  /**
   * Obtener puntos ordenados por distancia
   */
  orderPointsByDistance(
    userLocation: Coordinate,
    points: CollectionPoint[]
  ): CollectionPointWithDistance[] {
    const normalizedPoints = points.map((p) => ({
      id: typeof p.id === 'string' ? p.id : p.id.value,
      name: p.name,
      coordinates: p.coordinates,
      fillPercentage: p.fillPercentage,
      status: p.status.toLowerCase(),
    }));

    return routeOptimizationService.orderPointsByDistance(
      userLocation,
      normalizedPoints
    );
  }

  /**
   * Obtener puntos priorizados por disponibilidad y distancia
   */
  prioritizePoints(
    userLocation: Coordinate,
    points: CollectionPoint[],
    prioritizeAvailable: boolean = true
  ): CollectionPointWithDistance[] {
    const normalizedPoints = points.map((p) => ({
      id: typeof p.id === 'string' ? p.id : p.id.value,
      name: p.name,
      coordinates: p.coordinates,
      fillPercentage: p.fillPercentage,
      status: p.status.toLowerCase(),
    }));

    return routeOptimizationService.prioritizePoints(
      userLocation,
      normalizedPoints,
      prioritizeAvailable
    );
  }

  /**
   * Estimar tiempo de viaje entre dos puntos
   */
  estimateTravelTime(
    from: Coordinate,
    to: Coordinate,
    mode: 'on_foot' | 'driving' | 'cycling' = 'driving'
  ): { distance: number; duration: number } {
    return routeOptimizationService.estimateTravelTime(from, to, mode);
  }

  /**
   * Obtener modos de transporte disponibles
   */
  getTransportModes() {
    return routeOptimizationService.getTransportModes();
  }
}

// Instancia singleton del servicio
export const collectionPointService = new CollectionPointService();

// Exportar también la clase para testing
export default CollectionPointService;

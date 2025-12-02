// Application Layer - Use Case
// Caso de uso: Optimizar ruta de recolección

import { CollectionPointRepository } from '@domain/repositories/CollectionPointRepository';
import { CollectionRouteRepository } from '@domain/repositories/CollectionRouteRepository';
import { RouteOptimizationService } from '@domain/services/RouteOptimizationService';
import { CollectionRoute } from '@domain/entities/CollectionRoute';
import { Coordinates } from '@domain/entities/CollectionPoint';

export interface OptimizeRouteRequest {
  startLatitude: number;
  startLongitude: number;
  collectionPointIds: string[];
  vehicleId: string;
  driverId: string;
  scheduledDate: Date;
  routeName?: string;
}

export interface OptimizeRouteResponse {
  success: boolean;
  data?: {
    routeId: string;
    totalDistance: number;
    estimatedDuration: number;
    estimatedFuelConsumption: number;
    optimizationPercentage: number;
    waypoints: Array<{
      collectionPointId: string;
      order: number;
      coordinates: Coordinates;
    }>;
  };
  error?: string;
}

export class OptimizeCollectionRouteUseCase {
  constructor(
    private readonly collectionPointRepository: CollectionPointRepository,
    private readonly routeRepository: CollectionRouteRepository,
    private readonly optimizationService: RouteOptimizationService,
  ) {}

  async execute(request: OptimizeRouteRequest): Promise<OptimizeRouteResponse> {
    try {
      // Validar que hay puntos de recolección
      if (!request.collectionPointIds || request.collectionPointIds.length < 2) {
        return {
          success: false,
          error: 'At least 2 collection points are required',
        };
      }

      // Obtener los puntos de recolección
      const points = await Promise.all(
        request.collectionPointIds.map((id) =>
          this.collectionPointRepository.findById({ value: id }),
        ),
      );

      // Filtrar puntos nulos
      const validPoints = points.filter((p) => p !== null);

      if (validPoints.length !== request.collectionPointIds.length) {
        return {
          success: false,
          error: 'One or more collection points not found',
        };
      }

      // Preparar datos para optimización
      const startPoint: Coordinates = {
        latitude: request.startLatitude,
        longitude: request.startLongitude,
      };

      const pointsToOptimize = validPoints.map((point) => ({
        id: point!.id.value,
        coordinates: point!.coordinates,
      }));

      // Optimizar la ruta
      const optimization = this.optimizationService.optimizeRoute(
        startPoint,
        pointsToOptimize,
        true, // Retornar al punto de inicio
      );

      // Crear la ruta optimizada
      const routeName =
        request.routeName || `Route ${new Date().toISOString().split('T')[0]}`;

      const route = CollectionRoute.create({
        name: routeName,
        waypoints: optimization.optimizedWaypoints,
        totalDistance: optimization.totalDistance,
        estimatedDuration: optimization.estimatedDuration,
        estimatedFuelConsumption: optimization.estimatedFuelConsumption,
        vehicleId: request.vehicleId,
        driverId: request.driverId,
        scheduledDate: request.scheduledDate,
      });

      // Guardar la ruta
      await this.routeRepository.save(route);

      return {
        success: true,
        data: {
          routeId: route.id.value,
          totalDistance: optimization.totalDistance,
          estimatedDuration: optimization.estimatedDuration,
          estimatedFuelConsumption: optimization.estimatedFuelConsumption,
          optimizationPercentage: optimization.optimizationPercentage,
          waypoints: optimization.optimizedWaypoints,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize route',
      };
    }
  }
}

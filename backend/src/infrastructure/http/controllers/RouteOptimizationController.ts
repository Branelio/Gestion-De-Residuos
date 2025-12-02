import { Request, Response } from 'express';
import { MongoCollectionPointRepository } from '../../repositories/MongoCollectionPointRepository';
import { RouteOptimizationService } from '../../../domain/services/RouteOptimizationService';

/**
 * Controller para optimización de rutas de recolección
 */
export class RouteOptimizationController {
  private repository: MongoCollectionPointRepository;
  private optimizationService: RouteOptimizationService;

  constructor() {
    this.repository = new MongoCollectionPointRepository();
    this.optimizationService = new RouteOptimizationService();
  }

  /**
   * POST /api/routes/optimize
   * Optimiza una ruta de recolección
   * 
   * Body: {
   *   startLocation: { latitude: number, longitude: number },
   *   collectionPointIds: string[],
   *   returnToStart: boolean
   * }
   */
  async optimizeRoute(req: Request, res: Response): Promise<void> {
    try {
      const { startLocation, collectionPointIds, returnToStart } = req.body;

      // Validar datos de entrada
      if (!startLocation || !startLocation.latitude || !startLocation.longitude) {
        res.status(400).json({
          success: false,
          error: 'Se requiere startLocation con latitude y longitude',
        });
        return;
      }

      if (!Array.isArray(collectionPointIds) || collectionPointIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Se requiere un array de collectionPointIds',
        });
        return;
      }

      // Obtener los puntos de acopio solicitados
      const points = [];
      for (const id of collectionPointIds) {
        const point = await this.repository.findById(id);
        if (point) {
          points.push({
            id: point.id.value,
            coordinates: point.coordinates,
          });
        }
      }

      if (points.length === 0) {
        res.status(404).json({
          success: false,
          error: 'No se encontraron puntos de acopio válidos',
        });
        return;
      }

      // Optimizar la ruta
      const result = this.optimizationService.optimizeRoute(
        startLocation,
        points,
        returnToStart !== false // Por defecto true
      );

      res.json({
        success: true,
        data: {
          optimizedWaypoints: result.optimizedWaypoints,
          totalDistance: result.totalDistance,
          estimatedDuration: result.estimatedDuration,
          estimatedFuelConsumption: result.estimatedFuelConsumption,
          optimizationPercentage: result.optimizationPercentage,
          pointsProcessed: points.length,
        },
      });
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al optimizar ruta',
      });
    }
  }

  /**
   * POST /api/routes/optimize-nearby
   * Optimiza una ruta con los puntos cercanos a una ubicación
   * 
   * Body: {
   *   startLocation: { latitude: number, longitude: number },
   *   radius: number (opcional, default: 10km),
   *   maxPoints: number (opcional, default: 10),
   *   returnToStart: boolean
   * }
   */
  async optimizeNearbyRoute(req: Request, res: Response): Promise<void> {
    try {
      const { startLocation, radius, maxPoints, returnToStart } = req.body;

      // Validar datos de entrada
      if (!startLocation || !startLocation.latitude || !startLocation.longitude) {
        res.status(400).json({
          success: false,
          error: 'Se requiere startLocation con latitude y longitude',
        });
        return;
      }

      const radiusKm = radius || 10;
      const limit = maxPoints || 10;

      // Buscar puntos cercanos
      const nearbyPoints = await this.repository.findNearby(
        startLocation,
        radiusKm
      );

      if (nearbyPoints.length === 0) {
        res.status(404).json({
          success: false,
          error: `No se encontraron puntos de acopio en un radio de ${radiusKm}km`,
        });
        return;
      }

      // Limitar cantidad de puntos
      const pointsToOptimize = nearbyPoints
        .slice(0, limit)
        .map(point => ({
          id: point.id.value,
          coordinates: point.coordinates,
        }));

      // Optimizar la ruta
      const result = this.optimizationService.optimizeRoute(
        startLocation,
        pointsToOptimize,
        returnToStart !== false
      );

      res.json({
        success: true,
        data: {
          optimizedWaypoints: result.optimizedWaypoints,
          totalDistance: result.totalDistance,
          estimatedDuration: result.estimatedDuration,
          estimatedFuelConsumption: result.estimatedFuelConsumption,
          optimizationPercentage: result.optimizationPercentage,
          pointsProcessed: pointsToOptimize.length,
          pointsAvailable: nearbyPoints.length,
          searchRadius: radiusKm,
        },
      });
    } catch (error) {
      console.error('Error optimizando ruta cercana:', error);
      res.status(500).json({
        success: false,
        error: 'Error al optimizar ruta',
      });
    }
  }

  /**
   * GET /api/routes/estimate?distance=10.5
   * Calcula estimaciones para una distancia dada
   */
  async getEstimates(req: Request, res: Response): Promise<void> {
    try {
      const { distance } = req.query;

      if (!distance) {
        res.status(400).json({
          success: false,
          error: 'Se requiere parámetro distance',
        });
        return;
      }

      const distanceKm = parseFloat(distance as string);

      if (isNaN(distanceKm) || distanceKm < 0) {
        res.status(400).json({
          success: false,
          error: 'Distancia inválida',
        });
        return;
      }

      const AVERAGE_SPEED_KM_H = 30;
      const FUEL_CONSUMPTION_PER_KM = 0.15;

      const estimatedDuration = Math.ceil((distanceKm / AVERAGE_SPEED_KM_H) * 60);
      const estimatedFuelConsumption = Math.round(distanceKm * FUEL_CONSUMPTION_PER_KM * 100) / 100;
      const estimatedCost = Math.round(estimatedFuelConsumption * 2.5 * 100) / 100; // $2.50 por galón aprox

      res.json({
        success: true,
        data: {
          distance: distanceKm,
          estimatedDuration,
          estimatedFuelConsumption,
          estimatedCost,
          averageSpeed: AVERAGE_SPEED_KM_H,
        },
      });
    } catch (error) {
      console.error('Error calculando estimaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al calcular estimaciones',
      });
    }
  }
}

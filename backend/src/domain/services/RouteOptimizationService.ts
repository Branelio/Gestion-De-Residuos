// Domain Layer - Route Optimization Service
// Servicio para optimización de rutas de recolección

import { Coordinates } from '../entities/CollectionPoint';
import { Waypoint } from '../entities/CollectionRoute';
import { GeolocationService } from './GeolocationService';

export interface OptimizationResult {
  optimizedWaypoints: Waypoint[];
  totalDistance: number;
  estimatedDuration: number; // minutos
  estimatedFuelConsumption: number; // litros
  optimizationPercentage: number; // % de mejora
}

export class RouteOptimizationService {
  private readonly geolocationService: GeolocationService;
  private readonly AVERAGE_SPEED_KM_H = 30; // Velocidad promedio en ciudad
  private readonly FUEL_CONSUMPTION_PER_KM = 0.15; // Litros por km

  constructor() {
    this.geolocationService = new GeolocationService();
  }

  /**
   * Optimiza una ruta usando algoritmo de vecino más cercano
   * Similar al Traveling Salesman Problem (TSP)
   */
  optimizeRoute(
    startPoint: Coordinates,
    collectionPoints: Array<{ id: string; coordinates: Coordinates }>,
    returnToStart: boolean = true,
  ): OptimizationResult {
    if (collectionPoints.length === 0) {
      throw new Error('Cannot optimize empty route');
    }

    // Calcular distancia original sin optimización
    const originalDistance = this.calculateTotalDistance(
      startPoint,
      collectionPoints.map((p) => p.coordinates),
      returnToStart,
    );

    // Algoritmo del vecino más cercano (Nearest Neighbor)
    const optimizedOrder = this.nearestNeighborAlgorithm(startPoint, collectionPoints);

    // Calcular distancia optimizada
    const optimizedDistance = this.calculateTotalDistance(
      startPoint,
      optimizedOrder.map((p) => p.coordinates),
      returnToStart,
    );

    // Crear waypoints con orden optimizado
    const optimizedWaypoints: Waypoint[] = optimizedOrder.map((point, index) => ({
      collectionPointId: point.id,
      order: index + 1,
      coordinates: point.coordinates,
    }));

    const estimatedDuration = this.calculateDuration(optimizedDistance);
    const estimatedFuelConsumption = this.calculateFuelConsumption(optimizedDistance);
    const optimizationPercentage =
      ((originalDistance - optimizedDistance) / originalDistance) * 100;

    return {
      optimizedWaypoints,
      totalDistance: optimizedDistance,
      estimatedDuration,
      estimatedFuelConsumption,
      optimizationPercentage,
    };
  }

  /**
   * Algoritmo del vecino más cercano para optimización
   */
  private nearestNeighborAlgorithm(
    start: Coordinates,
    points: Array<{ id: string; coordinates: Coordinates }>,
  ): Array<{ id: string; coordinates: Coordinates }> {
    const unvisited = [...points];
    const route: Array<{ id: string; coordinates: Coordinates }> = [];
    let current = start;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = this.geolocationService.calculateDistance(
        current,
        unvisited[0].coordinates,
      );

      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.geolocationService.calculateDistance(
          current,
          unvisited[i].coordinates,
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      const nearest = unvisited[nearestIndex];
      route.push(nearest);
      current = nearest.coordinates;
      unvisited.splice(nearestIndex, 1);
    }

    return route;
  }

  /**
   * Calcula la distancia total de una ruta
   */
  private calculateTotalDistance(
    start: Coordinates,
    points: Coordinates[],
    returnToStart: boolean,
  ): number {
    let total = 0;
    let current = start;

    for (const point of points) {
      total += this.geolocationService.calculateDistance(current, point);
      current = point;
    }

    if (returnToStart) {
      total += this.geolocationService.calculateDistance(current, start);
    }

    return Math.round(total * 100) / 100;
  }

  /**
   * Calcula la duración estimada en minutos
   */
  private calculateDuration(distanceKm: number): number {
    const hours = distanceKm / this.AVERAGE_SPEED_KM_H;
    return Math.ceil(hours * 60);
  }

  /**
   * Calcula el consumo de combustible estimado
   */
  private calculateFuelConsumption(distanceKm: number): number {
    return Math.round(distanceKm * this.FUEL_CONSUMPTION_PER_KM * 100) / 100;
  }

  /**
   * Estima el ahorro en combustible comparando rutas
   */
  calculateFuelSavings(originalDistance: number, optimizedDistance: number): number {
    const originalFuel = this.calculateFuelConsumption(originalDistance);
    const optimizedFuel = this.calculateFuelConsumption(optimizedDistance);
    return Math.round((originalFuel - optimizedFuel) * 100) / 100;
  }
}

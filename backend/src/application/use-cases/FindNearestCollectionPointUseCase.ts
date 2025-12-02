// Application Layer - Use Case
// Caso de uso: Encontrar el punto de acopio más cercano

import { CollectionPointRepository } from '@domain/repositories/CollectionPointRepository';
import { GeolocationService } from '@domain/services/GeolocationService';
import { Coordinates } from '@domain/entities/CollectionPoint';

export interface FindNearestPointRequest {
  userLatitude: number;
  userLongitude: number;
  radiusKm?: number;
  includeFullPoints?: boolean;
}

export interface FindNearestPointResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    type: string;
    address: string;
    coordinates: Coordinates;
    distance: number;
    fillPercentage: number;
    status: string;
    isRural: boolean;
  };
  error?: string;
}

export class FindNearestCollectionPointUseCase {
  constructor(
    private readonly collectionPointRepository: CollectionPointRepository,
    private readonly geolocationService: GeolocationService,
  ) {}

  async execute(request: FindNearestPointRequest): Promise<FindNearestPointResponse> {
    try {
      const userLocation: Coordinates = {
        latitude: request.userLatitude,
        longitude: request.userLongitude,
      };

      // Validar coordenadas
      if (!this.geolocationService.areValidCoordinates(userLocation)) {
        return {
          success: false,
          error: 'Invalid coordinates provided',
        };
      }

      // Obtener puntos cercanos dentro del radio
      const radiusKm = request.radiusKm || 10; // Radio por defecto: 10 km
      let points = await this.collectionPointRepository.findNearby(userLocation, radiusKm);

      // Filtrar puntos llenos si el usuario no quiere verlos
      if (!request.includeFullPoints) {
        points = points.filter((point) => !point.isFull());
      }

      if (points.length === 0) {
        return {
          success: false,
          error: 'No collection points found within the specified radius',
        };
      }

      // Encontrar el más cercano
      const nearestWithDistance = this.geolocationService.findNearestPoint(userLocation, points);

      if (!nearestWithDistance) {
        return {
          success: false,
          error: 'Unable to calculate nearest point',
        };
      }

      return {
        success: true,
        data: {
          id: nearestWithDistance.id.value,
          name: nearestWithDistance.name,
          type: nearestWithDistance.type,
          address: nearestWithDistance.address,
          coordinates: nearestWithDistance.coordinates,
          distance: nearestWithDistance.distance,
          fillPercentage: nearestWithDistance.fillPercentage,
          status: nearestWithDistance.status,
          isRural: nearestWithDistance.isRural,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

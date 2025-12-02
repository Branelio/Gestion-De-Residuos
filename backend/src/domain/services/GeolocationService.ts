// Domain Layer - Geolocation Service
// Servicio para cálculos de geolocalización y distancias

import { Coordinates } from '../entities/CollectionPoint';

export interface NearbyPoint {
  id: string;
  name: string;
  coordinates: Coordinates;
  distance: number; // En km
}

export class GeolocationService {
  /**
   * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
   * @param coord1 Primera coordenada
   * @param coord2 Segunda coordenada
   * @returns Distancia en kilómetros
   */
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(coord2.latitude - coord1.latitude);
    const dLon = this.toRad(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.latitude)) *
        Math.cos(this.toRad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Encuentra el punto más cercano a una ubicación dada
   * @param userLocation Ubicación del usuario
   * @param points Lista de puntos para evaluar
   * @returns El punto más cercano con su distancia
   */
  findNearestPoint<T extends { coordinates: Coordinates }>(
    userLocation: Coordinates,
    points: T[],
  ): (T & { distance: number }) | null {
    if (points.length === 0) return null;

    let nearest = points[0];
    let minDistance = this.calculateDistance(userLocation, nearest.coordinates);

    for (const point of points) {
      const distance = this.calculateDistance(userLocation, point.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }

    return { ...nearest, distance: minDistance };
  }

  /**
   * Filtra puntos dentro de un radio específico
   * @param userLocation Ubicación del usuario
   * @param points Lista de puntos
   * @param radiusKm Radio en kilómetros
   * @returns Puntos dentro del radio ordenados por distancia
   */
  findPointsWithinRadius<T extends { coordinates: Coordinates }>(
    userLocation: Coordinates,
    points: T[],
    radiusKm: number,
  ): (T & { distance: number })[] {
    const pointsWithDistance = points
      .map((point) => ({
        ...point,
        distance: this.calculateDistance(userLocation, point.coordinates),
      }))
      .filter((point) => point.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return pointsWithDistance;
  }

  /**
   * Valida si unas coordenadas son válidas
   */
  areValidCoordinates(coordinates: Coordinates): boolean {
    return (
      coordinates.latitude >= -90 &&
      coordinates.latitude <= 90 &&
      coordinates.longitude >= -180 &&
      coordinates.longitude <= 180
    );
  }

  /**
   * Calcula el centro geográfico de múltiples puntos
   */
  calculateCentroid(coordinates: Coordinates[]): Coordinates {
    if (coordinates.length === 0) {
      throw new Error('Cannot calculate centroid of empty array');
    }

    const sum = coordinates.reduce(
      (acc, coord) => ({
        latitude: acc.latitude + coord.latitude,
        longitude: acc.longitude + coord.longitude,
      }),
      { latitude: 0, longitude: 0 },
    );

    return {
      latitude: sum.latitude / coordinates.length,
      longitude: sum.longitude / coordinates.length,
    };
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

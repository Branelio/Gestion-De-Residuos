/**
 * Servicio de Optimización de Rutas
 * Calcula rutas óptimas, distancias y tiempos de viaje
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface CollectionPointWithDistance {
  id: string;
  name: string;
  coordinates: Coordinate;
  distance: number; // en km
  durationOnFoot: number; // en minutos
  durationByVehicle: number; // en minutos
  fillPercentage: number;
  status: 'available' | 'full' | 'maintenance';
}

export interface OptimizedRoute {
  points: CollectionPointWithDistance[];
  totalDistance: number;
  totalDurationOnFoot: number;
  totalDurationByVehicle: number;
  nearestPoint: CollectionPointWithDistance | null;
}

export interface TransportMode {
  mode: 'on_foot' | 'driving' | 'cycling';
  label: string;
  speedKmH: number; // velocidad promedio en km/h
  color: string;
}

class RouteOptimizationService {
  private transportModes: Record<string, TransportMode> = {
    on_foot: {
      mode: 'on_foot',
      label: 'A pie',
      speedKmH: 5, // Velocidad promedio a pie: 5 km/h
      color: '#FF6B6B',
    },
    driving: {
      mode: 'driving',
      label: 'Vehículo',
      speedKmH: 30, // Velocidad promedio en ciudad: 30 km/h
      color: '#4CAF50',
    },
    cycling: {
      mode: 'cycling',
      label: 'Bicicleta',
      speedKmH: 15, // Velocidad promedio en bicicleta: 15 km/h
      color: '#2196F3',
    },
  };

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   * Retorna la distancia en kilómetros
   */
  private calculateDistance(
    coord1: Coordinate,
    coord2: Coordinate
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat =
      ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon =
      ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Redondear a 1 decimal
  }

  /**
   * Calcula el tiempo de viaje en minutos basado en la distancia y velocidad
   */
  private calculateDuration(
    distanceKm: number,
    speedKmH: number
  ): number {
    const hours = distanceKm / speedKmH;
    const minutes = Math.round(hours * 60);
    return Math.max(minutes, 1); // Mínimo 1 minuto
  }

  /**
   * Ordena los puntos cercanos por distancia desde la ubicación actual
   */
  public orderPointsByDistance(
    userLocation: Coordinate,
    points: Array<any>
  ): CollectionPointWithDistance[] {
    return points
      .map((point) => {
        const distance = this.calculateDistance(
          userLocation,
          point.coordinates
        );

        return {
          id: point.id,
          name: point.name,
          coordinates: point.coordinates,
          distance,
          durationOnFoot: this.calculateDuration(
            distance,
            this.transportModes.on_foot.speedKmH
          ),
          durationByVehicle: this.calculateDuration(
            distance,
            this.transportModes.driving.speedKmH
          ),
          fillPercentage: point.fillPercentage || 0,
          status: point.status || 'available',
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Optimiza una ruta visitando todos los puntos en el orden más eficiente
   * Usa un algoritmo simple de vecino más cercano
   */
  public optimizeRoute(
    userLocation: Coordinate,
    points: Array<any>
  ): OptimizedRoute {
    if (points.length === 0) {
      return {
        points: [],
        totalDistance: 0,
        totalDurationOnFoot: 0,
        totalDurationByVehicle: 0,
        nearestPoint: null,
      };
    }

    // Ordenar por distancia inicial
    const pointsWithDistance = this.orderPointsByDistance(
      userLocation,
      points
    );

    const nearestPoint = pointsWithDistance[0];

    // Algoritmo del Vecino Más Cercano (Nearest Neighbor)
    const optimizedPoints: CollectionPointWithDistance[] = [];
    let currentLocation = userLocation;
    const remainingPoints = [...pointsWithDistance];

    while (remainingPoints.length > 0) {
      // Encontrar el punto más cercano a la ubicación actual
      let nearestIndex = 0;
      let minDistance = this.calculateDistance(
        currentLocation,
        remainingPoints[0].coordinates
      );

      for (let i = 1; i < remainingPoints.length; i++) {
        const dist = this.calculateDistance(
          currentLocation,
          remainingPoints[i].coordinates
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }

      // Agregar el punto más cercano a la ruta optimizada
      const nextPoint = remainingPoints[nearestIndex];
      optimizedPoints.push(nextPoint);
      currentLocation = nextPoint.coordinates;

      // Remover del conjunto de puntos disponibles
      remainingPoints.splice(nearestIndex, 1);
    }

    // Calcular distancias y tiempos totales
    let totalDistance = this.calculateDistance(
      userLocation,
      optimizedPoints[0].coordinates
    );

    for (let i = 0; i < optimizedPoints.length - 1; i++) {
      totalDistance += this.calculateDistance(
        optimizedPoints[i].coordinates,
        optimizedPoints[i + 1].coordinates
      );
    }

    // Agregar distancia de retorno al punto de inicio
    if (optimizedPoints.length > 0) {
      totalDistance += this.calculateDistance(
        optimizedPoints[optimizedPoints.length - 1].coordinates,
        userLocation
      );
    }

    const totalDurationOnFoot = this.calculateDuration(
      totalDistance,
      this.transportModes.on_foot.speedKmH
    );

    const totalDurationByVehicle = this.calculateDuration(
      totalDistance,
      this.transportModes.driving.speedKmH
    );

    return {
      points: optimizedPoints,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalDurationOnFoot,
      totalDurationByVehicle,
      nearestPoint,
    };
  }

  /**
   * Obtiene los modos de transporte disponibles
   */
  public getTransportModes(): TransportMode[] {
    return Object.values(this.transportModes);
  }

  /**
   * Obtiene información de un modo de transporte específico
   */
  public getTransportMode(mode: string): TransportMode | null {
    return this.transportModes[mode] || null;
  }

  /**
   * Calcula el tiempo estimado de viaje entre dos puntos
   */
  public estimateTravelTime(
    from: Coordinate,
    to: Coordinate,
    mode: 'on_foot' | 'driving' | 'cycling' = 'driving'
  ): { distance: number; duration: number } {
    const distance = this.calculateDistance(from, to);
    const transportMode =
      this.transportModes[mode] ||
      this.transportModes.driving;
    const duration = this.calculateDuration(
      distance,
      transportMode.speedKmH
    );

    return { distance, duration };
  }

  /**
   * Ordena puntos por prioridad (disponibilidad y cercanía)
   */
  public prioritizePoints(
    userLocation: Coordinate,
    points: Array<any>,
    prioritizeAvailable: boolean = true
  ): CollectionPointWithDistance[] {
    const pointsWithDistance = this.orderPointsByDistance(
      userLocation,
      points
    );

    if (!prioritizeAvailable) {
      return pointsWithDistance;
    }

    // Separar puntos disponibles y no disponibles
    const available = pointsWithDistance.filter(
      (p) => p.status === 'available' && p.fillPercentage < 80
    );
    const notAvailable = pointsWithDistance.filter(
      (p) => p.status !== 'available' || p.fillPercentage >= 80
    );

    return [...available, ...notAvailable];
  }
}

export const routeOptimizationService = new RouteOptimizationService();
export default routeOptimizationService;

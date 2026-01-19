// Tests para GeolocationService
// Validación de cálculos de distancia, búsqueda de puntos cercanos y validaciones

import { GeolocationService } from '@domain/services/GeolocationService';
import { Coordinates } from '@domain/entities/CollectionPoint';

describe('GeolocationService', () => {
  let geolocationService: GeolocationService;

  beforeEach(() => {
    geolocationService = new GeolocationService();
  });

  describe('calculateDistance', () => {
    it('debe calcular la distancia correctamente entre dos coordenadas usando Haversine', () => {
      // Latacunga, Parque La Matriz: -0.9346, -78.6156
      const coord1: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      // Latacunga, Centro Cívico: -0.9311, -78.6077
      const coord2: Coordinates = {
        latitude: -0.9311,
        longitude: -78.6077,
      };

      const distance = geolocationService.calculateDistance(coord1, coord2);

      // Distancia aproximada esperada: ~0.95 km
      expect(distance).toBeGreaterThan(0.9);
      expect(distance).toBeLessThan(1.0);
    });

    it('debe retornar 0 cuando las coordenadas son idénticas', () => {
      const coord1: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const distance = geolocationService.calculateDistance(coord1, coord1);

      expect(distance).toBe(0);
    });

    it('debe calcular correctamente distancias largas', () => {
      // Latacunga a Quito (~80 km)
      const latacunga: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const quito: Coordinates = {
        latitude: -0.2167,
        longitude: -78.5147,
      };

      const distance = geolocationService.calculateDistance(latacunga, quito);

      // Distancia aproximada esperada: ~80-85 km
      expect(distance).toBeGreaterThan(75);
      expect(distance).toBeLessThan(90);
    });

    it('debe redondear la distancia a 2 decimales', () => {
      const coord1: Coordinates = {
        latitude: 0,
        longitude: 0,
      };

      const coord2: Coordinates = {
        latitude: 0.01,
        longitude: 0.01,
      };

      const distance = geolocationService.calculateDistance(coord1, coord2);

      // Verificar que tiene máximo 2 decimales
      const decimalPlaces = (distance.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe('findNearestPoint', () => {
    it('debe encontrar el punto más cercano entre varios', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const points = [
        {
          id: 'point1',
          name: 'Punto A',
          coordinates: { latitude: -0.9311, longitude: -78.6077 }, // ~0.95 km
        },
        {
          id: 'point2',
          name: 'Punto B',
          coordinates: { latitude: -0.9400, longitude: -78.6200 }, // ~0.66 km
        },
        {
          id: 'point3',
          name: 'Punto C',
          coordinates: { latitude: -0.9450, longitude: -78.6250 }, // ~1.2 km
        },
      ];

      const nearest = geolocationService.findNearestPoint(userLocation, points);

      expect(nearest).not.toBeNull();
      expect(nearest?.id).toBe('point2'); // Debe ser el más cercano
      expect(nearest?.distance).toBeLessThan(1);
    });

    it('debe retornar null cuando la lista de puntos está vacía', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const nearest = geolocationService.findNearestPoint(userLocation, []);

      expect(nearest).toBeNull();
    });

    it('debe retornar el único punto cuando hay solo uno', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const point = {
        id: 'point1',
        name: 'Punto Único',
        coordinates: { latitude: -0.9311, longitude: -78.6077 },
      };

      const nearest = geolocationService.findNearestPoint(userLocation, [point]);

      expect(nearest?.id).toBe('point1');
      expect(nearest?.distance).toBeGreaterThan(0);
    });

    it('debe incluir la distancia calculada en el resultado', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const point = {
        id: 'point1',
        coordinates: { latitude: -0.9346, longitude: -78.6156 },
      };

      const nearest = geolocationService.findNearestPoint(userLocation, [point]);

      expect(nearest).toHaveProperty('distance');
      expect(nearest?.distance).toBe(0);
    });
  });

  describe('findPointsWithinRadius', () => {
    it('debe retornar todos los puntos dentro del radio especificado', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const points = [
        {
          id: 'point1',
          coordinates: { latitude: -0.9311, longitude: -78.6077 }, // ~0.95 km
        },
        {
          id: 'point2',
          coordinates: { latitude: -0.9400, longitude: -78.6200 }, // ~0.66 km
        },
        {
          id: 'point3',
          coordinates: { latitude: -0.9450, longitude: -78.6250 }, // ~1.2 km
        },
      ];

      const pointsInRadius = geolocationService.findPointsWithinRadius(
        userLocation,
        points,
        1 // Radio de 1 km
      );

      expect(pointsInRadius.length).toBe(2); // Solo point1 y point2
    });

    it('debe ordenar los puntos por distancia ascendente', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const points = [
        {
          id: 'point1',
          coordinates: { latitude: -0.9311, longitude: -78.6077 }, // ~0.95 km
        },
        {
          id: 'point2',
          coordinates: { latitude: -0.9400, longitude: -78.6200 }, // ~0.66 km
        },
        {
          id: 'point3',
          coordinates: { latitude: -0.9450, longitude: -78.6250 }, // ~1.2 km
        },
      ];

      const pointsInRadius = geolocationService.findPointsWithinRadius(
        userLocation,
        points,
        2 // Radio de 2 km para incluir todos
      );

      // Verificar que están ordenados por distancia
      for (let i = 1; i < pointsInRadius.length; i++) {
        expect(pointsInRadius[i].distance).toBeGreaterThanOrEqual(
          pointsInRadius[i - 1].distance
        );
      }
    });

    it('debe retornar lista vacía cuando no hay puntos dentro del radio', () => {
      const userLocation: Coordinates = {
        latitude: 0,
        longitude: 0,
      };

      const points = [
        {
          id: 'point1',
          coordinates: { latitude: -0.9346, longitude: -78.6156 },
        },
      ];

      const pointsInRadius = geolocationService.findPointsWithinRadius(
        userLocation,
        points,
        0.5 // Radio muy pequeño
      );

      expect(pointsInRadius.length).toBe(0);
    });

    it('debe incluir la distancia para cada punto retornado', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const points = [
        {
          id: 'point1',
          coordinates: { latitude: -0.9311, longitude: -78.6077 },
        },
      ];

      const pointsInRadius = geolocationService.findPointsWithinRadius(
        userLocation,
        points,
        10
      );

      expect(pointsInRadius[0]).toHaveProperty('distance');
      expect(typeof pointsInRadius[0].distance).toBe('number');
    });
  });

  describe('areValidCoordinates', () => {
    it('debe retornar true para coordenadas válidas', () => {
      const validCoords: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      expect(geolocationService.areValidCoordinates(validCoords)).toBe(true);
    });

    it('debe retornar false si la latitud es menor a -90', () => {
      const invalidCoords: Coordinates = {
        latitude: -91,
        longitude: -78.6156,
      };

      expect(geolocationService.areValidCoordinates(invalidCoords)).toBe(false);
    });

    it('debe retornar false si la latitud es mayor a 90', () => {
      const invalidCoords: Coordinates = {
        latitude: 91,
        longitude: -78.6156,
      };

      expect(geolocationService.areValidCoordinates(invalidCoords)).toBe(false);
    });

    it('debe retornar false si la longitud es menor a -180', () => {
      const invalidCoords: Coordinates = {
        latitude: -0.9346,
        longitude: -181,
      };

      expect(geolocationService.areValidCoordinates(invalidCoords)).toBe(false);
    });

    it('debe retornar false si la longitud es mayor a 180', () => {
      const invalidCoords: Coordinates = {
        latitude: -0.9346,
        longitude: 181,
      };

      expect(geolocationService.areValidCoordinates(invalidCoords)).toBe(false);
    });

    it('debe aceptar los límites exactos de latitud y longitud', () => {
      const coordsAtBoundaries = [
        { latitude: -90, longitude: -180 },
        { latitude: 90, longitude: 180 },
        { latitude: 0, longitude: 0 },
      ];

      coordsAtBoundaries.forEach((coords) => {
        expect(geolocationService.areValidCoordinates(coords)).toBe(true);
      });
    });
  });

  describe('calculateCentroid', () => {
    it('debe calcular el centroide de múltiples coordenadas correctamente', () => {
      const coordinates: Coordinates[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 2, longitude: 2 },
        { latitude: 2, longitude: 0 },
      ];

      const centroid = geolocationService.calculateCentroid(coordinates);

      expect(centroid.latitude).toBeCloseTo(1.33, 1);
      expect(centroid.longitude).toBeCloseTo(0.67, 1);
    });

    it('debe retornar la misma coordenada cuando solo hay una', () => {
      const coordinates: Coordinates[] = [
        { latitude: -0.9346, longitude: -78.6156 },
      ];

      const centroid = geolocationService.calculateCentroid(coordinates);

      expect(centroid.latitude).toBe(-0.9346);
      expect(centroid.longitude).toBe(-78.6156);
    });

    it('debe lanzar error cuando se pasa un array vacío', () => {
      expect(() => {
        geolocationService.calculateCentroid([]);
      }).toThrow('Cannot calculate centroid of empty array');
    });

    it('debe calcular correctamente el centroide de coordenadas reales de Latacunga', () => {
      const latacungaPoints: Coordinates[] = [
        { latitude: -0.9346, longitude: -78.6156 }, // La Matriz
        { latitude: -0.9311, longitude: -78.6077 }, // Centro Cívico
        { latitude: -0.9400, longitude: -78.6200 }, // Otro punto
      ];

      const centroid = geolocationService.calculateCentroid(latacungaPoints);

      // El centroide debe estar dentro del rango de las coordenadas
      expect(centroid.latitude).toBeGreaterThan(-0.95);
      expect(centroid.latitude).toBeLessThan(-0.93);
      expect(centroid.longitude).toBeGreaterThan(-78.63);
      expect(centroid.longitude).toBeLessThan(-78.61);
    });
  });

  describe('Casos de uso reales de Latacunga', () => {
    it('debe encontrar el punto más cercano en Latacunga con datos reales', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const collectionPoints = [
        {
          id: 'CP-001',
          name: 'Centro de Acopio La Matriz',
          coordinates: { latitude: -0.9346, longitude: -78.6156 },
        },
        {
          id: 'CP-002',
          name: 'Centro Acopio San Felipe',
          coordinates: { latitude: -0.9500, longitude: -78.6300 },
        },
        {
          id: 'CP-003',
          name: 'Centro Acopio Eloy Alfaro',
          coordinates: { latitude: -0.9200, longitude: -78.6000 },
        },
      ];

      const nearest = geolocationService.findNearestPoint(
        userLocation,
        collectionPoints
      );

      expect(nearest?.id).toBe('CP-001');
      expect(nearest?.distance).toBe(0);
    });

    it('debe retornar puntos cercanos dentro de 5km en Latacunga', () => {
      const userLocation: Coordinates = {
        latitude: -0.9346,
        longitude: -78.6156,
      };

      const collectionPoints = [
        {
          id: 'CP-001',
          coordinates: { latitude: -0.9346, longitude: -78.6156 },
        },
        {
          id: 'CP-002',
          coordinates: { latitude: -0.9311, longitude: -78.6077 },
        },
        {
          id: 'CP-003',
          coordinates: { latitude: -0.9500, longitude: -78.6300 },
        },
      ];

      const nearbyPoints = geolocationService.findPointsWithinRadius(
        userLocation,
        collectionPoints,
        5
      );

      expect(nearbyPoints.length).toBeGreaterThan(0);
      expect(nearbyPoints.every((p) => p.distance <= 5)).toBe(true);
    });
  });
});

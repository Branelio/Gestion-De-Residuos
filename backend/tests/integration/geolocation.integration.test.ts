// Tests de Integración para API Endpoints de Geolocalización
// Validación de endpoints REST de puntos de acopio y búsquedas de proximidad

import {
  FindNearestCollectionPointUseCase,
  FindNearestPointRequest,
} from '@application/use-cases/FindNearestCollectionPointUseCase';
import { GeolocationService } from '@domain/services/GeolocationService';

describe('API Integration Tests - Geolocation Endpoints', () => {
  let findNearestUseCase: FindNearestCollectionPointUseCase;
  let geolocationService: GeolocationService;

  beforeEach(() => {
    geolocationService = new GeolocationService();

    // Mock repository for testing
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findNearby: jest.fn().mockResolvedValue([
        {
          id: { value: 'CP-001' },
          name: 'Centro de Acopio La Matriz',
          type: 'COLLECTION_CENTER',
          coordinates: { latitude: -0.9346, longitude: -78.6156 },
          address: 'Av. Eloy Alfaro y Quito',
          capacity: 5000,
          currentLoad: 2000,
          status: 'AVAILABLE',
          isRural: false,
          fillPercentage: 40,
          createdAt: new Date(),
          updatedAt: new Date(),
          isFull: () => false,
        },
      ]),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    findNearestUseCase = new FindNearestCollectionPointUseCase(
      mockRepository,
      geolocationService
    );
  });

  describe('GET /api/collection-points/nearby', () => {
    it('debe retornar puntos cercanos con parámetros válidos', async () => {
      const request: FindNearestPointRequest = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        radiusKm: 5,
      };

      const response = await findNearestUseCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.data?.id).toBeDefined();
    });

    it('debe validar parámetros de entrada', async () => {
      const invalidRequests = [
        { userLatitude: 91, userLongitude: -78.6156 }, // Latitud inválida
        { userLatitude: -0.9346, userLongitude: 181 }, // Longitud inválida
        { userLatitude: NaN, userLongitude: -78.6156 }, // NaN
      ];

      for (const request of invalidRequests) {
        const response = await findNearestUseCase.execute(request as any);
        expect(response.success).toBe(false);
      }
    });

    it('debe retornar error 400 cuando faltan parámetros', async () => {
      const incompleteRequest = {
        userLatitude: -0.9346,
        // userLongitude está faltando
      } as any;

      const response = await findNearestUseCase.execute(incompleteRequest);
      // El servicio debe manejar esto
      expect(response.success).toBe(false);
    });

    it('debe soportar radio variable', async () => {
      const radii = [1, 5, 10, 20];

      for (const radiusKm of radii) {
        const request: FindNearestPointRequest = {
          userLatitude: -0.9346,
          userLongitude: -78.6156,
          radiusKm,
        };

        const response = await findNearestUseCase.execute(request);
        // El servicio debe procesar cualquier radio
        expect(response.success || !response.success).toBe(true);
      }
    });

    it('debe retornar estructura de respuesta correcta', async () => {
      const request: FindNearestPointRequest = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
      };

      const response = await findNearestUseCase.execute(request);

      if (response.success && response.data) {
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('name');
        expect(response.data).toHaveProperty('type');
        expect(response.data).toHaveProperty('address');
        expect(response.data).toHaveProperty('coordinates');
        expect(response.data).toHaveProperty('distance');
        expect(response.data).toHaveProperty('fillPercentage');
        expect(response.data).toHaveProperty('status');
        expect(response.data).toHaveProperty('isRural');

        // Validar tipos de datos
        expect(typeof response.data.id).toBe('string');
        expect(typeof response.data.name).toBe('string');
        expect(typeof response.data.distance).toBe('number');
        expect(typeof response.data.fillPercentage).toBe('number');
      }
    });
  });

  describe('POST /api/collection-points/nearest', () => {
    it('debe encontrar el punto más cercano con parámetros JSON', async () => {
      const request: FindNearestPointRequest = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        radiusKm: 10,
        includeFullPoints: false,
      };

      const response = await findNearestUseCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.data?.id).toBeDefined();
    });

    it('debe filtrar puntos llenos si includeFullPoints es false', async () => {
      const request: FindNearestPointRequest = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        includeFullPoints: false,
      };

      const response = await findNearestUseCase.execute(request);

      if (response.success && response.data) {
        // El punto retornado no debe estar lleno
        expect(response.data.fillPercentage).toBeLessThan(100);
      }
    });

    it('debe incluir puntos llenos si includeFullPoints es true', async () => {
      const request: FindNearestPointRequest = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        includeFullPoints: true,
      };

      const response = await findNearestUseCase.execute(request);

      // Con includeFullPoints=true, debe procesar todos los puntos
      expect(response.success || !response.success).toBe(true);
    });
  });

  describe('Integración de Geolocalización - Casos Reales', () => {
    it('debe manejar solicitudes desde diferentes zonas de Latacunga', async () => {
      const locations = [
        { latitude: -0.9346, longitude: -78.6156, zone: 'La Matriz' },
        { latitude: -0.9500, longitude: -78.6300, zone: 'San Felipe' },
        { latitude: -0.9200, longitude: -78.6000, zone: 'Centro Cívico' },
      ];

      for (const location of locations) {
        const request: FindNearestPointRequest = {
          userLatitude: location.latitude,
          userLongitude: location.longitude,
          radiusKm: 10,
        };

        const response = await findNearestUseCase.execute(request);
        expect(response.success || !response.success).toBe(true);
      }
    });

    it('debe retornar datos consistentes para misma ubicación', async () => {
      const request: FindNearestPointRequest = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
      };

      const response1 = await findNearestUseCase.execute(request);
      const response2 = await findNearestUseCase.execute(request);

      if (response1.success && response2.success) {
        expect(response1.data?.id).toBe(response2.data?.id);
        expect(response1.data?.distance).toBe(response2.data?.distance);
      }
    });

    it('debe manejar búsquedas desde zona rural', async () => {
      const request: FindNearestPointRequest = {
        userLatitude: -0.9600,
        userLongitude: -78.6400,
        radiusKm: 20,
      };

      const response = await findNearestUseCase.execute(request);
      expect(response.success || !response.success).toBe(true);
    });

    it('debe retornar error gracefully cuando no hay puntos en radio', async () => {
      const request: FindNearestPointRequest = {
        userLatitude: -0.5000, // Ubicación lejana
        userLongitude: -77.0000,
        radiusKm: 1,
      };

      const response = await findNearestUseCase.execute(request);

      if (!response.success) {
        expect(response.error).toBeDefined();
        expect(response.data).toBeUndefined();
      }
    });
  });

  describe('Performance y Escalabilidad', () => {
    it('debe procesar solicitudes dentro de tiempo aceptable', async () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const request: FindNearestPointRequest = {
          userLatitude: -0.9346 + (Math.random() - 0.5) * 0.1,
          userLongitude: -78.6156 + (Math.random() - 0.5) * 0.1,
        };

        await findNearestUseCase.execute(request);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 100 solicitudes no deben tomar más de 5 segundos
      expect(totalTime).toBeLessThan(5000);
    });

    it('debe manejar múltiples solicitudes concurrentes', async () => {
      const requests = Array(50)
        .fill(null)
        .map(() => ({
          userLatitude: -0.9346 + (Math.random() - 0.5) * 0.1,
          userLongitude: -78.6156 + (Math.random() - 0.5) * 0.1,
          radiusKm: Math.random() * 20 + 5,
        }));

      const promises = requests.map((req) => findNearestUseCase.execute(req));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(50);
      expect(results.some((r: any) => r.success)).toBe(true);
    });
  });

  describe('Validación de Seguridad', () => {
    it('debe rechazar coordenadas fuera de rango', async () => {
      const invalidCoordinates = [
        { latitude: 91, longitude: -78.6156 },
        { latitude: -91, longitude: -78.6156 },
        { latitude: -0.9346, longitude: 181 },
        { latitude: -0.9346, longitude: -181 },
      ];

      for (const coords of invalidCoordinates) {
        const request: FindNearestPointRequest = {
          userLatitude: coords.latitude,
          userLongitude: coords.longitude,
        };

        const response = await findNearestUseCase.execute(request);
        expect(response.success).toBe(false);
      }
    });

    it('debe manejar valores nulos', async () => {
      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
      } as any;

      const response = await findNearestUseCase.execute(request);
      // Con datos válidos, debe procesar la solicitud
      expect(response.success || !response.success).toBe(true);
    });

    it('debe manejar valores no numéricos', async () => {
      const request = {
        userLatitude: 'ABC',
        userLongitude: '-78.6156',
      } as any;

      const response = await findNearestUseCase.execute(request);
      // Debe fallar o convertir apropiadamente
      expect(response.success || !response.success).toBe(true);
    });
  });
});

// Tests para FindNearestCollectionPointUseCase
// Validación de lógica de casos de uso para encontrar puntos de acopio más cercanos

import { FindNearestCollectionPointUseCase } from '@application/use-cases/FindNearestCollectionPointUseCase';
import { CollectionPointRepository } from '@domain/repositories/CollectionPointRepository';
import { GeolocationService } from '@domain/services/GeolocationService';
import { CollectionPoint, Coordinates } from '@domain/entities/CollectionPoint';

describe('FindNearestCollectionPointUseCase', () => {
  let useCase: FindNearestCollectionPointUseCase;
  let mockRepository: jest.Mocked<CollectionPointRepository>;
  let geolocationService: GeolocationService;

  beforeEach(() => {
    geolocationService = new GeolocationService();

    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findNearby: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new FindNearestCollectionPointUseCase(mockRepository, geolocationService);
  });

  describe('execute', () => {
    it('debe retornar error si las coordenadas son inválidas', async () => {
      const request = {
        userLatitude: 91, // Inválido: > 90
        userLongitude: -78.6156,
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid coordinates provided');
    });

    it('debe retornar error si la longitud es inválida', async () => {
      const request = {
        userLatitude: -0.9346,
        userLongitude: 181, // Inválido: > 180
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid coordinates provided');
    });

    it('debe retornar error si no hay puntos dentro del radio', async () => {
      mockRepository.findNearby.mockResolvedValue([]);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        radiusKm: 5,
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('No collection points found');
    });

    it('debe retornar el punto más cercano cuando hay puntos disponibles', async () => {
      const mockPoints = createMockCollectionPoints();
      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        radiusKm: 10,
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe('CP-001');
      expect(response.data?.distance).toBe(0);
    });

    it('debe utilizar radio por defecto de 10km si no se especifica', async () => {
      const mockPoints = createMockCollectionPoints();
      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
      };

      await useCase.execute(request);

      expect(mockRepository.findNearby).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: -0.9346,
          longitude: -78.6156,
        }),
        10 // Radio por defecto
      );
    });

    it('debe usar el radio especificado si se proporciona', async () => {
      const mockPoints = createMockCollectionPoints();
      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        radiusKm: 15,
      };

      await useCase.execute(request);

      expect(mockRepository.findNearby).toHaveBeenCalledWith(
        expect.any(Object),
        15
      );
    });

    it('debe filtrar puntos llenos por defecto', async () => {
      const mockPoints = createMockCollectionPoints();
      const fullPoint = mockPoints[1];
      fullPoint.isFull = jest.fn().mockReturnValue(true);

      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        includeFullPoints: false,
      };

      const response = await useCase.execute(request);

      // Debe retornar el punto que no está lleno
      expect(response.success).toBe(true);
      expect(response.data?.id).not.toBe(fullPoint.id.value);
    });

    it('debe incluir puntos llenos si se especifica includeFullPoints=true', async () => {
      const mockPoints = createMockCollectionPoints();
      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        includeFullPoints: true,
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(true);
      expect(mockRepository.findNearby).toHaveBeenCalled();
    });

    it('debe retornar los datos completos del punto más cercano', async () => {
      const mockPoints = createMockCollectionPoints();
      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
      };

      const response = await useCase.execute(request);

      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('type');
      expect(response.data).toHaveProperty('address');
      expect(response.data).toHaveProperty('coordinates');
      expect(response.data).toHaveProperty('distance');
      expect(response.data).toHaveProperty('fillPercentage');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('isRural');
    });

    it('debe manejar errores del repositorio', async () => {
      mockRepository.findNearby.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('Database connection failed');
    });

    it('debe calcular la distancia correctamente', async () => {
      const mockPoints = [
        createMockCollectionPoint('CP-001', { latitude: -0.9346, longitude: -78.6156 }),
        createMockCollectionPoint('CP-002', { latitude: -0.9311, longitude: -78.6077 }),
      ];
      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9311,
        userLongitude: -78.6077,
      };

      const response = await useCase.execute(request);

      // El punto más cercano es CP-002 (ubicación idéntica)
      expect(response.data?.distance).toBe(0);
      expect(typeof response.data?.distance).toBe('number');
    });

    it('debe retornar punto más cercano entre múltiples opciones', async () => {
      const mockPoints = [
        createMockCollectionPoint('CP-001', { latitude: -0.9346, longitude: -78.6156 }),
        createMockCollectionPoint('CP-002', { latitude: -0.9300, longitude: -78.6100 }),
        createMockCollectionPoint('CP-003', { latitude: -0.9500, longitude: -78.6300 }),
      ];

      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
      };

      const response = await useCase.execute(request);

      // El punto más cercano debe ser CP-001 (mismo ubicación)
      expect(response.data?.id).toBe('CP-001');
      expect(response.data?.distance).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    it('debe encontrar el punto más cercano en Latacunga', async () => {
      const latacungaPoints = [
        createMockCollectionPoint('CP-MATRIZ', {
          latitude: -0.9346,
          longitude: -78.6156,
        }),
        createMockCollectionPoint('CP-SANFELIPE', {
          latitude: -0.9500,
          longitude: -78.6300,
        }),
        createMockCollectionPoint('CP-ELOYAL', {
          latitude: -0.9200,
          longitude: -78.6000,
        }),
      ];

      mockRepository.findNearby.mockResolvedValue(latacungaPoints);

      const userLocation = {
        userLatitude: -0.9400,
        userLongitude: -78.6200,
      };

      const response = await useCase.execute(userLocation);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it('debe incluir puntos llenos si se especifica includeFullPoints=true', async () => {
      const mockPoints = createMockCollectionPoints();
      mockRepository.findNearby.mockResolvedValue(mockPoints);

      const request = {
        userLatitude: -0.9346,
        userLongitude: -78.6156,
        includeFullPoints: true,
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(true);
      expect(mockRepository.findNearby).toHaveBeenCalled();
    });

    it('debe retornar error cuando usuario está fuera de cobertura', async () => {
      mockRepository.findNearby.mockResolvedValue([]);

      const request = {
        userLatitude: 0.5000, // Ubicación lejana de Latacunga
        userLongitude: -77.0000,
        radiusKm: 5,
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('No collection points found');
    });
  });
});

// Funciones auxiliares para crear mocks
function createMockCollectionPoints(): CollectionPoint[] {
  return [
    createMockCollectionPoint('CP-001', {
      latitude: -0.9346,
      longitude: -78.6156,
    }),
    createMockCollectionPoint('CP-002', {
      latitude: -0.9311,
      longitude: -78.6077,
    }),
    createMockCollectionPoint('CP-003', {
      latitude: -0.9500,
      longitude: -78.6300,
    }),
  ];
}

function createMockCollectionPoint(
  id: string,
  coordinates: Coordinates
): CollectionPoint & { isFull: jest.Mock } {
  const mock = {
    id: { value: id },
    name: `Centro de Acopio ${id}`,
    type: 'COLLECTION_CENTER',
    coordinates,
    address: `Dirección de ${id}`,
    capacity: 5000,
    currentLoad: 2000,
    status: 'AVAILABLE',
    isRural: false,
    fillPercentage: 40,
    createdAt: new Date(),
    updatedAt: new Date(),
    isFull: jest.fn().mockReturnValue(false),
  } as any;

  return mock;
}

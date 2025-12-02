import { Request, Response } from 'express';
import { MongoCollectionPointRepository } from '../../repositories/MongoCollectionPointRepository';

/**
 * Controller para endpoints de puntos de acopio
 */
export class CollectionPointController {
  private repository: MongoCollectionPointRepository;

  constructor() {
    this.repository = new MongoCollectionPointRepository();
  }

  /**
   * GET /api/collection-points
   * Obtiene todos los puntos de acopio activos
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const points = await this.repository.findAll();
      
      res.json({
        success: true,
        data: points.map(point => ({
          id: point.id,
          name: point.name,
          coordinates: point.coordinates,
          address: point.address,
          capacity: point.capacity,
          currentLoad: point.currentLoad,
          fillPercentage: point.fillPercentage,
          status: point.status,
        })),
        count: points.length,
      });
    } catch (error) {
      console.error('Error obteniendo puntos de acopio:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener puntos de acopio',
      });
    }
  }

  /**
   * GET /api/collection-points/nearby?lat=-0.9346&lng=-78.6156&radius=5
   * Encuentra puntos de acopio cercanos
   */
  async getNearby(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng, radius } = req.query;

      // Validar parámetros
      if (!lat || !lng) {
        res.status(400).json({
          success: false,
          error: 'Se requieren parámetros lat y lng',
        });
        return;
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = radius ? parseFloat(radius as string) : 10;

      // Validar coordenadas
      if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        res.status(400).json({
          success: false,
          error: 'Coordenadas inválidas',
        });
        return;
      }

      // Buscar puntos cercanos usando el repositorio
      const nearbyPoints = await this.repository.findNearby(
        { latitude, longitude },
        radiusKm
      );

      res.json({
        success: true,
        data: nearbyPoints.map(point => ({
          id: point.id,
          name: point.name,
          coordinates: point.coordinates,
          address: point.address,
          capacity: point.capacity,
          currentLoad: point.currentLoad,
          fillPercentage: point.fillPercentage,
          status: point.status,
        })),
        count: nearbyPoints.length,
        searchRadius: radiusKm,
        userLocation: { latitude, longitude },
      });
    } catch (error) {
      console.error('Error buscando puntos cercanos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al buscar puntos cercanos',
      });
    }
  }

  /**
   * GET /api/collection-points/:id
   * Obtiene un punto de acopio por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const point = await this.repository.findById(id);

      if (!point) {
        res.status(404).json({
          success: false,
          error: 'Punto de acopio no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: point.id,
          name: point.name,
          coordinates: point.coordinates,
          address: point.address,
          capacity: point.capacity,
          currentLoad: point.currentLoad,
          fillPercentage: point.fillPercentage,
          status: point.status,
        },
      });
    } catch (error) {
      console.error('Error obteniendo punto de acopio:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener punto de acopio',
      });
    }
  }

  /**
   * GET /api/collection-points/stats/summary
   * Obtiene estadísticas generales
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const allPoints = await this.repository.findAll();
      const available = allPoints.filter(p => p.status === 'AVAILABLE').length;
      const full = allPoints.filter(p => p.status === 'FULL').length;
      const totalCapacity = allPoints.reduce((sum, p) => sum + p.capacity, 0);
      const totalLoad = allPoints.reduce((sum, p) => sum + p.currentLoad, 0);

      res.json({
        success: true,
        data: {
          total: allPoints.length,
          available,
          full,
          totalCapacity,
          totalLoad,
          averageFillPercentage: Math.round((totalLoad / totalCapacity) * 100),
        },
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas',
      });
    }
  }
}

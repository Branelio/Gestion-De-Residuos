import { Request, Response } from 'express';
import { MongoWasteReportRepository } from '../../repositories/MongoWasteReportRepository';
import { WasteReport, ReportType } from '../../../domain/entities/WasteReport';

/**
 * Controller para endpoints de reportes de residuos
 */
export class WasteReportController {
  private repository: MongoWasteReportRepository;

  constructor() {
    this.repository = new MongoWasteReportRepository();
  }

  /**
   * POST /api/waste-reports
   * Crear un nuevo reporte
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, description, coordinates, address, photoUrl } = req.body;

      // Validar campos requeridos
      if (!userId || !type || !description || !coordinates || !address) {
        res.status(400).json({
          success: false,
          error: 'Faltan campos requeridos: userId, type, description, coordinates, address',
        });
        return;
      }

      // Validar tipo de reporte
      if (!Object.values(ReportType).includes(type)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de reporte inválido',
        });
        return;
      }

      // Validar coordenadas
      if (
        !coordinates.latitude ||
        !coordinates.longitude ||
        coordinates.latitude < -90 ||
        coordinates.latitude > 90 ||
        coordinates.longitude < -180 ||
        coordinates.longitude > 180
      ) {
        res.status(400).json({
          success: false,
          error: 'Coordenadas inválidas',
        });
        return;
      }

      // Crear el reporte
      const report = WasteReport.create({
        userId,
        type,
        description,
        coordinates,
        address,
        photoUrl,
      });

      // Guardar en la base de datos
      await this.repository.save(report);

      res.status(201).json({
        success: true,
        message: 'Reporte creado exitosamente',
        data: report.toJSON(),
      });
    } catch (error: any) {
      console.error('Error creating waste report:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al crear el reporte',
      });
    }
  }

  /**
   * GET /api/waste-reports
   * Obtener todos los reportes
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const reports = await this.repository.findAll();

      res.json({
        success: true,
        data: reports.map((r) => r.toJSON()),
        count: reports.length,
      });
    } catch (error) {
      console.error('Error getting reports:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener reportes',
      });
    }
  }

  /**
   * GET /api/waste-reports/:id
   * Obtener un reporte por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await this.repository.findById(id);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Reporte no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: report.toJSON(),
      });
    } catch (error) {
      console.error('Error getting report:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el reporte',
      });
    }
  }

  /**
   * GET /api/waste-reports/user/:userId
   * Obtener reportes de un usuario
   */
  async getByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const reports = await this.repository.findByUserId(userId);

      res.json({
        success: true,
        data: reports.map((r) => r.toJSON()),
        count: reports.length,
      });
    } catch (error) {
      console.error('Error getting user reports:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener reportes del usuario',
      });
    }
  }

  /**
   * GET /api/waste-reports/stats
   * Obtener estadísticas de reportes
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const statusCounts = await this.repository.countByStatus();
      const allReports = await this.repository.findAll();

      res.json({
        success: true,
        data: {
          total: allReports.length,
          byStatus: statusCounts,
          pending: statusCounts.PENDING,
          inProgress: statusCounts.IN_PROGRESS,
          resolved: statusCounts.RESOLVED,
          rejected: statusCounts.REJECTED,
        },
      });
    } catch (error) {
      console.error('Error getting report stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas',
      });
    }
  }

  /**
   * GET /api/waste-reports/nearby?lat=-0.9346&lng=-78.6156&radius=5
   * Obtener reportes cercanos
   */
  async getNearby(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng, radius } = req.query;

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

      const reports = await this.repository.findNearby({ latitude, longitude }, radiusKm);

      res.json({
        success: true,
        data: reports.map((r) => r.toJSON()),
        count: reports.length,
        searchRadius: radiusKm,
      });
    } catch (error) {
      console.error('Error getting nearby reports:', error);
      res.status(500).json({
        success: false,
        error: 'Error al buscar reportes cercanos',
      });
    }
  }
}

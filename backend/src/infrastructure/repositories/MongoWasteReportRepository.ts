import { WasteReport, ReportType, ReportStatus, Coordinates } from '../../domain/entities/WasteReport';
import { WasteReportRepository } from '../../domain/repositories/WasteReportRepository';
import { WasteReportModel } from '../persistence/WasteReportModel';
import { MongoCollectionPointRepository } from './MongoCollectionPointRepository';

export class MongoWasteReportRepository implements WasteReportRepository {
  private collectionPointRepo: MongoCollectionPointRepository;

  constructor() {
    this.collectionPointRepo = new MongoCollectionPointRepository();
  }

  async save(report: WasteReport): Promise<void> {
    await WasteReportModel.create({
      userId: report.userId,
      type: report.type,
      description: report.description,
      coordinates: {
        type: 'Point',
        coordinates: [report.coordinates.longitude, report.coordinates.latitude],
      },
      address: (report as any).props.address,
      photoUrl: (report as any).props.photoUrl,
      status: report.status,
      verifiedByAI: report.verifiedByAI,
      pointsAwarded: report.pointsAwarded,
    });

    // Si es un reporte de OVERFLOW, actualizar el punto de acopio
    if (report.type === ReportType.OVERFLOW) {
      await this.updateCollectionPointStatus(report.coordinates);
    }
  }

  async findById(id: { value: string } | string): Promise<WasteReport | null> {
    const idString = typeof id === 'string' ? id : id.value;
    const document = await WasteReportModel.findById(idString);
    if (!document) return null;
    return this.toDomain(document);
  }

  async findAll(): Promise<WasteReport[]> {
    const documents = await WasteReportModel.find().sort({ createdAt: -1 });
    return documents.map((doc) => this.toDomain(doc));
  }

  async findByStatus(status: ReportStatus): Promise<WasteReport[]> {
    const documents = await WasteReportModel.find({ status }).sort({ createdAt: -1 });
    return documents.map((doc) => this.toDomain(doc));
  }

  async findByUserId(userId: string): Promise<WasteReport[]> {
    const documents = await WasteReportModel.find({ userId }).sort({ createdAt: -1 });
    return documents.map((doc) => this.toDomain(doc));
  }

  async findNearby(coordinates: Coordinates, radiusKm: number): Promise<WasteReport[]> {
    const documents = await WasteReportModel.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.longitude, coordinates.latitude],
          },
          $maxDistance: radiusKm * 1000, // Convertir km a metros
        },
      },
    });
    return documents.map((doc) => this.toDomain(doc));
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await WasteReportModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {
      PENDING: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
    };

    counts.forEach((item) => {
      result[item._id] = item.count;
    });

    return result;
  }

  async update(report: WasteReport): Promise<void> {
    const idString = typeof report.id === 'string' ? report.id : report.id.value;
    await WasteReportModel.findByIdAndUpdate(idString, {
      type: report.type,
      description: report.description,
      status: report.status,
      verifiedByAI: report.verifiedByAI,
      pointsAwarded: report.pointsAwarded,
      updatedAt: new Date(),
    });
  }

  async delete(id: { value: string } | string): Promise<void> {
    const idString = typeof id === 'string' ? id : id.value;
    await WasteReportModel.findByIdAndDelete(idString);
  }

  /**
   * Actualiza el estado de un punto de acopio basado en los reportes
   */
  private async updateCollectionPointStatus(coordinates: Coordinates): Promise<void> {
    try {
      // Buscar el punto de acopio más cercano
      const nearbyPoints = await this.collectionPointRepo.findNearby(coordinates, 0.5); // 500 metros
      
      if (nearbyPoints.length === 0) return;

      const nearestPoint = nearbyPoints[0];
      
      // Contar reportes recientes (últimas 24 horas) de OVERFLOW para este punto
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const recentReports = await WasteReportModel.countDocuments({
        type: 'OVERFLOW',
        status: { $in: ['PENDING', 'IN_PROGRESS'] },
        createdAt: { $gte: oneDayAgo },
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [nearestPoint.coordinates.longitude, nearestPoint.coordinates.latitude],
            },
            $maxDistance: 100, // 100 metros del punto exacto
          },
        },
      });

      // Si hay 3 o más reportes recientes, marcar como FULL
      if (recentReports >= 3) {
        console.log(`⚠️ Punto de acopio ${nearestPoint.name} marcado como FULL por múltiples reportes`);
        
        // Actualizar el punto en la base de datos
        const CollectionPointModel = require('../persistence/CollectionPointModel').CollectionPointModel;
        await CollectionPointModel.findOneAndUpdate(
          { _id: nearestPoint.id },
          { 
            status: 'FULL',
            currentLoad: nearestPoint.capacity, // Marcar como lleno
          }
        );
      }
    } catch (error) {
      console.error('Error actualizando estado del punto de acopio:', error);
    }
  }

  private toDomain(document: any): WasteReport {
    return WasteReport.fromPersistence({
      id: { value: document._id.toString() },
      userId: document.userId,
      type: document.type as ReportType,
      description: document.description,
      coordinates: {
        latitude: document.coordinates.coordinates[1],
        longitude: document.coordinates.coordinates[0],
      },
      address: document.address,
      photoUrl: document.photoUrl,
      status: document.status as ReportStatus,
      verifiedByAI: document.verifiedByAI,
      pointsAwarded: document.pointsAwarded,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      resolvedAt: document.resolvedAt,
    });
  }
}

// Application Layer - Use Case
// Caso de uso: Crear un reporte de residuos por parte de ciudadanos

import { WasteReportRepository } from '@domain/repositories/WasteReportRepository';
import { CitizenRepository } from '@domain/repositories/CitizenRepository';
import { WasteReport, ReportType } from '@domain/entities/WasteReport';
import { GeolocationService } from '@domain/services/GeolocationService';

export interface CreateWasteReportRequest {
  userId: string;
  type: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  photoUrl?: string;
}

export interface CreateWasteReportResponse {
  success: boolean;
  data?: {
    reportId: string;
    userId: string;
    type: string;
    coordinates: { latitude: number; longitude: number };
    status: string;
    createdAt: string;
  };
  error?: string;
}

export class CreateWasteReportUseCase {
  constructor(
    private readonly wasteReportRepository: WasteReportRepository,
    private readonly citizenRepository: CitizenRepository,
    private readonly geolocationService: GeolocationService,
  ) {}

  async execute(request: CreateWasteReportRequest): Promise<CreateWasteReportResponse> {
    try {
      // Validar que el usuario existe
      const citizen = await this.citizenRepository.findById({ value: request.userId });
      if (!citizen) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Validar coordenadas
      const coordinates = {
        latitude: request.latitude,
        longitude: request.longitude,
      };

      if (!this.geolocationService.areValidCoordinates(coordinates)) {
        return {
          success: false,
          error: 'Invalid coordinates',
        };
      }

      // Crear el reporte
      const report = WasteReport.create({
        userId: request.userId,
        type: request.type,
        description: request.description,
        coordinates,
        address: request.address,
        photoUrl: request.photoUrl,
      });

      // Guardar el reporte
      await this.wasteReportRepository.save(report);

      // Incrementar contador de reportes del ciudadano
      citizen.incrementReportsCount();
      await this.citizenRepository.update(citizen);

      return {
        success: true,
        data: {
          reportId: report.id.value,
          userId: report.userId,
          type: report.type,
          coordinates: report.coordinates,
          status: report.status,
          createdAt: report.toJSON().createdAt as string,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create report',
      };
    }
  }
}

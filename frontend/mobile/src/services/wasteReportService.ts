import { httpClient } from './httpClient';

/**
 * Tipos de reportes
 */
export enum ReportType {
  OVERFLOW = 'OVERFLOW',
  ILLEGAL_DUMP = 'ILLEGAL_DUMP',
  DAMAGED_CONTAINER = 'DAMAGED_CONTAINER',
  MISSED_COLLECTION = 'MISSED_COLLECTION',
}

/**
 * Estados de reportes
 */
export enum ReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

/**
 * Interface para el reporte
 */
export interface WasteReport {
  id: string;
  userId: string;
  type: ReportType;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  photoUrl?: string;
  status: ReportStatus;
  verifiedByAI: boolean;
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

/**
 * Interface para crear un reporte
 */
export interface CreateReportData {
  userId: string;
  type: ReportType;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  photoUrl?: string;
}

/**
 * Interface para estadísticas de reportes
 */
export interface ReportStats {
  total: number;
  byStatus: Record<string, number>;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

/**
 * Servicio para interactuar con la API de Reportes
 */
class WasteReportService {
  /**
   * Crear un nuevo reporte
   */
  async createReport(data: CreateReportData): Promise<WasteReport> {
    try {
      const response = await httpClient.post<WasteReport>(
        '/api/waste-reports',
        data
      );
      console.log('✅ Reporte creado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creando reporte:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los reportes
   */
  async getAllReports(): Promise<WasteReport[]> {
    try {
      const response = await httpClient.get<WasteReport[]>(
        '/api/waste-reports'
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo reportes:', error);
      throw error;
    }
  }

  /**
   * Obtener reportes de un usuario
   */
  async getUserReports(userId: string): Promise<WasteReport[]> {
    try {
      const response = await httpClient.get<WasteReport[]>(
        `/api/waste-reports/user/${userId}`
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo reportes del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener reportes cercanos
   */
  async getNearbyReports(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<WasteReport[]> {
    try {
      const response = await httpClient.get<WasteReport[]>(
        `/api/waste-reports/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo reportes cercanos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de reportes
   */
  async getStats(): Promise<ReportStats> {
    try {
      const response = await httpClient.get<ReportStats>(
        '/api/waste-reports/stats'
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener un reporte por ID
   */
  async getReportById(id: string): Promise<WasteReport> {
    try {
      const response = await httpClient.get<WasteReport>(
        `/api/waste-reports/${id}`
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo reporte:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const wasteReportService = new WasteReportService();

// Exportar también la clase para testing
export default WasteReportService;

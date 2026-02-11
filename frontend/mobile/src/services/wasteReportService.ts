/**
 * Servicio de reportes de residuos
 * Conecta con el backend local para gestionar reportes ciudadanos
 */
import httpClient from './httpClient';

/**
 * Tipos de reporte disponibles
 */
export const ReportType = {
  OVERFLOW: 'OVERFLOW',
  ILLEGAL_DUMP: 'ILLEGAL_DUMP',
  DAMAGED_CONTAINER: 'DAMAGED_CONTAINER',
  MISSED_COLLECTION: 'MISSED_COLLECTION',
  DANGEROUS: 'DANGEROUS',
} as const;

/**
 * Estados de reporte
 */
export const ReportStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const;

/**
 * Interface para un reporte de residuos
 */
export interface WasteReport {
  id: string;
  userId: string;
  type: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  photoUrl?: string;
  status: string;
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
  type: string;
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
 * Determinar zona automáticamente basado en coordenadas de Latacunga
 */
function determinarZona(lat: number, lon: number): string {
  const latCenter = -0.9346;
  const lonCenter = -78.6157;

  const latDiff = lat - latCenter;
  const lonDiff = lon - lonCenter;

  const centerThreshold = 0.01;

  if (Math.abs(latDiff) < centerThreshold && Math.abs(lonDiff) < centerThreshold) {
    return 'Centro de Latacunga';
  }

  const absLatDiff = Math.abs(latDiff);
  const absLonDiff = Math.abs(lonDiff);

  if (absLatDiff > absLonDiff) {
    return latDiff > 0 ? 'Zona Norte - Latacunga' : 'Zona Sur - Latacunga';
  } else {
    return lonDiff > 0 ? 'Zona Este - Latacunga' : 'Zona Oeste - Latacunga';
  }
}

class WasteReportService {
  /**
   * Crear un nuevo reporte de residuos
   */
  async createReport(data: CreateReportData): Promise<WasteReport> {
    try {
      console.log('📤 Creando reporte en backend local:', data);

      // Determinar dirección si no se proporciona
      const address = data.address || determinarZona(
        data.coordinates.latitude,
        data.coordinates.longitude
      );

      const response = await httpClient.post<{ success: boolean; data: WasteReport }>(
        '/api/waste-reports',
        {
          userId: data.userId,
          type: data.type,
          description: data.description,
          coordinates: data.coordinates,
          address: address,
          photoUrl: data.photoUrl,
        }
      );

      console.log('✅ Reporte creado:', response);

      // El interceptor de httpClient ya extrae response.data.data
      return response as unknown as WasteReport;
    } catch (error: any) {
      console.error('❌ Error creando reporte:', error);
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Error al crear el reporte. Verifica tu conexión.'
      );
    }
  }

  /**
   * Obtener todos los reportes
   */
  async getAllReports(): Promise<WasteReport[]> {
    try {
      const response = await httpClient.get<{ success: boolean; data: WasteReport[]; count: number }>(
        '/api/waste-reports'
      );
      return response as unknown as WasteReport[];
    } catch (error: any) {
      console.error('❌ Error obteniendo reportes:', error);
      throw new Error(
        error.response?.data?.error ||
        'Error al obtener los reportes'
      );
    }
  }

  /**
   * Obtener reportes de un usuario
   */
  async getUserReports(userId: string): Promise<WasteReport[]> {
    try {
      const response = await httpClient.get<{ success: boolean; data: WasteReport[]; count: number }>(
        `/api/waste-reports/user/${userId}`
      );
      return response as unknown as WasteReport[];
    } catch (error: any) {
      console.error('❌ Error obteniendo reportes del usuario:', error);
      throw new Error(
        error.response?.data?.error ||
        'Error al obtener tus reportes'
      );
    }
  }

  /**
   * Obtener un reporte por ID
   */
  async getReportById(id: string): Promise<WasteReport> {
    try {
      const response = await httpClient.get<{ success: boolean; data: WasteReport }>(
        `/api/waste-reports/${id}`
      );
      return response as unknown as WasteReport;
    } catch (error: any) {
      console.error('❌ Error obteniendo reporte:', error);
      throw new Error(
        error.response?.data?.error ||
        'Error al obtener el reporte'
      );
    }
  }

  /**
   * Obtener estadísticas de reportes
   */
  async getStats(): Promise<ReportStats> {
    try {
      const response = await httpClient.get<{ success: boolean; data: ReportStats }>(
        '/api/waste-reports/stats'
      );
      return response as unknown as ReportStats;
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw new Error(
        error.response?.data?.error ||
        'Error al obtener estadísticas'
      );
    }
  }

  /**
   * Obtener reportes cercanos a una ubicación
   */
  async getNearbyReports(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<WasteReport[]> {
    try {
      const response = await httpClient.get<{ success: boolean; data: WasteReport[]; count: number }>(
        `/api/waste-reports/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`
      );
      return response as unknown as WasteReport[];
    } catch (error: any) {
      console.error('❌ Error obteniendo reportes cercanos:', error);
      throw new Error(
        error.response?.data?.error ||
        'Error al buscar reportes cercanos'
      );
    }
  }
}

// Instancia singleton del servicio
export const wasteReportService = new WasteReportService();

// Exportar también la clase para testing
export default WasteReportService;

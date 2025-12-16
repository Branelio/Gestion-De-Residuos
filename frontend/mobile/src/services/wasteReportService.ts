/**
 * Servicio adaptador de reportes de residuos
 * Mantiene compatibilidad con código existente mientras usa la API de EPAGAL internamente
 */
import { 
  incidenciasService, 
  TipoIncidencia, 
  EstadoIncidencia, 
  ZonaIncidencia,
  IncidenciaResponse,
  IncidenciaCreate,
  IncidenciaStats
} from './incidenciasService';

/**
 * Mapeo de tipos de reporte a tipos de incidencia EPAGAL
 */
export const ReportType = {
  OVERFLOW: TipoIncidencia.CONTENEDOR_LLENO,
  ILLEGAL_DUMP: TipoIncidencia.BASURA_ESPARCIDA,
  DAMAGED_CONTAINER: TipoIncidencia.PUNTO_CRITICO,
  MISSED_COLLECTION: TipoIncidencia.FALTA_RECOLECCION,
  DANGEROUS: TipoIncidencia.RESIDUO_PELIGROSO,
  OTHER: TipoIncidencia.OTRO,
} as const;

/**
 * Mapeo de estados de reporte a estados de incidencia EPAGAL
 */
export const ReportStatus = {
  PENDING: EstadoIncidencia.PENDIENTE,
  IN_PROGRESS: EstadoIncidencia.EN_PROCESO,
  RESOLVED: EstadoIncidencia.RESUELTA,
  REJECTED: EstadoIncidencia.RECHAZADA,
} as const;

/**
 * Interface para reporte de residuos
 */
export interface WasteReport {
  id: number;
  userId: number;
  type: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  photoUrl?: string;
  status: string;
  severity: number;
  zone: string;
  createdAt: string;
  reportedAt: string;
}

/**
 * Interface para crear un reporte
 */
export interface CreateReportData {
  userId: number;
  type: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  photoUrl?: string;
  severity?: number;
  zone?: string;
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

class WasteReportService {
  /**
   * Formatear mensaje de error para el usuario
   */
  private formatErrorMessage(error: any): string {
    if (error.response) {
      // Error de respuesta del servidor
      const status = error.response.status;
      const detail = error.response.data?.detail;
      
      if (status === 400) {
        return detail || 'Datos inv\u00e1lidos. Por favor verifica la informaci\u00f3n.';
      } else if (status === 401) {
        return 'No tienes autorizaci\u00f3n. Por favor inicia sesi\u00f3n.';
      } else if (status === 404) {
        return 'No se encontr\u00f3 el recurso solicitado.';
      } else if (status === 500) {
        return 'Error en el servidor. Por favor intenta m\u00e1s tarde.';
      } else if (status === 503) {
        return 'El servicio no est\u00e1 disponible. Por favor intenta m\u00e1s tarde.';
      }
      return detail || `Error del servidor (${status})`;
    } else if (error.request) {
      // Error de red
      return 'No se pudo conectar al servidor. Verifica tu conexi\u00f3n a internet.';
    } else {
      // Otro tipo de error
      return error.message || 'Ocurri\u00f3 un error inesperado.';
    }
  }

  /**
   * Crear un nuevo reporte (usa API de EPAGAL)
   */
  async createReport(data: CreateReportData): Promise<WasteReport> {
    try {
      // Determinar zona automáticamente
      const zona = data.zone 
        ? (data.zone as ZonaIncidencia)
        : incidenciasService.determinarZona(
            data.coordinates.latitude,
            data.coordinates.longitude
          );

      // Crear incidencia en EPAGAL
      const incidencia = await incidenciasService.crearIncidencia({
        tipo: data.type,
        gravedad: data.severity || 3,
        descripcion: data.description,
        lat: data.coordinates.latitude,
        lon: data.coordinates.longitude,
        zona: zona,
        usuario_id: data.userId,
        foto_url: data.photoUrl,
        ventana_inicio: new Date().toISOString(),
        ventana_fin: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Convertir a formato WasteReport
      return this.convertToWasteReport(incidencia);
    } catch (error: any) {
      console.error('❌ Error creando reporte:', error);
      const errorMessage = this.formatErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener todos los reportes
   */
  async getAllReports(): Promise<WasteReport[]> {
    try {
      const incidencias = await incidenciasService.listarIncidencias(0, 100);
      return incidencias.map(inc => this.convertToWasteReport(inc));
    } catch (error: any) {
      console.error('❌ Error obteniendo reportes:', error);
      const errorMessage = this.formatErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener reportes de un usuario
   */
  async getUserReports(userId: number): Promise<WasteReport[]> {
    try {
      const incidencias = await incidenciasService.listarIncidencias(0, 100);
      const filtered = incidencias.filter(inc => inc.usuario_id === userId);
      return filtered.map(inc => this.convertToWasteReport(inc));
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
      const incidencias = await incidenciasService.listarIncidencias(0, 100);
      
      // Filtrar por distancia
      const nearby = incidencias.filter(inc => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          inc.lat,
          inc.lon
        );
        return distance <= radiusKm;
      });

      return nearby.map(inc => this.convertToWasteReport(inc));
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
      const stats = await incidenciasService.obtenerEstadisticas();
      return {
        total: stats.total_incidencias,
        byStatus: {
          PENDIENTE: stats.pendientes,
          EN_PROCESO: stats.en_proceso,
          RESUELTA: stats.resueltas,
          RECHAZADA: stats.rechazadas,
        },
        pending: stats.pendientes,
        inProgress: stats.en_proceso,
        resolved: stats.resueltas,
        rejected: stats.rechazadas,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener un reporte por ID
   */
  async getReportById(id: number): Promise<WasteReport> {
    try {
      const incidencia = await incidenciasService.obtenerIncidencia(id);
      return this.convertToWasteReport(incidencia);
    } catch (error) {
      console.error('❌ Error obteniendo reporte:', error);
      throw error;
    }
  }

  /**
   * Actualizar un reporte
   */
  async updateReport(id: number, data: Partial<CreateReportData>): Promise<WasteReport> {
    try {
      const incidencia = await incidenciasService.actualizarIncidencia(id, {
        tipo: data.type,
        gravedad: data.severity,
        descripcion: data.description,
        foto_url: data.photoUrl,
      });
      return this.convertToWasteReport(incidencia);
    } catch (error) {
      console.error('❌ Error actualizando reporte:', error);
      throw error;
    }
  }

  /**
   * Eliminar un reporte
   */
  async deleteReport(id: number): Promise<void> {
    try {
      await incidenciasService.eliminarIncidencia(id);
    } catch (error) {
      console.error('❌ Error eliminando reporte:', error);
      throw error;
    }
  }

  /**
   * Convertir IncidenciaResponse a WasteReport
   */
  private convertToWasteReport(incidencia: any): WasteReport {
    return {
      id: incidencia.id,
      userId: incidencia.usuario_id,
      type: incidencia.tipo,
      description: incidencia.descripcion,
      coordinates: {
        latitude: incidencia.lat,
        longitude: incidencia.lon,
      },
      address: incidencia.zona,
      photoUrl: incidencia.foto_url,
      status: incidencia.estado,
      severity: incidencia.gravedad,
      zone: incidencia.zona,
      createdAt: incidencia.created_at,
      reportedAt: incidencia.reportado_en,
    };
  }

  /**
   * Calcular distancia entre dos coordenadas (fórmula de Haversine)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Instancia singleton del servicio
export const wasteReportService = new WasteReportService();

// Exportar también la clase para testing
export default WasteReportService;

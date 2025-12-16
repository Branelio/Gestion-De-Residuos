import axios, { AxiosInstance } from 'axios';

/**
 * Configuración de la API externa de EPAGAL
 */
const EPAGAL_API_CONFIG = {
  BASE_URL: 'https://epagal-backend-routing-latest.onrender.com',
  TIMEOUT: 15000, // 15 segundos (API externa puede ser más lenta)
};

/**
 * Tipos de incidencia según la API de EPAGAL
 */
export enum TipoIncidencia {
  CONTENEDOR_LLENO = 'CONTENEDOR_LLENO',
  RESIDUO_PELIGROSO = 'RESIDUO_PELIGROSO',
  BASURA_ESPARCIDA = 'BASURA_ESPARCIDA',
  FALTA_RECOLECCION = 'FALTA_RECOLECCION',
  PUNTO_CRITICO = 'PUNTO_CRITICO',
  OTRO = 'OTRO',
}

/**
 * Estados de incidencia según la API de EPAGAL
 */
export enum EstadoIncidencia {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTA = 'RESUELTA',
  RECHAZADA = 'RECHAZADA',
}

/**
 * Zonas de Latacunga según la API de EPAGAL
 */
export enum ZonaIncidencia {
  NORTE = 'NORTE',
  SUR = 'SUR',
  CENTRO = 'CENTRO',
  ESTE = 'ESTE',
  OESTE = 'OESTE',
}

/**
 * Interface para crear una incidencia
 */
export interface IncidenciaCreate {
  tipo: TipoIncidencia;
  gravedad: number; // 1-5
  descripcion: string;
  foto_url?: string;
  lat: number;
  lon: number;
  zona: ZonaIncidencia;
  ventana_inicio?: string; // ISO 8601
  ventana_fin?: string; // ISO 8601
  usuario_id: number;
}

/**
 * Interface para la respuesta de incidencia
 */
export interface IncidenciaResponse {
  id: number;
  tipo: string;
  gravedad: number;
  descripcion: string;
  foto_url?: string;
  lat: number;
  lon: number;
  zona: string;
  estado: string;
  ventana_inicio?: string;
  ventana_fin?: string;
  reportado_en: string;
  usuario_id: number;
  created_at: string;
}

/**
 * Interface para actualizar una incidencia
 */
export interface IncidenciaUpdate {
  tipo?: TipoIncidencia;
  gravedad?: number;
  descripcion?: string;
  foto_url?: string;
  estado?: EstadoIncidencia;
  zona?: ZonaIncidencia;
}

/**
 * Interface para estadísticas de incidencias
 */
export interface IncidenciaStats {
  total_incidencias: number;
  pendientes: number;
  en_proceso: number;
  resueltas: number;
  rechazadas: number;
  por_tipo: Record<string, number>;
  por_zona: Record<string, number>;
  gravedad_promedio: number;
}

/**
 * Interface para respuesta de autenticación
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Servicio para interactuar con la API externa de EPAGAL
 */
class IncidenciasService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: EPAGAL_API_CONFIG.BASE_URL,
      timeout: EPAGAL_API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autenticación
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        console.log(`🌐 EPAGAL API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor de respuesta para logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ EPAGAL API Response: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('❌ EPAGAL API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Establecer token de autenticación
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Limpiar token de autenticación
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Login en la API de EPAGAL (si es necesario)
   * Nota: Esto es opcional si ya tienes autenticación en tu app
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.client.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });
      
      this.setToken(response.data.access_token);
      return response.data;
    } catch (error: any) {
      console.error('Error en login EPAGAL:', error);
      throw new Error(error.response?.data?.detail || 'Error al iniciar sesión en EPAGAL');
    }
  }

  /**
   * Crear una nueva incidencia
   */
  async crearIncidencia(data: IncidenciaCreate): Promise<IncidenciaResponse> {
    try {
      console.log('📤 Creando incidencia:', data);
      const response = await this.client.post<IncidenciaResponse>('/api/incidencias/', data);
      console.log('✅ Incidencia creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear incidencia:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al crear la incidencia'
      );
    }
  }

  /**
   * Listar todas las incidencias
   */
  async listarIncidencias(
    skip: number = 0,
    limit: number = 100
  ): Promise<IncidenciaResponse[]> {
    try {
      const response = await this.client.get<IncidenciaResponse[]>('/api/incidencias/', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al listar incidencias:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al obtener las incidencias'
      );
    }
  }

  /**
   * Listar incidencias de un usuario específico
   */
  async listarIncidenciasPorUsuario(
    usuarioId: number,
    skip: number = 0,
    limit: number = 100
  ): Promise<IncidenciaResponse[]> {
    try {
      const todasIncidencias = await this.listarIncidencias(skip, limit);
      return todasIncidencias.filter(inc => inc.usuario_id === usuarioId);
    } catch (error: any) {
      console.error('Error al listar incidencias del usuario:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al obtener las incidencias del usuario'
      );
    }
  }

  /**
   * Listar incidencias por zona
   */
  async listarIncidenciasPorZona(
    zona: ZonaIncidencia,
    skip: number = 0,
    limit: number = 100
  ): Promise<IncidenciaResponse[]> {
    try {
      const todasIncidencias = await this.listarIncidencias(skip, limit);
      return todasIncidencias.filter(inc => inc.zona === zona);
    } catch (error: any) {
      console.error('Error al listar incidencias por zona:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al obtener las incidencias de la zona'
      );
    }
  }

  /**
   * Obtener una incidencia por ID
   */
  async obtenerIncidencia(id: number): Promise<IncidenciaResponse> {
    try {
      const response = await this.client.get<IncidenciaResponse>(
        `/api/incidencias/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener incidencia:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al obtener la incidencia'
      );
    }
  }

  /**
   * Actualizar una incidencia
   */
  async actualizarIncidencia(
    id: number,
    data: IncidenciaUpdate
  ): Promise<IncidenciaResponse> {
    try {
      const response = await this.client.patch<IncidenciaResponse>(
        `/api/incidencias/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar incidencia:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al actualizar la incidencia'
      );
    }
  }

  /**
   * Eliminar una incidencia
   */
  async eliminarIncidencia(id: number): Promise<{ message: string }> {
    try {
      const response = await this.client.delete<{ message: string }>(
        `/api/incidencias/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar incidencia:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al eliminar la incidencia'
      );
    }
  }

  /**
   * Obtener estadísticas de incidencias
   */
  async obtenerEstadisticas(): Promise<IncidenciaStats> {
    try {
      const response = await this.client.get<IncidenciaStats>('/api/incidencias/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al obtener las estadísticas'
      );
    }
  }

  /**
   * Verificar umbral de zona (si hay demasiadas incidencias en una zona)
   */
  async verificarUmbralZona(zona: ZonaIncidencia): Promise<{
    zona: string;
    total_incidencias: number;
    umbral_superado: boolean;
    umbral_configurado: number;
  }> {
    try {
      const response = await this.client.get(`/api/incidencias/zona/${zona}/umbral`);
      return response.data;
    } catch (error: any) {
      console.error('Error al verificar umbral de zona:', error);
      throw new Error(
        error.response?.data?.detail || 'Error al verificar el umbral de la zona'
      );
    }
  }

  /**
   * Determinar zona basada en coordenadas (helper method)
   * Basado en las coordenadas de Latacunga, Ecuador
   */
  determinarZona(lat: number, lon: number): ZonaIncidencia {
    // Coordenadas del centro de Latacunga: -0.9346, -78.6157
    const latCenter = -0.9346;
    const lonCenter = -78.6157;
    
    // Calcular diferencias
    const latDiff = lat - latCenter;
    const lonDiff = lon - lonCenter;
    
    // Umbral para considerar como centro (aproximadamente 1km = 0.009 grados)
    const centerThreshold = 0.01;
    
    // Si está muy cerca del centro
    if (Math.abs(latDiff) < centerThreshold && Math.abs(lonDiff) < centerThreshold) {
      return ZonaIncidencia.CENTRO;
    }
    
    // Determinar zona por cuadrante
    const absLatDiff = Math.abs(latDiff);
    const absLonDiff = Math.abs(lonDiff);
    
    if (absLatDiff > absLonDiff) {
      // Más desplazamiento en latitud
      return latDiff > 0 ? ZonaIncidencia.NORTE : ZonaIncidencia.SUR;
    } else {
      // Más desplazamiento en longitud
      return lonDiff > 0 ? ZonaIncidencia.ESTE : ZonaIncidencia.OESTE;
    }
  }

  /**
   * Convertir gravedad numérica a nivel descriptivo
   */
  obtenerNivelGravedad(gravedad: number): string {
    if (gravedad <= 1) return 'Muy Baja';
    if (gravedad <= 2) return 'Baja';
    if (gravedad <= 3) return 'Media';
    if (gravedad <= 4) return 'Alta';
    return 'Crítica';
  }
}

// Exportar instancia singleton
export const incidenciasService = new IncidenciasService();
export default incidenciasService;

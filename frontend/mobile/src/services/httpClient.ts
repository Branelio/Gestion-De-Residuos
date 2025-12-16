import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Configuración base de la API
 * Cambiar BASE_URL en producción
 */
const API_CONFIG = {
  // Para desarrollo local desde dispositivo físico usa tu IP local
  // Para emulador Android usa: http://10.0.2.2:3000
  // Para simulador iOS usa: http://localhost:3000
  BASE_URL: 'http://10.0.2.2:3000', // IP para emulador Android
  TIMEOUT: 10000, // 10 segundos
};

/**
 * Cliente HTTP configurado para la API de Latacunga Waste Management
 */
class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor de request para logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor de response para logging y manejo de errores
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
        console.log('📦 Response data:', JSON.stringify(response.data).substring(0, 200));
        
        // Si la respuesta tiene formato {success: true, data: ...}, extraer data
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
          console.log('🔄 Unwrapping response.data.data');
          return { ...response, data: response.data.data };
        }
        
        return response;
      },
      (error) => {
        if (error.response) {
          // El servidor respondió con un código de error
          console.error(`❌ API Error: ${error.response.status}`, error.response.data);
        } else if (error.request) {
          // La petición fue hecha pero no hubo respuesta
          console.error('❌ Network Error: No response received');
        } else {
          // Algo más sucedió
          console.error('❌ Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  /**
   * Verifica si la API está disponible
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get<{ status: string }>('/health');
      return response.status === 'OK';
    } catch (error) {
      return false;
    }
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();

// Exportar también la clase para testing
export default HttpClient;

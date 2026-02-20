import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Constants from 'expo-constants';

/**
 * Detecta automáticamente la IP del servidor de desarrollo.
 * 
 * En Expo Go, usa el debugger host (misma IP que sirve el bundle JS).
 * Si hay una URL configurada en app.json → extra.apiUrl, la usa como override.
 * Fallback: localhost (para builds de producción o emulador).
 */
function getApiBaseUrl(): string {
  // 1. Override manual en app.json (si existe y no es la IP vieja hardcodeada)
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configuredUrl) {
    return configuredUrl;
  }

  // 2. Auto-detectar IP del dev server de Expo
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    // debuggerHost viene como "192.168.1.100:8081", extraemos solo la IP
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3000`;
  }

  // 3. Fallback para producción
  return 'http://localhost:3000';
}

const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000, // 10 segundos
};

/**
 * Cliente HTTP configurado para la API de Latacunga Waste Management
 */
class HttpClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor de request para logging y autenticación
    this.client.interceptors.request.use(
      (config) => {
        // Agregar token si existe
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
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

  /**
   * Configurar token de autenticación
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Limpiar token de autenticación
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Obtener la URL base del API
   */
  getBaseUrl(): string {
    return API_CONFIG.BASE_URL;
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();

// Exportar la instancia como default (para compatibilidad)
export default httpClient;


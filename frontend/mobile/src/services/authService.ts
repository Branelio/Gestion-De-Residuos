import { httpClient } from './httpClient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'operator' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Servicio de autenticación para la app móvil
 */
class AuthService {
  private readonly BASE_PATH = '/api/auth';

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>(
        `${this.BASE_PATH}/login`,
        credentials
      );
      return response;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>(
        `${this.BASE_PATH}/register`,
        data
      );
      return response;
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al registrar usuario.'
      );
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await httpClient.get<User>(
        `${this.BASE_PATH}/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response;
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      throw new Error('Error al obtener información del usuario.');
    }
  }
}

// Instancia singleton
export const authService = new AuthService();
export default AuthService;

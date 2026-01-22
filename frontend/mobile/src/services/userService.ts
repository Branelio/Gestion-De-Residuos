/**
 * Servicio para gestión de usuarios
 */
import { httpClient } from './httpClient';

/**
 * Interface para el usuario
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'citizen';
  phone?: string;
  address?: string;
  avatar?: string;
  points?: number;
  reportsCount?: number;
  createdAt?: string;
}

/**
 * Interface para actualizar perfil
 */
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
}

/**
 * Interface para cambiar contraseña
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Servicio de gestión de usuarios
 */
class UserService {
  /**
   * Obtener perfil del usuario actual
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await httpClient.get<User>('/api/users/me');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil del usuario actual
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      console.log('📝 Actualizando perfil:', data);
      const response = await httpClient.put<User>('/api/users/me', data);
      console.log('✅ Perfil actualizado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      console.log('🔒 Cambiando contraseña...');
      await httpClient.put('/api/users/me/password', data);
      console.log('✅ Contraseña actualizada');
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId: string): Promise<{
    totalReports: number;
    resolvedReports: number;
    pendingReports: number;
    totalPoints: number;
  }> {
    try {
      // TODO: Implementar endpoint real cuando esté disponible
      // Por ahora retornamos datos de ejemplo
      return {
        totalReports: 0,
        resolvedReports: 0,
        pendingReports: 0,
        totalPoints: 0,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

export const userService = new UserService();

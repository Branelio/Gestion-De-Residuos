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
      // Obtener reportes del usuario
      const reportsResponse = await httpClient.get<{ success: boolean; data: any[]; count: number }>(
        `/api/waste-reports/user/${userId}`
      );

      const reports = (reportsResponse as any)?.data || [];
      const totalReports = Array.isArray(reports) ? reports.length : 0;
      const resolvedReports = Array.isArray(reports) ? reports.filter((r: any) => r.status === 'RESOLVED').length : 0;
      const pendingReports = Array.isArray(reports) ? reports.filter((r: any) => r.status === 'PENDING').length : 0;

      // Obtener puntos de gamificación
      let totalPoints = 0;
      try {
        const gamResponse = await httpClient.get<any>(`/api/gamification/profile/${userId}`);
        totalPoints = (gamResponse as any)?.data?.totalPoints || (gamResponse as any)?.totalPoints || 0;
      } catch {
        // Si no hay perfil de gamificación, usar 0
      }

      return {
        totalReports,
        resolvedReports,
        pendingReports,
        totalPoints,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalReports: 0,
        resolvedReports: 0,
        pendingReports: 0,
        totalPoints: 0,
      };
    }
  }
}

export const userService = new UserService();

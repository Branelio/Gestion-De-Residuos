// Service - User Feedback
import { httpClient } from './httpClient';

export enum FeedbackType {
  GEOLOCATION_ACCURACY = 'GEOLOCATION_ACCURACY',
  APP_USABILITY = 'APP_USABILITY',
  COLLECTION_POINT_ISSUE = 'COLLECTION_POINT_ISSUE',
  FEATURE_SUGGESTION = 'FEATURE_SUGGESTION',
  BUG_REPORT = 'BUG_REPORT',
  OTHER = 'OTHER',
}

export interface SubmitFeedbackRequest {
  userId: string;
  type: FeedbackType;
  rating: number; // 1-5
  comment?: string;
  metadata?: {
    userLocation?: {
      latitude: number;
      longitude: number;
    };
    nearestPointId?: string;
    appVersion?: string;
    deviceInfo?: string;
  };
}

export interface FeedbackStats {
  averageRating: number;
  totalFeedback: number;
  recentFeedback: any[];
}

class FeedbackService {
  /**
   * Enviar feedback de usuario
   */
  async submitFeedback(feedback: SubmitFeedbackRequest): Promise<{ success: boolean; feedbackId?: string; error?: string }> {
    try {
      console.log('📝 Enviando feedback:', feedback);
      const response = await httpClient.post<{ success: boolean; feedbackId?: string; error?: string }>(
        '/api/feedback',
        feedback
      );
      console.log('✅ Feedback enviado:', response);
      return response;
    } catch (error) {
      console.error('Error enviando feedback:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de feedback
   */
  async getStats(type?: FeedbackType): Promise<FeedbackStats> {
    try {
      const url = type ? `/api/feedback/stats?type=${type}` : '/api/feedback/stats';
      const response = await httpClient.get<{ success: boolean; data: FeedbackStats }>(url);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de feedback:', error);
      throw error;
    }
  }

  /**
   * Obtener feedback de un usuario
   */
  async getUserFeedback(userId: string): Promise<any[]> {
    try {
      const response = await httpClient.get<{ success: boolean; data: any[] }>(
        `/api/feedback/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo feedback del usuario:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();

// Application Use Case - Submit User Feedback

import { UserFeedbackRepository } from '@domain/repositories/UserFeedbackRepository';
import { UserFeedback, FeedbackType, FeedbackRating } from '@domain/entities/UserFeedback';

export interface SubmitFeedbackRequest {
  userId: string;
  type: FeedbackType;
  rating: FeedbackRating;
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

export interface SubmitFeedbackResponse {
  success: boolean;
  feedbackId?: string;
  error?: string;
}

export class SubmitUserFeedbackUseCase {
  constructor(private readonly feedbackRepository: UserFeedbackRepository) {}

  async execute(request: SubmitFeedbackRequest): Promise<SubmitFeedbackResponse> {
    try {
      // Validaciones
      if (!request.userId) {
        return {
          success: false,
          error: 'User ID is required',
        };
      }

      if (!request.type) {
        return {
          success: false,
          error: 'Feedback type is required',
        };
      }

      if (!request.rating || request.rating < 1 || request.rating > 5) {
        return {
          success: false,
          error: 'Rating must be between 1 and 5',
        };
      }

      // Crear feedback
      const feedback = UserFeedback.create({
        userId: request.userId,
        type: request.type,
        rating: request.rating,
        comment: request.comment,
        metadata: {
          ...request.metadata,
          timestamp: new Date(),
        },
      });

      // Guardar
      await this.feedbackRepository.save(feedback);

      return {
        success: true,
        feedbackId: feedback.id.value,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// HTTP Controller - User Feedback

import { Request, Response } from 'express';
import { SubmitUserFeedbackUseCase } from '@application/use-cases/SubmitUserFeedbackUseCase';
import { UserFeedbackRepository } from '@domain/repositories/UserFeedbackRepository';
import { FeedbackType, FeedbackRating } from '@domain/entities/UserFeedback';

export class UserFeedbackController {
  constructor(
    private readonly submitFeedbackUseCase: SubmitUserFeedbackUseCase,
    private readonly feedbackRepository: UserFeedbackRepository
  ) {}

  /**
   * POST /api/feedback
   * Enviar feedback de usuario
   */
  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, rating, comment, metadata } = req.body;

      const response = await this.submitFeedbackUseCase.execute({
        userId,
        type: type as FeedbackType,
        rating: rating as FeedbackRating,
        comment,
        metadata,
      });

      if (response.success) {
        res.status(201).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/feedback/stats
   * Obtener estadísticas de feedback
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;

      const averageRating = await this.feedbackRepository.getAverageRating(
        type as FeedbackType | undefined
      );

      const recentFeedback = await this.feedbackRepository.findRecent(10);

      res.json({
        success: true,
        data: {
          averageRating,
          totalFeedback: recentFeedback.length,
          recentFeedback: recentFeedback.map((fb) => fb.toPrimitives()),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/feedback/user/:userId
   * Obtener feedback de un usuario específico
   */
  async getUserFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const feedback = await this.feedbackRepository.findByUserId(userId);

      res.json({
        success: true,
        data: feedback.map((fb) => fb.toPrimitives()),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

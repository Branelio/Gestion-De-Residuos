// Domain Repository Interface - UserFeedback

import { UserFeedback, UserFeedbackId, FeedbackType } from '../entities/UserFeedback';

export interface UserFeedbackRepository {
  save(feedback: UserFeedback): Promise<void>;
  findById(id: UserFeedbackId): Promise<UserFeedback | null>;
  findAll(): Promise<UserFeedback[]>;
  findByUserId(userId: string): Promise<UserFeedback[]>;
  findByType(type: FeedbackType): Promise<UserFeedback[]>;
  findRecent(limit: number): Promise<UserFeedback[]>;
  getAverageRating(type?: FeedbackType): Promise<number>;
}

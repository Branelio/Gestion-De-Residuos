// Infrastructure - MongoDB Repository for UserFeedback

import { UserFeedbackRepository } from '../../domain/repositories/UserFeedbackRepository';
import {
  UserFeedback,
  UserFeedbackId,
  UserFeedbackProps,
  FeedbackType,
  FeedbackRating,
} from '../../domain/entities/UserFeedback';
import { UserFeedbackModel } from '../persistence/UserFeedbackModel';

export class MongoUserFeedbackRepository implements UserFeedbackRepository {
  async save(feedback: UserFeedback): Promise<void> {
    const primitives = feedback.toPrimitives();

    const doc = new UserFeedbackModel({
      _id: primitives.id.value,
      userId: primitives.userId,
      type: primitives.type,
      rating: primitives.rating,
      comment: primitives.comment,
      metadata: primitives.metadata,
      createdAt: primitives.createdAt,
    });

    await doc.save();
  }

  async findById(id: UserFeedbackId): Promise<UserFeedback | null> {
    const doc = await UserFeedbackModel.findById(id.value).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(): Promise<UserFeedback[]> {
    const docs = await UserFeedbackModel.find().sort({ createdAt: -1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByUserId(userId: string): Promise<UserFeedback[]> {
    const docs = await UserFeedbackModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByType(type: FeedbackType): Promise<UserFeedback[]> {
    const docs = await UserFeedbackModel.find({ type })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findRecent(limit: number): Promise<UserFeedback[]> {
    const docs = await UserFeedbackModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async getAverageRating(type?: FeedbackType): Promise<number> {
    const match = type ? { type } : {};

    const result = await UserFeedbackModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    return result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
  }

  private toDomain(doc: any): UserFeedback {
    const props: UserFeedbackProps = {
      id: { value: doc._id.toString() },
      userId: doc.userId,
      type: doc.type as FeedbackType,
      rating: doc.rating as FeedbackRating,
      comment: doc.comment,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
    };

    return UserFeedback.fromPersistence(props);
  }
}

// Domain Entity - User Feedback
// Retroalimentación de usuarios sobre la experiencia de geolocalización

export interface UserFeedbackId {
  value: string;
}

export enum FeedbackType {
  GEOLOCATION_ACCURACY = 'GEOLOCATION_ACCURACY',
  APP_USABILITY = 'APP_USABILITY',
  COLLECTION_POINT_ISSUE = 'COLLECTION_POINT_ISSUE',
  FEATURE_SUGGESTION = 'FEATURE_SUGGESTION',
  BUG_REPORT = 'BUG_REPORT',
  OTHER = 'OTHER',
}

export enum FeedbackRating {
  VERY_BAD = 1,
  BAD = 2,
  NEUTRAL = 3,
  GOOD = 4,
  VERY_GOOD = 5,
}

export interface UserFeedbackProps {
  id: UserFeedbackId;
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
    timestamp?: Date;
  };
  createdAt: Date;
}

export class UserFeedback {
  private constructor(private readonly props: UserFeedbackProps) {}

  static create(props: Omit<UserFeedbackProps, 'id' | 'createdAt'>): UserFeedback {
    return new UserFeedback({
      ...props,
      id: { value: `FEEDBACK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: UserFeedbackProps): UserFeedback {
    return new UserFeedback(props);
  }

  get id(): UserFeedbackId {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): FeedbackType {
    return this.props.type;
  }

  get rating(): FeedbackRating {
    return this.props.rating;
  }

  get comment(): string | undefined {
    return this.props.comment;
  }

  get metadata(): UserFeedbackProps['metadata'] {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPrimitives(): UserFeedbackProps {
    return {
      id: this.props.id,
      userId: this.props.userId,
      type: this.props.type,
      rating: this.props.rating,
      comment: this.props.comment,
      metadata: this.props.metadata,
      createdAt: this.props.createdAt,
    };
  }
}

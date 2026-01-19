// Infrastructure - MongoDB Model for UserFeedback

import mongoose, { Schema, Document } from 'mongoose';

interface IUserFeedbackDocument extends Document {
  userId: string;
  type: string;
  rating: number;
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

const UserFeedbackSchema = new Schema<IUserFeedbackDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'GEOLOCATION_ACCURACY',
        'APP_USABILITY',
        'COLLECTION_POINT_ISSUE',
        'FEATURE_SUGGESTION',
        'BUG_REPORT',
        'OTHER',
      ],
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    metadata: {
      userLocation: {
        latitude: Number,
        longitude: Number,
      },
      nearestPointId: String,
      appVersion: String,
      deviceInfo: String,
      timestamp: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Índice para búsquedas rápidas por fecha
UserFeedbackSchema.index({ createdAt: -1 });

// Índice compuesto para análisis por tipo y fecha
UserFeedbackSchema.index({ type: 1, createdAt: -1 });

export const UserFeedbackModel = mongoose.model<IUserFeedbackDocument>(
  'UserFeedback',
  UserFeedbackSchema
);

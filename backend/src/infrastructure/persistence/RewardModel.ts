/**
 * Modelo de MongoDB para Recompensas
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Recompensa
 */
export interface IRewardDocument extends Omit<Document, '_id'> {
    _id: mongoose.Types.ObjectId;
    type: 'discount' | 'recognition' | 'raffle' | 'benefit' | 'merchandise';
    title: string;
    description: string;
    pointsCost: number;
    stock: number | null;
    status: 'active' | 'inactive' | 'expired' | 'out_of_stock';
    expiresAt: Date | null;
    imageUrl: string;
    termsAndConditions: string;
    partner: string | null;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema de Mongoose para Recompensas
 */
const rewardSchema = new Schema<IRewardDocument>(
    {
        type: {
            type: String,
            enum: ['discount', 'recognition', 'raffle', 'benefit', 'merchandise'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        pointsCost: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: {
            type: Number,
            default: null, // null = ilimitado
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'expired', 'out_of_stock'],
            default: 'active',
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        termsAndConditions: {
            type: String,
            required: true,
        },
        partner: {
            type: String,
            default: null,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Índices para consultas frecuentes
rewardSchema.index({ status: 1, pointsCost: 1 });
rewardSchema.index({ type: 1, status: 1 });

export const RewardModel = mongoose.model<IRewardDocument>(
    'Reward',
    rewardSchema
);

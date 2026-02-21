/**
 * Repositorio de MongoDB para Recompensas (Rewards)
 */

import { RewardModel, IRewardDocument } from '../persistence/RewardModel';
import {
    Reward,
    RewardId,
    RewardType,
    RewardStatus
} from '../../domain/entities/Reward';
import { RewardRepository } from '../../application/use-cases/RedeemReward';

export class MongoRewardRepository implements RewardRepository {
    /**
     * Busca todas las recompensas
     */
    async findAll(): Promise<Reward[]> {
        const docs = await RewardModel.find().exec();
        return docs.map((doc: IRewardDocument) => this.toDomain(doc));
    }

    /**
     * Busca recompensas disponibles
     */
    async findAvailable(): Promise<Reward[]> {
        const now = new Date();
        const docs = await RewardModel.find({
            status: RewardStatus.ACTIVE,
            $and: [
                {
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: now } }
                    ]
                },
                {
                    $or: [
                        { stock: null },
                        { stock: { $gt: 0 } }
                    ]
                }
            ]
        }).exec();

        return docs.map((doc: IRewardDocument) => this.toDomain(doc));
    }

    /**
     * Busca una recompensa por ID
     */
    async findById(id: RewardId): Promise<Reward | null> {
        const doc = await RewardModel.findById(id.value).exec();
        
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    /**
     * Guarda o actualiza una recompensa
     */
    async save(reward: Reward): Promise<void> {
        const doc = await RewardModel.findById(reward.id.value).exec();

        if (doc) {
            // Actualizar documento existente
            doc.type = reward.type;
            doc.title = reward.title;
            doc.description = reward.description;
            doc.pointsCost = reward.pointsCost;
            doc.stock = reward.stock;
            doc.status = reward.status;
            doc.expiresAt = reward.expiresAt;
            doc.imageUrl = reward.imageUrl;
            doc.termsAndConditions = reward.termsAndConditions;
            doc.partner = reward.partner;
            doc.metadata = reward.metadata;
            doc.updatedAt = reward.updatedAt;

            await doc.save();
        } else {
            // Crear nuevo documento
            await RewardModel.create({
                _id: reward.id.value,
                type: reward.type,
                title: reward.title,
                description: reward.description,
                pointsCost: reward.pointsCost,
                stock: reward.stock,
                status: reward.status,
                expiresAt: reward.expiresAt,
                imageUrl: reward.imageUrl,
                termsAndConditions: reward.termsAndConditions,
                partner: reward.partner,
                metadata: reward.metadata,
                createdAt: reward.createdAt,
                updatedAt: reward.updatedAt
            });
        }
    }

    /**
     * Convierte un documento de MongoDB a entidad de dominio
     */
    private toDomain(doc: IRewardDocument): Reward {
        return new Reward(
            new RewardId(doc._id.toString()),
            doc.type as RewardType,
            doc.title,
            doc.description,
            doc.pointsCost,
            doc.stock,
            doc.status as RewardStatus,
            doc.expiresAt,
            doc.imageUrl,
            doc.termsAndConditions,
            doc.partner,
            doc.metadata || {},
            doc.createdAt,
            doc.updatedAt
        );
    }
}

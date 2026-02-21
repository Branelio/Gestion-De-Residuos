/**
 * Repositorio de MongoDB para Logros (Achievements)
 */

import { AchievementModel, IAchievementDocument } from '../persistence/GamificationModel';
import {
    Achievement,
    AchievementId,
    AchievementCategory
} from '../../domain/entities/Achievement';
import { AchievementRepository } from '../../application/use-cases/GetAchievements';

export class MongoAchievementRepository implements AchievementRepository {
    /**
     * Busca todos los logros
     */
    async findAll(): Promise<Achievement[]> {
        const docs = await AchievementModel.find().exec();
        return docs.map(doc => this.toDomain(doc));
    }

    /**
     * Busca un logro por ID
     */
    async findById(id: AchievementId): Promise<Achievement | null> {
        const doc = await AchievementModel.findById(id.value).exec();
        
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    /**
     * Busca un logro por código
     */
    async findByCode(code: string): Promise<Achievement | null> {
        const doc = await AchievementModel.findOne({ code }).exec();
        
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    /**
     * Guarda o actualiza un logro
     */
    async save(achievement: Achievement): Promise<void> {
        const doc = await AchievementModel.findById(achievement.id.value).exec();

        if (doc) {
            // Actualizar documento existente
            doc.code = achievement.code;
            doc.name = achievement.name;
            doc.description = achievement.description;
            doc.icon = achievement.icon;
            doc.pointsRequired = achievement.pointsRequired;
            doc.reportsRequired = achievement.reportsRequired;
            doc.category = achievement.category;
            doc.hidden = achievement.hidden;
            doc.special = achievement.special;

            await doc.save();
        } else {
            // Crear nuevo documento
            await AchievementModel.create({
                _id: achievement.id.value,
                code: achievement.code,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                pointsRequired: achievement.pointsRequired,
                reportsRequired: achievement.reportsRequired,
                category: achievement.category,
                hidden: achievement.hidden,
                special: achievement.special
            });
        }
    }

    /**
     * Convierte un documento de MongoDB a entidad de dominio
     */
    private toDomain(doc: IAchievementDocument): Achievement {
        return new Achievement(
            new AchievementId(doc._id.toString()),
            doc.code,
            doc.name,
            doc.description,
            doc.icon,
            doc.pointsRequired,
            doc.reportsRequired,
            doc.category as AchievementCategory,
            doc.hidden || false,
            doc.special || false
        );
    }
}

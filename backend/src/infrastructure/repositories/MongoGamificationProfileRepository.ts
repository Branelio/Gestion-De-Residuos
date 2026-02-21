/**
 * Repositorio de MongoDB para Perfiles de Gamificación
 */

import { GamificationModel, IGamificationDocument } from '../persistence/GamificationModel';
import { 
    GamificationProfile,
    GamificationProfileId,
    Badge,
    Streak
} from '../../domain/entities/GamificationProfile';
import { GamificationProfileRepository } from '../../application/use-cases/GetUserGamificationProfile';

export class MongoGamificationProfileRepository implements GamificationProfileRepository {
    /**
     * Busca un perfil por ID de usuario
     */
    async findByUserId(userId: string): Promise<GamificationProfile | null> {
        const doc = await GamificationModel.findOne({ userId }).exec();
        
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    /**
     * Busca los top N perfiles por puntos (para leaderboard)
     */
    async findTopByPoints(limit: number): Promise<GamificationProfile[]> {
        const docs = await GamificationModel
            .find()
            .sort({ totalPoints: -1, level: -1 })
            .limit(limit)
            .exec();

        return docs.map(doc => this.toDomain(doc));
    }

    /**
     * Guarda o actualiza un perfil
     */
    async save(profile: GamificationProfile): Promise<void> {
        const doc = await GamificationModel.findOne({ userId: profile.userId }).exec();

        if (doc) {
            // Actualizar documento existente
            doc.totalPoints = profile.totalPoints;
            doc.level = profile.level;
            doc.badges = profile.badges.map(b => b.code);
            doc.reportsCount = profile.reportsCount;
            doc.verifiedReportsCount = profile.verifiedReportsCount;
            doc.lastReportDate = profile.lastReportDate;

            // Streak
            doc.streak = {
                currentStreak: profile.streak.currentStreak,
                longestStreak: profile.streak.longestStreak,
                lastActivityDate: profile.streak.lastActivityDate,
                isActive: profile.streak.isActive
            };

            // Misiones
            doc.missions = profile.missions;

            // Recompensas canjeadas
            doc.redeemedRewards = profile.redeemedRewards;

            await doc.save();
        } else {
            // Crear nuevo documento
            await GamificationModel.create({
                userId: profile.userId,
                totalPoints: profile.totalPoints,
                level: profile.level,
                badges: profile.badges.map(b => b.code),
                reportsCount: profile.reportsCount,
                verifiedReportsCount: profile.verifiedReportsCount,
                lastReportDate: profile.lastReportDate,
                streak: {
                    currentStreak: profile.streak.currentStreak,
                    longestStreak: profile.streak.longestStreak,
                    lastActivityDate: profile.streak.lastActivityDate,
                    isActive: profile.streak.isActive
                },
                missions: profile.missions,
                redeemedRewards: profile.redeemedRewards
            });
        }
    }

    /**
     * Convierte un documento de MongoDB a entidad de dominio
     */
    private toDomain(doc: IGamificationDocument): GamificationProfile {
        // Convertir badges array de strings a objetos Badge
        const badges: Badge[] = doc.badges.map((code: string) => ({
            code,
            unlockedAt: new Date() // TODO: Almacenar fecha de desbloqueo
        }));

        // Asegurar que streak existe
        const streak: Streak = doc.streak || {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
            isActive: false
        };

        return new GamificationProfile(
            new GamificationProfileId(doc.userId),
            doc.userId,
            doc.totalPoints,
            doc.level,
            badges,
            doc.reportsCount,
            doc.verifiedReportsCount,
            streak,
            doc.missions || [],
            doc.redeemedRewards || [],
            doc.lastReportDate,
            doc.createdAt,
            doc.updatedAt
        );
    }
}

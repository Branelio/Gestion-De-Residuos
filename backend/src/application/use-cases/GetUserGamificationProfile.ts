/**
 * Caso de Uso: Obtener Perfil de Gamificación del Usuario
 */

import { GamificationProfile, GamificationProfileId } from '../../domain/entities/GamificationProfile';

export interface GamificationProfileRepository {
    findByUserId(userId: string): Promise<GamificationProfile | null>;
    save(profile: GamificationProfile): Promise<void>;
}

export class GetUserGamificationProfileUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository
    ) {}

    async execute(userId: string): Promise<GamificationProfile> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        let profile = await this.gamificationProfileRepository.findByUserId(userId);

        // Si no existe perfil, crear uno nuevo
        if (!profile) {
            profile = new GamificationProfile(
                new GamificationProfileId(userId), // Usar userId como ID del perfil
                userId,
                0, // totalPoints
                1, // level
                [], // badges
                0, // reportsCount
                0, // verifiedReportsCount
                {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: new Date(),
                    isActive: false
                }, // streak
                [], // missions
                []  // redeemedRewards
            );

            await this.gamificationProfileRepository.save(profile);
        }

        return profile;
    }
}

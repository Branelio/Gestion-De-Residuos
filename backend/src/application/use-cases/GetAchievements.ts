/**
 * Caso de Uso: Obtener Todos los Logros (Achievements)
 * Retorna la lista completa de logros disponibles
 */

import { Achievement, AchievementId } from '../../domain/entities/Achievement';

export interface AchievementRepository {
    findAll(): Promise<Achievement[]>;
    findById(id: AchievementId): Promise<Achievement | null>;
    findByCode(code: string): Promise<Achievement | null>;
    save(achievement: Achievement): Promise<void>;
}

export class GetAllAchievementsUseCase {
    constructor(
        private readonly achievementRepository: AchievementRepository
    ) {}

    async execute(includeHidden: boolean = false): Promise<Achievement[]> {
        const achievements = await this.achievementRepository.findAll();

        // Filtrar logros ocultos si no se solicitan explícitamente
        if (!includeHidden) {
            return achievements.filter(achievement => !achievement.hidden);
        }

        return achievements;
    }
}

/**
 * Caso de Uso: Obtener Logros Desbloqueados del Usuario
 */
export class GetUserAchievementsUseCase {
    constructor(
        private readonly achievementRepository: AchievementRepository,
        private readonly gamificationProfileRepository: any
    ) {}

    async execute(userId: string): Promise<{
        unlockedAchievements: Achievement[];
        lockedAchievements: Achievement[];
        totalUnlocked: number;
        totalAvailable: number;
    }> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        // Obtener perfil del usuario
        const profile = await this.gamificationProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        // Obtener todos los logros
        const allAchievements = await this.achievementRepository.findAll();

        // Separar logros desbloqueados y bloqueados
        const userBadgeCodes = profile.badges.map((b: any) => b.code);
        
        const unlockedAchievements = allAchievements.filter(
            achievement => userBadgeCodes.includes(achievement.code)
        );

        const lockedAchievements = allAchievements.filter(
            achievement => !userBadgeCodes.includes(achievement.code) && !achievement.hidden
        );

        return {
            unlockedAchievements,
            lockedAchievements,
            totalUnlocked: unlockedAchievements.length,
            totalAvailable: allAchievements.filter(a => !a.hidden).length
        };
    }
}

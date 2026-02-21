/**
 * Servicio de gamificación
 * Conecta con el backend local para gestionar puntos, logros y ranking
 */
import httpClient from './httpClient';

/**
 * Interface para perfil de gamificación
 */
export interface Streak {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
    isActive: boolean;
}

export interface Mission {
    id: string;
    type: 'daily' | 'weekly' | 'monthly';
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    reward: number;
    expiresAt: string;
    completed: boolean;
    completedAt?: string;
}

export interface GamificationProfile {
    userId: string;
    totalPoints: number;
    level: number;
    levelName: string;
    badges: Array<{
        code: string;
        unlockedAt: string;
    }>;
    reportsCount: number;
    verifiedReportsCount: number;
    lastReportDate?: string;
    streak: Streak;
    missions: Mission[];
    redeemedRewards: string[];
    progressToNextLevel: number;
    pointsToNextLevel: number;
    canRedeemDiscount: boolean;
}

/**
 * Interface para entrada del leaderboard
 */
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    totalPoints: number;
    level: number;
    reportsCount: number;
    badgesCount: number;
}

/**
 * Interface para logro/achievement
 */
export interface Achievement {
    _id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    pointsRequired: number;
    reportsRequired: number;
    category: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'SPECIAL';
    hidden?: boolean;
    special?: boolean;
    categoryColor?: string;
}

/**
 * Interface para recompensa
 */
/**
 * Interface para recompensa
 */
export interface Reward {
    _id: string;
    type: 'discount' | 'recognition' | 'raffle' | 'benefit' | 'merchandise';
    typeName: string;
    typeIcon: string;
    title: string;
    description: string;
    pointsCost: number;
    stock: number | null;
    status: string;
    available: boolean;
    expiresAt?: string;
    expiringSoon: boolean;
    imageUrl: string;
    termsAndConditions: string;
    partner: string | null;
    metadata: Record<string, any>;
}

/**
 * Interface para resultado de otorgar puntos
 */
export interface AwardPointsResult {
    userId: string;
    pointsAwarded: number;
    totalPoints: number;
    level: number;
    leveledUp: boolean;
    newBadges: string[];
    streakBonus: number;
    streakBroken: boolean;
    canRedeemDiscount: boolean;
}

/**
 * Interface para misiones del usuario
 */
export interface UserMissions {
    activeMissions: Mission[];
    completedMissions: Mission[];
    expiredMissions: Mission[];
}

/**
 * Interface para resultado de redención
 */
export interface RedeemResult {
    success: boolean;
    rewardCode: string;
    message: string;
    remainingPoints: number;
}

/**
 * Interface para achievements del usuario
 */
export interface UserAchievements {
    unlocked: Achievement[];
    locked: Achievement[];
    totalUnlocked: number;
    totalAvailable: number
    title: string;
    description: string;
    pointsCost: number;
    stock: number | null;
    status: string;
    available: boolean;
    expiresAt?: string;
    expiringSoon: boolean;
    imageUrl: string;
    termsAndConditions: string;
    partner: string | null;
    metadata: Record<string, any>;
}

class GamificationService {
    /**
     * Obtener perfil de gamificación del usuario
     */
    async getUserProfile(userId: string): Promise<GamificationProfile> {
        try {
            console.log('📊 Obteniendo perfil de gamificación para:', userId);

            const response = await httpClient.get<{ success: boolean; data: GamificationProfile }>(
                `/api/gamification/profile/${userId}`
            );

            console.log('✅ Perfil obtenido:', response);
            return response as unknown as GamificationProfile;
        } catch (error: any) {
            console.error('❌ Error obteniendo perfil:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al obtener el perfil de gamificación'
            );
        }
    }

    /**
     * Obtener leaderboard (top 10 usuarios)
     */
    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        try {
            console.log('🏆 Obteniendo leaderboard...');

            const response = await httpClient.get<{ success: boolean; data: LeaderboardEntry[] }>(
                '/api/gamification/leaderboard'
            );

            return response as unknown as LeaderboardEntry[];
        } catch (error: any) {
            console.error('❌ Error obteniendo leaderboard:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al obtener el ranking'
            );
        }
    }

    /**
     * Obtener lista de logros disponibles
     */
    async getAchievements(): Promise<Achievement[]> {
        try {
            console.log('🎖️ Obteniendo logros disponibles...');

            const response = await httpClient.get<{ success: boolean; data: Achievement[] }>(
                '/api/gamification/achievements'
            );

            return response as unknown as Achievement[];
        } catch (error: any) {
            console.error('❌ Error obteniendo logros:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al obtener los logros'
            );
        }
    }

    /**
     * Obtener badges del usuario
     */
    async getUserBadges(userId: string): Promise<Achievement[]> {
        try {
            console.log('🏅 Obteniendo badges del usuario:', userId);

            const response = await httpClient.get<{ success: boolean; data: Achievement[] }>(
                `/api/gamification/user/${userId}/badges`
            );

            return response as unknown as Achievement[];
        } catch (error: any) {
            console.error('❌ Error obteniendo badges:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al obtener tus badges'
            );
        }
    }

    /**
     * Obtener nivel del usuario como texto
     */
    getLevelName(level: number): string {
        const levels: Record<number, string> = {
            1: 'Principiante',
            2: 'Aprendiz',
            3: 'Ciudadano Activo',
            4: 'Colaborador',
            5: 'Defensor Ambiental',
            6: 'Guardián Verde',
            7: 'Eco Líder',
            8: 'Campeón Ambiental',
            9: 'Héroe de Latacunga',
            10: 'Leyenda Ambiental',
        };
        return levels[level] || 'Principiante';
    }

    /**
     * Obtener color del nivel
     */
    getLevelColor(level: number): string {
        if (level <= 2) return '#9CA3AF'; // Gris
        if (level <= 4) return '#10B981'; // Verde
        if (level <= 6) return '#3B82F6'; // Azul
        if (level <= 8) return '#8B5CF6'; // Morado
        return '#F59E0B'; // Dorado
    }

    /**
     * Obtener ícono de categoría de logro
     */
    getCategoryIcon(category: string): string {
        const icons: Record<string, string> = {
            BEGINNER: '🌱',
            INTERMEDIATE: '🌿',
            ADVANCED: '🌳',
            EXPERT: '👑',
            SPECIAL: '⭐',
        };
        return icons[category] || '⭐';
    }

    /**
     * Obtener achievements del usuario (desbloqueados y bloqueados)
     */
    async getUserAchievements(userId: string): Promise<UserAchievements> {
        try {
            console.log('🎖️ Obteniendo achievements del usuario:', userId);

            const response = await httpClient.get<{ success: boolean; data: UserAchievements }>(
                `/api/gamification/user/${userId}/achievements`
            );

            return response as unknown as UserAchievements;
        } catch (error: any) {
            console.error('❌ Error obteniendo achievements:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al obtener los logros del usuario'
            );
        }
    }

    /**
     * Obtener misiones del usuario
     */
    async getUserMissions(userId: string): Promise<UserMissions> {
        try {
            console.log('📋 Obteniendo misiones del usuario:', userId);

            const response = await httpClient.get<{ success: boolean; data: UserMissions }>(
                `/api/gamification/user/${userId}/missions`
            );

            return response as unknown as UserMissions;
        } catch (error: any) {
            console.error('❌ Error obteniendo misiones:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al obtener las misiones'
            );
        }
    }

    /**
     * Generar misiones diarias para el usuario
     */
    async generateDailyMissions(userId: string): Promise<Mission[]> {
        try {
            console.log('🔄 Generando misiones diarias para:', userId);

            const response = await httpClient.post<{ success: boolean; data: Mission[] }>(
                `/api/gamification/user/${userId}/missions/daily`,
                {}
            );

            return response as unknown as Mission[];
        } catch (error: any) {
            console.error('❌ Error generando misiones diarias:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al generar misiones diarias'
            );
        }
    }

    /**
     * Generar misiones semanales para el usuario
     */
    async generateWeeklyMissions(userId: string): Promise<Mission[]> {
        try {
            console.log('🔄 Generando misiones semanales para:', userId);

            const response = await httpClient.post<{ success: boolean; data: Mission[] }>(
                `/api/gamification/user/${userId}/missions/weekly`,
                {}
            );

            return response as unknown as Mission[];
        } catch (error: any) {
            console.error('❌ Error generando misiones semanales:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al generar misiones semanales'
            );
        }
    }

    /**
     * Actualizar progreso de una misión
     */
    async updateMissionProgress(
        userId: string,
        type: string,
        value: number
    ): Promise<{ completedMissions: Mission[]; totalReward: number }> {
        try {
            console.log('📊 Actualizando progreso de misión:', type);

            const response = await httpClient.post<{ 
                success: boolean; 
                data: { completedMissions: Mission[]; totalReward: number } 
            }>(
                `/api/gamification/user/${userId}/missions/update`,
                { type, value }
            );

            return response as unknown as { completedMissions: Mission[]; totalReward: number };
        } catch (error: any) {
            console.error('❌ Error actualizando misión:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al actualizar la misión'
            );
        }
    }

    /**
     * Obtener recompensas disponibles
     */
    async getRewards(): Promise<Reward[]> {
        try {
            console.log('🎁 Obteniendo recompensas disponibles...');

            const response = await httpClient.get<{ success: boolean; data: Reward[] }>(
                '/api/gamification/rewards'
            );

            return response as unknown as Reward[];
        } catch (error: any) {
            console.error('❌ Error obteniendo recompensas:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al obtener las recompensas'
            );
        }
    }

    /**
     * Redimir una recompensa
     */
    async redeemReward(userId: string, rewardId: string): Promise<RedeemResult> {
        try {
            console.log('🎁 Redimiendo recompensa:', rewardId);

            const response = await httpClient.post<{ success: boolean; data: RedeemResult }>(
                '/api/gamification/redeem',
                { userId, rewardId }
            );

            return response as unknown as RedeemResult;
        } catch (error: any) {
            console.error('❌ Error redimiendo recompensa:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al redimir la recompensa'
            );
        }
    }

    /**
     * Obtener historial de recompensas redimidas del usuario
     */
    async getUserRewardHistory(userId: string): Promise<any[]> {
        try {
            console.log('📜 Obteniendo historial de recompensas:', userId);

            const response = await httpClient.get<{ success: boolean; data: any[] }>(
                `/api/gamification/user/${userId}/rewards`
            );

            return response as unknown as any[];
        } catch (error: any) {
            console.error('❌ Error obteniendo historial:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al obtener el historial de recompensas'
            );
        }
    }

    /**
     * Otorgar puntos a un usuario (usado internamente)
     */
    async awardPoints(
        userId: string,
        points: number,
        reason: string
    ): Promise<AwardPointsResult> {
        try {
            console.log(`💎 Otorgando ${points} puntos a ${userId}: ${reason}`);

            const response = await httpClient.post<{ success: boolean; data: AwardPointsResult }>(
                '/api/gamification/award-points',
                { userId, points, reason }
            );

            return response as unknown as AwardPointsResult;
        } catch (error: any) {
            console.error('❌ Error otorgando puntos:', error);
            throw new Error(
                error.response?.data?.error ||
                'Error al otorgar puntos'
            );
        }
    }

    /**
     * Obtener tipo de ícono de recompensa
     */
    getRewardTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            discount: '🏷️',
            recognition: '🏆',
            raffle: '🎟️',
            benefit: '🎁',
            merchandise: '👕',
        };
        return icons[type] || '🎁';
    }

    /**
     * Obtener nombre legible del tipo de recompensa
     */
    getRewardTypeName(type: string): string {
        const names: Record<string, string> = {
            discount: 'Descuento',
            recognition: 'Reconocimiento',
            raffle: 'Sorteo',
            benefit: 'Beneficio',
            merchandise: 'Mercancía',
        };
        return names[type] || 'Recompensa';
    }

    /**
     * Verificar si una recompensa está próxima a expirar (menos de 7 días)
     */
    isRewardExpiringSoon(expiresAt?: string): boolean {
        if (!expiresAt) return false;
        const now = new Date();
        const expiration = new Date(expiresAt);
        const daysUntilExpiration = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
    }

    /**
     * Formatear fecha de expiración de misión
     */
    formatMissionExpiry(expiresAt: string): string {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const hoursRemaining = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursRemaining < 1) {
            return 'Expira pronto';
        } else if (hoursRemaining < 24) {
            return `${Math.floor(hoursRemaining)}h restantes`;
        } else {
            const days = Math.floor(hoursRemaining / 24);
            return `${days} día${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`;
        }
    }

    /**
     * Calcular porcentaje de progreso de misión
     */
    getMissionProgress(mission: Mission): number {
        return Math.min(100, Math.round((mission.currentValue / mission.targetValue) * 100));
    }
}

// Instancia singleton del servicio
export const gamificationService = new GamificationService();

// Exportar también la clase para testing
export default GamificationService;

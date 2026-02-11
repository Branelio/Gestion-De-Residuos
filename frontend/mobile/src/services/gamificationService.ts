/**
 * Servicio de gamificación
 * Conecta con el backend local para gestionar puntos, logros y ranking
 */
import httpClient from './httpClient';

/**
 * Interface para perfil de gamificación
 */
export interface GamificationProfile {
    userId: string;
    totalPoints: number;
    level: number;
    badges: string[];
    reportsCount: number;
    verifiedReportsCount: number;
    lastReportDate?: string;
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
    category: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
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
    canRedeemDiscount: boolean;
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
        };
        return icons[category] || '⭐';
    }
}

// Instancia singleton del servicio
export const gamificationService = new GamificationService();

// Exportar también la clase para testing
export default GamificationService;

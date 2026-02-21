/**
 * Caso de Uso: Obtener Leaderboard (Tabla de Clasificación)
 * Retorna los top usuarios por puntos
 */

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName?: string;
    totalPoints: number;
    level: number;
    reportsCount: number;
    badgesCount: number;
}

export interface GamificationProfileRepository {
    findByUserId(userId: string): Promise<any>;
    save(profile: any): Promise<void>;
    findTopByPoints(limit: number): Promise<any[]>;
}

export class GetLeaderboardUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository
    ) {}

    async execute(limit: number = 10, userId?: string): Promise<{
        leaderboard: LeaderboardEntry[];
        currentUserRank?: number;
    }> {
        if (limit <= 0 || limit > 100) {
            throw new Error('El límite debe estar entre 1 y 100');
        }

        // Obtener top usuarios
        const topProfiles = await this.gamificationProfileRepository.findTopByPoints(limit);

        const leaderboard: LeaderboardEntry[] = topProfiles.map((profile, index) => ({
            rank: index + 1,
            userId: profile.userId,
            userName: profile.userName || undefined,
            totalPoints: profile.totalPoints,
            level: profile.level,
            reportsCount: profile.reportsCount,
            badgesCount: profile.badges.length
        }));

        // Si se proporciona userId, buscar su ranking
        let currentUserRank: number | undefined;
        if (userId) {
            const userEntry = leaderboard.find(entry => entry.userId === userId);
            if (userEntry) {
                currentUserRank = userEntry.rank;
            } else {
                // Si no está en el top, calcular su posición real
                // Esto requeriría contar cuántos usuarios tienen más puntos
                // Por ahora, dejar como undefined
                currentUserRank = undefined;
            }
        }

        return {
            leaderboard,
            currentUserRank
        };
    }
}

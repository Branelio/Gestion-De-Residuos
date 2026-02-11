import { Request, Response } from 'express';
import { GamificationModel, AchievementModel, DEFAULT_ACHIEVEMENTS } from '../../persistence/GamificationModel';

/**
 * Controller para endpoints de gamificación
 */
export class GamificationController {
    /**
     * GET /api/gamification/profile/:userId
     * Obtener perfil de gamificación del usuario
     */
    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            // Buscar o crear perfil de gamificación
            let profile = await GamificationModel.findOne({ userId });

            if (!profile) {
                // Crear perfil nuevo si no existe
                profile = await GamificationModel.create({
                    userId,
                    totalPoints: 0,
                    level: 1,
                    badges: [],
                    reportsCount: 0,
                    verifiedReportsCount: 0,
                });
            }

            // Calcular puntos para siguiente nivel
            const levelThresholds = [0, 20, 50, 100, 150, 250, 350, 500, 750, 1000];
            const currentLevelPoints = levelThresholds[profile.level - 1] || 0;
            const nextLevelPoints = levelThresholds[profile.level] || 1000;
            const progressToNextLevel = Math.min(
                100,
                Math.round(
                    ((profile.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
                )
            );

            res.json({
                success: true,
                data: {
                    userId: profile.userId,
                    totalPoints: profile.totalPoints,
                    level: profile.level,
                    badges: profile.badges,
                    reportsCount: profile.reportsCount,
                    verifiedReportsCount: profile.verifiedReportsCount,
                    lastReportDate: profile.lastReportDate,
                    progressToNextLevel,
                    pointsToNextLevel: nextLevelPoints - profile.totalPoints,
                    canRedeemDiscount: profile.totalPoints >= 100,
                },
            });
        } catch (error: any) {
            console.error('Error getting gamification profile:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al obtener perfil de gamificación',
            });
        }
    }

    /**
     * GET /api/gamification/leaderboard
     * Obtener top 10 usuarios
     */
    async getLeaderboard(_req: Request, res: Response): Promise<void> {
        try {
            const leaderboard = await GamificationModel.find()
                .sort({ totalPoints: -1, reportsCount: -1 })
                .limit(10)
                .select('userId totalPoints level reportsCount badges');

            res.json({
                success: true,
                data: leaderboard.map((user, index) => ({
                    rank: index + 1,
                    userId: user.userId,
                    totalPoints: user.totalPoints,
                    level: user.level,
                    reportsCount: user.reportsCount,
                    badgesCount: user.badges.length,
                })),
            });
        } catch (error: any) {
            console.error('Error getting leaderboard:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al obtener leaderboard',
            });
        }
    }

    /**
     * GET /api/gamification/achievements
     * Obtener lista de logros disponibles
     */
    async getAchievements(_req: Request, res: Response): Promise<void> {
        try {
            // Verificar si existen logros en la base de datos
            let achievements = await AchievementModel.find();

            // Si no hay logros, crear los predefinidos
            if (achievements.length === 0) {
                await AchievementModel.insertMany(DEFAULT_ACHIEVEMENTS);
                achievements = await AchievementModel.find();
            }

            res.json({
                success: true,
                data: achievements,
            });
        } catch (error: any) {
            console.error('Error getting achievements:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al obtener logros',
            });
        }
    }

    /**
     * POST /api/gamification/award-points
     * Otorgar puntos a un usuario (uso interno después de verificar reporte)
     */
    async awardPoints(req: Request, res: Response): Promise<void> {
        try {
            const { userId, points, reportType } = req.body;

            if (!userId || !points) {
                res.status(400).json({
                    success: false,
                    error: 'Faltan campos requeridos: userId, points',
                });
                return;
            }

            // Buscar o crear perfil
            let profile = await GamificationModel.findOne({ userId });

            if (!profile) {
                profile = await GamificationModel.create({
                    userId,
                    totalPoints: 0,
                    level: 1,
                    badges: [],
                    reportsCount: 0,
                    verifiedReportsCount: 0,
                });
            }

            // Actualizar puntos
            profile.totalPoints += points;
            profile.reportsCount += 1;
            profile.verifiedReportsCount += 1;
            profile.lastReportDate = new Date();

            // Calcular nuevo nivel
            const newLevel = this.calculateLevel(profile.totalPoints);
            const leveledUp = newLevel > profile.level;
            profile.level = newLevel;

            // Verificar logros
            const newBadges: string[] = [];

            // Primer reporte
            if (profile.reportsCount === 1 && !profile.badges.includes('FIRST_REPORT')) {
                profile.badges.push('FIRST_REPORT');
                newBadges.push('FIRST_REPORT');
            }

            // 5 reportes
            if (profile.reportsCount >= 5 && !profile.badges.includes('FIVE_REPORTS')) {
                profile.badges.push('FIVE_REPORTS');
                newBadges.push('FIVE_REPORTS');
            }

            // 10 reportes
            if (profile.reportsCount >= 10 && !profile.badges.includes('TEN_REPORTS')) {
                profile.badges.push('TEN_REPORTS');
                newBadges.push('TEN_REPORTS');
            }

            // 50 puntos
            if (profile.totalPoints >= 50 && !profile.badges.includes('FIFTY_POINTS')) {
                profile.badges.push('FIFTY_POINTS');
                newBadges.push('FIFTY_POINTS');
            }

            // 100 puntos
            if (profile.totalPoints >= 100 && !profile.badges.includes('HUNDRED_POINTS')) {
                profile.badges.push('HUNDRED_POINTS');
                newBadges.push('HUNDRED_POINTS');
            }

            // 500 puntos
            if (profile.totalPoints >= 500 && !profile.badges.includes('FIVE_HUNDRED_POINTS')) {
                profile.badges.push('FIVE_HUNDRED_POINTS');
                newBadges.push('FIVE_HUNDRED_POINTS');
            }

            // Reporte peligroso
            if (reportType === 'DANGEROUS' && !profile.badges.includes('DANGEROUS_REPORTER')) {
                profile.badges.push('DANGEROUS_REPORTER');
                newBadges.push('DANGEROUS_REPORTER');
            }

            await profile.save();

            res.json({
                success: true,
                data: {
                    userId: profile.userId,
                    pointsAwarded: points,
                    totalPoints: profile.totalPoints,
                    level: profile.level,
                    leveledUp,
                    newBadges,
                    canRedeemDiscount: profile.totalPoints >= 100,
                },
            });
        } catch (error: any) {
            console.error('Error awarding points:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al otorgar puntos',
            });
        }
    }

    /**
     * GET /api/gamification/user/:userId/badges
     * Obtener badges de un usuario
     */
    async getUserBadges(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const profile = await GamificationModel.findOne({ userId });

            if (!profile) {
                res.json({
                    success: true,
                    data: [],
                });
                return;
            }

            // Obtener detalles de los badges
            const achievements = await AchievementModel.find({
                code: { $in: profile.badges },
            });

            res.json({
                success: true,
                data: achievements,
            });
        } catch (error: any) {
            console.error('Error getting user badges:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al obtener badges del usuario',
            });
        }
    }

    /**
     * Calcular nivel basado en puntos
     */
    private calculateLevel(points: number): number {
        if (points >= 1000) return 10;
        if (points >= 750) return 9;
        if (points >= 500) return 8;
        if (points >= 350) return 7;
        if (points >= 250) return 6;
        if (points >= 150) return 5;
        if (points >= 100) return 4;
        if (points >= 50) return 3;
        if (points >= 20) return 2;
        return 1;
    }
}

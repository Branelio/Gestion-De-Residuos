/**
 * Rutas de Gamificación
 * Endpoints para gestionar puntos, logros, recompensas y misiones
 */

import { Router, Request, Response } from 'express';

// Repositorios
import { MongoGamificationProfileRepository } from '../../repositories/MongoGamificationProfileRepository';
import { MongoAchievementRepository } from '../../repositories/MongoAchievementRepository';
import { MongoRewardRepository } from '../../repositories/MongoRewardRepository';

// Casos de uso
import { GetUserGamificationProfileUseCase } from '../../../application/use-cases/GetUserGamificationProfile';
import { AwardPointsToUserUseCase } from '../../../application/use-cases/AwardPointsToUser';
import { GetLeaderboardUseCase } from '../../../application/use-cases/GetLeaderboard';
import { 
    GetAllAchievementsUseCase,
    GetUserAchievementsUseCase 
} from '../../../application/use-cases/GetAchievements';
import {
    RedeemRewardUseCase,
    GetAvailableRewardsUseCase,
    GetUserRewardHistoryUseCase
} from '../../../application/use-cases/RedeemReward';
import {
    GenerateDailyMissionsUseCase,
    GenerateWeeklyMissionsUseCase,
    GetUserMissionsUseCase,
    UpdateMissionProgressUseCase
} from '../../../application/use-cases/ManageMissions';

const router = Router();

// Inicializar repositorios
const gamificationProfileRepository = new MongoGamificationProfileRepository();
const achievementRepository = new MongoAchievementRepository();
const rewardRepository = new MongoRewardRepository();

// ==================== PERFIL DE GAMIFICACIÓN ====================

/**
 * GET /api/gamification/profile/:userId
 * Obtener perfil de gamificación del usuario
 */
router.get('/profile/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const useCase = new GetUserGamificationProfileUseCase(gamificationProfileRepository);
        const profile = await useCase.execute(userId);

        res.json({
            success: true,
            data: profile.toObject()
        });
    } catch (error: any) {
        console.error('Error obteniendo perfil de gamificación:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener el perfil de gamificación'
        });
    }
});

/**
 * POST /api/gamification/award-points
 * Otorgar puntos a un usuario
 */
router.post('/award-points', async (req: Request, res: Response) => {
    try {
        const { userId, points, reason, verified } = req.body;

        // Validaciones
        if (!userId || !points || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren los campos: userId, points, reason'
            });
        }

        const useCase = new AwardPointsToUserUseCase(gamificationProfileRepository);
        const result = await useCase.execute({
            userId,
            points,
            reason,
            verified: verified || false
        });

        return res.json({
            success: true,
            data: result,
            message: `Se otorgaron ${result.pointsAwarded} puntos a ${userId}`
        });
    } catch (error: any) {
        console.error('Error otorgando puntos:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error al otorgar puntos'
        });
    }
});

// ==================== LEADERBOARD ====================

/**
 * GET /api/gamification/leaderboard
 * Obtener tabla de clasificación (top usuarios)
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const userId = req.query.userId as string;

        const useCase = new GetLeaderboardUseCase(gamificationProfileRepository);
        const result = await useCase.execute(limit, userId);

        res.json({
            success: true,
            data: result.leaderboard,
            currentUserRank: result.currentUserRank
        });
    } catch (error: any) {
        console.error('Error obteniendo leaderboard:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener el leaderboard'
        });
    }
});

// ==================== LOGROS / ACHIEVEMENTS ====================

/**
 * GET /api/gamification/achievements
 * Obtener todos los logros disponibles
 */
router.get('/achievements', async (req: Request, res: Response) => {
    try {
        const includeHidden = req.query.includeHidden === 'true';

        const useCase = new GetAllAchievementsUseCase(achievementRepository);
        const achievements = await useCase.execute(includeHidden);

        res.json({
            success: true,
            data: achievements.map(a => a.toObject())
        });
    } catch (error: any) {
        console.error('Error obteniendo logros:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener los logros'
        });
    }
});

/**
 * GET /api/gamification/user/:userId/achievements
 * Obtener logros del usuario (desbloqueados y bloqueados)
 */
router.get('/user/:userId/achievements', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const useCase = new GetUserAchievementsUseCase(
            achievementRepository,
            gamificationProfileRepository
        );
        const result = await useCase.execute(userId);

        res.json({
            success: true,
            data: {
                unlocked: result.unlockedAchievements.map(a => a.toObject()),
                locked: result.lockedAchievements.map(a => a.toObject()),
                totalUnlocked: result.totalUnlocked,
                totalAvailable: result.totalAvailable
            }
        });
    } catch (error: any) {
        console.error('Error obteniendo logros del usuario:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener los logros del usuario'
        });
    }
});

/**
 * GET /api/gamification/user/:userId/badges
 * Obtener badges desbloqueados del usuario
 */
router.get('/user/:userId/badges', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const useCase = new GetUserAchievementsUseCase(
            achievementRepository,
            gamificationProfileRepository
        );
        const result = await useCase.execute(userId);

        res.json({
            success: true,
            data: result.unlockedAchievements.map(a => a.toObject())
        });
    } catch (error: any) {
        console.error('Error obteniendo badges:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener los badges'
        });
    }
});

// ==================== RECOMPENSAS / REWARDS ====================

/**
 * GET /api/gamification/rewards
 * Obtener recompensas disponibles
 */
router.get('/rewards', async (_req: Request, res: Response) => {
    try {
        const useCase = new GetAvailableRewardsUseCase(rewardRepository);
        const result = await useCase.execute();

        res.json({
            success: true,
            data: result.rewards.map(r => r.toObject())
        });
    } catch (error: any) {
        console.error('Error obteniendo recompensas:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las recompensas'
        });
    }
});

/**
 * POST /api/gamification/redeem
 * Canjear una recompensa
 */
router.post('/redeem', async (req: Request, res: Response) => {
    try {
        const { userId, rewardId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        if (!rewardId) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere el campo: rewardId'
            });
        }

        const useCase = new RedeemRewardUseCase(
            gamificationProfileRepository,
            rewardRepository
        );
        const result = await useCase.execute({ userId, rewardId });

        return res.json({
            success: true,
            data: result,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error canjeando recompensa:', error);
        return res.status(400).json({
            success: false,
            error: error.message || 'Error al canjear la recompensa'
        });
    }
});

/**
 * GET /api/gamification/user/:userId/rewards
 * Obtener historial de recompensas canjeadas del usuario
 */
router.get('/user/:userId/rewards', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const useCase = new GetUserRewardHistoryUseCase(
            gamificationProfileRepository,
            rewardRepository
        );
        const result = await useCase.execute(userId);

        res.json({
            success: true,
            data: {
                redeemedRewards: result.redeemedRewards.map(r => ({
                    reward: r.reward.toObject(),
                    redeemedAt: r.redeemedAt
                })),
                totalRedeemed: result.totalRedeemed
            }
        });
    } catch (error: any) {
        console.error('Error obteniendo historial de recompensas:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener el historial de recompensas'
        });
    }
});

// ==================== MISIONES / MISSIONS ====================

/**
 * GET /api/gamification/user/:userId/missions
 * Obtener misiones del usuario
 */
router.get('/user/:userId/missions', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const useCase = new GetUserMissionsUseCase(gamificationProfileRepository);
        const result = await useCase.execute(userId);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error obteniendo misiones:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las misiones'
        });
    }
});

/**
 * POST /api/gamification/user/:userId/missions/daily
 * Generar misiones diarias para el usuario
 */
router.post('/user/:userId/missions/daily', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const useCase = new GenerateDailyMissionsUseCase(gamificationProfileRepository);
        const missions = await useCase.execute(userId);

        res.json({
            success: true,
            data: missions,
            message: 'Misiones diarias generadas'
        });
    } catch (error: any) {
        console.error('Error generando misiones diarias:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al generar misiones diarias'
        });
    }
});

/**
 * POST /api/gamification/user/:userId/missions/weekly
 * Generar misiones semanales para el usuario
 */
router.post('/user/:userId/missions/weekly', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const useCase = new GenerateWeeklyMissionsUseCase(gamificationProfileRepository);
        const missions = await useCase.execute(userId);

        res.json({
            success: true,
            data: missions,
            message: 'Misiones semanales generadas'
        });
    } catch (error: any) {
        console.error('Error generando misiones semanales:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al generar misiones semanales'
        });
    }
});

/**
 * POST /api/gamification/user/:userId/missions/update
 * Actualizar progreso de misiones
 */
router.post('/user/:userId/missions/update', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { type, value } = req.body;

        if (!type || value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren los campos: type, value'
            });
        }

        const useCase = new UpdateMissionProgressUseCase(gamificationProfileRepository);
        const result = await useCase.execute(userId, type, value);

        return res.json({
            success: true,
            data: result,
            message: result.completedMissions.length > 0
                ? `¡Misiones completadas! +${result.totalReward} puntos`
                : 'Progreso actualizado'
        });
    } catch (error: any) {
        console.error('Error actualizando progreso de misiones:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error al actualizar el progreso'
        });
    }
});

export default router;

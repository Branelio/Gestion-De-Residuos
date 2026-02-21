/**
 * Caso de Uso: Canjear Recompensa
 * Permite a un usuario canjear sus puntos por una recompensa
 */

import { Reward, RewardId } from '../../domain/entities/Reward';
import { GamificationProfileRepository } from './GetUserGamificationProfile';

export interface RewardRepository {
    findById(id: RewardId): Promise<Reward | null>;
    findAll(): Promise<Reward[]>;
    findAvailable(): Promise<Reward[]>;
    save(reward: Reward): Promise<void>;
}

export interface RedeemRewardRequest {
    userId: string;
    rewardId: string;
}

export interface RedeemRewardResult {
    success: boolean;
    rewardCode: string;
    message: string;
    remainingPoints: number;
}

export class RedeemRewardUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository,
        private readonly rewardRepository: RewardRepository
    ) {}

    async execute(request: RedeemRewardRequest): Promise<RedeemRewardResult> {
        // Validaciones
        if (!request.userId || request.userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        if (!request.rewardId || request.rewardId.trim().length === 0) {
            throw new Error('El ID de la recompensa es requerido');
        }

        // Obtener la recompensa
        const reward = await this.rewardRepository.findById(new RewardId(request.rewardId));
        if (!reward) {
            throw new Error('Recompensa no encontrada');
        }

        // Verificar que la recompensa esté disponible
        if (!reward.isAvailable()) {
            throw new Error('Esta recompensa no está disponible actualmente');
        }

        // Obtener perfil del usuario
        const profile = await this.gamificationProfileRepository.findByUserId(request.userId);
        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        // Verificar que el usuario tenga suficientes puntos
        if (profile.totalPoints < reward.pointsCost) {
            throw new Error(
                `Puntos insuficientes. Necesitas ${reward.pointsCost} puntos pero solo tienes ${profile.totalPoints}`
            );
        }

        // Canjear la recompensa
        profile.redeemReward(request.rewardId, reward.pointsCost);
        reward.redeem();

        // Guardar cambios
        await Promise.all([
            this.gamificationProfileRepository.save(profile),
            this.rewardRepository.save(reward)
        ]);

        // Generar código único de canje
        const rewardCode = this.generateRewardCode(request.userId, request.rewardId);

        return {
            success: true,
            rewardCode,
            message: `¡Felicitaciones! Has canjeado: ${reward.title}`,
            remainingPoints: profile.totalPoints
        };
    }

    /**
     * Genera un código único para el canje
     */
    private generateRewardCode(userId: string, rewardId: string): string {
        const timestamp = Date.now().toString(36);
        const userHash = userId.substring(0, 6).toUpperCase();
        const rewardHash = rewardId.substring(0, 4).toUpperCase();
        return `${userHash}-${rewardHash}-${timestamp}`;
    }
}

/**
 * Caso de Uso: Obtener Recompensas Disponibles
 */
export class GetAvailableRewardsUseCase {
    constructor(
        private readonly rewardRepository: RewardRepository
    ) {}

    async execute(_userId?: string): Promise<{
        rewards: Reward[];
        userPoints?: number;
    }> {
        const rewards = await this.rewardRepository.findAvailable();

        let userPoints: number | undefined;
        
        // Si se proporciona userId, obtener sus puntos para mostrar qué puede canjear
        // (esto requeriría inyectar el repositorio de gamificación, lo dejamos opcional)

        return {
            rewards,
            userPoints
        };
    }
}

/**
 * Caso de Uso: Obtener Historial de Recompensas del Usuario
 */
export class GetUserRewardHistoryUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository,
        private readonly rewardRepository: RewardRepository
    ) {}

    async execute(userId: string): Promise<{
        redeemedRewards: Array<{
            reward: Reward;
            redeemedAt: Date;
        }>;
        totalRedeemed: number;
    }> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        // Obtener perfil del usuario
        const profile = await this.gamificationProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        // Obtener detalles de las recompensas canjeadas
        const redeemedRewards = await Promise.all(
            profile.redeemedRewards.map(async (rewardId: string) => {
                const reward = await this.rewardRepository.findById(new RewardId(rewardId));
                return {
                    reward: reward!,
                    redeemedAt: new Date() // TODO: Guardar fecha de canje en el perfil
                };
            })
        );

        return {
            redeemedRewards: redeemedRewards.filter(r => r.reward !== null),
            totalRedeemed: profile.redeemedRewards.length
        };
    }
}

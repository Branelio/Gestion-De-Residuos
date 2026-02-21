/**
 * Caso de Uso: Otorgar Puntos al Usuario
 * Se ejecuta cuando el usuario realiza un reporte de residuos verificado
 */

import { GamificationProfile } from '../../domain/entities/GamificationProfile';
import { GamificationProfileRepository } from './GetUserGamificationProfile';

export interface AwardPointsRequest {
    userId: string;
    points: number;
    reason: string;
    verified?: boolean;
}

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

export class AwardPointsToUserUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository
    ) {}

    async execute(request: AwardPointsRequest): Promise<AwardPointsResult> {
        // Validaciones
        if (!request.userId || request.userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        if (request.points <= 0) {
            throw new Error('Los puntos deben ser mayores a 0');
        }

        // Obtener perfil del usuario
        const profile = await this.gamificationProfileRepository.findByUserId(request.userId);

        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        // Actualizar racha
        const { streakBonus, streakBroken } = profile.updateStreak();

        // Incrementar contador de reportes
        profile.incrementReportCount(request.verified);

        // Otorgar puntos base + bonus de racha
        const totalPoints = request.points + streakBonus;
        const { leveledUp, newBadges } = profile.awardPoints(totalPoints, request.reason);

        // Verificar badges por reportes
        const reportBadges = this.checkReportBadges(profile);
        newBadges.push(...reportBadges);

        // Verificar badges especiales
        const specialBadges = this.checkSpecialBadges(profile);
        newBadges.push(...specialBadges);

        // Guardar cambios
        await this.gamificationProfileRepository.save(profile);

        return {
            userId: request.userId,
            pointsAwarded: totalPoints,
            totalPoints: profile.totalPoints,
            level: profile.level,
            leveledUp,
            newBadges,
            streakBonus,
            streakBroken,
            canRedeemDiscount: profile.canRedeemDiscount()
        };
    }

    /**
     * Verifica si el usuario desbloqueó badges por cantidad de reportes
     */
    private checkReportBadges(profile: GamificationProfile): string[] {
        const newBadges: string[] = [];
        const reportBadges = [
            { code: 'FIRST_REPORT', threshold: 1 },
            { code: 'FIVE_REPORTS', threshold: 5 },
            { code: 'TEN_REPORTS', threshold: 10 },
            { code: 'TWENTY_REPORTS', threshold: 20 },
            { code: 'FIFTY_REPORTS', threshold: 50 }
        ];

        for (const badge of reportBadges) {
            if (profile.reportsCount >= badge.threshold) {
                const unlocked = profile.unlockBadge(badge.code);
                if (unlocked) {
                    newBadges.push(badge.code);
                }
            }
        }

        return newBadges;
    }

    /**
     * Verifica badges especiales según condiciones específicas
     */
    private checkSpecialBadges(profile: GamificationProfile): string[] {
        const newBadges: string[] = [];
        const now = new Date();

        // Badge por racha de 7 días
        if (profile.streak.currentStreak >= 7) {
            const unlocked = profile.unlockBadge('WEEK_STREAK');
            if (unlocked) newBadges.push('WEEK_STREAK');
        }

        // Badge por racha de 30 días
        if (profile.streak.currentStreak >= 30) {
            const unlocked = profile.unlockBadge('MONTH_STREAK');
            if (unlocked) newBadges.push('MONTH_STREAK');
        }

        // Badge por racha de 100 días
        if (profile.streak.currentStreak >= 100) {
            const unlocked = profile.unlockBadge('HUNDRED_DAYS_STREAK');
            if (unlocked) newBadges.push('HUNDRED_DAYS_STREAK');
        }

        // Badge madrugador (antes de 7 AM)
        if (now.getHours() < 7) {
            const unlocked = profile.unlockBadge('EARLY_BIRD');
            if (unlocked) newBadges.push('EARLY_BIRD');
        }

        // Badge búho nocturno (después de 10 PM)
        if (now.getHours() >= 22) {
            const unlocked = profile.unlockBadge('NIGHT_OWL');
            if (unlocked) newBadges.push('NIGHT_OWL');
        }

        // Badge fin de semana
        if (now.getDay() === 0 || now.getDay() === 6) {
            const unlocked = profile.unlockBadge('WEEKEND_WARRIOR');
            if (unlocked) newBadges.push('WEEKEND_WARRIOR');
        }

        // Badge Día del Medio Ambiente (5 de junio)
        if (now.getMonth() === 5 && now.getDate() === 5) {
            const unlocked = profile.unlockBadge('ENVIRONMENT_DAY');
            if (unlocked) newBadges.push('ENVIRONMENT_DAY');
        }

        return newBadges;
    }
}

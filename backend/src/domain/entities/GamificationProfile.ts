/**
 * Entidad de dominio: Perfil de Gamificación
 * Representa el perfil de gamificación de un usuario
 */

export class GamificationProfileId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('GamificationProfileId no puede estar vacío');
        }
    }

    equals(other: GamificationProfileId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

export interface Badge {
    code: string;
    unlockedAt: Date;
}

export interface Streak {
    currentStreak: number;      // Días consecutivos actuales
    longestStreak: number;       // Récord de días consecutivos
    lastActivityDate: Date;      // Última fecha de actividad
    isActive: boolean;           // Si la racha está activa
}

export interface Mission {
    id: string;
    type: 'daily' | 'weekly' | 'monthly';
    title: string;
    description: string;
    targetValue: number;         // Meta a alcanzar
    currentValue: number;        // Progreso actual
    reward: number;              // Puntos de recompensa
    expiresAt: Date;
    completed: boolean;
    completedAt?: Date;
}

export interface Reward {
    id: string;
    type: 'discount' | 'recognition' | 'raffle' | 'benefit';
    title: string;
    description: string;
    pointsCost: number;
    available: boolean;
    expiresAt?: Date;
    metadata?: Record<string, any>;
}

export class GamificationProfile {
    constructor(
        public readonly id: GamificationProfileId,
        public readonly userId: string,
        public totalPoints: number,
        public level: number,
        public badges: Badge[],
        public reportsCount: number,
        public verifiedReportsCount: number,
        public streak: Streak,
        public missions: Mission[],
        public redeemedRewards: string[],  // IDs de recompensas canjeadas
        public lastReportDate?: Date,
        public readonly createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) {
        this.validateInvariants();
    }

    private validateInvariants(): void {
        if (this.totalPoints < 0) {
            throw new Error('Los puntos totales no pueden ser negativos');
        }

        if (this.level < 1 || this.level > 10) {
            throw new Error('El nivel debe estar entre 1 y 10');
        }

        if (this.reportsCount < 0) {
            throw new Error('El conteo de reportes no puede ser negativo');
        }

        if (this.verifiedReportsCount < 0) {
            throw new Error('El conteo de reportes verificados no puede ser negativo');
        }

        if (this.verifiedReportsCount > this.reportsCount) {
            throw new Error('Los reportes verificados no pueden superar el total de reportes');
        }

        if (this.streak.currentStreak < 0) {
            throw new Error('La racha actual no puede ser negativa');
        }

        if (this.streak.longestStreak < 0) {
            throw new Error('La racha más larga no puede ser negativa');
        }
    }

    /**
     * Calcula el nivel basado en los puntos totales
     */
    calculateLevel(): number {
        const points = this.totalPoints;
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

    /**
     * Calcula puntos necesarios para el siguiente nivel
     */
    pointsToNextLevel(): number {
        const levelThresholds = [0, 20, 50, 100, 150, 250, 350, 500, 750, 1000];
        const currentLevel = this.level;
        
        if (currentLevel >= 10) return 0; // Ya está en nivel máximo
        
        return levelThresholds[currentLevel] - this.totalPoints;
    }

    /**
     * Calcula el progreso hacia el siguiente nivel (0-100%)
     */
    progressToNextLevel(): number {
        const levelThresholds = [0, 20, 50, 100, 150, 250, 350, 500, 750, 1000];
        const currentLevel = this.level;
        
        if (currentLevel >= 10) return 100;
        
        const currentThreshold = levelThresholds[currentLevel - 1];
        const nextThreshold = levelThresholds[currentLevel];
        const pointsInCurrentLevel = this.totalPoints - currentThreshold;
        const pointsNeededForLevel = nextThreshold - currentThreshold;
        
        return Math.floor((pointsInCurrentLevel / pointsNeededForLevel) * 100);
    }

    /**
     * Otorga puntos al perfil
     */
    awardPoints(points: number, _reason: string): { leveledUp: boolean; newBadges: string[] } {
        if (points <= 0) {
            throw new Error('Los puntos a otorgar deben ser positivos');
        }

        const oldLevel = this.level;
        this.totalPoints += points;
        this.level = this.calculateLevel();
        this.updatedAt = new Date();

        const leveledUp = this.level > oldLevel;
        const newBadges: string[] = [];

        // Verificar nuevos badges por puntos
        const pointBadges = this.checkPointBadges();
        newBadges.push(...pointBadges);

        return { leveledUp, newBadges };
    }

    /**
     * Actualiza la racha del usuario
     */
    updateStreak(): { streakBonus: number; streakBroken: boolean } {
        const now = new Date();
        const lastActivity = this.streak.lastActivityDate;
        
        // Calcular diferencia en días
        const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let streakBonus = 0;
        let streakBroken = false;

        if (diffDays === 0) {
            // Mismo día, no hacer nada
            return { streakBonus: 0, streakBroken: false };
        } else if (diffDays === 1) {
            // Día consecutivo, incrementar racha
            this.streak.currentStreak += 1;
            this.streak.isActive = true;
            
            // Actualizar récord si es necesario
            if (this.streak.currentStreak > this.streak.longestStreak) {
                this.streak.longestStreak = this.streak.currentStreak;
            }

            // Bonificación por racha (1 punto extra cada 3 días de racha)
            if (this.streak.currentStreak % 3 === 0) {
                streakBonus = 5;
            }
        } else {
            // Se rompió la racha
            this.streak.currentStreak = 1;
            this.streak.isActive = true;
            streakBroken = diffDays > 1 && this.streak.isActive;
        }

        this.streak.lastActivityDate = now;
        this.updatedAt = now;

        return { streakBonus, streakBroken };
    }

    /**
     * Incrementa el contador de reportes
     */
    incrementReportCount(verified: boolean = false): void {
        this.reportsCount += 1;
        if (verified) {
            this.verifiedReportsCount += 1;
        }
        this.lastReportDate = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Desbloquea un badge
     */
    unlockBadge(badgeCode: string): boolean {
        // Verificar si ya tiene el badge
        const hasBadge = this.badges.some(b => b.code === badgeCode);
        if (hasBadge) {
            return false;
        }

        this.badges.push({
            code: badgeCode,
            unlockedAt: new Date()
        });
        this.updatedAt = new Date();

        return true;
    }

    /**
     * Verifica si puede canjear descuentos (mínimo 100 puntos)
     */
    canRedeemDiscount(): boolean {
        return this.totalPoints >= 100;
    }

    /**
     * Canjea una recompensa
     */
    redeemReward(rewardId: string, pointsCost: number): void {
        if (this.totalPoints < pointsCost) {
            throw new Error('Puntos insuficientes para canjear la recompensa');
        }

        this.totalPoints -= pointsCost;
        this.redeemedRewards.push(rewardId);
        this.updatedAt = new Date();

        // Recalcular nivel si bajó de puntos
        this.level = this.calculateLevel();
    }

    /**
     * Completa una misión
     */
    completeMission(missionId: string): number {
        const mission = this.missions.find(m => m.id === missionId);
        
        if (!mission) {
            throw new Error('Misión no encontrada');
        }

        if (mission.completed) {
            throw new Error('La misión ya está completada');
        }

        if (mission.currentValue < mission.targetValue) {
            throw new Error('La misión no ha alcanzado su objetivo');
        }

        mission.completed = true;
        mission.completedAt = new Date();
        this.updatedAt = new Date();

        return mission.reward;
    }

    /**
     * Actualiza el progreso de una misión
     */
    updateMissionProgress(missionId: string, value: number): void {
        const mission = this.missions.find(m => m.id === missionId);
        
        if (!mission) {
            throw new Error('Misión no encontrada');
        }

        if (mission.completed) {
            return; // Ya completada, no actualizar
        }

        mission.currentValue = Math.min(value, mission.targetValue);
        this.updatedAt = new Date();
    }

    /**
     * Verifica badges por puntos alcanzados
     */
    private checkPointBadges(): string[] {
        const newBadges: string[] = [];
        const pointBadges = [
            { code: 'FIFTY_POINTS', threshold: 50 },
            { code: 'HUNDRED_POINTS', threshold: 100 },
            { code: 'TWO_HUNDRED_FIFTY_POINTS', threshold: 250 },
            { code: 'FIVE_HUNDRED_POINTS', threshold: 500 },
            { code: 'THOUSAND_POINTS', threshold: 1000 }
        ];

        for (const badge of pointBadges) {
            if (this.totalPoints >= badge.threshold) {
                const unlocked = this.unlockBadge(badge.code);
                if (unlocked) {
                    newBadges.push(badge.code);
                }
            }
        }

        return newBadges;
    }

    /**
     * Obtiene el nombre del nivel
     */
    getLevelName(): string {
        const levelNames = [
            'Principiante',
            'Aprendiz',
            'Colaborador',
            'Comprometido',
            'Activo',
            'Dedicado',
            'Experto',
            'Maestro',
            'Héroe Ambiental',
            'Leyenda Verde'
        ];

        return levelNames[this.level - 1] || 'Principiante';
    }

    /**
     * Convierte la entidad a un objeto plano
     */
    toObject() {
        return {
            id: this.id.value,
            userId: this.userId,
            totalPoints: this.totalPoints,
            level: this.level,
            levelName: this.getLevelName(),
            badges: this.badges,
            reportsCount: this.reportsCount,
            verifiedReportsCount: this.verifiedReportsCount,
            streak: this.streak,
            missions: this.missions,
            redeemedRewards: this.redeemedRewards,
            lastReportDate: this.lastReportDate,
            progressToNextLevel: this.progressToNextLevel(),
            pointsToNextLevel: this.pointsToNextLevel(),
            canRedeemDiscount: this.canRedeemDiscount(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

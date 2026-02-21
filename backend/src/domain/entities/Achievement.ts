/**
 * Entidad de dominio: Logro/Achievement
 * Representa un logro que los usuarios pueden desbloquear
 */

export class AchievementId {
    constructor(public readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('AchievementId no puede estar vacío');
        }
    }

    equals(other: AchievementId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

export enum AchievementCategory {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT',
    SPECIAL = 'SPECIAL'
}

export class Achievement {
    constructor(
        public readonly id: AchievementId,
        public readonly code: string,
        public readonly name: string,
        public readonly description: string,
        public readonly icon: string,
        public readonly pointsRequired: number,
        public readonly reportsRequired: number,
        public readonly category: AchievementCategory,
        public readonly hidden: boolean = false,  // Logros ocultos/sorpresa
        public readonly special: boolean = false   // Eventos especiales
    ) {
        this.validateInvariants();
    }

    private validateInvariants(): void {
        if (!this.code || this.code.trim().length === 0) {
            throw new Error('El código del logro es requerido');
        }

        if (!this.name || this.name.trim().length === 0) {
            throw new Error('El nombre del logro es requerido');
        }

        if (!this.description || this.description.trim().length === 0) {
            throw new Error('La descripción del logro es requerida');
        }

        if (!this.icon || this.icon.trim().length === 0) {
            throw new Error('El ícono del logro es requerido');
        }

        if (this.pointsRequired < 0) {
            throw new Error('Los puntos requeridos no pueden ser negativos');
        }

        if (this.reportsRequired < 0) {
            throw new Error('Los reportes requeridos no pueden ser negativos');
        }
    }

    /**
     * Verifica si un usuario puede desbloquear este logro
     */
    canUnlock(totalPoints: number, reportsCount: number): boolean {
        return totalPoints >= this.pointsRequired && reportsCount >= this.reportsRequired;
    }

    /**
     * Obtiene el color del badge según la categoría
     */
    getCategoryColor(): string {
        switch (this.category) {
            case AchievementCategory.BEGINNER:
                return '#10B981'; // verde
            case AchievementCategory.INTERMEDIATE:
                return '#3B82F6'; // azul
            case AchievementCategory.ADVANCED:
                return '#8B5CF6'; // morado
            case AchievementCategory.EXPERT:
                return '#F59E0B'; // naranja/dorado
            case AchievementCategory.SPECIAL:
                return '#EF4444'; // rojo
            default:
                return '#6B7280'; // gris
        }
    }

    /**
     * Convierte la entidad a un objeto plano
     */
    toObject() {
        return {
            id: this.id.value,
            code: this.code,
            name: this.name,
            description: this.description,
            icon: this.icon,
            pointsRequired: this.pointsRequired,
            reportsRequired: this.reportsRequired,
            category: this.category,
            categoryColor: this.getCategoryColor(),
            hidden: this.hidden,
            special: this.special
        };
    }
}

/**
 * Constantes de logros predefinidos
 */
export const PREDEFINED_ACHIEVEMENTS = [
    // BEGINNER
    {
        code: 'FIRST_REPORT',
        name: 'Primer Reporte',
        description: 'Realizaste tu primer reporte de residuos',
        icon: '🎯',
        pointsRequired: 0,
        reportsRequired: 1,
        category: AchievementCategory.BEGINNER
    },
    {
        code: 'FIVE_REPORTS',
        name: 'Reportero Activo',
        description: 'Realizaste 5 reportes',
        icon: '📝',
        pointsRequired: 0,
        reportsRequired: 5,
        category: AchievementCategory.BEGINNER
    },
    {
        code: 'FIFTY_POINTS',
        name: '50 Puntos',
        description: 'Acumulaste 50 puntos limpios',
        icon: '⭐',
        pointsRequired: 50,
        reportsRequired: 0,
        category: AchievementCategory.BEGINNER
    },

    // INTERMEDIATE
    {
        code: 'TEN_REPORTS',
        name: 'Reportero Comprometido',
        description: 'Realizaste 10 reportes',
        icon: '📋',
        pointsRequired: 0,
        reportsRequired: 10,
        category: AchievementCategory.INTERMEDIATE
    },
    {
        code: 'HUNDRED_POINTS',
        name: 'Centenario',
        description: 'Acumulaste 100 puntos limpios',
        icon: '💯',
        pointsRequired: 100,
        reportsRequired: 0,
        category: AchievementCategory.INTERMEDIATE
    },
    {
        code: 'WEEK_STREAK',
        name: 'Semana Perfecta',
        description: 'Mantuviste una racha de 7 días',
        icon: '🔥',
        pointsRequired: 0,
        reportsRequired: 7,
        category: AchievementCategory.INTERMEDIATE
    },

    // ADVANCED
    {
        code: 'TWENTY_REPORTS',
        name: 'Reportero Experto',
        description: 'Realizaste 20 reportes',
        icon: '📊',
        pointsRequired: 0,
        reportsRequired: 20,
        category: AchievementCategory.ADVANCED
    },
    {
        code: 'TWO_HUNDRED_FIFTY_POINTS',
        name: 'Cazador de Puntos',
        description: 'Acumulaste 250 puntos limpios',
        icon: '🎖️',
        pointsRequired: 250,
        reportsRequired: 0,
        category: AchievementCategory.ADVANCED
    },
    {
        code: 'MONTH_STREAK',
        name: 'Mes Imparable',
        description: 'Mantuviste una racha de 30 días',
        icon: '🔥',
        pointsRequired: 0,
        reportsRequired: 30,
        category: AchievementCategory.ADVANCED
    },

    // EXPERT
    {
        code: 'FIFTY_REPORTS',
        name: 'Maestro Reportero',
        description: 'Realizaste 50 reportes',
        icon: '🏆',
        pointsRequired: 0,
        reportsRequired: 50,
        category: AchievementCategory.EXPERT
    },
    {
        code: 'FIVE_HUNDRED_POINTS',
        name: 'Medio Millar',
        description: 'Acumulaste 500 puntos limpios',
        icon: '💎',
        pointsRequired: 500,
        reportsRequired: 0,
        category: AchievementCategory.EXPERT
    },
    {
        code: 'THOUSAND_POINTS',
        name: 'Leyenda Verde',
        description: 'Acumulaste 1000 puntos limpios',
        icon: '👑',
        pointsRequired: 1000,
        reportsRequired: 0,
        category: AchievementCategory.EXPERT
    },
    {
        code: 'HUNDRED_DAYS_STREAK',
        name: 'Centurión',
        description: 'Mantuviste una racha de 100 días',
        icon: '⚡',
        pointsRequired: 0,
        reportsRequired: 100,
        category: AchievementCategory.EXPERT
    },

    // SPECIAL
    {
        code: 'EARLY_BIRD',
        name: 'Madrugador',
        description: 'Reportaste antes de las 7 AM',
        icon: '🌅',
        pointsRequired: 0,
        reportsRequired: 1,
        category: AchievementCategory.SPECIAL,
        hidden: true
    },
    {
        code: 'NIGHT_OWL',
        name: 'Búho Nocturno',
        description: 'Reportaste después de las 10 PM',
        icon: '🦉',
        pointsRequired: 0,
        reportsRequired: 1,
        category: AchievementCategory.SPECIAL,
        hidden: true
    },
    {
        code: 'WEEKEND_WARRIOR',
        name: 'Guerrero del Fin de Semana',
        description: 'Reportaste en sábado y domingo',
        icon: '💪',
        pointsRequired: 0,
        reportsRequired: 2,
        category: AchievementCategory.SPECIAL,
        hidden: true
    },
    {
        code: 'ENVIRONMENT_DAY',
        name: 'Día del Medio Ambiente',
        description: 'Reportaste el 5 de junio',
        icon: '🌍',
        pointsRequired: 0,
        reportsRequired: 1,
        category: AchievementCategory.SPECIAL,
        special: true
    },
    {
        code: 'RECYCLING_HERO',
        name: 'Héroe del Reciclaje',
        description: 'Reportaste 10 residuos reciclables',
        icon: '♻️',
        pointsRequired: 0,
        reportsRequired: 10,
        category: AchievementCategory.SPECIAL
    }
];

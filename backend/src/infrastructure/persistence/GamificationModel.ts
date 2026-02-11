import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Gamificación
 */
export interface IGamificationDocument extends Omit<Document, '_id'> {
    _id: mongoose.Types.ObjectId;
    userId: string;
    totalPoints: number;
    level: number;
    badges: string[];
    reportsCount: number;
    verifiedReportsCount: number;
    lastReportDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interface para logros/achievements
 */
export interface IAchievementDocument extends Omit<Document, '_id'> {
    _id: mongoose.Types.ObjectId;
    code: string;
    name: string;
    description: string;
    icon: string;
    pointsRequired: number;
    reportsRequired: number;
    category: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

/**
 * Schema de Mongoose para Gamificación de Usuario
 */
const gamificationSchema = new Schema<IGamificationDocument>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        totalPoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        level: {
            type: Number,
            default: 1,
            min: 1,
            max: 10,
        },
        badges: {
            type: [String],
            default: [],
        },
        reportsCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        verifiedReportsCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastReportDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Schema de Mongoose para Logros
 */
const achievementSchema = new Schema<IAchievementDocument>({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    pointsRequired: {
        type: Number,
        default: 0,
    },
    reportsRequired: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        default: 'BEGINNER',
    },
});

// Índices para consultas frecuentes
gamificationSchema.index({ totalPoints: -1 }); // Para leaderboard
gamificationSchema.index({ level: -1, totalPoints: -1 });

// Método para calcular nivel basado en puntos
gamificationSchema.methods.calculateLevel = function (): number {
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
};

export const GamificationModel = mongoose.model<IGamificationDocument>(
    'Gamification',
    gamificationSchema
);

export const AchievementModel = mongoose.model<IAchievementDocument>(
    'Achievement',
    achievementSchema
);

/**
 * Lista de logros predefinidos
 */
export const DEFAULT_ACHIEVEMENTS = [
    {
        code: 'FIRST_REPORT',
        name: 'Primer Reporte',
        description: 'Realizaste tu primer reporte de residuos',
        icon: '🌱',
        pointsRequired: 0,
        reportsRequired: 1,
        category: 'BEGINNER',
    },
    {
        code: 'FIVE_REPORTS',
        name: 'Ciudadano Activo',
        description: 'Has realizado 5 reportes',
        icon: '🌿',
        pointsRequired: 0,
        reportsRequired: 5,
        category: 'BEGINNER',
    },
    {
        code: 'TEN_REPORTS',
        name: 'Guardián Ambiental',
        description: 'Has realizado 10 reportes',
        icon: '🌳',
        pointsRequired: 0,
        reportsRequired: 10,
        category: 'INTERMEDIATE',
    },
    {
        code: 'FIFTY_POINTS',
        name: 'Acumulador Verde',
        description: 'Has acumulado 50 puntos',
        icon: '⭐',
        pointsRequired: 50,
        reportsRequired: 0,
        category: 'BEGINNER',
    },
    {
        code: 'HUNDRED_POINTS',
        name: 'Eco Héroe',
        description: 'Has acumulado 100 puntos - ¡Puedes canjear descuentos!',
        icon: '🏆',
        pointsRequired: 100,
        reportsRequired: 0,
        category: 'INTERMEDIATE',
    },
    {
        code: 'FIVE_HUNDRED_POINTS',
        name: 'Campeón de Latacunga',
        description: 'Has acumulado 500 puntos',
        icon: '👑',
        pointsRequired: 500,
        reportsRequired: 0,
        category: 'ADVANCED',
    },
    {
        code: 'DANGEROUS_REPORTER',
        name: 'Detector de Peligros',
        description: 'Has reportado residuos peligrosos',
        icon: '⚠️',
        pointsRequired: 0,
        reportsRequired: 0,
        category: 'INTERMEDIATE',
    },
];

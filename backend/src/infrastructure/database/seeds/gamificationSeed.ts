/**
 * Seed data para gamificación
 * Perfiles, puntos y logros de los usuarios ciudadanos
 */

// IDs de ciudadanos de usersSeed.ts
const citizenIds = [
    '674c1a1b2c3d4e5f6a7b8ca2', // Ana López
    '674c1a1b2c3d4e5f6a7b8ca3', // Roberto Flores
    '674c1a1b2c3d4e5f6a7b8ca4', // Laura Martínez
    '674c1a1b2c3d4e5f6a7b8ca5', // Diego Herrera
    '674c1a1b2c3d4e5f6a7b8ca6', // Patricia Vega
    '674c1a1b2c3d4e5f6a7b8ca7', // Fernando Castro
    '674c1a1b2c3d4e5f6a7b8ca8', // Mónica Ruiz
    '674c1a1b2c3d4e5f6a7b8ca9', // Javier Morales
    '674c1a1b2c3d4e5f6a7b8caa', // Silvia Paredes
    '674c1a1b2c3d4e5f6a7b8cab', // Andrés Jiménez
];

/**
 * Datos de perfil de gamificación para cada ciudadano
 */
export const gamificationProfilesData = [
    {
        userId: citizenIds[0], // Ana López - muy activa
        totalPoints: 350,
        level: 7,
        badges: ['FIRST_REPORT', 'FIVE_REPORTS', 'TEN_REPORTS', 'FIFTY_POINTS', 'HUNDRED_POINTS'],
        reportsCount: 15,
        verifiedReportsCount: 12,
        lastReportDate: new Date('2026-02-15T10:30:00Z'),
    },
    {
        userId: citizenIds[1], // Roberto Flores - activo
        totalPoints: 180,
        level: 5,
        badges: ['FIRST_REPORT', 'FIVE_REPORTS', 'TEN_REPORTS', 'FIFTY_POINTS', 'HUNDRED_POINTS'],
        reportsCount: 11,
        verifiedReportsCount: 9,
        lastReportDate: new Date('2026-02-14T14:00:00Z'),
    },
    {
        userId: citizenIds[2], // Laura Martínez - moderada
        totalPoints: 95,
        level: 3,
        badges: ['FIRST_REPORT', 'FIVE_REPORTS', 'FIFTY_POINTS'],
        reportsCount: 7,
        verifiedReportsCount: 5,
        lastReportDate: new Date('2026-02-12T11:20:00Z'),
    },
    {
        userId: citizenIds[3], // Diego Herrera - nuevo
        totalPoints: 30,
        level: 2,
        badges: ['FIRST_REPORT'],
        reportsCount: 3,
        verifiedReportsCount: 2,
        lastReportDate: new Date('2026-02-10T09:45:00Z'),
    },
    {
        userId: citizenIds[4], // Patricia Vega - activa
        totalPoints: 220,
        level: 6,
        badges: ['FIRST_REPORT', 'FIVE_REPORTS', 'TEN_REPORTS', 'FIFTY_POINTS', 'HUNDRED_POINTS'],
        reportsCount: 12,
        verifiedReportsCount: 10,
        lastReportDate: new Date('2026-02-16T08:00:00Z'),
    },
    {
        userId: citizenIds[5], // Fernando Castro - moderado
        totalPoints: 75,
        level: 3,
        badges: ['FIRST_REPORT', 'FIVE_REPORTS', 'FIFTY_POINTS'],
        reportsCount: 5,
        verifiedReportsCount: 4,
        lastReportDate: new Date('2026-02-08T16:30:00Z'),
    },
    {
        userId: citizenIds[6], // Mónica Ruiz - principiante
        totalPoints: 15,
        level: 1,
        badges: ['FIRST_REPORT'],
        reportsCount: 2,
        verifiedReportsCount: 1,
        lastReportDate: new Date('2026-02-05T12:10:00Z'),
    },
    {
        userId: citizenIds[7], // Javier Morales - muy activo
        totalPoints: 500,
        level: 8,
        badges: ['FIRST_REPORT', 'FIVE_REPORTS', 'TEN_REPORTS', 'FIFTY_POINTS', 'HUNDRED_POINTS', 'FIVE_HUNDRED_POINTS'],
        reportsCount: 20,
        verifiedReportsCount: 18,
        lastReportDate: new Date('2026-02-16T07:30:00Z'),
    },
    {
        userId: citizenIds[8], // Silvia Paredes - moderada
        totalPoints: 60,
        level: 3,
        badges: ['FIRST_REPORT', 'FIVE_REPORTS', 'FIFTY_POINTS'],
        reportsCount: 4,
        verifiedReportsCount: 3,
        lastReportDate: new Date('2026-02-09T15:00:00Z'),
    },
    {
        userId: citizenIds[9], // Andrés Jiménez - activo
        totalPoints: 140,
        level: 4,
        badges: ['FIRST_REPORT', 'FIVE_REPORTS', 'FIFTY_POINTS', 'HUNDRED_POINTS'],
        reportsCount: 8,
        verifiedReportsCount: 7,
        lastReportDate: new Date('2026-02-13T10:00:00Z'),
    },
];

/**
 * Puntos a actualizar en la colección de usuarios
 */
export const userPointsUpdates = gamificationProfilesData.map(profile => ({
    id: profile.userId,
    points: profile.totalPoints,
    reportsCount: profile.reportsCount,
}));

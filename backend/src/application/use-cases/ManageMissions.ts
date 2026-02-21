/**
 * Caso de Uso: Gestión de Misiones
 * Crea, actualiza y verifica misiones para los usuarios
 */

import { Mission } from '../../domain/entities/GamificationProfile';
import { GamificationProfileRepository } from './GetUserGamificationProfile';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMissionRequest {
    type: 'daily' | 'weekly' | 'monthly';
    title: string;
    description: string;
    targetValue: number;
    reward: number;
    expiresAt: Date;
}

export class CreateMissionsForUserUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository
    ) {}

    async execute(userId: string, missions: CreateMissionRequest[]): Promise<void> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        const profile = await this.gamificationProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        // Crear las misiones
        const newMissions: Mission[] = missions.map(missionData => ({
            id: uuidv4(),
            type: missionData.type,
            title: missionData.title,
            description: missionData.description,
            targetValue: missionData.targetValue,
            currentValue: 0,
            reward: missionData.reward,
            expiresAt: missionData.expiresAt,
            completed: false
        }));

        // Agregar a la lista de misiones del perfil
        profile.missions.push(...newMissions);
        profile.updatedAt = new Date();

        await this.gamificationProfileRepository.save(profile);
    }
}

/**
 * Caso de Uso: Generar Misiones Diarias
 */
export class GenerateDailyMissionsUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository
    ) {}

    async execute(userId: string): Promise<Mission[]> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        const profile = await this.gamificationProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        // Eliminar misiones diarias expiradas
        const now = new Date();
        profile.missions = profile.missions.filter(
            mission => mission.type !== 'daily' || mission.expiresAt > now
        );

        // Verificar si ya tiene misiones diarias activas
        const hasActiveDailyMissions = profile.missions.some(
            mission => mission.type === 'daily' && !mission.completed
        );

        if (hasActiveDailyMissions) {
            return profile.missions.filter(m => m.type === 'daily');
        }

        // Generar nuevas misiones diarias
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);

        const dailyMissions: Mission[] = [
            {
                id: uuidv4(),
                type: 'daily',
                title: 'Reporta 3 residuos',
                description: 'Completa 3 reportes de residuos hoy',
                targetValue: 3,
                currentValue: 0,
                reward: 15,
                expiresAt: tomorrow,
                completed: false
            },
            {
                id: uuidv4(),
                type: 'daily',
                title: 'Gana 20 puntos',
                description: 'Acumula 20 puntos limpios hoy',
                targetValue: 20,
                currentValue: 0,
                reward: 10,
                expiresAt: tomorrow,
                completed: false
            }
        ];

        // Agregar misión adicional según el nivel del usuario
        if (profile.level >= 5) {
            dailyMissions.push({
                id: uuidv4(),
                type: 'daily',
                title: 'Mantén tu racha',
                description: 'Reporta al menos un residuo para mantener tu racha',
                targetValue: 1,
                currentValue: 0,
                reward: 5,
                expiresAt: tomorrow,
                completed: false
            });
        }

        profile.missions.push(...dailyMissions);
        profile.updatedAt = new Date();

        await this.gamificationProfileRepository.save(profile);

        return dailyMissions;
    }
}

/**
 * Caso de Uso: Generar Misiones Semanales
 */
export class GenerateWeeklyMissionsUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository
    ) {}

    async execute(userId: string): Promise<Mission[]> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        const profile = await this.gamificationProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        // Eliminar misiones semanales expiradas
        const now = new Date();
        profile.missions = profile.missions.filter(
            mission => mission.type !== 'weekly' || mission.expiresAt > now
        );

        // Verificar si ya tiene misiones semanales activas
        const hasActiveWeeklyMissions = profile.missions.some(
            mission => mission.type === 'weekly' && !mission.completed
        );

        if (hasActiveWeeklyMissions) {
            return profile.missions.filter(m => m.type === 'weekly');
        }

        // Calcular el próximo domingo
        const nextSunday = new Date();
        const daysUntilSunday = 7 - nextSunday.getDay();
        nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
        nextSunday.setHours(23, 59, 59, 999);

        const weeklyMissions: Mission[] = [
            {
                id: uuidv4(),
                type: 'weekly',
                title: 'Reporta 10 residuos',
                description: 'Completa 10 reportes esta semana',
                targetValue: 10,
                currentValue: 0,
                reward: 50,
                expiresAt: nextSunday,
                completed: false
            },
            {
                id: uuidv4(),
                type: 'weekly',
                title: 'Acumula 100 puntos',
                description: 'Gana 100 puntos limpios esta semana',
                targetValue: 100,
                currentValue: 0,
                reward: 30,
                expiresAt: nextSunday,
                completed: false
            }
        ];

        // Misión adicional para usuarios avanzados
        if (profile.level >= 7) {
            weeklyMissions.push({
                id: uuidv4(),
                type: 'weekly',
                title: 'Racha de 7 días',
                description: 'Mantén una racha activa durante toda la semana',
                targetValue: 7,
                currentValue: 0,
                reward: 75,
                expiresAt: nextSunday,
                completed: false
            });
        }

        profile.missions.push(...weeklyMissions);
        profile.updatedAt = new Date();

        await this.gamificationProfileRepository.save(profile);

        return weeklyMissions;
    }
}

/**
 * Caso de Uso: Actualizar Progreso de Misión
 */
export class UpdateMissionProgressUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository
    ) {}

    async execute(userId: string, missionType: string, value: number): Promise<{
        completedMissions: Mission[];
        totalReward: number;
    }> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        const profile = await this.gamificationProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        const completedMissions: Mission[] = [];
        let totalReward = 0;

        // Actualizar progreso de misiones relevantes
        for (const mission of profile.missions) {
            if (mission.completed) continue;
            if (mission.expiresAt < new Date()) continue;

            // Determinar si la misión aplica según el tipo
            let shouldUpdate = false;

            if (missionType === 'report' && mission.title.includes('Reporta')) {
                shouldUpdate = true;
            } else if (missionType === 'points' && mission.title.includes('puntos')) {
                shouldUpdate = true;
            } else if (missionType === 'streak' && mission.title.includes('racha')) {
                shouldUpdate = true;
            }

            if (shouldUpdate) {
                profile.updateMissionProgress(mission.id, value);

                // Verificar si se completó
                if (mission.currentValue >= mission.targetValue && !mission.completed) {
                    const reward = profile.completeMission(mission.id);
                    completedMissions.push(mission);
                    totalReward += reward;

                    // Otorgar los puntos de recompensa
                    profile.awardPoints(reward, `Misión completada: ${mission.title}`);
                }
            }
        }

        if (completedMissions.length > 0) {
            await this.gamificationProfileRepository.save(profile);
        }

        return {
            completedMissions,
            totalReward
        };
    }
}

/**
 * Caso de Uso: Obtener Misiones del Usuario
 */
export class GetUserMissionsUseCase {
    constructor(
        private readonly gamificationProfileRepository: GamificationProfileRepository
    ) {}

    async execute(userId: string): Promise<{
        activeMissions: Mission[];
        completedMissions: Mission[];
        expiredMissions: Mission[];
    }> {
        if (!userId || userId.trim().length === 0) {
            throw new Error('El ID del usuario es requerido');
        }

        const profile = await this.gamificationProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new Error('Perfil de gamificación no encontrado');
        }

        const now = new Date();

        const activeMissions = profile.missions.filter(
            m => !m.completed && m.expiresAt > now
        );

        const completedMissions = profile.missions.filter(m => m.completed);

        const expiredMissions = profile.missions.filter(
            m => !m.completed && m.expiresAt <= now
        );

        return {
            activeMissions,
            completedMissions,
            expiredMissions
        };
    }
}

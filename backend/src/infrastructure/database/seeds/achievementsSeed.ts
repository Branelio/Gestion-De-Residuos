/**
 * Seed para Achievements (Logros)
 * Crea todos los logros disponibles en el sistema
 */

import mongoose from 'mongoose';
import { AchievementModel } from '../../persistence/GamificationModel';
import { PREDEFINED_ACHIEVEMENTS } from '../../../domain/entities/Achievement';

export async function seedAchievements() {
    try {
        console.log('🎖️ Iniciando seed de achievements...');

        // Limpiar achievements existentes
        await AchievementModel.deleteMany({});
        console.log('   ✓ Achievements anteriores eliminados');

        // Insertar todos los achievements predefinidos
        const achievementsData = PREDEFINED_ACHIEVEMENTS.map(achievement => ({
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            pointsRequired: achievement.pointsRequired,
            reportsRequired: achievement.reportsRequired,
            category: achievement.category,
            hidden: achievement.hidden || false,
            special: achievement.special || false
        }));

        await AchievementModel.insertMany(achievementsData);

        console.log(`   ✓ ${achievementsData.length} achievements creados exitosamente`);
        console.log('   📊 Resumen por categoría:');
        
        const categories = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'SPECIAL'];
        for (const category of categories) {
            const count = achievementsData.filter(a => a.category === category).length;
            if (count > 0) {
                console.log(`      - ${category}: ${count} logros`);
            }
        }

        const hiddenCount = achievementsData.filter(a => a.hidden).length;
        console.log(`      - Logros ocultos: ${hiddenCount}`);

        return { success: true, count: achievementsData.length };
    } catch (error) {
        console.error('❌ Error en seed de achievements:', error);
        throw error;
    }
}

/**
 * Ejecutar seed si se llama directamente
 */
if (require.main === module) {
    mongoose
        .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/latacunga_waste_management')
        .then(async () => {
            console.log('✅ Conectado a MongoDB');
            await seedAchievements();
            await mongoose.connection.close();
            console.log('✅ Seed completado y conexión cerrada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error conectando a MongoDB:', error);
            process.exit(1);
        });
}

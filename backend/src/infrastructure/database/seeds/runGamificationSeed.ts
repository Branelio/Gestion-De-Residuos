/**
 * Seed Master de Gamificación
 * Ejecuta todos los seeds relacionados con gamificación
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedAchievements } from './achievementsSeed';
import { seedRewards } from './rewardsSeed';

// Cargar variables de entorno PRIMERO
dotenv.config();

async function seedGamification() {
    try {
        console.log('\n🎮 ========================================');
        console.log('   SEED DE GAMIFICACIÓN');
        console.log('   ========================================\n');

        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/latacunga_waste_management';
        
        console.log('📡 Conectando a MongoDB Atlas...');
        console.log('🔗 URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Ocultar password
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado exitosamente\n');

        // Seed de Achievements
        console.log('1️⃣ Creando Achievements...');
        const achievementsResult = await seedAchievements();
        console.log('');

        // Seed de Rewards
        console.log('2️⃣ Creando Rewards...');
        const rewardsResult = await seedRewards();
        console.log('');

        // Resumen final
        console.log('✅ ========================================');
        console.log('   SEED COMPLETADO EXITOSAMENTE');
        console.log('   ========================================');
        console.log(`   📈 Total Achievements: ${achievementsResult.count}`);
        console.log(`   🎁 Total Rewards: ${rewardsResult.count}`);
        console.log('');
        console.log('   🚀 Sistema de gamificación listo para usar!');
        console.log('   ========================================\n');

        await mongoose.connection.close();
        console.log('🔒 Conexión a MongoDB cerrada');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error en seed de gamificación:', error);
        process.exit(1);
    }
}

// Ejecutar
seedGamification();

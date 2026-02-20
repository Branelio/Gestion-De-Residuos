/**
 * Script completo para seed de datos en MongoDB
 * Incluye: usuarios, puntos de acopio, gamificación, reportes y logros
 * Uso: npx ts-node src/infrastructure/database/seeds/runSeed.ts [--clear]
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { collectionPointsData, seedStats } from './collectionPointsSeed';
import { usersData, usersStats } from './usersSeed';
import { gamificationProfilesData, userPointsUpdates } from './gamificationSeed';
import { wasteReportsData } from './wasteReportsSeed';
import { GamificationModel, AchievementModel, DEFAULT_ACHIEVEMENTS } from '../../persistence/GamificationModel';
import { WasteReportModel } from '../../persistence/WasteReportModel';
import { UserModel } from '../../persistence/UserModel';

// Cargar variables de entorno
dotenv.config();

// Schema de Mongoose para CollectionPoint (inline para evitar problemas de import)
const CollectionPointSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentLoad: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['AVAILABLE', 'FULL', 'MAINTENANCE', 'INACTIVE'],
    required: true
  },
  wasteTypes: [{ type: String }],
  schedule: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  zone: {
    type: String,
    enum: ['URBANA', 'PERIURBANA', 'RURAL', 'INDUSTRIAL', 'COMERCIAL', 'INSTITUCIONAL', 'RECREATIVA']
  },
  parish: { type: String },
  description: { type: String },
  contactPhone: { type: String },
  isActive: { type: Boolean, default: true },
  lastEmptied: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CollectionPointSchema.index({ location: '2dsphere' });

const CollectionPointModel = mongoose.model('CollectionPoint', CollectionPointSchema, 'collection_points');

/**
 * Conectar a MongoDB
 */
async function connectDatabase(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/waste_management';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    throw error;
  }
}

/**
 * Limpiar todas las colecciones
 */
async function clearAllCollections(): Promise<void> {
  try {
    console.log('🗑️  Limpiando todas las colecciones...');

    const results = await Promise.all([
      CollectionPointModel.deleteMany({}),
      UserModel.deleteMany({}),
      GamificationModel.deleteMany({}),
      AchievementModel.deleteMany({}),
      WasteReportModel.deleteMany({}),
    ]);

    console.log(`   - Collection Points: ${results[0].deletedCount} eliminados`);
    console.log(`   - Users: ${results[1].deletedCount} eliminados`);
    console.log(`   - Gamification: ${results[2].deletedCount} eliminados`);
    console.log(`   - Achievements: ${results[3].deletedCount} eliminados`);
    console.log(`   - Waste Reports: ${results[4].deletedCount} eliminados`);
  } catch (error) {
    console.error('❌ Error al limpiar colecciones:', error);
    throw error;
  }
}

/**
 * Seed de usuarios
 */
async function seedUsers(): Promise<void> {
  try {
    console.log('\n👤 Seeding usuarios...');
    await UserModel.insertMany(usersData);
    console.log(`   ✅ ${usersData.length} usuarios insertados`);
    console.log(`   📊 Admins: ${usersStats.admins}, Operadores: ${usersStats.operators}, Ciudadanos: ${usersStats.citizens}`);
  } catch (error) {
    console.error('❌ Error seeding usuarios:', error);
    throw error;
  }
}

/**
 * Seed de puntos de acopio
 */
async function seedCollectionPoints(): Promise<void> {
  try {
    console.log('\n📍 Seeding puntos de acopio...');
    await CollectionPointModel.insertMany(collectionPointsData);
    console.log(`   ✅ ${collectionPointsData.length} puntos insertados`);
    console.log(`   📊 Capacidad total: ${seedStats.totalCapacity.toLocaleString()} kg`);
  } catch (error) {
    console.error('❌ Error seeding puntos de acopio:', error);
    throw error;
  }
}

/**
 * Seed de logros/achievements predeterminados
 */
async function seedAchievements(): Promise<void> {
  try {
    console.log('\n🏆 Seeding logros/achievements...');
    await AchievementModel.insertMany(DEFAULT_ACHIEVEMENTS);
    console.log(`   ✅ ${DEFAULT_ACHIEVEMENTS.length} logros insertados`);
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    throw error;
  }
}

/**
 * Seed de perfiles de gamificación
 */
async function seedGamification(): Promise<void> {
  try {
    console.log('\n🎮 Seeding perfiles de gamificación...');
    await GamificationModel.insertMany(gamificationProfilesData);
    console.log(`   ✅ ${gamificationProfilesData.length} perfiles insertados`);

    // Actualizar puntos en los documentos de usuario
    console.log('   🔄 Actualizando puntos en los usuarios...');
    for (const update of userPointsUpdates) {
      await UserModel.updateOne(
        { _id: update.id },
        { $set: { points: update.points, reportsCount: update.reportsCount } }
      );
    }
    console.log(`   ✅ ${userPointsUpdates.length} usuarios actualizados con puntos`);
  } catch (error) {
    console.error('❌ Error seeding gamificación:', error);
    throw error;
  }
}

/**
 * Seed de reportes de residuos
 */
async function seedWasteReports(): Promise<void> {
  try {
    console.log('\n📋 Seeding reportes de residuos...');
    await WasteReportModel.insertMany(wasteReportsData);
    console.log(`   ✅ ${wasteReportsData.length} reportes insertados`);

    // Estadísticas
    const resolved = wasteReportsData.filter(r => r.status === 'RESOLVED').length;
    const pending = wasteReportsData.filter(r => r.status === 'PENDING').length;
    const inProgress = wasteReportsData.filter(r => r.status === 'IN_PROGRESS').length;
    console.log(`   📊 Resueltos: ${resolved}, Pendientes: ${pending}, En Progreso: ${inProgress}`);
  } catch (error) {
    console.error('❌ Error seeding reportes:', error);
    throw error;
  }
}

/**
 * Verificar datos insertados
 */
async function verifyData(): Promise<void> {
  try {
    console.log('\n🔍 VERIFICACIÓN DE DATOS:');

    const [users, points, gamification, achievements, reports] = await Promise.all([
      UserModel.countDocuments(),
      CollectionPointModel.countDocuments(),
      GamificationModel.countDocuments(),
      AchievementModel.countDocuments(),
      WasteReportModel.countDocuments(),
    ]);

    console.log(`   Usuarios: ${users}`);
    console.log(`   Puntos de acopio: ${points}`);
    console.log(`   Perfiles de gamificación: ${gamification}`);
    console.log(`   Logros disponibles: ${achievements}`);
    console.log(`   Reportes de residuos: ${reports}`);

    // Top 5 usuarios por puntos
    const topUsers = await GamificationModel.find()
      .sort({ totalPoints: -1 })
      .limit(5);

    console.log('\n🏆 TOP 5 USUARIOS POR PUNTOS:');
    for (let i = 0; i < topUsers.length; i++) {
      const user = await UserModel.findById(topUsers[i].userId);
      console.log(`   ${i + 1}. ${user?.name || 'Desconocido'} - ${topUsers[i].totalPoints} pts (Nivel ${topUsers[i].level})`);
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  try {
    // Conectar a la base de datos
    await connectDatabase();

    // Limpiar datos existentes si se usa --clear
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      console.log('⚠️  Modo de limpieza activado');
      await clearAllCollections();
    }

    // Ejecutar todos los seeds
    await seedUsers();
    await seedCollectionPoints();
    await seedAchievements();
    await seedGamification();
    await seedWasteReports();

    // Verificar datos
    await verifyData();

    console.log('\n✨ Proceso de seed completado exitosamente');

  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar
main();

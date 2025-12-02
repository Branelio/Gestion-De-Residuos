/**
 * Script para ejecutar el seed de puntos de acopio en MongoDB
 * Uso: npm run seed:collection-points
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { collectionPointsData, seedStats } from './collectionPointsSeed';

// Cargar variables de entorno
dotenv.config();

// Schema de Mongoose para CollectionPoint
const CollectionPointSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
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

// Crear índice geoespacial para búsquedas por proximidad
CollectionPointSchema.index({ location: '2dsphere' });

const CollectionPointModel = mongoose.model('CollectionPoint', CollectionPointSchema, 'collection_points');

/**
 * Conecta a MongoDB
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
 * Limpia la colección existente (opcional)
 */
async function clearCollection(): Promise<void> {
  try {
    const result = await CollectionPointModel.deleteMany({});
    console.log(`🗑️  Eliminados ${result.deletedCount} documentos existentes`);
  } catch (error) {
    console.error('❌ Error al limpiar colección:', error);
    throw error;
  }
}

/**
 * Inserta los datos de seed
 */
async function seedCollectionPoints(): Promise<void> {
  try {
    console.log('🌱 Iniciando seed de puntos de acopio...');
    
    // Insertar todos los puntos
    const result = await CollectionPointModel.insertMany(collectionPointsData);
    
    console.log(`✅ ${result.length} puntos de acopio insertados correctamente`);
    
    // Mostrar estadísticas
    console.log('\n📊 ESTADÍSTICAS DE SEED:');
    console.log(`   Total de puntos: ${seedStats.totalPoints}`);
    console.log(`   Capacidad total: ${seedStats.totalCapacity.toLocaleString()} kg`);
    console.log(`   Carga actual: ${seedStats.totalCurrentLoad.toLocaleString()} kg`);
    console.log(`   Promedio de llenado: ${seedStats.averageLoad}%`);
    console.log('\n📍 DISTRIBUCIÓN POR ZONA:');
    Object.entries(seedStats.byZone).forEach(([zone, count]) => {
      if (count > 0) {
        console.log(`   ${zone}: ${count} puntos`);
      }
    });
    
    // Verificar índice geoespacial
    const indexes = await CollectionPointModel.collection.getIndexes();
    console.log('\n🗺️  Índices creados:', Object.keys(indexes).join(', '));
    
  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    throw error;
  }
}

/**
 * Verifica los datos insertados
 */
async function verifyData(): Promise<void> {
  try {
    console.log('\n🔍 VERIFICACIÓN DE DATOS:');
    
    // Contar documentos
    const count = await CollectionPointModel.countDocuments();
    console.log(`   Total documentos: ${count}`);
    
    // Buscar puntos por zona
    const urbanPoints = await CollectionPointModel.countDocuments({ zone: 'URBANA' });
    const ruralPoints = await CollectionPointModel.countDocuments({ zone: 'RURAL' });
    console.log(`   Puntos urbanos: ${urbanPoints}`);
    console.log(`   Puntos rurales: ${ruralPoints}`);
    
    // Buscar punto más cercano al Parque Vicente León (centro de Latacunga)
    const centerPoint = [-78.6156, -0.9346]; // [longitude, latitude]
    const nearestPoints = await CollectionPointModel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: centerPoint
          },
          $maxDistance: 5000 // 5 km
        }
      }
    }).limit(5);
    
    console.log(`\n📍 5 PUNTOS MÁS CERCANOS AL CENTRO (Parque Vicente León):`);
    nearestPoints.forEach((point, index) => {
      console.log(`   ${index + 1}. ${point.name} - ${point.address}`);
    });
    
    // Buscar puntos disponibles
    const availablePoints = await CollectionPointModel.countDocuments({ status: 'AVAILABLE' });
    const fullPoints = await CollectionPointModel.countDocuments({ status: 'FULL' });
    console.log(`\n✅ Puntos disponibles: ${availablePoints}`);
    console.log(`🔴 Puntos llenos: ${fullPoints}`);
    
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
    
    // Preguntar si limpiar datos existentes
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      console.log('⚠️  Modo de limpieza activado');
      await clearCollection();
    }
    
    // Ejecutar seed
    await seedCollectionPoints();
    
    // Verificar datos
    await verifyData();
    
    console.log('\n✨ Proceso completado exitosamente');
    
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar
main();

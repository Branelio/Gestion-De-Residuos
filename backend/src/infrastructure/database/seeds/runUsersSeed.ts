/**
 * Script para ejecutar el seed de usuarios en MongoDB
 * Uso: npm run seed:users
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { usersData, usersStats } from './usersSeed';

// Cargar variables de entorno
dotenv.config();

// Importar el modelo
import { UserModel } from '../../persistence/UserModel';

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
    const result = await UserModel.deleteMany({});
    console.log(`🗑️  Eliminados ${result.deletedCount} usuarios existentes`);
  } catch (error) {
    console.error('❌ Error al limpiar colección:', error);
    throw error;
  }
}

/**
 * Inserta los datos de seed
 */
async function seedUsers(): Promise<void> {
  try {
    console.log('🌱 Iniciando seed de usuarios...');
    
    // Insertar todos los usuarios
    const result = await UserModel.insertMany(usersData);
    
    console.log(`✅ ${result.length} usuarios insertados correctamente`);
    
    // Mostrar estadísticas
    console.log('\n📊 ESTADÍSTICAS DE SEED:');
    console.log(`   Total de usuarios: ${usersStats.total}`);
    console.log(`   Administradores: ${usersStats.admins}`);
    console.log(`   Operadores: ${usersStats.operators}`);
    console.log(`   Ciudadanos: ${usersStats.citizens}`);
    console.log(`   Activos: ${usersStats.active}`);
    
    // Mostrar usuarios de prueba
    console.log('\n👥 USUARIOS DE PRUEBA:');
    console.log('\n📌 ADMINISTRADORES:');
    console.log('   Email: admin@latacunga.gob.ec');
    console.log('   Email: admin.sistemas@latacunga.gob.ec');
    console.log('\n📌 OPERADORES:');
    console.log('   Email: operador1@latacunga.gob.ec');
    console.log('   Email: operador2@latacunga.gob.ec');
    console.log('   Email: operador3@latacunga.gob.ec');
    console.log('\n📌 CIUDADANOS:');
    console.log('   Email: ciudadano1@gmail.com');
    console.log('   Email: ciudadano2@gmail.com');
    console.log('   ... y 8 usuarios más');
    console.log('\n🔑 CONTRASEÑA PARA TODOS: Latacunga2025!');
    
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
    const count = await UserModel.countDocuments();
    console.log(`   Total documentos: ${count}`);
    
    // Contar por rol
    const admins = await UserModel.countDocuments({ role: 'admin' });
    const operators = await UserModel.countDocuments({ role: 'operator' });
    const citizens = await UserModel.countDocuments({ role: 'citizen' });
    
    console.log(`   Administradores: ${admins}`);
    console.log(`   Operadores: ${operators}`);
    console.log(`   Ciudadanos: ${citizens}`);
    
    // Verificar índices
    const indexes = await UserModel.collection.getIndexes();
    console.log('\n🗂️  Índices creados:', Object.keys(indexes).join(', '));
    
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
    await seedUsers();
    
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

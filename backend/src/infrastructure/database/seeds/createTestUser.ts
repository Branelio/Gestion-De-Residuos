import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UserModel } from '../../persistence/UserModel';
import { connectDatabase, disconnectDatabase } from '../../config/database';

/**
 * Script para crear un usuario de prueba en la base de datos
 */
async function createTestUser() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await connectDatabase();

    // Verificar si ya existe el usuario
    const existingUser = await UserModel.findOne({ email: 'test@latacunga.com' });
    
    if (existingUser) {
      console.log('ℹ️  El usuario de prueba ya existe');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Nombre:', existingUser.name);
      console.log('🔑 Role:', existingUser.role);
      console.log('✅ Activo:', existingUser.isActive);
      return;
    }

    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Crear usuario de prueba
    const testUser = new UserModel({
      _id: randomUUID(),
      email: 'test@latacunga.com',
      name: 'Usuario de Prueba',
      password: hashedPassword,
      role: 'citizen',
      isActive: true,
    });

    await testUser.save();

    console.log('✅ Usuario de prueba creado exitosamente!');
    console.log('📧 Email: test@latacunga.com');
    console.log('🔒 Password: Test123!');
    console.log('👤 Nombre:', testUser.name);
    console.log('🔑 Role:', testUser.role);
    console.log('🆔 ID:', testUser._id);

  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error);
    throw error;
  } finally {
    await disconnectDatabase();
    console.log('👋 Desconectado de la base de datos');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createTestUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default createTestUser;

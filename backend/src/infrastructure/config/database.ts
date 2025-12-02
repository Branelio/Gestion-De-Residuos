import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/latacunga_waste_management';

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('✅ Ya conectado a MongoDB');
      return;
    }

    try {
      await mongoose.connect(MONGODB_URI);
      this.isConnected = true;
      console.log('🚀 Conectado exitosamente a MongoDB');
      console.log(`📊 Base de datos: ${mongoose.connection.name}`);
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }

    // Manejar eventos de conexión
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
      this.isConnected = false;
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ Error en conexión MongoDB:', error);
    });
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('👋 Desconectado de MongoDB');
    } catch (error) {
      console.error('❌ Error desconectando de MongoDB:', error);
      throw error;
    }
  }

  public getConnection() {
    return mongoose.connection;
  }

  public isDBConnected(): boolean {
    return this.isConnected;
  }
}

export const connectDatabase = async (): Promise<void> => {
  const db = Database.getInstance();
  await db.connect();
};

export const disconnectDatabase = async (): Promise<void> => {
  const db = Database.getInstance();
  await db.disconnect();
};

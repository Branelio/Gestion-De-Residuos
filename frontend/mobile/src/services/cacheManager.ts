// Service - Cache Manager para datos offline
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionPoint } from './collectionPointService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

const CACHE_KEYS = {
  COLLECTION_POINTS: '@latacunga_collection_points',
  NEARBY_POINTS: '@latacunga_nearby_points',
  STATS: '@latacunga_stats',
  USER_LOCATION: '@latacunga_user_location',
};

const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutos

class CacheManager {
  /**
   * Guardar datos en caché
   */
  async set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
      console.log(`📦 Cached ${key}`);
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  }

  /**
   * Obtener datos del caché
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) {
        console.log(`❌ Cache miss: ${key}`);
        return null;
      }

      const cacheEntry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Verificar si expiró
      if (now - cacheEntry.timestamp > cacheEntry.expiresIn) {
        console.log(`⏰ Cache expired: ${key}`);
        await this.delete(key);
        return null;
      }

      console.log(`✅ Cache hit: ${key}`);
      return cacheEntry.data;
    } catch (error) {
      console.error(`Error getting cache ${key}:`, error);
      return null;
    }
  }

  /**
   * Eliminar entrada del caché
   */
  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Deleted cache: ${key}`);
    } catch (error) {
      console.error(`Error deleting cache ${key}:`, error);
    }
  }

  /**
   * Limpiar todo el caché
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('🧹 Cleared all cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Obtener o actualizar puntos de acopio
   */
  async getOrFetchCollectionPoints(
    fetchFn: () => Promise<CollectionPoint[]>
  ): Promise<CollectionPoint[]> {
    const cached = await this.get<CollectionPoint[]>(CACHE_KEYS.COLLECTION_POINTS);
    
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await fetchFn();
    await this.set(CACHE_KEYS.COLLECTION_POINTS, data, 1000 * 60 * 60); // 1 hora
    return data;
  }

  /**
   * Guardar puntos cercanos con key específica por ubicación
   */
  async saveNearbyPoints(
    lat: number,
    lng: number,
    radius: number,
    points: CollectionPoint[]
  ): Promise<void> {
    const key = `${CACHE_KEYS.NEARBY_POINTS}_${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;
    await this.set(key, points, 1000 * 60 * 15); // 15 minutos
  }

  /**
   * Obtener puntos cercanos cacheados
   */
  async getNearbyPoints(
    lat: number,
    lng: number,
    radius: number
  ): Promise<CollectionPoint[] | null> {
    const key = `${CACHE_KEYS.NEARBY_POINTS}_${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;
    return await this.get<CollectionPoint[]>(key);
  }

  /**
   * Guardar estadísticas
   */
  async saveStats(stats: any): Promise<void> {
    await this.set(CACHE_KEYS.STATS, stats, 1000 * 60 * 30); // 30 minutos
  }

  /**
   * Obtener estadísticas cacheadas
   */
  async getStats(): Promise<any | null> {
    return await this.get(CACHE_KEYS.STATS);
  }
}

export const cacheManager = new CacheManager();
export { CACHE_KEYS };

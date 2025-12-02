import { CollectionPointRepository } from '../../domain/repositories/CollectionPointRepository';
import { CollectionPoint, Coordinates } from '../../domain/entities/CollectionPoint';
import { CollectionPointModel, ICollectionPointDocument } from '../persistence/CollectionPointModel';

/**
 * Implementación de MongoDB para el repositorio de puntos de acopio
 */
export class MongoCollectionPointRepository implements CollectionPointRepository {
  
  /**
   * Convierte un documento de MongoDB a entidad de dominio
   */
  private toDomain(doc: ICollectionPointDocument): CollectionPoint {
    return CollectionPoint.fromPersistence({
      id: { value: doc._id },
      name: doc.name,
      type: 'CONTAINER' as any, // Simplificado
      coordinates: {
        latitude: doc.location.coordinates[1],
        longitude: doc.location.coordinates[0],
      },
      address: doc.address,
      capacity: doc.capacity,
      currentLoad: doc.currentLoad,
      status: doc.status,
      isRural: doc.zone === 'RURAL',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convierte una entidad de dominio a documento de MongoDB
   */
  private toDocument(point: CollectionPoint): Partial<ICollectionPointDocument> {
    return {
      _id: point.id.value,
      name: point.name,
      location: {
        type: 'Point',
        coordinates: [point.coordinates.longitude, point.coordinates.latitude],
      },
      address: point.address,
      capacity: point.capacity,
      currentLoad: point.currentLoad,
      status: point.status,
      wasteTypes: ['GENERAL'],
      zone: point.isRural ? 'RURAL' : 'URBANA',
      parish: '',
      isActive: true,
    };
  }

  async save(point: CollectionPoint): Promise<void> {
    try {
      const doc = this.toDocument(point);
      await CollectionPointModel.create(doc);
    } catch (error) {
      console.error('Error guardando punto de acopio:', error);
      throw new Error('No se pudo guardar el punto de acopio');
    }
  }

  async findById(id: string | { value: string }): Promise<CollectionPoint | null> {
    try {
      const idValue = typeof id === 'string' ? id : id.value;
      const doc = await CollectionPointModel.findById(idValue).exec();
      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      console.error('Error buscando punto de acopio por ID:', error);
      throw new Error('No se pudo encontrar el punto de acopio');
    }
  }

  async findAll(): Promise<CollectionPoint[]> {
    try {
      const docs = await CollectionPointModel.find({ isActive: true }).exec();
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      console.error('Error obteniendo todos los puntos de acopio:', error);
      throw new Error('No se pudieron obtener los puntos de acopio');
    }
  }

  async findByStatus(status: string): Promise<CollectionPoint[]> {
    try {
      const docs = await CollectionPointModel.find({ 
        status, 
        isActive: true 
      }).exec();
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      console.error('Error buscando puntos por estado:', error);
      throw new Error('No se pudieron obtener los puntos de acopio por estado');
    }
  }

  /**
   * Encuentra puntos de acopio cercanos usando índice geoespacial
   * @param coordinates Coordenadas del punto de referencia
   * @param radiusKm Radio de búsqueda en kilómetros
   */
  async findNearby(coordinates: Coordinates, radiusKm: number): Promise<CollectionPoint[]> {
    try {
      const radiusMeters = radiusKm * 1000;

      const docs = await CollectionPointModel.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [coordinates.longitude, coordinates.latitude],
            },
            $maxDistance: radiusMeters,
          },
        },
        isActive: true,
      }).exec();

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      console.error('Error buscando puntos cercanos:', error);
      throw new Error('No se pudieron obtener los puntos cercanos');
    }
  }

  async update(point: CollectionPoint): Promise<void> {
    try {
      const doc = this.toDocument(point);
      await CollectionPointModel.findByIdAndUpdate(
        point.id.value,
        { $set: doc },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error actualizando punto de acopio:', error);
      throw new Error('No se pudo actualizar el punto de acopio');
    }
  }

  async delete(id: string | { value: string }): Promise<void> {
    try {
      const idValue = typeof id === 'string' ? id : id.value;
      await CollectionPointModel.findByIdAndUpdate(
        idValue,
        { $set: { isActive: false } },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error eliminando punto de acopio:', error);
      throw new Error('No se pudo eliminar el punto de acopio');
    }
  }

  /**
   * Métodos adicionales útiles
   */
  async deleteAll(): Promise<void> {
    try {
      await CollectionPointModel.deleteMany({}).exec();
    } catch (error) {
      console.error('Error eliminando todos los puntos:', error);
      throw new Error('No se pudieron eliminar los puntos');
    }
  }

  async count(): Promise<number> {
    try {
      return await CollectionPointModel.countDocuments({ isActive: true }).exec();
    } catch (error) {
      console.error('Error contando puntos:', error);
      throw new Error('No se pudo contar los puntos');
    }
  }
}

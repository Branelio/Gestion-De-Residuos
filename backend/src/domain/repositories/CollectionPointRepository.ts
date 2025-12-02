// Domain Layer - Repository Interfaces

import { CollectionPoint, CollectionPointId } from '../entities/CollectionPoint';
import { Coordinates } from '../entities/CollectionPoint';

export interface CollectionPointRepository {
  save(point: CollectionPoint): Promise<void>;
  findById(id: CollectionPointId): Promise<CollectionPoint | null>;
  findAll(): Promise<CollectionPoint[]>;
  findByStatus(status: string): Promise<CollectionPoint[]>;
  findNearby(coordinates: Coordinates, radiusKm: number): Promise<CollectionPoint[]>;
  update(point: CollectionPoint): Promise<void>;
  delete(id: CollectionPointId): Promise<void>;
}

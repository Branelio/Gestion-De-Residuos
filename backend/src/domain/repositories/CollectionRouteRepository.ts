// Domain Layer - Repository Interface

import { CollectionRoute, RouteId } from '../entities/CollectionRoute';

export interface CollectionRouteRepository {
  save(route: CollectionRoute): Promise<void>;
  findById(id: RouteId): Promise<CollectionRoute | null>;
  findByDriverId(driverId: string): Promise<CollectionRoute[]>;
  findByStatus(status: string): Promise<CollectionRoute[]>;
  findByScheduledDate(date: Date): Promise<CollectionRoute[]>;
  findAll(): Promise<CollectionRoute[]>;
  update(route: CollectionRoute): Promise<void>;
  delete(id: RouteId): Promise<void>;
}

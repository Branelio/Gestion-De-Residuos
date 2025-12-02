// Domain Layer - Repository Interface

import { Citizen, CitizenId } from '../entities/Citizen';

export interface CitizenRepository {
  save(citizen: Citizen): Promise<void>;
  findById(id: CitizenId): Promise<Citizen | null>;
  findByEmail(email: string): Promise<Citizen | null>;
  findAll(): Promise<Citizen[]>;
  update(citizen: Citizen): Promise<void>;
  delete(id: CitizenId): Promise<void>;
}

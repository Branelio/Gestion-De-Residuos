// Domain Layer - Repository Interface
// Puerto (interface) que define el contrato para persistencia

import { User, UserId } from '../entities/User';

export interface UserRepository {
  save(user: User, password: string): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<{ user: User; password: string } | null>;
  findAll(): Promise<User[]>;
  delete(id: UserId): Promise<void>;
  update(user: User): Promise<void>;
}

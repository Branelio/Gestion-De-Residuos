// Domain Layer - Domain Service
// Servicios de dominio para lógica que no pertenece a una entidad específica

import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export class UserDomainService {
  constructor(private readonly userRepository: UserRepository) {}

  async isEmailUnique(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return existingUser === null;
  }

  async canDeleteUser(userId: string): Promise<boolean> {
    // Aquí podrías agregar lógica de negocio compleja
    // Por ejemplo, verificar si el usuario tiene datos dependientes
    return true;
  }
}

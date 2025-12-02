import { UserModel } from '../persistence/UserModel';
import { User, UserId } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class MongoUserRepository implements UserRepository {
  async findById(id: UserId): Promise<User | null> {
    try {
      const userDoc = await UserModel.findById(id.value);
      if (!userDoc) return null;

      return User.fromPersistence({
        id: { value: userDoc._id },
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        isActive: userDoc.isActive,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      });
    } catch (error) {
      throw new Error(`Error finding user by id: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findOne({ email: email.toLowerCase() });
      if (!userDoc) return null;

      return User.fromPersistence({
        id: { value: userDoc._id },
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        isActive: userDoc.isActive,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error}`);
    }
  }

  async findByEmailWithPassword(email: string): Promise<{ user: User; password: string } | null> {
    try {
      const userDoc = await UserModel.findOne({ email: email.toLowerCase() });
      if (!userDoc) return null;

      const user = User.fromPersistence({
        id: { value: userDoc._id },
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        isActive: userDoc.isActive,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      });

      return { user, password: userDoc.password };
    } catch (error) {
      throw new Error(`Error finding user by email with password: ${error}`);
    }
  }

  async save(user: User, password: string): Promise<void> {
    try {
      const existingUser = await UserModel.findById(user.id.value);

      if (existingUser) {
        // Update
        await UserModel.findByIdAndUpdate(user.id.value, {
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          updatedAt: new Date(),
        });
      } else {
        // Create
        await UserModel.create({
          _id: user.id.value,
          email: user.email,
          name: user.name,
          password,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      }
    } catch (error) {
      throw new Error(`Error saving user: ${error}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const userDocs = await UserModel.find();
      
      return userDocs.map(doc => 
        User.fromPersistence({
          id: { value: doc._id },
          email: doc.email,
          name: doc.name,
          role: doc.role,
          isActive: doc.isActive,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })
      );
    } catch (error) {
      throw new Error(`Error finding all users: ${error}`);
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await UserModel.findByIdAndDelete(id.value);
    } catch (error) {
      throw new Error(`Error deleting user: ${error}`);
    }
  }

  async update(user: User): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(user.id.value, {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Error updating user: ${error}`);
    }
  }
}

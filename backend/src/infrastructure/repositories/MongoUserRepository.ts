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
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          points: user.points,
          reportsCount: user.reportsCount,
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
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          points: user.points || 0,
          reportsCount: user.reportsCount || 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      }
    } catch (error) {
      throw new Error(`Error saving user: ${error}`);
    }
  }

  async create(userData: {
    email: string;
    name: string;
    password: string;
    role: 'citizen' | 'admin' | 'operator';
    points?: number;
    reportsCount?: number;
  }): Promise<User> {
    try {
      const userId = Math.random().toString(36).substring(7);
      const userDoc = await UserModel.create({
        _id: userId,
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role,
        isActive: true,
        points: userData.points || 0,
        reportsCount: userData.reportsCount || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return User.fromPersistence({
        id: { value: userDoc._id },
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        isActive: userDoc.isActive,
        phone: userDoc.phone,
        address: userDoc.address,
        avatar: userDoc.avatar,
        points: userDoc.points,
        reportsCount: userDoc.reportsCount,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      });
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
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
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        points: user.points,
        reportsCount: user.reportsCount,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Error updating user: ${error}`);
    }
  }

  async create(user: User, password: string): Promise<User> {
    try {
      const userDoc = await UserModel.create({
        _id: user.id.value,
        email: user.email,
        name: user.name,
        password,
        role: user.role,
        isActive: true,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        points: user.points || 0,
        reportsCount: user.reportsCount || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return User.fromPersistence({
        id: { value: userDoc._id },
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        isActive: userDoc.isActive,
        phone: userDoc.phone,
        address: userDoc.address,
        avatar: userDoc.avatar,
        points: userDoc.points,
        reportsCount: userDoc.reportsCount,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      });
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async save(user: User, password?: string): Promise<void> {
    try {
      const existingUser = await UserModel.findById(user.id.value);
      
      if (existingUser) {
        await UserModel.findByIdAndUpdate(user.id.value, {
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          points: user.points,
          reportsCount: user.reportsCount,
          updatedAt: new Date(),
        });
      } else {
        await UserModel.create({
          _id: user.id.value,
          email: user.email,
          name: user.name,
          password,
          role: user.role,
          isActive: true,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          points: user.points || 0,
          reportsCount: user.reportsCount || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      throw new Error(`Error saving user: ${error}`);
    }
  }
}

// Domain Layer - Entities
// Entidad User siguiendo principios DDD

export interface UserId {
  value: string;
}

export interface UserProps {
  id: UserId;
  email: string;
  name: string;
  password?: string; // Opcional para no exponerlo en JSON
  role: 'citizen' | 'admin' | 'operator';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  address?: string;
  avatar?: string;
  points?: number;
  reportsCount?: number;
}

export class User {
  private constructor(private readonly props: UserProps) {
    this.validate();
  }

  static create(props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'isActive'>): User {
    return new User({
      ...props,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  private validate(): void {
    if (!this.props.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (this.props.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get role(): 'citizen' | 'admin' | 'operator' {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get password(): string | undefined {
    return this.props.password;
  }

  updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
    this.validate();
  }

  updatePhone(phone: string): void {
    this.props.phone = phone;
    this.props.updatedAt = new Date();
  }

  updateAddress(address: string): void {
    this.props.address = address;
    this.props.updatedAt = new Date();
  }

  updateAvatar(avatar: string): void {
    this.props.avatar = avatar;
    this.props.updatedAt = new Date();
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get address(): string | undefined {
    return this.props.address;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get points(): number {
    return this.props.points || 0;
  }

  get reportsCount(): number {
    return this.props.reportsCount || 0;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      email: this.props.email,
      name: this.props.name,
      phone: this.props.phone,
      address: this.props.address,
      avatar: this.props.avatar,
      points: this.props.points || 0,
      reportsCount: this.props.reportsCount || 0,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

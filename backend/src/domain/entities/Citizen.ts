// Domain Layer - Entidad de Usuario Ciudadano
// Representa un usuario de la aplicación con sistema de puntos

export interface CitizenId {
  value: string;
}

export enum UserRole {
  CITIZEN = 'CITIZEN',
  COLLECTOR = 'COLLECTOR',
  ADMIN = 'ADMIN',
}

export interface CitizenProps {
  id: CitizenId;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  points: number;
  reportsCount: number;
  verifiedReports: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Citizen {
  private constructor(private readonly props: CitizenProps) {
    this.validate();
  }

  static create(
    props: Omit<
      CitizenProps,
      'id' | 'points' | 'reportsCount' | 'verifiedReports' | 'createdAt' | 'updatedAt'
    >,
  ): Citizen {
    return new Citizen({
      ...props,
      id: { value: this.generateId() },
      points: 0,
      reportsCount: 0,
      verifiedReports: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: CitizenProps): Citizen {
    return new Citizen(props);
  }

  private static generateId(): string {
    return `CIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.props.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (this.props.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (this.props.points < 0) {
      throw new Error('Points cannot be negative');
    }
  }

  get id(): CitizenId {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get phone(): string {
    return this.props.phone;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get points(): number {
    return this.props.points;
  }

  get reportsCount(): number {
    return this.props.reportsCount;
  }

  get verifiedReports(): number {
    return this.props.verifiedReports;
  }

  addPoints(points: number): void {
    if (points <= 0) {
      throw new Error('Points to add must be positive');
    }
    this.props.points += points;
    this.props.verifiedReports += 1;
    this.props.updatedAt = new Date();
  }

  redeemPoints(points: number): void {
    if (points <= 0) {
      throw new Error('Points to redeem must be positive');
    }
    if (this.props.points < points) {
      throw new Error('Insufficient points');
    }
    this.props.points -= points;
    this.props.updatedAt = new Date();
  }

  incrementReportsCount(): void {
    this.props.reportsCount += 1;
    this.props.updatedAt = new Date();
  }

  canRedeemDiscount(): boolean {
    return this.props.points >= 100; // Mínimo 100 puntos para canje
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      email: this.props.email,
      name: this.props.name,
      phone: this.props.phone,
      role: this.props.role,
      points: this.props.points,
      reportsCount: this.props.reportsCount,
      verifiedReports: this.props.verifiedReports,
      canRedeemDiscount: this.canRedeemDiscount(),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

// Domain Layer - Entidad de Reporte de Residuos
// Representa un reporte ciudadano de residuos con geolocalización

export interface ReportId {
  value: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum ReportType {
  OVERFLOW = 'OVERFLOW', // Desbordamiento de contenedor
  ILLEGAL_DUMP = 'ILLEGAL_DUMP', // Botadero ilegal
  DAMAGED_CONTAINER = 'DAMAGED_CONTAINER', // Contenedor dañado
  MISSED_COLLECTION = 'MISSED_COLLECTION', // Recolección no realizada
}

export interface ReportProps {
  id: ReportId;
  userId: string;
  type: ReportType;
  description: string;
  coordinates: Coordinates;
  address: string;
  photoUrl?: string;
  status: ReportStatus;
  verifiedByAI: boolean;
  pointsAwarded: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export class WasteReport {
  private constructor(private readonly props: ReportProps) {
    this.validate();
  }

  static create(
    props: Omit<
      ReportProps,
      'id' | 'status' | 'verifiedByAI' | 'pointsAwarded' | 'createdAt' | 'updatedAt'
    >,
  ): WasteReport {
    return new WasteReport({
      ...props,
      id: { value: this.generateId() },
      status: ReportStatus.PENDING,
      verifiedByAI: false,
      pointsAwarded: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: ReportProps): WasteReport {
    return new WasteReport(props);
  }

  private static generateId(): string {
    return `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.props.description || this.props.description.length < 10) {
      throw new Error('Description must be at least 10 characters');
    }
    if (
      this.props.coordinates.latitude < -90 ||
      this.props.coordinates.latitude > 90 ||
      this.props.coordinates.longitude < -180 ||
      this.props.coordinates.longitude > 180
    ) {
      throw new Error('Invalid coordinates');
    }
  }

  get id(): ReportId {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): ReportType {
    return this.props.type;
  }

  get description(): string {
    return this.props.description;
  }

  get coordinates(): Coordinates {
    return this.props.coordinates;
  }

  get status(): ReportStatus {
    return this.props.status;
  }

  get verifiedByAI(): boolean {
    return this.props.verifiedByAI;
  }

  get pointsAwarded(): number {
    return this.props.pointsAwarded;
  }

  markAsInProgress(): void {
    if (this.props.status !== ReportStatus.PENDING) {
      throw new Error('Only pending reports can be marked as in progress');
    }
    this.props.status = ReportStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();
  }

  resolve(): void {
    if (this.props.status !== ReportStatus.IN_PROGRESS) {
      throw new Error('Only in-progress reports can be resolved');
    }
    this.props.status = ReportStatus.RESOLVED;
    this.props.resolvedAt = new Date();
    this.props.updatedAt = new Date();
  }

  verifyWithAI(isValid: boolean): void {
    this.props.verifiedByAI = isValid;
    if (isValid) {
      this.props.pointsAwarded = this.calculatePoints();
    }
    this.props.updatedAt = new Date();
  }

  private calculatePoints(): number {
    // Lógica de puntos según tipo de reporte
    const basePoints: Record<ReportType, number> = {
      [ReportType.OVERFLOW]: 10,
      [ReportType.ILLEGAL_DUMP]: 15,
      [ReportType.DAMAGED_CONTAINER]: 8,
      [ReportType.MISSED_COLLECTION]: 5,
    };
    return basePoints[this.props.type] || 0;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      userId: this.props.userId,
      type: this.props.type,
      description: this.props.description,
      coordinates: this.props.coordinates,
      address: this.props.address,
      photoUrl: this.props.photoUrl,
      status: this.props.status,
      verifiedByAI: this.props.verifiedByAI,
      pointsAwarded: this.props.pointsAwarded,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      resolvedAt: this.props.resolvedAt?.toISOString(),
    };
  }
}

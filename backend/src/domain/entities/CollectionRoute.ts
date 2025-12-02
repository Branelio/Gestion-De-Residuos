// Domain Layer - Entidad de Ruta de Recolección
// Representa una ruta optimizada para recolección de residuos

export interface RouteId {
  value: string;
}

export interface Waypoint {
  collectionPointId: string;
  order: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  estimatedArrivalTime?: Date;
}

export enum RouteStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface RouteProps {
  id: RouteId;
  name: string;
  waypoints: Waypoint[];
  totalDistance: number; // En km
  estimatedDuration: number; // En minutos
  estimatedFuelConsumption: number; // En litros
  vehicleId: string;
  driverId: string;
  status: RouteStatus;
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CollectionRoute {
  private constructor(private readonly props: RouteProps) {
    this.validate();
  }

  static create(
    props: Omit<RouteProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): CollectionRoute {
    return new CollectionRoute({
      ...props,
      id: { value: this.generateId() },
      status: RouteStatus.PLANNED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: RouteProps): CollectionRoute {
    return new CollectionRoute(props);
  }

  private static generateId(): string {
    return `ROUTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (this.props.waypoints.length < 2) {
      throw new Error('Route must have at least 2 waypoints');
    }
    if (this.props.totalDistance <= 0) {
      throw new Error('Total distance must be positive');
    }
    if (this.props.estimatedDuration <= 0) {
      throw new Error('Estimated duration must be positive');
    }
  }

  get id(): RouteId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get waypoints(): Waypoint[] {
    return this.props.waypoints;
  }

  get totalDistance(): number {
    return this.props.totalDistance;
  }

  get estimatedDuration(): number {
    return this.props.estimatedDuration;
  }

  get estimatedFuelConsumption(): number {
    return this.props.estimatedFuelConsumption;
  }

  get status(): RouteStatus {
    return this.props.status;
  }

  get scheduledDate(): Date {
    return this.props.scheduledDate;
  }

  startRoute(): void {
    if (this.props.status !== RouteStatus.PLANNED) {
      throw new Error('Only planned routes can be started');
    }
    this.props.status = RouteStatus.IN_PROGRESS;
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  completeRoute(): void {
    if (this.props.status !== RouteStatus.IN_PROGRESS) {
      throw new Error('Only in-progress routes can be completed');
    }
    this.props.status = RouteStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  cancelRoute(): void {
    if (this.props.status === RouteStatus.COMPLETED) {
      throw new Error('Cannot cancel completed routes');
    }
    this.props.status = RouteStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  calculateEfficiencyScore(): number {
    // Score basado en optimización (menor distancia y consumo = mejor score)
    const baseScore = 100;
    const distancePenalty = this.props.totalDistance * 0.5;
    const fuelPenalty = this.props.estimatedFuelConsumption * 2;
    return Math.max(0, baseScore - distancePenalty - fuelPenalty);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      name: this.props.name,
      waypoints: this.props.waypoints,
      totalDistance: this.props.totalDistance,
      estimatedDuration: this.props.estimatedDuration,
      estimatedFuelConsumption: this.props.estimatedFuelConsumption,
      vehicleId: this.props.vehicleId,
      driverId: this.props.driverId,
      status: this.props.status,
      scheduledDate: this.props.scheduledDate.toISOString(),
      startedAt: this.props.startedAt?.toISOString(),
      completedAt: this.props.completedAt?.toISOString(),
      efficiencyScore: this.calculateEfficiencyScore(),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

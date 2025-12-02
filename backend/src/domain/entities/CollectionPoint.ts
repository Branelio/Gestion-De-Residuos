// Domain Layer - Entidad de Punto de Acopio/Basurero
// Representa un punto de recolección de residuos geolocalizado

export interface CollectionPointId {
  value: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum CollectionPointType {
  CONTAINER = 'CONTAINER', // Contenedor
  COLLECTION_CENTER = 'COLLECTION_CENTER', // Centro de acopio
  LANDFILL = 'LANDFILL', // Vertedero
}

export enum CollectionPointStatus {
  AVAILABLE = 'AVAILABLE',
  FULL = 'FULL',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export interface CollectionPointProps {
  id: CollectionPointId;
  name: string;
  type: CollectionPointType;
  coordinates: Coordinates;
  address: string;
  capacity: number; // En kg
  currentLoad: number; // En kg
  status: CollectionPointStatus;
  isRural: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CollectionPoint {
  private constructor(private readonly props: CollectionPointProps) {
    this.validate();
  }

  static create(
    props: Omit<CollectionPointProps, 'id' | 'createdAt' | 'updatedAt' | 'currentLoad'>,
  ): CollectionPoint {
    return new CollectionPoint({
      ...props,
      id: { value: this.generateId() },
      currentLoad: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: CollectionPointProps): CollectionPoint {
    return new CollectionPoint(props);
  }

  private static generateId(): string {
    return `CP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (this.props.capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    if (this.props.currentLoad < 0) {
      throw new Error('Current load cannot be negative');
    }
    if (this.props.currentLoad > this.props.capacity) {
      throw new Error('Current load cannot exceed capacity');
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

  get id(): CollectionPointId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): CollectionPointType {
    return this.props.type;
  }

  get coordinates(): Coordinates {
    return this.props.coordinates;
  }

  get address(): string {
    return this.props.address;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get currentLoad(): number {
    return this.props.currentLoad;
  }

  get status(): CollectionPointStatus {
    return this.props.status;
  }

  get isRural(): boolean {
    return this.props.isRural;
  }

  get fillPercentage(): number {
    return (this.props.currentLoad / this.props.capacity) * 100;
  }

  updateLoad(newLoad: number): void {
    if (newLoad < 0 || newLoad > this.props.capacity) {
      throw new Error('Invalid load value');
    }
    this.props.currentLoad = newLoad;
    this.props.updatedAt = new Date();

    // Actualizar estado automáticamente según carga
    if (newLoad >= this.props.capacity * 0.9) {
      this.props.status = CollectionPointStatus.FULL;
    } else if (this.props.status === CollectionPointStatus.FULL) {
      this.props.status = CollectionPointStatus.AVAILABLE;
    }
  }

  updateStatus(status: CollectionPointStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  isFull(): boolean {
    return this.props.status === CollectionPointStatus.FULL || this.fillPercentage >= 90;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      name: this.props.name,
      type: this.props.type,
      coordinates: this.props.coordinates,
      address: this.props.address,
      capacity: this.props.capacity,
      currentLoad: this.props.currentLoad,
      fillPercentage: this.fillPercentage,
      status: this.props.status,
      isRural: this.props.isRural,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

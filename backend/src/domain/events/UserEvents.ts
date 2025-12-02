// Domain Layer - Domain Events
// Eventos de dominio siguiendo Event-Driven Architecture

export interface DomainEvent {
  occurredOn: Date;
  eventName: string;
}

export class UserCreatedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'user.created';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class UserUpdatedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'user.updated';

  constructor(
    public readonly userId: string,
    public readonly changes: Record<string, unknown>,
  ) {
    this.occurredOn = new Date();
  }
}

export class UserDeletedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'user.deleted';

  constructor(public readonly userId: string) {
    this.occurredOn = new Date();
  }
}

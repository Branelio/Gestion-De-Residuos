# 🏗️ ARQUITECTURA Y METODOLOGÍA DEL SISTEMA

## 📚 ÍNDICE
1. [Arquitectura Hexagonal (Clean Architecture)](#arquitectura-hexagonal)
2. [Domain-Driven Design (DDD)](#domain-driven-design)
3. [CQRS (Command Query Responsibility Segregation)](#cqrs)
4. [Metodología Ágil - Scrum](#metodología-scrum)
5. [Comparativa con Otras Arquitecturas](#comparativa-arquitecturas)
6. [Comparativa con Otras Metodologías](#comparativa-metodologias)
7. [Justificación de Elección](#justificación)

---

## 🏛️ ARQUITECTURA HEXAGONAL (CLEAN ARCHITECTURE)

### ¿Qué es?

La **Arquitectura Hexagonal**, también conocida como **Puertos y Adaptadores**, fue propuesta por Alistair Cockburn. Su objetivo principal es crear sistemas altamente desacoplados donde el **dominio del negocio** es completamente independiente de detalles técnicos.

### Estructura en Capas

```
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE INFRAESTRUCTURA                         │
│  (Frameworks, Bases de Datos, APIs Externas, UI)            │
│                                                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │        CAPA DE APLICACIÓN                          │     │
│  │  (Casos de Uso, Orquestación, DTOs)                │     │
│  │                                                     │     │
│  │  ┌────────────────────────────────────────┐       │     │
│  │  │      CAPA DE DOMINIO                    │       │     │
│  │  │  (Entidades, Servicios, Eventos)        │       │     │
│  │  │  ⭐ NÚCLEO DEL NEGOCIO ⭐               │       │     │
│  │  │  ❌ SIN DEPENDENCIAS EXTERNAS           │       │     │
│  │  └────────────────────────────────────────┘       │     │
│  │                                                     │     │
│  └───────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Principios Fundamentales

1. **Independencia de Frameworks**: El negocio no depende de Express, React, etc.
2. **Testeable**: Lógica de negocio 100% testeable sin UI o BD
3. **Independencia de UI**: Puede cambiar de web a móvil sin afectar el core
4. **Independencia de BD**: MongoDB puede cambiar a PostgreSQL sin problemas
5. **Reglas de Negocio Centralizadas**: Todo en el dominio

### Implementación en Nuestro Proyecto

#### Capa de Dominio (Core)
```typescript
// backend/src/domain/entities/CollectionPoint.ts
export class CollectionPoint {
  // Reglas de negocio puras
  isFull(): boolean {
    return this.fillPercentage >= 90;
  }
  
  updateLoad(newLoad: number): void {
    // Validación de regla de negocio
    if (newLoad > this.capacity) {
      throw new Error('Load exceeds capacity');
    }
    // Cambio automático de estado
    if (newLoad >= this.capacity * 0.9) {
      this.status = CollectionPointStatus.FULL;
    }
  }
}
```

#### Puertos (Interfaces)
```typescript
// backend/src/domain/repositories/CollectionPointRepository.ts
export interface CollectionPointRepository {
  save(point: CollectionPoint): Promise<void>;
  findById(id: CollectionPointId): Promise<CollectionPoint | null>;
  findNearby(coordinates: Coordinates, radiusKm: number): Promise<CollectionPoint[]>;
}
```

#### Adaptadores (Implementaciones)
```typescript
// backend/src/infrastructure/repositories/MongoCollectionPointRepository.ts
export class MongoCollectionPointRepository implements CollectionPointRepository {
  async save(point: CollectionPoint): Promise<void> {
    // Implementación específica de MongoDB
    await CollectionPointModel.create(point.toJSON());
  }
}
```

### Ventajas

✅ **Mantenibilidad**: Cambios en UI no afectan al negocio
✅ **Testabilidad**: Fácil crear mocks y tests unitarios
✅ **Flexibilidad**: Cambiar tecnologías sin reescribir todo
✅ **Escalabilidad**: Fácil añadir nuevas features
✅ **Separación de Responsabilidades**: Cada capa tiene un propósito claro

### Desventajas

❌ **Curva de Aprendizaje**: Requiere entender conceptos avanzados
❌ **Más Código Inicial**: Más archivos y estructura
❌ **Overhead**: Para proyectos pequeños puede ser excesivo

---

## 🎯 DOMAIN-DRIVEN DESIGN (DDD)

### ¿Qué es?

**DDD** es un enfoque de desarrollo propuesto por Eric Evans que pone el **dominio del negocio** en el centro del desarrollo. Se enfoca en modelar el software según el lenguaje y los conceptos del negocio real.

### Conceptos Clave Implementados

#### 1. Entities (Entidades)
Objetos con identidad única que persisten en el tiempo.

```typescript
// CollectionPoint es una Entity
export class CollectionPoint {
  private constructor(private readonly props: CollectionPointProps) {}
  
  get id(): CollectionPointId {
    return this.props.id; // Identidad única
  }
}
```

#### 2. Value Objects
Objetos sin identidad, definidos por sus atributos.

```typescript
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CollectionPointId {
  value: string;
}
```

#### 3. Aggregates (Agregados)
Grupo de entidades tratadas como una unidad.

```typescript
// CollectionRoute es un agregado que contiene Waypoints
export class CollectionRoute {
  private waypoints: Waypoint[]; // Entidades relacionadas
}
```

#### 4. Domain Services
Lógica de negocio que no pertenece a una entidad específica.

```typescript
export class GeolocationService {
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    // Lógica de negocio pura (Fórmula de Haversine)
  }
}
```

#### 5. Domain Events
Eventos que representan algo importante en el dominio.

```typescript
export class UserCreatedEvent implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    this.occurredOn = new Date();
  }
}
```

#### 6. Repositories
Abstracción para acceso a datos.

```typescript
export interface CitizenRepository {
  save(citizen: Citizen): Promise<void>;
  findByEmail(email: string): Promise<Citizen | null>;
}
```

### Ubiquitous Language (Lenguaje Ubicuo)

Usamos el mismo lenguaje del dominio en código y documentación:

- **CollectionPoint** (Punto de Acopio)
- **WasteReport** (Reporte de Residuos)
- **CollectionRoute** (Ruta de Recolección)
- **Citizen** (Ciudadano)
- **fillPercentage** (Porcentaje de llenado)
- **optimizeRoute** (Optimizar ruta)

### Ventajas

✅ **Comunicación Clara**: Desarrolladores y expertos del negocio hablan igual
✅ **Modelo Rico**: Lógica de negocio encapsulada en entidades
✅ **Evolución**: El modelo evoluciona con el negocio
✅ **Complejidad Manejable**: Divide problemas complejos

### Desventajas

❌ **Requiere Conocimiento del Dominio**: Necesitas expertos del negocio
❌ **Tiempo Inicial**: Modelar correctamente lleva tiempo
❌ **No para TODO**: Mejor para dominios complejos

---

## ⚡ CQRS (Command Query Responsibility Segregation)

### ¿Qué es?

**CQRS** separa las operaciones de **lectura** (Queries) de las de **escritura** (Commands). Esto permite optimizar cada una independientemente.

### Estructura

```
┌──────────────────────────────────────────────┐
│               APPLICATION LAYER               │
├──────────────────────┬───────────────────────┤
│      COMMANDS        │       QUERIES         │
│   (Escritura)        │      (Lectura)        │
├──────────────────────┼───────────────────────┤
│ CreateWasteReport    │ FindNearestPoint      │
│ OptimizeRoute        │ GetUserProfile        │
│ RedeemPoints         │ ListReports           │
│                      │ GetRouteStats         │
└──────────────────────┴───────────────────────┘
```

### Implementación en el Proyecto

#### Commands (Escribir)
```typescript
// backend/src/application/commands/CreateWasteReportCommand.ts
export class CreateWasteReportCommand {
  constructor(
    public readonly userId: string,
    public readonly type: ReportType,
    public readonly coordinates: Coordinates
  ) {}
}
```

#### Queries (Leer)
```typescript
// backend/src/application/queries/FindNearestPointQuery.ts
export class FindNearestPointQuery {
  constructor(
    public readonly userLatitude: number,
    public readonly userLongitude: number,
    public readonly radiusKm: number
  ) {}
}
```

#### Use Cases
```typescript
// Command Handler
export class CreateWasteReportUseCase {
  async execute(command: CreateWasteReportCommand): Promise<void> {
    const report = WasteReport.create({ /*...*/ });
    await this.repository.save(report);
    // Publicar evento
    this.eventBus.publish(new ReportCreatedEvent(report.id));
  }
}

// Query Handler
export class FindNearestPointUseCase {
  async execute(query: FindNearestPointQuery): Promise<CollectionPointDTO> {
    const points = await this.repository.findNearby(/*...*/);
    return this.mapper.toDTO(points[0]);
  }
}
```

### Ventajas

✅ **Escalabilidad**: Leer y escribir pueden escalar independientemente
✅ **Optimización**: Queries optimizadas para lectura
✅ **Separación de Responsabilidades**: Código más limpio
✅ **Event Sourcing**: Fácil implementar si se necesita

### Desventajas

❌ **Complejidad**: Más archivos y estructuras
❌ **Consistencia Eventual**: En sistemas distribuidos
❌ **Overhead**: Para aplicaciones simples

---

## 🏃 METODOLOGÍA ÁGIL - SCRUM

### ¿Qué es?

**Scrum** es un framework ágil para gestión de proyectos que enfatiza:
- Entregas incrementales
- Adaptación al cambio
- Colaboración constante
- Inspección y adaptación continua

### Implementación en el Proyecto

#### 1. Sprints (2 semanas cada uno)

**Sprint 1-2: Fundamentos**
- ✅ Configuración del proyecto
- ✅ Arquitectura base
- ✅ Entidades del dominio
- ✅ Casos de uso principales

**Sprint 3-4: Geolocalización**
- 📍 Integración de mapas (Leaflet)
- 📍 Servicio de geolocalización
- 📍 Algoritmo de punto más cercano
- 📍 Tests unitarios

**Sprint 5-6: Optimización de Rutas**
- 🚛 Algoritmo Nearest Neighbor
- 🚛 Cálculo de métricas (distancia, combustible)
- 🚛 Interfaz de rutas
- 🚛 Tests de optimización

**Sprint 7-8: Sistema de Reportes**
- 📝 CRUD de reportes
- 📝 Upload de imágenes
- 📝 Validación con IA
- 📝 Sistema de puntos

**Sprint 9-10: Dashboard y Despliegue**
- 📊 Dashboard administrativo
- 📊 Gráficos y estadísticas
- 📊 Optimización de rendimiento
- 📊 Despliegue en producción

#### 2. Roles

**Product Owner**: Ing. Franklin Montaluisa (Tutor)
**Scrum Master**: Brandon Sangoluisa
**Development Team**: Brandon Sangoluisa, Byron Chuquitarco
**Stakeholders**: EPAGAL, Municipio de Latacunga

#### 3. Ceremonias

**Daily Standup**: 15 min diarios
- ¿Qué hice ayer?
- ¿Qué haré hoy?
- ¿Tengo impedimentos?

**Sprint Planning**: Inicio de cada sprint
- Seleccionar historias de usuario
- Estimar esfuerzo (Planning Poker)
- Definir objetivos del sprint

**Sprint Review**: Final del sprint
- Demostración al tutor y EPAGAL
- Feedback del producto

**Sprint Retrospective**: Final del sprint
- ¿Qué salió bien?
- ¿Qué mejorar?
- Acciones de mejora

#### 4. Artefactos

**Product Backlog**
```
PRIORIDAD | HISTORIA DE USUARIO                                    | PUNTOS
----------|-------------------------------------------------------|-------
ALTA      | Como ciudadano quiero encontrar el punto más cercano  | 13
ALTA      | Como ciudadano quiero reportar basura                 | 8
ALTA      | Como admin quiero ver reportes en mapa                | 13
MEDIA     | Como conductor quiero ver mi ruta optimizada          | 21
MEDIA     | Como ciudadano quiero canjear mis puntos              | 5
BAJA      | Como admin quiero exportar estadísticas               | 8
```

**Sprint Backlog**: Tareas del sprint actual
**Incremento**: Software funcional al final del sprint

### Ventajas de Scrum

✅ **Flexibilidad**: Adaptación rápida a cambios
✅ **Transparencia**: Todos saben qué se está haciendo
✅ **Entregas Frecuentes**: Valor entregado constantemente
✅ **Mejora Continua**: Retrospectivas para aprender
✅ **Motivación**: Equipos auto-organizados

---

## 📊 COMPARATIVA CON OTRAS ARQUITECTURAS

### 1. vs Arquitectura en Capas Tradicional

| Aspecto | Hexagonal | Capas Tradicional |
|---------|-----------|-------------------|
| **Dependencias** | Hacia el centro (dominio) | De arriba hacia abajo |
| **Testabilidad** | ⭐⭐⭐⭐⭐ Alta | ⭐⭐⭐ Media |
| **Acoplamiento** | ⭐⭐⭐⭐⭐ Bajo | ⭐⭐ Alto |
| **Complejidad Inicial** | ⭐⭐⭐ Media-Alta | ⭐ Baja |
| **Mantenibilidad** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Buena |
| **Cambio de BD** | Fácil | Difícil |
| **Cambio de Framework** | Fácil | Muy difícil |

**Ejemplo Capas Tradicional:**
```
Controller → Service → Repository → Database
     ↓           ↓           ↓
   Todo acoplado verticalmente
```

**Ejemplo Hexagonal:**
```
          ┌─────────┐
          │ Dominio │ ← Núcleo independiente
          └─────────┘
         ↗     ↑     ↖
    Puerto   Puerto   Puerto
       ↓       ↓       ↓
   Adaptador Adaptador Adaptador
   (Express) (MongoDB) (React)
```

**¿Por qué elegimos Hexagonal?**
- ✅ Mejor testabilidad (crítico para tesis)
- ✅ Independencia tecnológica (puede evolucionar)
- ✅ Demuestra conocimientos avanzados
- ✅ Escalable a largo plazo

### 2. vs Arquitectura de Microservicios

| Aspecto | Hexagonal (Monolito) | Microservicios |
|---------|----------------------|----------------|
| **Complejidad Operacional** | ⭐⭐ Baja | ⭐⭐⭐⭐⭐ Muy Alta |
| **Escalabilidad** | ⭐⭐⭐ Vertical | ⭐⭐⭐⭐⭐ Horizontal |
| **Latencia** | ⭐⭐⭐⭐⭐ Baja | ⭐⭐⭐ Media |
| **Deployment** | ⭐⭐⭐⭐ Simple | ⭐⭐ Complejo |
| **Consistencia de Datos** | ⭐⭐⭐⭐⭐ Fuerte | ⭐⭐ Eventual |
| **Equipo Necesario** | 2 personas | 10+ personas |

**¿Por qué NO microservicios para este proyecto?**
- ❌ Demasiada complejidad para el alcance
- ❌ Requiere DevOps avanzado (Kubernetes, etc.)
- ❌ Overhead de red innecesario
- ❌ Equipo pequeño (2 desarrolladores)
- ✅ Monolito modular es suficiente
- ✅ Puede migrar a microservicios después si crece

### 3. vs MVC (Model-View-Controller)

| Aspecto | Hexagonal + DDD | MVC Puro |
|---------|-----------------|----------|
| **Lógica de Negocio** | En el Dominio | En el Model (limitada) |
| **Validaciones** | Entidades ricas | Controllers/Models |
| **Testabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Complejidad** | ⭐⭐⭐⭐ Alta | ⭐⭐ Baja |
| **Escalabilidad del Código** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Aprendizaje** | Semanas | Días |

**Problema típico de MVC:**
```typescript
// Controller con lógica de negocio (MAL)
@Post('/reports')
async createReport(req, res) {
  const report = new Report(req.body);
  
  // ❌ Lógica de negocio en el controller
  if (report.latitude < -90 || report.latitude > 90) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  
  // ❌ Cálculo de puntos en el controller
  const points = report.type === 'OVERFLOW' ? 10 : 5;
  report.pointsAwarded = points;
  
  await report.save();
  res.json(report);
}
```

**Solución con Hexagonal + DDD:**
```typescript
// Lógica en la entidad (BIEN)
export class WasteReport {
  private validate(): void {
    if (this.props.coordinates.latitude < -90 || ...) {
      throw new Error('Invalid coordinates');
    }
  }
  
  private calculatePoints(): number {
    const basePoints: Record<ReportType, number> = {
      [ReportType.OVERFLOW]: 10,
      [ReportType.ILLEGAL_DUMP]: 15,
      // ...
    };
    return basePoints[this.props.type] || 0;
  }
}

// Controller solo orquesta (BIEN)
@Post('/reports')
async createReport(req, res) {
  const result = await this.createReportUseCase.execute(req.body);
  res.json(result);
}
```

---

## 📊 COMPARATIVA CON OTRAS METODOLOGÍAS

### 1. vs Metodología en Cascada (Waterfall)

| Aspecto | Scrum (Ágil) | Cascada |
|---------|--------------|---------|
| **Flexibilidad** | ⭐⭐⭐⭐⭐ Alta | ⭐ Muy Baja |
| **Entregas** | Incrementales (2 sem) | Final del proyecto |
| **Feedback** | Constante | Al final |
| **Cambios** | Bienvenidos | Costosos |
| **Documentación** | Suficiente | Exhaustiva |
| **Riesgo** | ⭐⭐ Bajo | ⭐⭐⭐⭐⭐ Alto |
| **Visibilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Cascada:**
```
Requisitos (1 mes) → Diseño (1 mes) → Implementación (3 meses) 
  → Testing (1 mes) → Despliegue
  
❌ Si algo falla al final, todo se retrasa
❌ Cliente ve el producto después de 6 meses
❌ Requisitos pueden haber cambiado
```

**Scrum:**
```
Sprint 1 → Entrega funcional → Feedback
Sprint 2 → Entrega funcional → Feedback
Sprint 3 → Entrega funcional → Feedback
...

✅ Cliente ve progreso cada 2 semanas
✅ Adaptación rápida a cambios
✅ Riesgo distribuido
```

**¿Por qué Scrum para este proyecto?**
- ✅ Requisitos pueden evolucionar (coordinación con EPAGAL)
- ✅ Entregas frecuentes al tutor
- ✅ Aprendizaje continuo (nuevas tecnologías)
- ✅ Mejor para tesis (documentar sprints)

### 2. vs Kanban

| Aspecto | Scrum | Kanban |
|---------|-------|--------|
| **Iteraciones** | Sprints de 2 semanas | Flujo continuo |
| **Roles** | Definidos (SM, PO, Dev) | Flexibles |
| **Estimaciones** | Obligatorias | Opcionales |
| **Cambios** | Al final del sprint | Cualquier momento |
| **Métricas** | Velocity, Burndown | Lead Time, Throughput |
| **Reuniones** | Daily, Review, Retro | Opcionales |

**¿Por qué Scrum y no Kanban?**
- ✅ Scrum da más estructura (bueno para tesis)
- ✅ Ceremonias ayudan a la coordinación
- ✅ Sprints marcan hitos claros
- ✅ Más fácil de documentar para la tesis
- ⚠️ Kanban es mejor para mantenimiento continuo

### 3. vs Extreme Programming (XP)

| Aspecto | Scrum | XP |
|---------|-------|-----|
| **Enfoque** | Gestión del proyecto | Prácticas de ingeniería |
| **Pair Programming** | Opcional | Obligatorio |
| **TDD** | Recomendado | Obligatorio |
| **Releases** | Final de sprint | Muy frecuentes |
| **Cambios** | Cada sprint | Diarios |
| **Documentación** | Suficiente | Mínima |

**Podemos combinar:**
```
Scrum (gestión) + Prácticas de XP (técnicas)
- Sprints de 2 semanas (Scrum)
- Test-Driven Development (XP)
- Refactoring continuo (XP)
- Code reviews (XP)
```

---

## 🎯 JUSTIFICACIÓN DE LA ELECCIÓN

### ¿Por qué Arquitectura Hexagonal + DDD + CQRS?

#### Para el Proyecto de Tesis

1. **Demuestra Conocimientos Avanzados**
   - Va más allá de un CRUD básico
   - Muestra comprensión de patrones de diseño
   - Aplicación de principios SOLID

2. **Documentable**
   - Fácil explicar la separación de capas
   - Diagramas claros
   - Cada decisión tiene justificación

3. **Testeable**
   - Importante para validar algoritmos (optimización)
   - Tests unitarios del dominio
   - Cobertura medible

4. **Escalable**
   - Si EPAGAL quiere expandir, está preparado
   - Puede añadir más módulos fácilmente
   - Base sólida para evolución

5. **Independiente de Tecnología**
   - Si React no funciona, cambiar es fácil
   - MongoDB puede cambiar a PostgreSQL
   - Express puede cambiar a Fastify

#### Para el Negocio (EPAGAL)

1. **Mantenible a Largo Plazo**
   - Otros desarrolladores pueden continuar
   - Código limpio y organizado
   - Documentación clara

2. **Adaptable**
   - Nuevos requisitos se integran fácilmente
   - Cambios de regulación municipal manejables
   - Integración con otros sistemas

3. **Confiable**
   - Lógica de negocio protegida
   - Validaciones centralizadas
   - Menos bugs

### ¿Por qué Scrum?

1. **Coordinación con Stakeholders**
   - Demos cada 2 semanas a EPAGAL y tutor
   - Feedback temprano
   - Ajustes continuos

2. **Gestión de Tiempo**
   - 4 meses de desarrollo = 8 sprints
   - Hitos claros
   - Progreso medible

3. **Aprendizaje**
   - Retrospectivas para mejorar
   - Adaptación a nuevas tecnologías
   - Experiencia profesional real

4. **Documentación de Tesis**
   - Cada sprint = sección en la tesis
   - Evolución del proyecto clara
   - Resultados medibles

---

## 📈 MÉTRICAS DE ÉXITO

### Arquitectura

- ✅ **Cobertura de Tests**: > 80%
- ✅ **Acoplamiento**: Bajo (medido con herramientas)
- ✅ **Complejidad Ciclomática**: < 10 por función
- ✅ **Deuda Técnica**: Controlada con SonarQube

### Metodología

- ✅ **Velocity**: Estable entre sprints
- ✅ **Burndown**: Tendencia descendente
- ✅ **Satisfacción del Cliente**: Feedback positivo
- ✅ **Cumplimiento de Sprints**: > 90%

### Negocio

- ✅ **Optimización de Rutas**: 9.4% reducción distancia
- ✅ **Reducción Combustible**: 11.6%
- ✅ **Participación Ciudadana**: Incremento medible
- ✅ **Tiempo de Respuesta API**: < 200ms

---

## 🔮 EVOLUCIÓN FUTURA

### Posibles Mejoras Arquitectónicas

1. **Event Sourcing**: Guardar eventos en vez de estados
2. **Microservicios**: Si la carga aumenta mucho
3. **GraphQL**: Para queries más flexibles
4. **Redis**: Caché distribuido
5. **Message Queue**: RabbitMQ/Kafka para eventos

### Posibles Mejoras Metodológicas

1. **CI/CD Avanzado**: GitHub Actions automatizado
2. **DevOps**: Kubernetes para orquestación
3. **Monitoring**: Prometheus + Grafana
4. **A/B Testing**: Experimentos controlados

---

**Conclusión**: La combinación de **Arquitectura Hexagonal + DDD + CQRS + Scrum** es ideal para este proyecto porque balancea:
- Calidad técnica (tesis)
- Pragmatismo (4 meses)
- Escalabilidad (futuro de EPAGAL)
- Aprendizaje (experiencia profesional)

---

**Autores**: Brandon Sangoluisa, Byron Chuquitarco  
**Universidad**: ESPE - Latacunga  
**Fecha**: Noviembre 2025

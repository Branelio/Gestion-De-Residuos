import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Latacunga Waste Management API',
      version: '1.0.0',
      description: 'API para el Sistema de Gestión de Residuos Sólidos de Latacunga con geolocalización y optimización de rutas',
      contact: {
        name: 'EPAGAL - Latacunga',
        email: 'info@epagal.gob.ec',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo',
      },
      {
        url: 'https://api-latacunga-waste.com',
        description: 'Servidor de Producción',
      },
    ],
    tags: [
      {
        name: 'Collection Points',
        description: 'Endpoints para puntos de acopio de residuos',
      },
      {
        name: 'Route Optimization',
        description: 'Endpoints para optimización de rutas de recolección',
      },
      {
        name: 'Health',
        description: 'Endpoints de verificación de salud del sistema',
      },
    ],
    components: {
      schemas: {
        CollectionPoint: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del punto de acopio',
              example: 'CP-001-MATRIZ',
            },
            name: {
              type: 'string',
              description: 'Nombre del punto de acopio',
              example: 'Centro de Acopio Municipal - La Matriz',
            },
            coordinates: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  description: 'Latitud',
                  example: -0.9350,
                },
                longitude: {
                  type: 'number',
                  description: 'Longitud',
                  example: -78.6160,
                },
              },
            },
            address: {
              type: 'string',
              description: 'Dirección del punto',
              example: 'Av. Eloy Alfaro y Quito, Latacunga Centro',
            },
            capacity: {
              type: 'number',
              description: 'Capacidad máxima en kg',
              example: 5000,
            },
            currentLoad: {
              type: 'number',
              description: 'Carga actual en kg',
              example: 1200,
            },
            fillPercentage: {
              type: 'number',
              description: 'Porcentaje de llenado',
              example: 24,
            },
            status: {
              type: 'string',
              enum: ['AVAILABLE', 'FULL', 'MAINTENANCE', 'OUT_OF_SERVICE'],
              description: 'Estado del punto de acopio',
              example: 'AVAILABLE',
            },
          },
        },
        Coordinates: {
          type: 'object',
          required: ['latitude', 'longitude'],
          properties: {
            latitude: {
              type: 'number',
              minimum: -90,
              maximum: 90,
              example: -0.9346,
            },
            longitude: {
              type: 'number',
              minimum: -180,
              maximum: 180,
              example: -78.6156,
            },
          },
        },
        OptimizedRoute: {
          type: 'object',
          properties: {
            optimizedWaypoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  collectionPointId: {
                    type: 'string',
                    example: 'CP-001-MATRIZ',
                  },
                  order: {
                    type: 'number',
                    example: 1,
                  },
                  coordinates: {
                    $ref: '#/components/schemas/Coordinates',
                  },
                },
              },
            },
            totalDistance: {
              type: 'number',
              description: 'Distancia total en km',
              example: 12.5,
            },
            estimatedDuration: {
              type: 'number',
              description: 'Duración estimada en minutos',
              example: 25,
            },
            estimatedFuelConsumption: {
              type: 'number',
              description: 'Consumo estimado en litros',
              example: 1.88,
            },
            optimizationPercentage: {
              type: 'number',
              description: 'Porcentaje de optimización logrado',
              example: 15.3,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error al obtener puntos de acopio',
            },
          },
        },
      },
    },
  },
  apis: ['./src/infrastructure/http/routes/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

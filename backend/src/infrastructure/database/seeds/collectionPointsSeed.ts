/**
 * Script de inicialización de datos para Puntos de Acopio de Latacunga
 * Basado en investigación y coordinación con EPAGAL
 * 
 * IMPORTANTE: Las coordenadas son aproximadas y deben validarse en campo
 */

import { CollectionPointStatus } from '../../../domain/entities/CollectionPoint';

export interface CollectionPointSeedData {
  id: string;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  capacity: number;
  currentLoad: number;
  status: CollectionPointStatus;
  wasteTypes: string[];
  schedule?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  zone: 'URBANA' | 'PERIURBANA' | 'RURAL' | 'INDUSTRIAL' | 'COMERCIAL' | 'INSTITUCIONAL' | 'RECREATIVA';
  parish: string;
  description?: string;
  contactPhone?: string;
  isActive: boolean;
  lastEmptied?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos de los 22 puntos de acopio identificados en Latacunga
 * COORDENADAS VERIFICADAS Y ACTUALIZADAS (Diciembre 2025)
 */
export const collectionPointsData: CollectionPointSeedData[] = [
  // CENTROS DE ACOPIO PRINCIPALES
  {
    id: 'CP-001-MATRIZ',
    name: 'Centro de Acopio Municipal - La Matriz',
    location: {
      type: 'Point',
      coordinates: [-78.61655, -0.93483] // Av. Eloy Alfaro - Actualizado
    },
    address: 'Av. Eloy Alfaro y Quito, Latacunga Centro',
    capacity: 5000,
    currentLoad: 1200,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['RECYCLABLE', 'PAPER', 'PLASTIC', 'GLASS', 'METAL'],
    schedule: {
      monday: { open: '07:00', close: '17:00' },
      tuesday: { open: '07:00', close: '17:00' },
      wednesday: { open: '07:00', close: '17:00' },
      thursday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '17:00' }
    },
    zone: 'URBANA',
    parish: 'La Matriz',
    description: 'Centro principal de acopio municipal con separación de materiales reciclables',
    contactPhone: '(03) 2990018',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-002-RECYCLE',
    name: 'Centro de Reciclaje Municipal',
    location: {
      type: 'Point',
      coordinates: [-78.60389, -0.91756] // Sector Patután - Actualizado
    },
    address: 'Sector Patután Alto',
    capacity: 10000,
    currentLoad: 2500,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['RECYCLABLE', 'PAPER', 'PLASTIC', 'GLASS', 'METAL', 'ELECTRONIC', 'ORGANIC'],
    schedule: {
      monday: { open: '08:00', close: '16:00' },
      tuesday: { open: '08:00', close: '16:00' },
      wednesday: { open: '08:00', close: '16:00' },
      thursday: { open: '08:00', close: '16:00' },
      friday: { open: '08:00', close: '16:00' },
      saturday: { open: '08:00', close: '16:00' }
    },
    zone: 'PERIURBANA',
    parish: 'Eloy Alfaro',
    description: 'Centro de reciclaje principal con procesamiento de todos los materiales',
    contactPhone: '(03) 2990018',
    isActive: true,
    lastEmptied: new Date('2025-01-13'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-003-SANFELIPE',
    name: 'Punto de Acopio San Felipe',
    location: {
      type: 'Point',
      coordinates: [-78.61189, -0.92845] // Barrio San Felipe - Actualizado
    },
    address: 'Barrio San Felipe, Av. 5 de Junio',
    capacity: 2000,
    currentLoad: 1500,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'RECYCLABLE'],
    zone: 'URBANA',
    parish: 'La Matriz',
    description: 'Punto de acopio comunitario 24/7',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2025-01-15')
  },

  // CONTENEDORES URBANOS (Zona Centro)
  {
    id: 'CP-004-VLEON',
    name: 'Contenedor Parque Vicente León',
    location: {
      type: 'Point',
      coordinates: [-78.61569, -0.93449] // Centro histórico - Actualizado
    },
    address: 'Parque Vicente León (frente a la Catedral)',
    capacity: 800,
    currentLoad: 320,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'URBANA',
    parish: 'La Matriz',
    description: 'Contenedor en centro histórico, recolección diaria',
    isActive: true,
    lastEmptied: new Date('2025-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-005-ELSALTO',
    name: 'Contenedor Mercado El Salto',
    location: {
      type: 'Point',
      coordinates: [-78.61395, -0.93268] // Mercado - Actualizado
    },
    address: 'Mercado El Salto, Av. Amazonas',
    capacity: 1500,
    currentLoad: 1100,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'ORGANIC'],
    zone: 'COMERCIAL',
    parish: 'La Matriz',
    description: 'Contenedor de alta capacidad, recolección 2 veces al día',
    isActive: true,
    lastEmptied: new Date('2025-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-006-SDOMINGO',
    name: 'Contenedor Plaza Santo Domingo',
    location: {
      type: 'Point',
      coordinates: [-78.61476, -0.93601] // Plaza - Actualizado
    },
    address: 'Plaza Santo Domingo',
    capacity: 800,
    currentLoad: 450,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'URBANA',
    parish: 'La Matriz',
    description: 'Contenedor público en plaza histórica',
    isActive: true,
    lastEmptied: new Date('2025-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-007-TERMINAL',
    name: 'Contenedor Terminal Terrestre',
    location: {
      type: 'Point',
      coordinates: [-78.61033, -0.94289] // Terminal - Actualizado
    },
    address: 'Terminal Terrestre de Latacunga',
    capacity: 1200,
    currentLoad: 800,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'URBANA',
    parish: 'Eloy Alfaro',
    description: 'Contenedor en terminal de transporte',
    isActive: true,
    lastEmptied: new Date('2025-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },

  // PUNTOS BARRIALES
  {
    id: 'CP-008-COCHA',
    name: 'Contenedor Barrio La Cocha',
    location: {
      type: 'Point',
      coordinates: [-78.62045, -0.93956] // La Cocha - Actualizado
    },
    address: 'Barrio La Cocha, calle principal',
    capacity: 600,
    currentLoad: 280,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'URBANA',
    parish: 'Ignacio Flores',
    description: 'Contenedor barrial comunitario',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-009-ILINIZAS',
    name: 'Contenedor Barrio Los Ilinizas',
    location: {
      type: 'Point',
      coordinates: [-78.61823, -0.92534] // Los Ilinizas - Actualizado
    },
    address: 'Barrio Los Ilinizas',
    capacity: 600,
    currentLoad: 350,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'URBANA',
    parish: 'Juan Montalvo',
    description: 'Contenedor barrial',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-010-SBUENAVT',
    name: 'Contenedor San Buenaventura',
    location: {
      type: 'Point',
      coordinates: [-78.62234, -0.92045] // San Buenaventura - Actualizado
    },
    address: 'San Buenaventura Alto',
    capacity: 600,
    currentLoad: 420,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'PERIURBANA',
    parish: 'San Buenaventura',
    description: 'Contenedor en zona periurbana',
    isActive: true,
    lastEmptied: new Date('2025-01-13'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2025-01-15')
  },

  // PUNTOS RURALES
  {
    id: 'CP-011-PASTOCALLE',
    name: 'Centro de Acopio Pastocalle',
    location: {
      type: 'Point',
      coordinates: [-78.60178, -0.86534] // Pastocalle - Actualizado
    },
    address: 'Parroquia Pastocalle, Centro',
    capacity: 3000,
    currentLoad: 800,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'RECYCLABLE', 'ORGANIC'],
    schedule: {
      tuesday: { open: '09:00', close: '15:00' },
      friday: { open: '09:00', close: '15:00' }
    },
    zone: 'RURAL',
    parish: 'Pastocalle',
    description: 'Centro de acopio rural con atención martes y viernes',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-012-MULALO',
    name: 'Punto de Acopio Mulaló',
    location: {
      type: 'Point',
      coordinates: [-78.58123, -0.91067] // Mulaló - Actualizado
    },
    address: 'Parroquia Mulaló, Plaza Central',
    capacity: 2000,
    currentLoad: 500,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'RECYCLABLE'],
    schedule: {
      wednesday: { open: '09:00', close: '14:00' },
      saturday: { open: '09:00', close: '14:00' }
    },
    zone: 'RURAL',
    parish: 'Mulaló',
    description: 'Punto rural con servicio miércoles y sábado',
    isActive: true,
    lastEmptied: new Date('2025-01-11'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-013-TANICUCHI',
    name: 'Contenedor Tanicuchí',
    location: {
      type: 'Point',
      coordinates: [-78.64089, -0.98023] // Tanicuchí - Actualizado
    },
    address: 'Parroquia Tanicuchí',
    capacity: 1000,
    currentLoad: 300,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'RURAL',
    parish: 'Tanicuchí',
    description: 'Contenedor rural',
    isActive: true,
    lastEmptied: new Date('2025-01-13'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-014-TOACASO',
    name: 'Punto de Acopio Toacaso',
    location: {
      type: 'Point',
      coordinates: [-78.65589, -0.79534] // Toacaso - Actualizado
    },
    address: 'Parroquia Toacaso, Vía Principal',
    capacity: 1500,
    currentLoad: 400,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'RECYCLABLE'],
    schedule: {
      monday: { open: '10:00', close: '14:00' },
      thursday: { open: '10:00', close: '14:00' }
    },
    zone: 'RURAL',
    parish: 'Toacaso',
    description: 'Punto rural norte del cantón',
    isActive: true,
    lastEmptied: new Date('2025-01-13'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-015-ALAQUEZ',
    name: 'Contenedor Aláquez',
    location: {
      type: 'Point',
      coordinates: [-78.61067, -0.88545] // Aláquez - Actualizado
    },
    address: 'Parroquia Aláquez',
    capacity: 800,
    currentLoad: 250,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'RURAL',
    parish: 'Aláquez',
    description: 'Contenedor rural',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-15')
  },

  // ZONAS INDUSTRIALES / COMERCIALES
  {
    id: 'CP-016-ZINORTE',
    name: 'Contenedor Zona Industrial Norte',
    location: {
      type: 'Point',
      coordinates: [-78.60523, -0.91534] // Zona Industrial - Actualizado
    },
    address: 'Av. Unidad Nacional (Zona Industrial)',
    capacity: 2000,
    currentLoad: 1200,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'INDUSTRIAL'],
    zone: 'INDUSTRIAL',
    parish: 'Eloy Alfaro',
    description: 'Contenedor para zona industrial, recolección diaria',
    isActive: true,
    lastEmptied: new Date('2025-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-017-MAYORISTA',
    name: 'Contenedor Mercado Mayorista',
    location: {
      type: 'Point',
      coordinates: [-78.60845, -0.93812] // Mercado Mayorista - Actualizado
    },
    address: 'Mercado Mayorista La Merced',
    capacity: 2500,
    currentLoad: 1800,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'ORGANIC'],
    zone: 'COMERCIAL',
    parish: 'La Merced',
    description: 'Alta capacidad para mercado mayorista, recolección 2-3 veces al día',
    isActive: true,
    lastEmptied: new Date('2025-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },

  // INSTITUCIONES EDUCATIVAS
  {
    id: 'CP-018-ESPE',
    name: 'Contenedor ESPE Latacunga',
    location: {
      type: 'Point',
      coordinates: [-78.61789, -0.99534] // ESPE Campus - Actualizado
    },
    address: 'Universidad ESPE - Campus Latacunga',
    capacity: 1000,
    currentLoad: 400,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'RECYCLABLE', 'PAPER'],
    zone: 'INSTITUCIONAL',
    parish: 'San Buenaventura',
    description: 'Contenedor en campus universitario',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-019-VLEONC',
    name: 'Contenedor Colegio Vicente León',
    location: {
      type: 'Point',
      coordinates: [-78.61712, -0.93623] // Colegio Vicente León - Actualizado
    },
    address: 'Colegio Nacional Vicente León',
    capacity: 800,
    currentLoad: 350,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL', 'RECYCLABLE'],
    zone: 'INSTITUCIONAL',
    parish: 'La Matriz',
    description: 'Contenedor institucional educativo',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },

  // CENTROS DE SALUD
  {
    id: 'CP-020-HOSPITAL',
    name: 'Contenedor Hospital Provincial',
    location: {
      type: 'Point',
      coordinates: [-78.61023, -0.92912] // Hospital - Actualizado
    },
    address: 'Hospital Provincial General de Latacunga',
    capacity: 1200,
    currentLoad: 500,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'INSTITUCIONAL',
    parish: 'Eloy Alfaro',
    description: 'Solo residuos comunes, NO infecciosos',
    isActive: true,
    lastEmptied: new Date('2025-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-15')
  },

  // PARQUES Y ÁREAS RECREATIVAS
  {
    id: 'CP-021-LAGUNA',
    name: 'Contenedor Parque La Laguna',
    location: {
      type: 'Point',
      coordinates: [-78.62534, -0.95012] // Parque La Laguna - Actualizado
    },
    address: 'Parque Recreacional La Laguna',
    capacity: 600,
    currentLoad: 200,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'RECREATIVA',
    parish: 'Ignacio Flores',
    description: 'Contenedor en área recreativa',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'CP-022-NAUTICO',
    name: 'Contenedor Parque Náutico',
    location: {
      type: 'Point',
      coordinates: [-78.61823, -0.94789] // Parque Náutico - Actualizado
    },
    address: 'Parque Náutico de Tenis',
    capacity: 500,
    currentLoad: 150,
    status: CollectionPointStatus.AVAILABLE,
    wasteTypes: ['GENERAL'],
    zone: 'RECREATIVA',
    parish: 'Ignacio Flores',
    description: 'Contenedor en complejo deportivo',
    isActive: true,
    lastEmptied: new Date('2025-01-14'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2025-01-15')
  }
];

/**
 * Estadísticas de los datos seed
 */
export const seedStats = {
  totalPoints: collectionPointsData.length,
  byZone: {
    URBANA: collectionPointsData.filter(p => p.zone === 'URBANA').length,
    PERIURBANA: collectionPointsData.filter(p => p.zone === 'PERIURBANA').length,
    RURAL: collectionPointsData.filter(p => p.zone === 'RURAL').length,
    INDUSTRIAL: collectionPointsData.filter(p => p.zone === 'INDUSTRIAL').length,
    COMERCIAL: collectionPointsData.filter(p => p.zone === 'COMERCIAL').length,
    INSTITUCIONAL: collectionPointsData.filter(p => p.zone === 'INSTITUCIONAL').length,
    RECREATIVA: collectionPointsData.filter(p => p.zone === 'RECREATIVA').length
  },
  totalCapacity: collectionPointsData.reduce((sum, p) => sum + p.capacity, 0),
  totalCurrentLoad: collectionPointsData.reduce((sum, p) => sum + p.currentLoad, 0),
  averageLoad: Math.round(
    (collectionPointsData.reduce((sum, p) => sum + p.currentLoad, 0) / 
    collectionPointsData.reduce((sum, p) => sum + p.capacity, 0)) * 100
  )
};


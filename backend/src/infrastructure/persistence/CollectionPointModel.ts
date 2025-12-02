import mongoose, { Schema, Document } from 'mongoose';

// Usar el enum directamente aquí para evitar problemas de importación
enum CollectionPointStatus {
  AVAILABLE = 'AVAILABLE',
  FULL = 'FULL',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

/**
 * Interfaz para el documento de MongoDB
 */
export interface ICollectionPointDocument extends Omit<Document, '_id'> {
  _id: string;
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
 * Schema de Mongoose para CollectionPoint con índice geoespacial
 */
const CollectionPointSchema = new Schema<ICollectionPointDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(coords: number[]) {
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && // longitude
                   coords[1] >= -90 && coords[1] <= 90;      // latitude
          },
          message: 'Coordenadas inválidas [longitude, latitude]'
        }
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    currentLoad: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(CollectionPointStatus),
      required: true,
      default: CollectionPointStatus.AVAILABLE,
      index: true,
    },
    wasteTypes: {
      type: [String],
      required: true,
      default: ['GENERAL'],
    },
    schedule: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    zone: {
      type: String,
      enum: ['URBANA', 'PERIURBANA', 'RURAL', 'INDUSTRIAL', 'COMERCIAL', 'INSTITUCIONAL', 'RECREATIVA'],
      required: true,
      index: true,
    },
    parish: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    lastEmptied: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'collection_points',
  }
);

// Índice geoespacial 2dsphere para búsquedas por ubicación
CollectionPointSchema.index({ location: '2dsphere' });

// Índice compuesto para búsquedas comunes
CollectionPointSchema.index({ zone: 1, status: 1, isActive: 1 });
CollectionPointSchema.index({ parish: 1, isActive: 1 });

// Método virtual para calcular el porcentaje de llenado
CollectionPointSchema.virtual('fillPercentage').get(function(this: ICollectionPointDocument) {
  return this.capacity > 0 ? Math.round((this.currentLoad / this.capacity) * 100) : 0;
});

// Configurar virtuals en JSON
CollectionPointSchema.set('toJSON', { virtuals: true });
CollectionPointSchema.set('toObject', { virtuals: true });

/**
 * Modelo de Mongoose para CollectionPoint
 */
export const CollectionPointModel = mongoose.model<ICollectionPointDocument>(
  'CollectionPoint',
  CollectionPointSchema
);

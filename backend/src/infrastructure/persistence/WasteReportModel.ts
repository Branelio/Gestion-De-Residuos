import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de MongoDB
 */
export interface IWasteReportDocument extends Omit<Document, '_id'> {
  _id: mongoose.Types.ObjectId;
  userId: string;
  collectionPointId?: string; // ID del punto de acopio reportado
  type: 'OVERFLOW' | 'ILLEGAL_DUMP' | 'DAMAGED_CONTAINER' | 'MISSED_COLLECTION';
  description: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  photoUrl?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  verifiedByAI: boolean;
  pointsAwarded: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

/**
 * Schema de Mongoose para Reportes de Residuos
 */
const wasteReportSchema = new Schema<IWasteReportDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    collectionPointId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ['OVERFLOW', 'ILLEGAL_DUMP', 'DAMAGED_CONTAINER', 'MISSED_COLLECTION'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    verifiedByAI: {
      type: Boolean,
      default: false,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Índice geoespacial para búsquedas por ubicación
wasteReportSchema.index({ coordinates: '2dsphere' });

// Índice compuesto para búsquedas comunes
wasteReportSchema.index({ status: 1, createdAt: -1 });
wasteReportSchema.index({ userId: 1, createdAt: -1 });
wasteReportSchema.index({ collectionPointId: 1, status: 1 });

export const WasteReportModel = mongoose.model<IWasteReportDocument>(
  'WasteReport',
  wasteReportSchema
);

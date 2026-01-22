import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Omit<Document, '_id'> {
  _id: string;
  email: string;
  name: string;
  password: string;
  role: 'citizen' | 'admin' | 'operator';
  isActive: boolean;
  phone?: string;
  address?: string;
  avatar?: string;
  points?: number;
  reportsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'operator'],
      default: 'citizen',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    points: {
      type: Number,
      default: 0,
    },
    reportsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Índices
// Email ya tiene unique:true en la definición del schema, no necesita índice adicional
UserSchema.index({ role: 1, isActive: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

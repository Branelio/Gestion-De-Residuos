import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Omit<Document, '_id'> {
  _id: string;
  email: string;
  name: string;
  password: string;
  role: 'citizen' | 'admin' | 'operator';
  isActive: boolean;
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
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Índices
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

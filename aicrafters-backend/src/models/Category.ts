import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

export const Category = mongoose.model<ICategory>('Category', categorySchema); 
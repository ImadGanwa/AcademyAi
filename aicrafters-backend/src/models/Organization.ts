import mongoose, { Schema, Document } from 'mongoose';

interface OrganizationUser {
  fullName: string;
  email: string;
}

export interface IOrganization extends Document {
  name: string;
  users: OrganizationUser[];
  courses: mongoose.Types.ObjectId[]; // Array of course IDs
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    users: [{
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
    }],
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema); 
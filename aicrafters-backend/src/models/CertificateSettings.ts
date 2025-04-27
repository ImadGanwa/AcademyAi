import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificateSettings extends Document {
  templateUrl: string;
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId;
}

const certificateSettingsSchema = new Schema({
  templateUrl: {
    type: String,
    required: true,
    description: 'URL of the certificate template image in Cloudinary'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

export const CertificateSettings = mongoose.model<ICertificateSettings>('CertificateSettings', certificateSettingsSchema); 
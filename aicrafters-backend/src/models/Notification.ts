import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId?: mongoose.Types.ObjectId;
  createdAt: Date;
  action?: string;
  actionUrl?: string;
}

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['user', 'course', 'assignment', 'review', 'completion']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    refPath: 'type'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String
  },
  actionUrl: {
    type: String
  }
});

// Create indexes
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ read: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema); 
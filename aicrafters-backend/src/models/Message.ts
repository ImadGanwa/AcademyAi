import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  conversationId: string; // Combination of sender and receiver IDs to group messages
}

const MessageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  conversationId: {
    type: String,
    required: true
  }
});

// Create compound index for better query performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Create the conversationId before saving
MessageSchema.pre('save', function(next) {
  const message = this as IMessage;
  // Sort IDs to ensure consistent conversationId regardless of sender/receiver order
  const ids = [message.sender.toString(), message.receiver.toString()].sort();
  message.conversationId = ids.join('_');
  next();
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema); 
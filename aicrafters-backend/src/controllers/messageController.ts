import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import mongoose from 'mongoose';

export const messageController = {
  // Get all conversations for the current user
  getConversations: async (req: Request, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Find all messages where user is either sender or receiver
      const messages = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(req.user._id) },
              { receiver: new mongoose.Types.ObjectId(req.user._id) }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: '$conversationId',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$receiver', new mongoose.Types.ObjectId(req.user._id)] },
                      { $eq: ['$read', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get user details for each conversation
      const conversations = await Promise.all(
        messages.map(async (msg) => {
          const otherUserId = msg.lastMessage.sender.equals(req.user?._id)
            ? msg.lastMessage.receiver
            : msg.lastMessage.sender;

          const otherUser = await User.findById(otherUserId).select('fullName email status lastActive');

          return {
            id: msg._id,
            user: otherUser,
            lastMessage: {
              content: msg.lastMessage.content,
              createdAt: msg.lastMessage.createdAt,
              sender: msg.lastMessage.sender,
              read: msg.lastMessage.read
            },
            unreadCount: msg.unreadCount
          };
        })
      );

      res.json(conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ message: 'Error fetching conversations' });
    }
  },

  // Get messages for a specific conversation
  getMessages: async (req: Request, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { userId } = req.params;
      
      // Create conversationId
      const ids = [req.user._id.toString(), userId].sort();
      const conversationId = ids.join('_');

      // Get messages and mark them as read
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 });

      // Mark unread messages as read
      await Message.updateMany(
        {
          conversationId,
          receiver: req.user._id,
          read: false
        },
        { $set: { read: true } }
      );

      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  },

  // Send a new message
  sendMessage: async (req: Request, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { receiverId, content } = req.body;

      if (!content?.trim()) {
        return res.status(400).json({ message: 'Message content is required' });
      }

      // Check if receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      // Create conversationId by sorting and joining user IDs
      const ids = [req.user._id.toString(), receiverId].sort();
      const conversationId = ids.join('_');

      // Create and save the message
      const message = new Message({
        sender: req.user._id,
        receiver: receiverId,
        content: content.trim(),
        conversationId
      });

      await message.save();

      res.json(message);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  },

  // Mark messages as read
  markAsRead: async (req: Request, res: Response) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { userId } = req.params;
      
      // Create conversationId
      const ids = [req.user._id.toString(), userId].sort();
      const conversationId = ids.join('_');

      // Mark all messages in the conversation as read
      await Message.updateMany(
        {
          conversationId,
          receiver: req.user._id,
          read: false
        },
        { $set: { read: true } }
      );

      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ message: 'Error marking messages as read' });
    }
  }
}; 
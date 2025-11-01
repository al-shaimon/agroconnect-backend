import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // null for broadcast notifications
    },
    recipientRole: {
      type: String,
      enum: ['farmer', 'buyer', 'all'],
      // Used for targeted broadcasts
    },
    type: {
      type: String,
      enum: ['order', 'broadcast', 'system', 'verification'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      // Optional, only for order-related notifications
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientRole: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

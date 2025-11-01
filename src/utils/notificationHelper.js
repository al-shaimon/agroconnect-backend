import Notification from '../app/modules/notification/notification.model.js';
import User from '../app/modules/auth/auth.model.js';
import {
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendNewOrderEmailToFarmer,
  sendOrderStatusUpdateEmailToBuyer,
  sendDocumentSubmissionEmailToAdmin,
  sendAccountStatusEmail,
  sendOrderCancelledEmailToFarmer,
} from './emailService.js';

/**
 * Emit real-time notification via Socket.IO
 */
const emitNotification = (io, connectedUsers, recipientId, notification) => {
  if (!io || !connectedUsers) {
    console.log('Socket.IO not available for real-time notification');
    return;
  }

  const socketId = connectedUsers.get(recipientId.toString());
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    console.log(`✅ Real-time notification sent to user ${recipientId}`);
  } else {
    console.log(`User ${recipientId} not connected - notification saved to database`);
  }
};

/**
 * Create and send notification to a user
 * @param {Object} options - Notification options
 * @param {String} options.recipientId - User ID to send notification to
 * @param {String} options.type - Notification type (order, broadcast, system, verification)
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.orderId - Optional order ID
 * @param {Object} options.io - Socket.IO instance
 * @param {Map} options.connectedUsers - Connected users map
 */
export const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  orderId = null,
  io = null,
  connectedUsers = null,
}) => {
  try {
    console.log('📝 Creating notification:', { recipientId, type, title });

    // Create in-app notification
    const notification = await Notification.create({
      recipientId,
      type,
      title,
      message,
      orderId,
      isRead: false,
    });

    console.log('✅ Notification created:', notification._id);

    // Send real-time notification via Socket.IO
    if (io && connectedUsers) {
      emitNotification(io, connectedUsers, recipientId, notification);
    } else {
      console.log('⚠️  Socket.IO not available for notification');
    }

    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

/**
 * Create broadcast notification to all users or specific role
 * @param {Object} options - Broadcast options
 * @param {String} options.recipientRole - Target role ('farmer', 'buyer', 'all')
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 */
export const createBroadcastNotification = async ({ recipientRole = 'all', title, message }) => {
  try {
    // Create broadcast notification
    const notification = await Notification.create({
      recipientRole,
      type: 'broadcast',
      title,
      message,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error('Error creating broadcast notification:', error);
    throw error;
  }
};

/**
 * Helper functions for specific notification types
 */

// Verification approved
export const notifyVerificationApproved = async (
  userId,
  userName,
  io = null,
  connectedUsers = null
) => {
  try {
    console.log('🎉 Sending verification approved notification to:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return;
    }

    // Create in-app notification
    await createNotification({
      recipientId: userId,
      type: 'verification',
      title: '✅ Verification Approved!',
      message: `Congratulations ${userName}! Your account has been verified. You can now start using all features.`,
      io,
      connectedUsers,
    });

    console.log('📧 Sending verification approved email to:', user.email);
    // Send email
    await sendVerificationApprovedEmail(user.email, userName).catch((err) =>
      console.error('Error sending verification approved email:', err)
    );
  } catch (error) {
    console.error('❌ Error in notifyVerificationApproved:', error);
  }
};

// Verification rejected
export const notifyVerificationRejected = async (
  userId,
  userName,
  reason,
  io = null,
  connectedUsers = null
) => {
  try {
    console.log('❌ Sending verification rejected notification to:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return;
    }

    // Create in-app notification
    await createNotification({
      recipientId: userId,
      type: 'verification',
      title: '❌ Verification Rejected',
      message: `Hi ${userName}, your verification was rejected. Reason: ${reason}. Please resubmit with correct documents.`,
      io,
      connectedUsers,
    });

    console.log('📧 Sending verification rejected email to:', user.email);
    // Send email
    await sendVerificationRejectedEmail(user.email, userName, reason).catch((err) =>
      console.error('Error sending verification rejected email:', err)
    );
  } catch (error) {
    console.error('❌ Error in notifyVerificationRejected:', error);
  }
};

// New order for farmer
export const notifyFarmerNewOrder = async (
  farmerId,
  orderDetails,
  io = null,
  connectedUsers = null
) => {
  const farmer = await User.findById(farmerId);
  if (!farmer) return;

  const { orderId, buyerName, totalAmount } = orderDetails;

  // Create in-app notification
  await createNotification({
    recipientId: farmerId,
    type: 'order',
    title: '🛒 New Order Received!',
    message: `You have a new order from ${buyerName} worth ৳${totalAmount}. Check your orders to confirm.`,
    orderId,
    io,
    connectedUsers,
  });

  // Send email
  await sendNewOrderEmailToFarmer(farmer.email, farmer.name, orderDetails).catch((err) =>
    console.error('Error sending new order email:', err)
  );
};

// Order status update for buyer
export const notifyOrderStatusUpdate = async (
  buyerId,
  orderId,
  status,
  farmerName,
  io = null,
  connectedUsers = null
) => {
  const buyer = await User.findById(buyerId);
  if (!buyer) return;

  const statusMessages = {
    confirmed: '✅ Your order has been confirmed by the farmer!',
    'in-transit': '🚚 Your order is on the way!',
    delivered: '📦 Your order has been delivered!',
    cancelled: '❌ Your order has been cancelled.',
  };

  // Create in-app notification
  await createNotification({
    recipientId: buyerId,
    type: 'order',
    title: 'Order Status Update',
    message: statusMessages[status] || `Your order status: ${status}`,
    orderId,
    io,
    connectedUsers,
  });

  // Send email
  await sendOrderStatusUpdateEmailToBuyer(buyer.email, buyer.name, {
    orderId,
    status,
    farmerName,
  }).catch((err) => console.error('Error sending order status email:', err));
};

// Document submission notification for admin
export const notifyAdminNewDocument = async (
  userName,
  userId,
  io = null,
  connectedUsers = null
) => {
  try {
    console.log('📄 Sending document submission notification for:', userName);
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return;
    }

    // Get all admins
    const admins = await User.find({ role: 'admin' });
    console.log(`Found ${admins.length} admins`);

    const notifications = admins.map(async (admin) => {
      console.log('📨 Notifying admin:', admin.email);

      // Create in-app notification
      await createNotification({
        recipientId: admin._id,
        type: 'system',
        title: '📄 New Document Submission',
        message: `${userName} has submitted verification documents for review.`,
        io,
        connectedUsers,
      });

      // Send email
      await sendDocumentSubmissionEmailToAdmin(admin.email, userName, user.role).catch((err) =>
        console.error('Error sending admin notification email:', err)
      );
    });

    return Promise.all(notifications);
  } catch (error) {
    console.error('❌ Error in notifyAdminNewDocument:', error);
  }
};

// Account status change notification
export const notifyAccountStatusChange = async (
  userId,
  userName,
  isActive,
  io = null,
  connectedUsers = null
) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Create in-app notification
    await createNotification({
      recipientId: userId,
      type: 'system',
      title: `Account ${isActive ? 'Activated' : 'Deactivated'}`,
      message: `Your account has been ${
        isActive ? 'activated' : 'deactivated'
      } by the administrator`,
      io,
      connectedUsers,
    });

    // Send email
    await sendAccountStatusEmail(user.email, userName, isActive).catch((err) =>
      console.error('Error sending account status email:', err)
    );
  } catch (error) {
    console.error('Error in notifyAccountStatusChange:', error);
  }
};

// Order cancelled notification to farmer
export const notifyFarmerOrderCancelled = async (
  farmerId,
  orderDetails,
  io = null,
  connectedUsers = null
) => {
  try {
    const farmer = await User.findById(farmerId);
    if (!farmer) return;

    const { orderId, buyerName, totalAmount } = orderDetails;

    // Create in-app notification
    await createNotification({
      recipientId: farmerId,
      type: 'order',
      title: 'Order Cancelled',
      message: `Order ${orderId} has been cancelled by ${buyerName}`,
      orderId,
      io,
      connectedUsers,
    });

    // Send email
    await sendOrderCancelledEmailToFarmer(farmer.email, farmer.name, orderDetails).catch((err) =>
      console.error('Error sending order cancelled email:', err)
    );
  } catch (error) {
    console.error('Error in notifyFarmerOrderCancelled:', error);
  }
};

export default {
  createNotification,
  createBroadcastNotification,
  notifyVerificationApproved,
  notifyVerificationRejected,
  notifyFarmerNewOrder,
  notifyOrderStatusUpdate,
  notifyAdminNewDocument,
  notifyAccountStatusChange,
  notifyFarmerOrderCancelled,
};

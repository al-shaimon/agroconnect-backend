import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

// Check if email credentials are configured
const isEmailConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

// Create reusable transporter only if credentials are available
let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify transporter connection
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email service error:', error.message);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.warn('⚠️  Email service disabled - SMTP credentials not configured');
  console.warn('   Add SMTP_USER and SMTP_PASS to .env to enable email notifications');
}

// Base email template with AgroConnect branding
const getEmailTemplate = (title, content, buttonText = null, buttonUrl = null) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; }
    .header p { color: #dcfce7; margin: 10px 0 0 0; font-size: 16px; }
    .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
    .content h2 { color: #111827; font-size: 24px; margin-top: 0; }
    .content p { margin: 16px 0; font-size: 16px; }
    .button { display: inline-block; padding: 14px 32px; background-color: #22c55e; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: background-color 0.3s; }
    .button:hover { background-color: #16a34a; }
    .info-box { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .warning-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
    .footer a { color: #22c55e; text-decoration: none; }
    .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header h1 { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌾 AgroConnect</h1>
      <p>Connecting Farmers & Buyers</p>
    </div>
    <div class="content">
      ${content}
      ${
        buttonText && buttonUrl
          ? `<center><a href="${buttonUrl}" class="button">${buttonText}</a></center>`
          : ''
      }
    </div>
    <div class="footer">
      <p><strong>AgroConnect</strong> - Your Trusted Agricultural Marketplace</p>
      <p>© ${new Date().getFullYear()} AgroConnect. All rights reserved.</p>
      <p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Visit Website</a> |
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/about">About Us</a> |
        <a href="mailto:support@agroconnect.com">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html }) => {
  // Skip sending if email service is not configured
  if (!isEmailConfigured || !transporter) {
    console.log('ℹ️  Email skipped (service not configured):', subject);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"AgroConnect" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Email templates for different notification types
 */

export const sendVerificationApprovedEmail = async (userEmail, userName) => {
  const content = `
    <h2>🎉 Verification Approved!</h2>
    <p>Dear ${userName},</p>
    <p>Great news! Your account has been successfully verified.</p>
    <div class="info-box">
      <p style="margin: 0;"><strong>✅ Your account is now fully activated!</strong></p>
      <p style="margin: 8px 0 0 0;">You can now access all features and start using AgroConnect.</p>
    </div>
    <p>What you can do now:</p>
    <ul>
      <li>List your products and manage inventory</li>
      <li>Connect with buyers across the region</li>
      <li>Track orders and manage deliveries</li>
      <li>Access analytics and insights</li>
    </ul>
    <p>Thank you for choosing AgroConnect. We're excited to have you on board!</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: '✅ Your AgroConnect Account Has Been Verified!',
    html: getEmailTemplate(
      'Verification Approved',
      content,
      'Go to Dashboard',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/farmer/dashboard`
    ),
  });
};

export const sendVerificationRejectedEmail = async (userEmail, userName, reason) => {
  const content = `
    <h2>Verification Status Update</h2>
    <p>Dear ${userName},</p>
    <p>Thank you for submitting your verification documents. Unfortunately, we were unable to approve your account at this time.</p>
    <div class="warning-box">
      <p style="margin: 0;"><strong>❌ Verification Rejected</strong></p>
      <p style="margin: 8px 0 0 0;"><strong>Reason:</strong> ${reason}</p>
    </div>
    <p><strong>What to do next:</strong></p>
    <ul>
      <li>Review the rejection reason carefully</li>
      <li>Prepare correct and clear documents</li>
      <li>Resubmit your verification documents</li>
    </ul>
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: '📄 AgroConnect Verification Update Required',
    html: getEmailTemplate(
      'Verification Rejected',
      content,
      'Resubmit Documents',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`
    ),
  });
};

export const sendNewOrderEmailToFarmer = async (farmerEmail, farmerName, orderDetails) => {
  const { orderId, buyerName, items, totalAmount, deliveryAddress } = orderDetails;

  const itemsList = items
    .map(
      (item) =>
        `<li><strong>${item.productName}</strong> - ${item.quantity} ${item.unit} @ ৳${item.pricePerUnit} = ৳${item.subtotal}</li>`
    )
    .join('');

  const content = `
    <h2>🛒 New Order Received!</h2>
    <p>Dear ${farmerName},</p>
    <p>Congratulations! You have received a new order.</p>
    <div class="info-box">
      <p style="margin: 0;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
      <p style="margin: 8px 0 0 0;"><strong>Customer:</strong> ${buyerName}</p>
      <p style="margin: 8px 0 0 0;"><strong>Total Amount:</strong> ৳${totalAmount}</p>
    </div>
    <p><strong>Order Items:</strong></p>
    <ul>${itemsList}</ul>
    <p><strong>Delivery Address:</strong></p>
    <p>${deliveryAddress.street}, ${deliveryAddress.area}, ${deliveryAddress.city}</p>
    <p>Please log in to your dashboard to confirm and process this order.</p>
  `;

  return sendEmail({
    to: farmerEmail,
    subject: `🛒 New Order Received - ৳${totalAmount}`,
    html: getEmailTemplate(
      'New Order',
      content,
      'View Order',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/farmer/orders`
    ),
  });
};

export const sendOrderStatusUpdateEmailToBuyer = async (buyerEmail, buyerName, orderDetails) => {
  const { orderId, status, farmerName } = orderDetails;

  const statusInfo = {
    confirmed: {
      title: '✅ Order Confirmed',
      message: 'Your order has been confirmed by the farmer and is being prepared.',
      color: '#22c55e',
    },
    'in-transit': {
      title: '🚚 Order In Transit',
      message: 'Your order is on the way! It will be delivered soon.',
      color: '#3b82f6',
    },
    delivered: {
      title: '📦 Order Delivered',
      message: 'Your order has been successfully delivered. Enjoy your fresh products!',
      color: '#22c55e',
    },
    cancelled: {
      title: '❌ Order Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact support.',
      color: '#ef4444',
    },
  };

  const info = statusInfo[status] || {
    title: 'Order Status Update',
    message: `Your order status has been updated to: ${status}`,
    color: '#6b7280',
  };

  const content = `
    <h2>${info.title}</h2>
    <p>Dear ${buyerName},</p>
    <p>${info.message}</p>
    <div class="info-box">
      <p style="margin: 0;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
      <p style="margin: 8px 0 0 0;"><strong>Farmer:</strong> ${farmerName}</p>
      <p style="margin: 8px 0 0 0;"><strong>Status:</strong> <span style="color: ${
        info.color
      }; font-weight: 600;">${status.toUpperCase()}</span></p>
    </div>
    <p>You can view the complete order details in your account.</p>
  `;

  return sendEmail({
    to: buyerEmail,
    subject: `${info.title} - Order #${orderId.slice(-8).toUpperCase()}`,
    html: getEmailTemplate(
      info.title,
      content,
      'View Order',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/buyer/orders`
    ),
  });
};

export const sendDocumentSubmissionEmailToAdmin = async (adminEmail, userName, userRole) => {
  const content = `
    <h2>📄 New Document Submission</h2>
    <p>A new verification document has been submitted for review.</p>
    <div class="info-box">
      <p style="margin: 0;"><strong>User:</strong> ${userName}</p>
      <p style="margin: 8px 0 0 0;"><strong>Role:</strong> ${userRole}</p>
      <p style="margin: 8px 0 0 0;"><strong>Status:</strong> Pending Review</p>
    </div>
    <p>Please review the submitted documents and take appropriate action.</p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: '📄 New Verification Document Submitted',
    html: getEmailTemplate(
      'Document Submission',
      content,
      'Review Now',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/verifications`
    ),
  });
};

export const sendWelcomeEmail = async (userEmail, userName, userRole) => {
  const roleInfo = {
    farmer: {
      title: 'Welcome to AgroConnect - Start Selling Your Products!',
      features: [
        'List your agricultural products',
        'Reach buyers across the region',
        'Manage orders and inventory',
        'Track your sales and revenue',
      ],
      nextStep: 'Complete your profile verification to start selling',
    },
    buyer: {
      title: 'Welcome to AgroConnect - Fresh Products Await!',
      features: [
        'Browse fresh products from local farmers',
        'Direct communication with farmers',
        'Secure online ordering',
        'Track your orders in real-time',
      ],
      nextStep: 'Start exploring our marketplace',
    },
  };

  const info = roleInfo[userRole] || roleInfo.buyer;

  const content = `
    <h2>Welcome to AgroConnect! 🌾</h2>
    <p>Dear ${userName},</p>
    <p>Thank you for joining AgroConnect! We're thrilled to have you as part of our growing community connecting farmers and buyers.</p>
    <div class="info-box">
      <p style="margin: 0;"><strong>What you can do with AgroConnect:</strong></p>
      <ul style="margin: 12px 0 0 0; padding-left: 20px;">
        ${info.features.map((feature) => `<li>${feature}</li>`).join('')}
      </ul>
    </div>
    <p><strong>Next Step:</strong> ${info.nextStep}</p>
    <p>If you have any questions, our support team is here to help!</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: info.title,
    html: getEmailTemplate(
      'Welcome to AgroConnect',
      content,
      'Get Started',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${userRole}/dashboard`
    ),
  });
};

export const sendBroadcastEmail = async (userEmail, userName, broadcastData) => {
  const { title, message } = broadcastData;

  const content = `
    <h2>📢 ${title}</h2>
    <p>Dear ${userName},</p>
    <div class="info-box">
      <p style="margin: 0; white-space: pre-wrap;">${message}</p>
    </div>
    <p>This is an important announcement from the AgroConnect team. If you have any questions, please feel free to contact us.</p>
    <p>Thank you for being a valued member of our community!</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: `📢 ${title}`,
    html: getEmailTemplate(
      title,
      content,
      'Visit Dashboard',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`
    ),
  });
};

export const sendAccountStatusEmail = async (userEmail, userName, isActive) => {
  const status = isActive ? 'Activated' : 'Deactivated';
  const emoji = isActive ? '✅' : '⚠️';

  const content = `
    <h2>${emoji} Account ${status}</h2>
    <p>Dear ${userName},</p>
    ${
      isActive
        ? `
      <div class="info-box">
        <p style="margin: 0;"><strong>✅ Your account has been reactivated!</strong></p>
        <p style="margin: 8px 0 0 0;">You can now access all features and continue using AgroConnect.</p>
      </div>
      <p>Welcome back! You can now log in and resume your activities on our platform.</p>
    `
        : `
      <div class="warning-box">
        <p style="margin: 0;"><strong>⚠️ Your account has been temporarily deactivated.</strong></p>
        <p style="margin: 8px 0 0 0;">You will not be able to access platform features until your account is reactivated.</p>
      </div>
      <p>If you believe this is a mistake or need assistance, please contact our support team.</p>
    `
    }
  `;

  return sendEmail({
    to: userEmail,
    subject: `${emoji} Your AgroConnect Account Has Been ${status}`,
    html: getEmailTemplate(
      `Account ${status}`,
      content,
      isActive ? 'Go to Dashboard' : 'Contact Support',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}${isActive ? '/' : '/about'}`
    ),
  });
};

export const sendOrderCancelledEmailToFarmer = async (farmerEmail, farmerName, orderDetails) => {
  const { orderId, buyerName, totalAmount } = orderDetails;

  const content = `
    <h2>❌ Order Cancelled</h2>
    <p>Dear ${farmerName},</p>
    <p>Unfortunately, an order has been cancelled by the buyer.</p>
    <div class="warning-box">
      <p style="margin: 0;"><strong>Order ID:</strong> #${
        orderId?.slice(-8)?.toUpperCase() || 'N/A'
      }</p>
      <p style="margin: 8px 0 0 0;"><strong>Buyer:</strong> ${buyerName}</p>
      <p style="margin: 8px 0 0 0;"><strong>Amount:</strong> ৳${totalAmount}</p>
    </div>
    <p>The product quantities have been restored to your inventory automatically.</p>
    <p>You can view more details in your orders dashboard.</p>
  `;

  return sendEmail({
    to: farmerEmail,
    subject: `❌ Order Cancelled - ${orderId?.slice(-8)?.toUpperCase() || 'N/A'}`,
    html: getEmailTemplate(
      'Order Cancelled',
      content,
      'View Orders',
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/farmer/orders`
    ),
  });
};

export default {
  sendEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendNewOrderEmailToFarmer,
  sendOrderStatusUpdateEmailToBuyer,
  sendDocumentSubmissionEmailToAdmin,
  sendWelcomeEmail,
  sendBroadcastEmail,
  sendAccountStatusEmail,
  sendOrderCancelledEmailToFarmer,
};

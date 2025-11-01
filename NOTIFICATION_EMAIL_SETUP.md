# Notification & Email System Setup Guide

## Overview

The AgroConnect platform now has a complete notification and email system that works across all
features:

### Features Covered:

1. **Verification System**

   - Admin gets notified when farmer/buyer submits verification documents
   - Farmer/buyer gets notified and emailed when admin approves/rejects verification

2. **Order System**

   - Farmer gets notified and emailed when buyer places an order
   - Buyer gets notified and emailed when farmer updates order status (confirmed, in-transit,
     delivered, cancelled)

3. **Notification Types**
   - **In-app notifications**: Stored in database and displayed in real-time
   - **Real-time notifications**: Via Socket.IO for instant updates
   - **Email notifications**: Professional HTML emails sent via SMTP

## Setup Instructions

### 1. Email Configuration (SMTP)

The system uses nodemailer for sending emails. You need to configure SMTP settings in your `.env`
file.

#### For Gmail:

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password:

   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated 16-character password

3. Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

#### For Other Email Providers:

```env
# For Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password

# For Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-password
```

### 2. Frontend URL Configuration

Add the frontend URL to your `.env`:

```env
FRONTEND_URL=http://localhost:5173
```

For production:

```env
FRONTEND_URL=https://your-domain.com
```

### 3. Socket.IO Configuration

The backend is already configured with Socket.IO. Make sure your `.env` has:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

For production, add your production frontend URL:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-domain.com
```

### 4. Frontend Socket Configuration

The frontend automatically connects to Socket.IO using the `VITE_SOCKET_URL` environment variable.

Create/update `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

For production:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com
```

## How It Works

### 1. Document Submission Flow

```
Farmer submits verification document
    ↓
Backend saves document
    ↓
Admin receives:
    - In-app notification ✅
    - Real-time notification via Socket.IO ✅
    - Email notification 📧
```

### 2. Verification Approval/Rejection Flow

```
Admin approves/rejects verification
    ↓
Farmer/Buyer receives:
    - In-app notification ✅
    - Real-time notification via Socket.IO ✅
    - Email notification 📧
```

### 3. Order Placement Flow

```
Buyer places order
    ↓
Farmer receives:
    - In-app notification ✅
    - Real-time notification via Socket.IO ✅
    - Email with order details 📧
```

### 4. Order Status Update Flow

```
Farmer updates order status
    ↓
Buyer receives:
    - In-app notification ✅
    - Real-time notification via Socket.IO ✅
    - Email with status update 📧
```

## Email Templates

The system includes professional HTML email templates for:

1. **Verification Approved** - Congratulatory email with next steps
2. **Verification Rejected** - Rejection email with reason and resubmit instructions
3. **New Order** - Order details with items, buyer info, and delivery address
4. **Order Status Update** - Status change notification with tracking info
5. **Document Submission** - Admin notification about new document

All emails include:

- AgroConnect branding
- Responsive design
- Action buttons with deep links
- Professional formatting

## Testing the System

### 1. Test Email Configuration

```bash
cd backend
npm run dev
```

Look for this message in console:

```
✅ Email service ready
```

If you see:

```
⚠️  Email service disabled - SMTP credentials not configured
```

Then your SMTP credentials are not configured properly.

### 2. Test Document Submission

1. Sign up as a farmer
2. Upload verification document
3. Check:
   - Admin should receive in-app notification
   - Admin should receive email
   - Console should show: `✅ Real-time notification sent to user {adminId}`

### 3. Test Verification Approval

1. Login as admin
2. Approve a farmer's verification
3. Check:
   - Farmer should receive in-app notification
   - Farmer should receive email
   - Console should show notification sent

### 4. Test Order System

1. Login as buyer
2. Place an order
3. Check:
   - Farmer receives notification and email
4. Login as farmer
5. Update order status
6. Check:
   - Buyer receives notification and email

## Troubleshooting

### Email Not Sending

1. Check SMTP credentials in `.env`
2. Verify SMTP_USER and SMTP_PASS are correct
3. For Gmail, ensure you're using App Password, not regular password
4. Check console for error messages

### Real-time Notifications Not Working

1. Check browser console for Socket.IO connection
2. Should see: `✅ Socket connected`
3. Check backend console for: `🔌 New socket connection:`
4. Verify VITE_SOCKET_URL is correct in frontend/.env

### In-app Notifications Not Showing

1. Check NotificationBell component is rendered in Navbar
2. Verify user is authenticated
3. Check browser console for errors

## Production Deployment

### 1. Update Environment Variables

```env
# Backend .env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Frontend .env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

### 2. Enable HTTPS

Socket.IO requires secure WebSocket (wss://) in production. Ensure your backend is served over
HTTPS.

### 3. CORS Configuration

Update ALLOWED_ORIGINS to include your production domain.

## API Endpoints

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Email Test (Development Only)

You can test email sending by triggering any of the flows mentioned above.

## Notification Types

| Type           | Event                 | Recipient    | Email Sent |
| -------------- | --------------------- | ------------ | ---------- |
| `verification` | Document submitted    | Admin        | ✅         |
| `verification` | Verification approved | Farmer/Buyer | ✅         |
| `verification` | Verification rejected | Farmer/Buyer | ✅         |
| `order`        | New order placed      | Farmer       | ✅         |
| `order`        | Order status updated  | Buyer        | ✅         |
| `system`       | System notifications  | All users    | ✅         |

## Summary

The notification and email system is now fully functional with:

✅ **In-app notifications** - Persistent and stored in database ✅ **Real-time notifications** -
Instant updates via Socket.IO  
✅ **Email notifications** - Professional HTML emails ✅ **Complete coverage** - All user flows
covered ✅ **Production ready** - Configurable for deployment

All notification and email features are working for:

- Verification document submission
- Verification approval/rejection
- Order placement
- Order status updates

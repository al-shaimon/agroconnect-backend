# Quick Setup - Notification & Email System

## 🚀 Quick Start

### 1. Configure Email (Required for Email Notifications)

Edit `backend/.env` and add:

```env
# For Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

**Get Gmail App Password:**

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (Custom name)"
3. Copy the 16-character password and use it as `SMTP_PASS`

### 2. Verify Environment Variables

**Backend `.env` must have:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agroconnect
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend `.env` must have:**

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Verify Setup

**Check Backend Console:**

```
✅ Email service ready
Server running in development mode on port 5000
WebSocket server is ready
```

**Check Frontend Console (Browser):**

```
✅ Socket connected
```

## ✨ What's Working Now

### 📄 Verification System

1. **Farmer submits documents** → Admin gets:

   - In-app notification
   - Real-time notification
   - Email

2. **Admin approves/rejects** → Farmer gets:
   - In-app notification
   - Real-time notification
   - Email

### 🛒 Order System

1. **Buyer places order** → Farmer gets:

   - In-app notification
   - Real-time notification
   - Email with order details

2. **Farmer updates order status** → Buyer gets:
   - In-app notification
   - Real-time notification
   - Email with status update

## 🧪 Testing

### Test Document Submission:

1. Register as farmer
2. Upload verification document
3. Admin should receive notification & email

### Test Verification:

1. Login as admin
2. Approve/reject farmer
3. Farmer should receive notification & email

### Test Order:

1. Login as buyer
2. Place an order
3. Farmer should receive notification & email
4. Login as farmer
5. Update order status
6. Buyer should receive notification & email

## ❌ Troubleshooting

| Issue                     | Solution                                   |
| ------------------------- | ------------------------------------------ |
| ⚠️ Email service disabled | Add SMTP credentials to `.env`             |
| Socket not connecting     | Check `VITE_SOCKET_URL` in frontend `.env` |
| Notifications not showing | Check NotificationBell in Navbar           |
| Gmail not working         | Use App Password, not regular password     |

## 📧 Email Templates Included

✅ Verification Approved ✅ Verification Rejected  
✅ New Order to Farmer ✅ Order Status Update to Buyer ✅ Document Submission to Admin

All emails are professionally designed with:

- Responsive HTML
- AgroConnect branding
- Action buttons
- Deep links to dashboard

## 🎯 What Changed

### Backend Changes:

1. ✅ Added Socket.IO to `server.js`
2. ✅ Updated `notificationHelper.js` - Added Socket.IO support
3. ✅ Updated `auth.controller.js` - Notify admins on document submission
4. ✅ Updated `verification.controller.js` - Notify users on approve/reject
5. ✅ Updated `buyer.controller.js` - Notify farmers on new order
6. ✅ Updated `farmer.controller.js` - Notify buyers on status update
7. ✅ Added SMTP configuration to `.env.example`

### Frontend Changes:

1. ✅ Updated `socketService.ts` - Emit join event with userId
2. ✅ Updated `useSocket.ts` - Connect with user.\_id
3. ✅ NotificationBell already listens for real-time notifications

## 🔐 Production Notes

For production deployment:

1. Use HTTPS for backend (required for Socket.IO)
2. Update `FRONTEND_URL` to production domain
3. Update `ALLOWED_ORIGINS` with production URLs
4. Use environment-specific SMTP credentials

## 📚 Full Documentation

See `NOTIFICATION_EMAIL_SETUP.md` for complete documentation.

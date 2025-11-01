# 🚀 Quick Start Guide

## ⚡ Immediate Action Required

### 1. Get Cloudinary Credentials (5 minutes)

1. Go to https://cloudinary.com
2. Sign up/Login
3. Copy from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 2. Update `.env` File

Open `backend/.env` and replace:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Restart Backend

```bash
cd backend
npm run dev
```

## 🔑 Test Accounts

| Role       | Email                 | Password  | Access             |
| ---------- | --------------------- | --------- | ------------------ |
| **Admin**  | admin@agroconnect.com | admin123  | /admin/panel       |
| **Farmer** | farmer@test.com       | farmer123 | /farmer/dashboard  |
| **Buyer**  | buyer@test.com        | buyer123  | /buyer/marketplace |

## ✅ What Was Fixed

1. **Farmer Login** - Fixed email mismatch (admin@test.com → admin@agroconnect.com)
2. **Document Upload** - Integrated Cloudinary with structured folders
3. **File Management** - Auto-cleanup of local files after upload
4. **Folder Structure** - `agroconnect/{role}/{userId}/{documentType}`

## 📁 Cloudinary Folder Example

```
agroconnect/
├── farmer/
│   └── 507f1f77bcf86cd799439011/
│       ├── nid/
│       │   └── document_123.jpg
│       └── passport/
│           └── document_456.pdf
└── buyer/
    └── 607f1f77bcf86cd799439022/
        └── trade_license/
            └── document_789.pdf
```

## 🧪 Testing Steps

### Test 1: Farmer Login

1. Login: `farmer@test.com` / `farmer123`
2. Should redirect to `/farmer/dashboard`

### Test 2: Document Upload

1. Login as farmer
2. Go to Profile
3. Upload document (NID, 1234567890123, any image)
4. Check Cloudinary Media Library

### Test 3: Admin Verification

1. Login: `admin@agroconnect.com` / `admin123`
2. Go to `/admin/verifications`
3. View pending request
4. Click document URL
5. Approve/Reject

## 📚 Documentation Files

- `COMPLETE_SETUP.md` - Detailed setup instructions
- `CLOUDINARY_SETUP.md` - Cloudinary-specific guide
- `.env.example` - Environment variables template

## 🐛 Troubleshooting

**Upload fails?**

- Check Cloudinary credentials in `.env`
- Restart backend server

**Login redirects to home?**

- Use exact credentials above
- Run `npm run seed` if needed

**Documents not showing?**

- Check Cloudinary Media Library
- Verify upload success message
- Check browser console for errors

## 🎯 Current Status

✅ Database seeded with correct accounts  
✅ Cloudinary integration complete  
✅ Folder structure implemented  
✅ Auto-cleanup configured  
⏳ **WAITING**: Your Cloudinary credentials

**Next**: Add credentials → Restart server → Test upload

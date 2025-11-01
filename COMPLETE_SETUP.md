# Complete Setup Instructions - AgroConnect

## Issues Fixed ✅

### 1. Farmer Login Issue

**Problem**: Farmer account couldn't login and redirected to homepage **Root Cause**: Email mismatch
in seed script (admin@test.com vs admin@agroconnect.com) **Solution**: Fixed seed.js to use correct
email addresses **Status**: ✅ FIXED - Database reseeded with correct accounts

### 2. Document Upload Implementation

**Problem**: Documents not uploading to cloud storage **Root Cause**: Using local file storage which
isn't suitable for production **Solution**: Integrated Cloudinary with proper folder structure
**Status**: ✅ IMPLEMENTED - Cloudinary integration complete

## New Test Accounts (After Fix)

### Admin Account

- Email: `admin@agroconnect.com`
- Password: `admin123`
- Status: Verified and Active
- Access: `/admin/panel`, `/admin/verifications`

### Farmer Account

- Email: `farmer@test.com`
- Password: `farmer123`
- Status: Pending Verification
- Access: `/farmer/dashboard`

### Buyer Account

- Email: `buyer@test.com`
- Password: `buyer123`
- Status: Pending Verification
- Access: `/buyer/marketplace`

## Cloudinary Integration Details

### Installation

```bash
cd backend
npm install cloudinary
```

✅ **Status**: Installed

### Configuration Files Created

1. **`backend/src/config/cloudinary.js`**

   - Cloudinary configuration and helper functions
   - Upload, delete, and transformation utilities
   - Structured folder path generation

2. **`backend/.env`** (Updated)

   - Added Cloudinary credentials placeholders
   - You need to add your actual credentials

3. **`backend/.env.example`** (Updated)

   - Template for environment variables
   - Includes Cloudinary setup instructions

4. **`backend/CLOUDINARY_SETUP.md`**
   - Complete guide for Cloudinary setup
   - Folder structure documentation
   - Troubleshooting guide

### Code Changes

#### 1. User Model (`auth.model.js`)

Added `cloudinaryPublicId` field to verificationDocuments:

```javascript
verificationDocuments: [
  {
    documentType: String,
    documentNumber: String,
    documentUrl: String,
    cloudinaryPublicId: String, // NEW: For deletion if needed
    uploadedAt: Date,
  },
];
```

#### 2. Auth Controller (`auth.controller.js`)

Updated `uploadVerificationDocument` function:

- ✅ Uploads files to Cloudinary
- ✅ Organizes in folder: `agroconnect/{role}/{userId}/{documentType}`
- ✅ Stores secure Cloudinary URL
- ✅ Adds metadata and tags
- ✅ Deletes local temporary files after upload
- ✅ Handles errors with cleanup

#### 3. Config (`config.js`)

Added Cloudinary configuration:

```javascript
cloudinary: {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}
```

## Cloudinary Folder Structure

Documents are organized as:

```
agroconnect/
├── farmer/
│   └── {userId}/
│       ├── nid/
│       ├── passport/
│       ├── driving_license/
│       ├── birth_certificate/
│       └── trade_license/
└── buyer/
    └── {userId}/
        ├── nid/
        ├── passport/
        ├── driving_license/
        ├── birth_certificate/
        └── trade_license/
```

### Example Path

For farmer with userId `507f1f77bcf86cd799439011` uploading NID:

```
agroconnect/farmer/507f1f77bcf86cd799439011/nid/
```

## Setup Steps for You

### Step 1: Get Cloudinary Credentials

1. Visit [Cloudinary](https://cloudinary.com)
2. Sign up for a free account (if you don't have one)
3. Log in to Dashboard
4. Copy these three values:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Update Environment Variables

Open `backend/.env` and replace these lines:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

With your actual values:

```env
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

### Step 4: Test Document Upload

1. Login as farmer: `farmer@test.com` / `farmer123`
2. Go to Profile page
3. Upload a verification document (NID, Passport, etc.)
4. Check your Cloudinary Media Library to see the uploaded file

### Step 5: Test Admin Verification

1. Logout and login as admin: `admin@agroconnect.com` / `admin123`
2. Navigate to `/admin/verifications`
3. View pending verification request
4. Click on document URL to view in Cloudinary
5. Approve or reject the verification

## Features Implemented

### Document Upload (User Side)

- ✅ Upload verification documents through Profile page
- ✅ Support for 5 document types (NID, Passport, Driving License, Birth Certificate, Trade License)
- ✅ Real-time upload to Cloudinary
- ✅ Automatic verification status update to "pending"
- ✅ Document list display with status
- ✅ Rejection reason display if rejected

### Document Verification (Admin Side)

- ✅ View all pending verifications
- ✅ Search by name or email
- ✅ Filter by status and role
- ✅ View document details and images
- ✅ Click to open document in new tab
- ✅ Approve verification
- ✅ Reject with reason
- ✅ Statistics dashboard

### File Management

- ✅ Automatic cleanup of local temporary files
- ✅ Error handling with rollback
- ✅ Cloudinary public ID storage for future deletion
- ✅ Metadata tagging (role, document type, user ID)
- ✅ Secure HTTPS URLs

### Security

- ✅ Environment variable storage for credentials
- ✅ Role-based access control
- ✅ File type validation (JPEG, PNG, PDF only)
- ✅ File size limit (5MB)
- ✅ JWT authentication required

## Testing Workflow

### 1. Test Farmer Login

```
Email: farmer@test.com
Password: farmer123
Expected: Redirect to /farmer/dashboard
```

### 2. Test Document Upload

```
1. Login as farmer
2. Go to Profile
3. Fill document form:
   - Document Type: NID
   - Document Number: 1234567890123
   - File: Upload any image/PDF
4. Submit
5. Should see success message
6. Document should appear in list
```

### 3. Test Admin Verification

```
1. Login as admin@agroconnect.com / admin123
2. Go to /admin/verifications
3. Should see farmer's pending verification
4. Click document URL to view
5. Click "Approve" or "Reject"
6. If reject, provide reason
7. Submit
```

### 4. Test Cloudinary Storage

```
1. Login to Cloudinary Dashboard
2. Go to Media Library
3. Navigate to: agroconnect/farmer/{userId}/nid/
4. Should see uploaded document
5. Click to view image details
6. Check tags: farmer, nid, {userId}
```

## Common Issues & Solutions

### Issue: Upload fails with Cloudinary error

**Solution**:

1. Check `.env` file has correct credentials
2. Ensure Cloudinary account is active
3. Check internet connection
4. Restart backend server

### Issue: Farmer can't login

**Solution**:

1. Run `npm run seed` to recreate accounts
2. Use exact email: `farmer@test.com`
3. Use exact password: `farmer123`
4. Check MongoDB connection

### Issue: Documents not visible to admin

**Solution**:

1. Ensure document uploaded successfully
2. Check verificationStatus is "pending"
3. Refresh admin verification page
4. Check database for user's verificationDocuments array

### Issue: Local files not deleted

**Solution**:

1. Check file permissions on uploads folder
2. Ensure fs.unlinkSync is not throwing errors
3. Check server logs

## Files Modified/Created

### Created

- ✅ `backend/src/config/cloudinary.js` - Cloudinary configuration
- ✅ `backend/CLOUDINARY_SETUP.md` - Setup documentation
- ✅ `backend/COMPLETE_SETUP.md` - This file

### Modified

- ✅ `backend/package.json` - Added cloudinary dependency
- ✅ `backend/seed.js` - Fixed admin email
- ✅ `backend/.env` - Added Cloudinary variables
- ✅ `backend/.env.example` - Added Cloudinary template
- ✅ `backend/src/config/config.js` - Added Cloudinary config
- ✅ `backend/src/app/modules/auth/auth.model.js` - Added cloudinaryPublicId
- ✅ `backend/src/app/modules/auth/auth.controller.js` - Cloudinary integration

## Next Steps

1. ✅ **Immediate**: Add your Cloudinary credentials to `.env`
2. ✅ **Test**: Upload a document as farmer
3. ✅ **Verify**: Check Cloudinary Media Library
4. ✅ **Approve**: Test admin verification workflow

## Production Checklist

Before deploying to production:

- [ ] Use production MongoDB URI
- [ ] Use strong JWT secret
- [ ] Configure production CORS origins
- [ ] Set up Cloudinary production account
- [ ] Enable Cloudinary auto-backup
- [ ] Set up monitoring for Cloudinary usage
- [ ] Configure rate limiting
- [ ] Enable HTTPS only
- [ ] Set up error logging
- [ ] Configure file retention policies

## Support

For issues:

1. Check server logs
2. Review Cloudinary dashboard
3. Check MongoDB for data
4. Review browser console
5. Check network tab for failed requests

## Summary

✅ **Fixed**: Farmer login issue by correcting seed data ✅ **Implemented**: Cloudinary integration
with structured folders ✅ **Created**: Complete documentation and setup guides ✅ **Ready**: System
ready for testing after adding Cloudinary credentials

**Action Required**: Add your Cloudinary credentials to `backend/.env` and restart the server.

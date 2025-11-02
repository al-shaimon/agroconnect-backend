# Vercel Image Upload Configuration Guide

## Overview

This application uses a **dual-mode file upload system** that automatically adapts to the deployment
environment:

- **Development (Local)**: Uses disk storage with Multer → Uploads to local `uploads/` folder → Then
  syncs to Cloudinary
- **Production (Vercel)**: Uses memory storage with Multer → Uploads directly to Cloudinary (no
  filesystem dependency)

This ensures compatibility with **Vercel's serverless architecture**, which has a read-only
filesystem.

---

## How It Works

### 1. Environment Detection

The system automatically detects the environment:

```javascript
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
```

### 2. Multer Configuration (`src/config/multer.js`)

**Development Mode:**

- Uses `multer.diskStorage()`
- Saves files temporarily to `uploads/verification/`
- Files are auto-deleted after Cloudinary upload

**Production Mode (Vercel):**

- Uses `multer.memoryStorage()`
- Files are stored in memory as buffers
- No filesystem access required

### 3. Cloudinary Upload (`src/config/cloudinary.js`)

The `uploadToCloudinary` function handles both modes:

**Development:**

```javascript
// Upload from file path
result = await cloudinary.uploader.upload(filePath, uploadOptions);
```

**Production:**

```javascript
// Upload from buffer
result = await new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
    if (error) reject(error);
    else resolve(result);
  });
  uploadStream.end(file); // file is a Buffer
});
```

### 4. Controller Helper Functions

Each controller has a `handleFileUpload` helper that automatically selects the correct upload
method:

```javascript
const handleFileUpload = async (file, folder, userRole, userId, documentType) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  if (isProduction) {
    // Upload buffer (req.file.buffer)
    result = await uploadToCloudinary(file.buffer, folder, userRole, userId, documentType);
  } else {
    // Upload file path (req.file.path)
    result = await uploadToCloudinary(file.path, folder, userRole, userId, documentType);
    // Clean up local file
    fs.unlinkSync(file.path);
  }

  return result;
};
```

---

## Supported Upload Endpoints

All these endpoints work seamlessly in both development and production:

### Authentication/Registration

- `POST /api/auth/register` - Profile image upload
- `POST /api/auth/register-driver` - Profile image & vehicle documents
- `PUT /api/auth/upload-verification-documents` - Verification documents (NID, License, Trade
  License)

### Farmer

- `POST /api/farmer/products` - Product image upload
- `PUT /api/farmer/products/:id` - Update product image

### Driver

- `PUT /api/driver/profile` - Profile & vehicle image upload

### Admin (Global Products)

- `POST /api/admin/global-products` - Product image upload
- `PUT /api/admin/global-products/:id` - Update product image

---

## Environment Variables Required

### For Vercel Deployment

Make sure these are set in your Vercel project settings:

```bash
# Required for Vercel
NODE_ENV=production
VERCEL=1  # Auto-set by Vercel

# Cloudinary (REQUIRED for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# MongoDB Atlas (production database)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=https://your-frontend-domain.vercel.app
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

---

## Vercel Deployment Checklist

### ✅ Pre-Deployment

1. **Cloudinary Account Setup**

   - Sign up at https://cloudinary.com
   - Get your credentials from Dashboard
   - Add them to Vercel environment variables

2. **MongoDB Atlas Setup**

   - Use MongoDB Atlas (cloud database) instead of local MongoDB
   - Whitelist Vercel IPs (or use `0.0.0.0/0` for testing)

3. **Environment Variables**
   - Add ALL required environment variables in Vercel project settings
   - Never commit `.env` to git

### ✅ Deployment

1. **Push to GitHub/GitLab**

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Import project from GitHub/GitLab
   - Add environment variables
   - Deploy

3. **Test Image Uploads**
   - Register a new user with profile photo
   - Upload verification documents
   - Create a product with image
   - Verify images appear in Cloudinary dashboard

---

## Testing Locally

### Test Development Mode (Disk Storage)

```bash
# Ensure NODE_ENV is development or not set
npm run dev
```

### Test Production Mode Locally (Memory Storage)

```bash
# Set environment to production
NODE_ENV=production npm run dev
```

Files should upload successfully in both modes.

---

## Troubleshooting

### Issue: "Failed to upload file to Cloudinary"

**Cause:** Missing Cloudinary credentials or incorrect configuration

**Solution:**

1. Verify Cloudinary credentials in `.env`
2. Check Cloudinary dashboard for API limits
3. Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set

### Issue: "ENOENT: no such file or directory" on Vercel

**Cause:** Code is trying to access filesystem in production

**Solution:**

- This should NOT happen with the current setup
- If it does, check that `isProduction` is correctly detected
- Verify that all controllers use `handleFileUpload` helper
- Check that no code uses `fs.readFile` or `fs.writeFile` without environment checks

### Issue: "Request Entity Too Large"

**Cause:** File size exceeds limit

**Solution:**

- Current limit is 5MB per file (set in `src/config/multer.js`)
- To increase, modify `limits.fileSize` in multer config
- Also check Cloudinary account limits

### Issue: Files Upload Locally But Not on Vercel

**Cause:** Missing environment variables in Vercel

**Solution:**

1. Go to Vercel Project Settings → Environment Variables
2. Add ALL variables from `.env.example`
3. Redeploy the project

---

## File Size Limits

- **Multer Limit:** 5MB per file
- **Cloudinary Free Tier:** 10GB total storage, 25 monthly credits
- **Vercel Serverless Function:** 50MB deployment size

---

## Storage Structure in Cloudinary

Files are organized by role and document type:

```
agroconnect/
├── profiles/
│   ├── farmer/
│   ├── buyer/
│   └── driver/
├── products/
├── vehicles/
└── verification/
    ├── farmer/
    │   └── {userId}/
    │       ├── nid/
    │       ├── trade_license/
    │       └── land_ownership/
    ├── buyer/
    │   └── {userId}/
    │       └── nid/
    └── driver/
        └── {userId}/
            ├── nid/
            └── driving_license/
```

---

## Code References

### Key Files

1. **Multer Config:** `src/config/multer.js`
2. **Cloudinary Helper:** `src/config/cloudinary.js`
3. **Controllers with Upload:**
   - `src/app/modules/auth/auth.controller.js`
   - `src/app/modules/farmer/farmer.controller.js`
   - `src/app/modules/driver/driver.controller.js`
   - `src/app/modules/product/globalProduct.controller.js`

### Helper Function Pattern

All controllers should use this pattern:

```javascript
const handleFileUpload = async (file, folder, userRole, userId, documentType) => {
  if (!file) return null;

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  try {
    let result;

    if (isProduction) {
      result = await uploadToCloudinary(file.buffer, folder, userRole, userId, documentType);
    } else {
      result = await uploadToCloudinary(file.path, folder, userRole, userId, documentType);
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return result;
  } catch (error) {
    if (!isProduction && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};
```

---

## Benefits of This Approach

✅ **Serverless Compatible** - Works on Vercel, AWS Lambda, Google Cloud Functions, etc. ✅
**Development Friendly** - Keeps local file system access for debugging ✅ **No Code Duplication** -
Single `handleFileUpload` helper used everywhere ✅ **Automatic Detection** - No manual switching
between modes ✅ **Cloudinary Integration** - All files permanently stored in cloud ✅ **Memory
Efficient** - Files in production never touch disk ✅ **Error Handling** - Automatic cleanup of
temporary files on error

---

## Security Notes

1. **File Type Validation** - Only JPEG, JPG, PNG, WebP allowed
2. **File Size Limit** - 5MB max per file
3. **Cloudinary Transformation** - Can add watermarks, resize, optimize
4. **Access Control** - Files uploaded with user role/ID metadata
5. **HTTPS Only** - All Cloudinary URLs use `secure_url`

---

## Monitoring

### Check Upload Success

**Development:**

```bash
# Check local uploads folder (should be auto-cleaned)
ls -la uploads/verification/

# Check console logs
# Should see: "💾 Using disk storage for file uploads (Development)"
```

**Production (Vercel):**

```bash
# Check Vercel function logs
vercel logs

# Check Cloudinary dashboard
# Media Library → agroconnect folder

# Should see in logs: "📦 Using memory storage for file uploads (Production/Vercel)"
```

---

## Need Help?

If you encounter issues:

1. Check Vercel function logs
2. Verify all environment variables are set
3. Test uploads in Cloudinary dashboard directly
4. Check this guide's troubleshooting section
5. Review Cloudinary upload quotas

---

**Last Updated:** November 2025 **Compatible With:** Vercel, Netlify Functions, AWS Lambda, Google
Cloud Functions

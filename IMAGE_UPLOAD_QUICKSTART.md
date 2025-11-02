# Image Upload System - Quick Reference

## ✅ System Status

**The image upload system is now fully configured for both development and production environments
(including Vercel serverless deployment).**

---

## 🎯 How It Works

### Development (Your Local Machine)

```
User uploads file → Multer saves to disk → Upload to Cloudinary → Delete local file → Return URL
```

### Production (Vercel/Serverless)

```
User uploads file → Multer stores in memory (Buffer) → Upload to Cloudinary → Return URL
```

**No code changes needed between environments!** ✨

---

## 🚀 Quick Start

### 1. Test Configuration

```bash
npm run test:upload
```

This will verify:

- ✅ Environment detection working
- ✅ Cloudinary credentials set
- ✅ Connection to Cloudinary successful
- ✅ Correct storage mode selected

### 2. Run Development Server

```bash
npm run dev
```

### 3. Deploy to Vercel

**Step 1:** Add environment variables in Vercel dashboard:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
```

**Step 2:** Deploy

```bash
vercel --prod
```

**That's it!** 🎉 Image uploads will work automatically.

---

## 📁 Files Modified

### Core Configuration

- ✅ `src/config/multer.js` - Environment-aware Multer setup
- ✅ `src/config/cloudinary.js` - Handles both buffer & file path uploads

### Controllers (All Updated)

- ✅ `src/app/modules/auth/auth.controller.js`
- ✅ `src/app/modules/farmer/farmer.controller.js`
- ✅ `src/app/modules/driver/driver.controller.js`
- ✅ `src/app/modules/product/globalProduct.controller.js`

### Routes (All Using Centralized Config)

- ✅ `src/app/modules/auth/auth.routes.js`
- ✅ `src/app/modules/farmer/farmer.routes.js`
- ✅ `src/app/modules/driver/driver.routes.js`
- ✅ `src/app/modules/product/product.routes.js`

---

## 🧪 Testing

### Test Local (Disk Storage)

```bash
NODE_ENV=development npm run dev
# Upload a file through any endpoint
# Check: uploads/ folder should be empty (files auto-deleted after upload)
# Check: Cloudinary dashboard should have the file
```

### Test Production Mode Locally (Memory Storage)

```bash
NODE_ENV=production npm run dev
# Upload a file through any endpoint
# Check: uploads/ folder should remain empty
# Check: Cloudinary dashboard should have the file
```

### Test on Vercel

```bash
# After deployment
curl -X POST https://your-app.vercel.app/api/auth/register \
  -F "profileImage=@test-image.jpg" \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "password=Test123!" \
  -F "role=farmer"
```

---

## 🔧 Troubleshooting

### Issue: "ENOENT: no such file or directory"

**On Local:**

- Directory should auto-create, but if not:
  ```bash
  mkdir -p uploads/verification
  mkdir -p uploads/products
  ```

**On Vercel:**

- This should NEVER happen if configured correctly
- Verify `NODE_ENV=production` is set in Vercel
- Check that code is using `file.buffer` not `file.path`

### Issue: "Failed to upload to Cloudinary"

**Check:**

1. Cloudinary credentials are correct
2. Run `npm run test:upload` to verify connection
3. Check Cloudinary dashboard for quota limits
4. Ensure file size is under 5MB

### Issue: Files Not Appearing in Cloudinary

**Check:**

1. Cloudinary credentials in `.env` (local) or Vercel dashboard (production)
2. Network/firewall not blocking cloudinary.com
3. File type is allowed (JPEG, JPG, PNG, WebP)
4. Check server logs for upload errors

---

## 📊 Monitoring

### Development Console Output

```bash
# You should see:
💾 Using disk storage for file uploads (Development)
```

### Production Console Output (Vercel Logs)

```bash
# You should see:
📦 Using memory storage for file uploads (Production/Vercel)
```

### Cloudinary Dashboard

- Go to: https://cloudinary.com/console/media_library
- Check folder: `agroconnect/`
- Verify files are uploading

---

## 🎨 Folder Structure in Cloudinary

```
agroconnect/
├── profiles/
│   ├── farmer/
│   ├── buyer/
│   └── driver/
├── products/
├── vehicles/
└── verification/
    ├── farmer/{userId}/
    │   ├── nid/
    │   ├── trade_license/
    │   └── land_ownership/
    ├── buyer/{userId}/
    │   └── nid/
    └── driver/{userId}/
        ├── nid/
        └── driving_license/
```

---

## 📚 Documentation

- **Complete Guide:** `VERCEL_IMAGE_UPLOAD_GUIDE.md`
- **API Documentation:** `API_DOCUMENTATION.md`
- **Deployment Checklist:** `DEPLOYMENT_CHECKLIST.md`

---

## ✨ Features

✅ **Zero Configuration Switching** - Automatically detects environment ✅ **Serverless
Compatible** - Works on Vercel, Netlify, AWS Lambda ✅ **Development Friendly** - Local file system
for easy debugging ✅ **Memory Efficient** - Buffers in production, disk in development ✅ **Auto
Cleanup** - Local files deleted after upload ✅ **Error Handling** - Automatic file cleanup on
errors ✅ **Type Validation** - Only JPEG, JPG, PNG, WebP allowed ✅ **Size Limits** - 5MB per file
✅ **Secure URLs** - All URLs use HTTPS

---

## 🎯 Next Steps

1. ✅ Test locally with `npm run test:upload`
2. ✅ Upload test images through all endpoints
3. ✅ Verify in Cloudinary dashboard
4. ✅ Deploy to Vercel
5. ✅ Add Cloudinary env vars to Vercel
6. ✅ Test uploads on production

---

**Last Updated:** November 2, 2025 **Status:** ✅ Production Ready

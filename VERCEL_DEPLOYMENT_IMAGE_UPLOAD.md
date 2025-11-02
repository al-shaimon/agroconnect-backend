# Vercel Deployment - Image Upload Checklist

## ✅ Pre-Deployment Verification

Run this command before deploying:

```bash
npm run test:upload
```

**Expected Output:**

```
✅ Environment detection working
✅ Cloudinary credentials set
✅ Cloudinary connection successful
✅ All tests passed!
```

---

## 🚀 Deployment Steps

### Step 1: Prepare Environment Variables

Copy these to Vercel Project Settings → Environment Variables:

```bash
# Required
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d

# Cloudinary (CRITICAL for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app

# Email (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

### Step 2: Verify Files

Ensure these files are in your repo:

- ✅ `src/config/multer.js` - Environment-aware config
- ✅ `src/config/cloudinary.js` - Buffer upload support
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Exclude unnecessary files

### Step 3: Deploy

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

## 🧪 Post-Deployment Testing

### 1. Test Image Upload Endpoints

```bash
# Get your deployment URL from Vercel
BACKEND_URL="https://your-backend.vercel.app"

# Test 1: Register with Profile Image
curl -X POST $BACKEND_URL/api/auth/register \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "password=Test123!" \
  -F "role=farmer" \
  -F "phone=+8801234567890" \
  -F "profileImage=@test-image.jpg"

# Test 2: Check Cloudinary
# Go to https://cloudinary.com/console/media_library
# Verify image appears in agroconnect/ folder
```

### 2. Check Vercel Logs

```bash
vercel logs --follow
```

**Look for:**

```
📦 Using memory storage for file uploads (Production/Vercel)
✅ File uploaded to Cloudinary: https://res.cloudinary.com/...
```

### 3. Test All Upload Endpoints

- ✅ User Registration (Profile Image)
- ✅ Driver Registration (Profile + Vehicle)
- ✅ Verification Documents (NID, License, etc.)
- ✅ Farmer Products (Product Images)
- ✅ Driver Profile Update (Images)
- ✅ Admin Global Products (Product Images)

---

## 🔍 Troubleshooting

### Issue: "Module not found" errors

**Solution:**

```bash
# Ensure all imports use .js extension
import { upload } from '../config/multer.js';  ✅
import { upload } from '../config/multer';     ❌
```

### Issue: "Failed to upload to Cloudinary"

**Check Vercel Logs:**

```bash
vercel logs --follow
```

**Verify:**

1. ✅ Cloudinary env vars are set in Vercel dashboard
2. ✅ Cloud name, API key, API secret are correct
3. ✅ Cloudinary account is active (not expired trial)
4. ✅ No upload quota exceeded

### Issue: "ENOENT: no such file or directory"

**This means disk storage is being used in production!**

**Fix:**

1. Check Vercel env vars: `NODE_ENV=production` must be set
2. Verify code uses `file.buffer` in production, not `file.path`
3. Check `src/config/multer.js` has correct environment detection:
   ```javascript
   const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
   ```

### Issue: "Request Entity Too Large"

**Solution:**

- Default limit is 5MB per file
- Vercel has a 50MB deployment limit
- Increase multer limit if needed (but not recommended)

---

## 📊 Monitoring

### Check Upload Success Rate

**Cloudinary Dashboard:**

- Go to: Media Library → agroconnect folder
- Monitor: Total files, Storage used, Transformations

**Vercel Analytics:**

- Monitor: Function invocation count
- Check: Error rate on upload endpoints
- Review: Function execution time

### Set Up Alerts

**Cloudinary:**

- Account Settings → Notifications
- Set alerts for quota limits

**Vercel:**

- Project Settings → Integrations
- Add monitoring service (DataDog, Sentry, etc.)

---

## 🎯 Verification Checklist

After deployment, verify:

- [ ] `npm run test:upload` passes locally
- [ ] Environment variables set in Vercel
- [ ] Deployment successful (no build errors)
- [ ] Test image upload via API
- [ ] Image appears in Cloudinary
- [ ] Vercel logs show "Using memory storage"
- [ ] No "ENOENT" errors in logs
- [ ] Frontend can upload images
- [ ] Images load correctly in frontend

---

## 🔐 Security Notes

### Cloudinary

- ✅ API credentials stored as environment variables (not in code)
- ✅ HTTPS only (secure_url used)
- ✅ File type validation (only images allowed)
- ✅ File size limits (5MB max)
- ✅ Signed uploads (authenticated requests)

### Vercel

- ✅ Environment variables encrypted at rest
- ✅ Separate env vars for dev/preview/production
- ✅ HTTPS enforced on all deployments
- ✅ DDoS protection included

---

## 📈 Performance

### Current Configuration

- **Upload Time (Local):** ~2-3 seconds (network dependent)
- **Upload Time (Vercel):** ~1-2 seconds (direct to Cloudinary)
- **Storage:** Unlimited (Cloudinary manages)
- **Bandwidth:** Covered by Cloudinary
- **Concurrent Uploads:** Supported (Cloudinary handles)

### Optimization Tips

1. **Image Compression:** Use Cloudinary transformations

   ```javascript
   // In frontend, request optimized version
   url = url.replace('/upload/', '/upload/q_auto,f_auto/');
   ```

2. **Lazy Loading:** Load images on demand
3. **CDN:** Cloudinary provides global CDN automatically
4. **Caching:** Cloudinary handles caching

---

## 📞 Support Resources

- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Vercel Docs:** https://vercel.com/docs
- **Multer Docs:** https://github.com/expressjs/multer
- **Project Docs:** See `VERCEL_IMAGE_UPLOAD_GUIDE.md`

---

## ✨ Success Criteria

Your deployment is successful when:

✅ No errors in Vercel deployment logs ✅ `test:upload` script passes ✅ Images upload successfully
through API ✅ Images appear in Cloudinary dashboard ✅ Images load in frontend application ✅ No
filesystem-related errors in production ✅ Vercel logs show "Using memory storage"

---

**Last Updated:** November 2, 2025 **Status:** Production Ready ✅

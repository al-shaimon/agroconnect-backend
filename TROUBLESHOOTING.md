# 🚨 Troubleshooting 500 Error - Immediate Actions

## Step 1: Check Vercel Deployment Status

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Check if the latest deployment says "Ready" or "Building"
4. If it's still building, wait for it to complete

## Step 2: Check Vercel Function Logs (MOST IMPORTANT!)

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Click on the latest deployment (should show green "Ready")
4. Click "Functions" tab
5. Click on "server.js"
6. Look for ERROR messages in red

### Common errors you might see:

#### Error: "MONGODB_URI is not defined"

**Solution:**

- Go to Project Settings → Environment Variables
- Add `MONGODB_URI` with your MongoDB connection string
- Redeploy

#### Error: "Cannot find module" or "Module not found"

**Solution:**

- Check that all dependencies are in `package.json`
- Vercel runs `npm install` automatically
- Check build logs for installation errors

#### Error: "Operation buffering timed out"

**Solution:**

- MongoDB connection string is wrong OR
- MongoDB Atlas network access doesn't allow Vercel IPs
- Go to MongoDB Atlas → Network Access → Allow 0.0.0.0/0

## Step 3: Verify ALL Environment Variables

Go to: Vercel Project → Settings → Environment Variables

You MUST have these set (checkall boxes: Production, Preview, Development):

```
MONGODB_URI=mongodb+srv://...your-connection-string...
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://your-frontend.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=AgroConnect <noreply@agroconnect.com>
```

After adding/changing env vars, you MUST redeploy:

- Go to Deployments tab
- Click "..." menu on latest deployment
- Click "Redeploy"

## Step 4: Check MongoDB Atlas

1. Go to: https://cloud.mongodb.com
2. Click on your cluster
3. Click "Network Access" in left sidebar
4. You should see: `0.0.0.0/0` (Allow access from anywhere)
5. If not:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"

## Step 5: Test MongoDB Connection String Locally

In your backend folder, create a test file:

```javascript
// test-db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
```

Run:

```powershell
node test-db.js
```

If this fails locally, your MONGODB_URI is wrong.

## Step 6: Check Vercel Build Logs

1. Go to Vercel Dashboard → Your Project
2. Click on latest deployment
3. Click "Building" or "Build Logs" tab
4. Look for any RED errors during build
5. Common issues:
   - npm install failures
   - TypeScript errors (if using TS)
   - Missing files

## Step 7: Manual Redeploy

Sometimes Vercel needs a manual trigger:

```powershell
cd c:\Users\alsha\OneDrive\Desktop\hackathon\intra-dept\backend
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

## Step 8: Check vercel.json

Your `vercel.json` should look like this:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 10
    }
  }
}
```

## What to Share for Help

If still not working, share:

1. **Vercel Function Logs** (from Step 2)

   - Screenshot of the error messages in Vercel Functions tab

2. **Environment Variables Status**

   - Screenshot showing all env vars are set (hide the values!)

3. **Build Logs**

   - Any errors from Vercel build process

4. **MongoDB Atlas Network Access**
   - Screenshot showing 0.0.0.0/0 is allowed

---

## Quick Test Commands

### Test Health Endpoint

```powershell
Invoke-WebRequest -Uri "https://api.agroconnect.alshaimon.com/api/health" -UseBasicParsing
```

### Test Root Endpoint

```powershell
Invoke-WebRequest -Uri "https://api.agroconnect.alshaimon.com/" -UseBasicParsing
```

### Test Login

```powershell
$body = @{
    email = "admin@agroconnect.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.agroconnect.alshaimon.com/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

---

**Next Step:** Check the Vercel Function Logs (Step 2) - that will tell you EXACTLY what's wrong!

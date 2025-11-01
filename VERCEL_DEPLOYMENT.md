# Vercel Deployment Guide for AgroConnect Backend

## Important: Environment Variables

Make sure ALL these environment variables are set in your Vercel project settings:

### Required Variables:

1. **MONGODB_URI** - Your MongoDB connection string

   - Example:
     `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
   - ⚠️ Make sure your MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs) or add Vercel's
     IP ranges

2. **JWT_SECRET** - Secret key for JWT tokens
3. **ALLOWED_ORIGINS** - Comma-separated frontend URLs

   - Example: `https://yourdomain.com,https://www.yourdomain.com`

4. **CLOUDINARY_CLOUD_NAME**
5. **CLOUDINARY_API_KEY**
6. **CLOUDINARY_API_SECRET**

7. **EMAIL_HOST**
8. **EMAIL_PORT**
9. **EMAIL_USER**
10. **EMAIL_PASSWORD**
11. **EMAIL_FROM**

### Optional:

- **NODE_ENV** - Will be set to "production" automatically by Vercel

## How to Add Environment Variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in the sidebar
4. Add each variable one by one
5. Make sure to select "Production", "Preview", and "Development" for each variable
6. Click "Save"

## MongoDB Atlas Network Access:

1. Log in to MongoDB Atlas
2. Go to "Network Access" in the left sidebar
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
5. Click "Confirm"

⚠️ **Note**: In production, you should restrict this to specific IPs for security.

## Deployment:

Once environment variables are set:

```bash
git add .
git commit -m "Fix Vercel serverless deployment"
git push
```

Vercel will automatically redeploy.

## Checking Logs:

1. Go to your Vercel project
2. Click on the deployment
3. Click "Functions" tab
4. Click on any function to see logs
5. Look for MongoDB connection errors or missing environment variables

## Known Limitations on Vercel:

- ❌ **Socket.IO won't work** (serverless limitation)
  - Consider deploying Socket.IO separately on Railway, Render, or Heroku
  - Or use polling/webhooks for real-time features
- ⚠️ **File uploads** go to `/tmp` directory (gets cleared)
  - Use Cloudinary for all file uploads (already implemented)
- ⏱️ **10-second timeout** on hobby plan
  - Long-running operations may fail
  - Upgrade to Pro for 60-second timeout if needed

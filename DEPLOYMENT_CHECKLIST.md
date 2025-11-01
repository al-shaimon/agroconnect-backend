# Vercel Deployment Checklist ✅

Before deploying, make sure you've completed ALL these steps:

## 1. MongoDB Atlas Configuration

- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0` (all IPs)
- [ ] MongoDB connection string is correct and accessible
- [ ] Database user has proper read/write permissions

## 2. Vercel Environment Variables

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables (mark all: Production, Preview, Development):

- [ ] `MONGODB_URI` - Your full MongoDB connection string
- [ ] `JWT_SECRET` - A secure random string
- [ ] `ALLOWED_ORIGINS` - Your frontend URLs (comma-separated)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`
- [ ] `EMAIL_FROM`

## 3. Code Changes

- [ ] All changes committed and pushed to GitHub
- [ ] `vercel.json` file exists
- [ ] `server.js` exports the app for serverless

## 4. Deployment

```bash
git add .
git commit -m "Configure for Vercel serverless deployment"
git push
```

## 5. After Deployment - Testing

### Test 1: Health Check

```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "AgroConnect API Health Check",
  "database": {
    "status": "connected"
  }
}
```

### Test 2: Root Endpoint

```bash
curl https://your-domain.vercel.app/
```

### Test 3: Login Endpoint

```bash
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agroconnect.com","password":"admin123"}'
```

## 6. Check Logs

If anything fails:

1. Go to Vercel Dashboard
2. Select your deployment
3. Click "Functions" tab
4. Click "server.js" to see logs
5. Look for errors in red

## Common Issues & Solutions

### "Operation buffering timed out"

- ❌ Problem: MongoDB not connected
- ✅ Solution: Check `MONGODB_URI` in Vercel env vars
- ✅ Solution: Verify MongoDB Atlas network access

### "FUNCTION_INVOCATION_FAILED"

- ❌ Problem: Code error or missing dependencies
- ✅ Solution: Check function logs in Vercel
- ✅ Solution: Verify all environment variables are set

### "Database connection unavailable"

- ❌ Problem: MongoDB connection failed
- ✅ Solution: Test your MONGODB_URI locally first
- ✅ Solution: Check MongoDB Atlas is not paused/down

## Support Resources

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- Your deployment logs: Vercel Dashboard → Deployments → Functions

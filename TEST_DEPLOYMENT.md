# Quick Deployment Test

## 1. Test Health Endpoint

Open in browser or use curl:

```
https://api.agroconnect.alshaimon.com/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "AgroConnect API Health Check",
  "database": {
    "status": "connected",
    "host": "your-cluster.mongodb.net"
  },
  "environment": "production"
}
```

## 2. Test Root Endpoint

```
https://api.agroconnect.alshaimon.com/
```

Expected:

```json
{
  "success": true,
  "message": "Welcome to AgroConnect API",
  "version": "1.0.0"
}
```

## 3. Test Login Endpoint (PowerShell)

```powershell
$body = @{
    email = "admin@agroconnect.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.agroconnect.alshaimon.com/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

## 4. Test Login (curl - if you have it installed)

```bash
curl -X POST https://api.agroconnect.alshaimon.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@agroconnect.com\",\"password\":\"admin123\"}"
```

## What to check if it fails:

### If you get 503 (Service Unavailable):

- Database connection failed
- Check Vercel env vars for `MONGODB_URI`
- Check MongoDB Atlas network access

### If you get 500 (Internal Server Error):

- Check Vercel function logs
- Go to: https://vercel.com/dashboard → Your Project → Deployments → Click latest → Functions →
  server.js

### If you get CORS errors:

- Check `ALLOWED_ORIGINS` in Vercel env vars
- Should include your frontend URL

### If endpoint returns 404:

- Routes might not be loading properly
- Check Vercel build logs

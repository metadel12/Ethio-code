# 🚀 Render Deployment Guide - EthioCode

## Overview

This guide will help you deploy EthioCode to Render.com with proper configuration for both backend and frontend.

---

## 📋 Prerequisites

- Render account (https://render.com)
- GitHub/GitLab repository with your code
- MongoDB Atlas account (for database)
- Redis Cloud account (optional, for caching)

---

## 🔧 Backend Deployment

### Step 1: Create Web Service

1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Configure:

```yaml
Name: ethiocode-backend
Environment: Docker
Region: Choose closest to your users
Branch: main
Root Directory: backend
```

### Step 2: Environment Variables

Add these in Render dashboard:

```bash
# Required
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/ethiocode
SECRET_KEY=your-super-secret-key-min-32-chars
REDIS_URL=redis://default:password@redis-host:port

# Optional
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://your-frontend.onrender.com
ENVIRONMENT=production
```

### Step 3: Dockerfile (Already Updated)

The `backend/Dockerfile` has been updated with:
- Python 3.11 (stable for Render)
- System dependencies (gcc, g++, gfortran)
- NumPy/scientific package support
- Optimized for production

### Step 4: Deploy

Click **"Create Web Service"** and wait for deployment.

**Your backend will be at:** `https://ethiocode-backend.onrender.com`

---

## 🎨 Frontend Deployment

### Step 1: Create Static Site

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect your repository
4. Configure:

```yaml
Name: ethiocode-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### Step 2: Environment Variables

Add in Render dashboard:

```bash
VITE_API_URL=https://ethiocode-backend.onrender.com
```

### Step 3: Build Settings

Render will automatically:
- Install dependencies
- Run build command
- Deploy to CDN

**Your frontend will be at:** `https://ethiocode-frontend.onrender.com`

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all)

### Step 2: Get Connection String

```
mongodb+srv://username:password@cluster.mongodb.net/ethiocode?retryWrites=true&w=majority
```

### Step 3: Add to Render

Add as `MONGODB_URL` environment variable in backend service.

---

## 🔴 Redis Setup (Optional)

### Option 1: Redis Cloud (Recommended)

1. Go to https://redis.com/try-free/
2. Create free database
3. Get connection string
4. Add as `REDIS_URL` in Render

### Option 2: Render Redis (Paid)

1. Create Redis instance on Render
2. Use internal connection string

---

## 🔒 Security Checklist

- [ ] Set strong `SECRET_KEY` (min 32 characters)
- [ ] Configure `CORS_ORIGINS` to your frontend URL
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Render)
- [ ] Whitelist only necessary IPs in MongoDB
- [ ] Set up monitoring and alerts

---

## 🚨 Common Issues & Solutions

### Issue 1: NumPy/Pandas Installation Fails

**Solution:** Dockerfile already includes system dependencies:
```dockerfile
RUN apt-get update && apt-get install -y \
    gcc g++ gfortran libopenblas-dev liblapack-dev
```

### Issue 2: Build Timeout

**Solution:** Upgrade to paid plan or optimize dependencies:
```bash
# In requirements.txt, use specific versions
numpy==1.24.3
pandas==2.0.3
```

### Issue 3: Database Connection Failed

**Solution:** Check MongoDB Atlas:
- Whitelist IP: `0.0.0.0/0`
- Verify connection string
- Check username/password

### Issue 4: CORS Errors

**Solution:** Add frontend URL to backend environment:
```bash
CORS_ORIGINS=https://ethiocode-frontend.onrender.com
```

### Issue 5: Cold Starts (Free Tier)

**Solution:** 
- Upgrade to paid plan
- Or use cron job to keep alive:
  ```bash
  # Use cron-job.org to ping every 10 minutes
  https://ethiocode-backend.onrender.com/health
  ```

---

## 📊 Monitoring

### Health Check Endpoint

Add to your FastAPI app:

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }
```

### Render Dashboard

Monitor:
- Deployment logs
- Runtime logs
- Metrics (CPU, Memory)
- Request count

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push

Render automatically deploys when you push to main branch.

### Manual Deploy

1. Go to service dashboard
2. Click **"Manual Deploy"**
3. Select branch
4. Click **"Deploy"**

---

## 💰 Cost Estimation

### Free Tier
- Backend: Free (with cold starts)
- Frontend: Free
- MongoDB Atlas: Free (512MB)
- Redis Cloud: Free (30MB)

**Total: $0/month**

### Paid Tier (Recommended for Production)
- Backend: $7/month (no cold starts)
- Frontend: Free
- MongoDB Atlas: $9/month (2GB)
- Redis: $5/month (250MB)

**Total: ~$21/month**

---

## 🎯 Deployment Checklist

### Before Deployment

- [ ] Update Dockerfile (already done)
- [ ] Set up MongoDB Atlas
- [ ] Set up Redis (optional)
- [ ] Prepare environment variables
- [ ] Test locally with Docker
- [ ] Commit and push to GitHub

### During Deployment

- [ ] Create backend web service
- [ ] Add environment variables
- [ ] Wait for build to complete
- [ ] Test backend API
- [ ] Create frontend static site
- [ ] Add VITE_API_URL
- [ ] Wait for build to complete
- [ ] Test frontend

### After Deployment

- [ ] Test all features
- [ ] Check logs for errors
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)
- [ ] Set up SSL (automatic)
- [ ] Enable auto-deploy

---

## 🌐 Custom Domain (Optional)

### Backend

1. Go to backend service settings
2. Click **"Custom Domain"**
3. Add: `api.yourdomain.com`
4. Update DNS records

### Frontend

1. Go to frontend site settings
2. Click **"Custom Domain"**
3. Add: `yourdomain.com`
4. Update DNS records

---

## 📝 render.yaml (Infrastructure as Code)

Create `render.yaml` in project root for automated setup:

```yaml
services:
  # Backend API
  - type: web
    name: ethiocode-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    envVars:
      - key: MONGODB_URL
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: REDIS_URL
        sync: false
      - key: ENVIRONMENT
        value: production

  # Frontend
  - type: web
    name: ethiocode-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://ethiocode-backend.onrender.com

databases:
  # Optional: Render PostgreSQL
  - name: ethiocode-db
    databaseName: ethiocode
    user: ethiocode
```

---

## 🔧 Troubleshooting Commands

### View Logs
```bash
# In Render dashboard
Logs → View logs
```

### SSH into Container (Paid Plan)
```bash
# In Render dashboard
Shell → Open shell
```

### Test Locally with Docker
```bash
# Build
docker build -t ethiocode-backend ./backend

# Run
docker run -p 8000:8000 \
  -e MONGODB_URL=your-url \
  -e SECRET_KEY=your-key \
  ethiocode-backend

# Test
curl http://localhost:8000/health
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Redis Cloud Docs](https://docs.redis.com/latest/rc/)

---

## 🆘 Support

### Render Support
- Dashboard: https://dashboard.render.com
- Community: https://community.render.com
- Status: https://status.render.com

### EthioCode Issues
- Check logs in Render dashboard
- Review environment variables
- Test database connections
- Verify CORS settings

---

## 🎉 Success!

Once deployed, your app will be live at:
- **Frontend:** https://ethiocode-frontend.onrender.com
- **Backend:** https://ethiocode-backend.onrender.com
- **API Docs:** https://ethiocode-backend.onrender.com/docs

**Congratulations on deploying to production! 🚀**

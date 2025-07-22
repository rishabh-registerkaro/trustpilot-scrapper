# 🚀 Deployment Guide - Trustpilot Scraper

This guide explains how to deploy your Trustpilot scraper to Render.com using Docker.

## 📦 What I Built for You

### **Docker Configuration Files:**
- `Dockerfile` - Production-ready container setup
- `.dockerignore` - Excludes unnecessary files from build
- `docker-compose.yml` - Local development setup
- `render.yaml` - Render.com deployment configuration

### **Application Updates:**
- Updated `app.js` with production host binding
- Added Docker scripts to `package.json`
- Environment variable configuration
- Health check endpoint for monitoring

## 🐳 Docker Features

### **Security & Performance:**
- ✅ **Non-root user** - Runs as `pptruser` for security
- ✅ **Minimal base image** - `node:18-slim` for smaller size
- ✅ **Puppeteer dependencies** - All Chrome dependencies included
- ✅ **Health checks** - Automatic service monitoring
- ✅ **Production optimized** - Only production dependencies installed

### **Puppeteer Compatibility:**
- ✅ **All required libraries** - Chrome/Chromium dependencies
- ✅ **Font support** - For proper text rendering
- ✅ **Audio/video permissions** - For complete browser functionality
- ✅ **Security sandbox** - Proper browser isolation

## 🧪 Local Testing

### **1. Test with Docker Locally:**
```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Test the API
curl http://localhost:3001/health
curl http://localhost:3001/scrape/safeledger
```

### **2. Test with Docker Compose:**
```bash
# Start everything
docker-compose up

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

## 🌐 Deploy to Render.com

### **Step 1: Prepare Your Repository**
```bash
# Make sure all files are committed
git add .
git commit -m "Add Docker deployment configuration"
git push origin main
```

### **Step 2: Create Render Service**

#### **Option A: Using render.yaml (Recommended)**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click "Apply" to deploy

#### **Option B: Manual Setup**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure settings:
   - **Environment**: `Docker`
   - **Build Command**: Leave empty (Docker handles it)
   - **Start Command**: `node app.js`
   - **Health Check Path**: `/health`

### **Step 3: Environment Variables**
Set these in Render dashboard:
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

### **Step 4: Deploy!**
- Render will automatically build and deploy
- Build time: ~5-10 minutes (first time)
- Your API will be available at: `https://your-service-name.onrender.com`

## 🔧 Configuration Options

### **Render.yaml Settings:**
```yaml
services:
  - type: web
    name: trustpilot-scraper
    env: docker
    region: oregon          # Change region if needed
    plan: starter          # Free tier (upgrade for production)
    branch: main           # Your git branch
    healthCheckPath: /health
```

### **Available Regions:**
- `oregon` (US West)
- `ohio` (US East) 
- `frankfurt` (Europe)
- `singapore` (Asia)

### **Available Plans:**
- `starter` - Free (512MB RAM, sleeps after 15min inactivity)
- `standard` - $7/month (512MB RAM, always on)
- `pro` - $25/month (1GB RAM, better performance)

## 🔍 Monitoring & Debugging

### **Health Check Endpoint:**
```bash
curl https://your-app.onrender.com/health
```

### **API Endpoints:**
```bash
# Main API documentation
curl https://your-app.onrender.com/

# Scrape SafeLedger reviews
curl https://your-app.onrender.com/scrape/safeledger

# Custom company scraping
curl -X POST https://your-app.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.trustpilot.com/review/example.com"}'
```

### **Render Logs:**
- View real-time logs in Render dashboard
- Check "Events" tab for deployment status
- Monitor "Metrics" for performance

## ⚠️ Important Notes

### **Free Tier Limitations:**
- **Sleeps after 15 minutes** of inactivity
- **Cold start time** ~30 seconds when waking up
- **512MB RAM limit** - sufficient for most scraping tasks
- **No persistent disk storage**

### **Production Recommendations:**
- **Upgrade to paid plan** for always-on service
- **Add custom domain** for professional API
- **Set up monitoring** alerts
- **Consider rate limiting** for public APIs

### **Puppeteer Considerations:**
- **Memory usage** can be high during scraping
- **Browser processes** are properly cleaned up
- **Timeouts** are configured for reliability
- **User agent rotation** helps avoid blocking

## 🚀 Deployment Commands Summary

```bash
# Local testing
npm run docker:build
npm run docker:run

# Docker Compose
docker-compose up -d

# Git deployment
git add .
git commit -m "Deploy to Render"
git push origin main
```

## 🆘 Troubleshooting

### **Build Fails:**
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check Render build logs

### **App Won't Start:**
- Verify PORT and HOST environment variables
- Check app.js syntax
- Review Render service logs

### **Scraping Fails:**
- Puppeteer dependencies missing → Check Dockerfile
- Memory limits exceeded → Upgrade plan
- Rate limiting → Add delays between requests

### **API Not Responding:**
- Service sleeping (free tier) → Upgrade or ping regularly
- Wrong port configuration → Check environment variables
- Health check failing → Verify /health endpoint

## 📧 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test locally with Docker first
4. Check Puppeteer browser launch settings

Your Trustpilot scraper is now ready for production deployment! 🎉 
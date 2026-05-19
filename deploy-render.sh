#!/bin/bash

# EthioCode Render Deployment Script
# This script helps prepare your project for Render deployment

echo "🚀 EthioCode Render Deployment Preparation"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Are you in the project root?"
    exit 1
fi

echo "✅ Found render.yaml"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Warning: Docker not found. Install Docker to test locally."
else
    echo "✅ Docker is installed"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo ""

# Check backend Dockerfile
if [ -f "backend/Dockerfile" ]; then
    echo "✅ Backend Dockerfile exists"
else
    echo "❌ Backend Dockerfile missing"
fi

# Check frontend package.json
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "❌ Frontend package.json missing"
fi

# Check backend requirements.txt
if [ -f "backend/requirements.txt" ]; then
    echo "✅ Backend requirements.txt exists"
else
    echo "❌ Backend requirements.txt missing"
fi

echo ""
echo "🔧 Next Steps:"
echo ""
echo "1. Set up MongoDB Atlas:"
echo "   → https://cloud.mongodb.com"
echo "   → Create cluster and get connection string"
echo ""
echo "2. Set up Redis Cloud (optional):"
echo "   → https://redis.com/try-free/"
echo "   → Create database and get connection string"
echo ""
echo "3. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "4. Deploy on Render:"
echo "   → Go to https://dashboard.render.com"
echo "   → Click 'New +' → 'Blueprint'"
echo "   → Connect repository"
echo "   → Render will use render.yaml automatically"
echo ""
echo "5. Add Environment Variables in Render:"
echo "   → MONGODB_URL (from MongoDB Atlas)"
echo "   → REDIS_URL (from Redis Cloud)"
echo "   → SECRET_KEY (will be auto-generated)"
echo ""
echo "📖 Full guide: See RENDER_DEPLOYMENT.md"
echo ""
echo "🎉 Good luck with your deployment!"

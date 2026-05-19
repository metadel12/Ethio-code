@echo off
REM EthioCode Render Deployment Script for Windows
REM This script helps prepare your project for Render deployment

echo.
echo ========================================
echo   EthioCode Render Deployment Preparation
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "render.yaml" (
    echo [ERROR] render.yaml not found. Are you in the project root?
    exit /b 1
)

echo [OK] Found render.yaml
echo.

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker not found. Install Docker to test locally.
) else (
    echo [OK] Docker is installed
)

echo.
echo Pre-deployment Checklist:
echo.

REM Check backend Dockerfile
if exist "backend\Dockerfile" (
    echo [OK] Backend Dockerfile exists
) else (
    echo [ERROR] Backend Dockerfile missing
)

REM Check frontend package.json
if exist "frontend\package.json" (
    echo [OK] Frontend package.json exists
) else (
    echo [ERROR] Frontend package.json missing
)

REM Check backend requirements.txt
if exist "backend\requirements.txt" (
    echo [OK] Backend requirements.txt exists
) else (
    echo [ERROR] Backend requirements.txt missing
)

echo.
echo Next Steps:
echo.
echo 1. Set up MongoDB Atlas:
echo    - Go to https://cloud.mongodb.com
echo    - Create cluster and get connection string
echo.
echo 2. Set up Redis Cloud (optional):
echo    - Go to https://redis.com/try-free/
echo    - Create database and get connection string
echo.
echo 3. Push to GitHub:
echo    git add .
echo    git commit -m "Prepare for Render deployment"
echo    git push origin main
echo.
echo 4. Deploy on Render:
echo    - Go to https://dashboard.render.com
echo    - Click 'New +' - 'Blueprint'
echo    - Connect repository
echo    - Render will use render.yaml automatically
echo.
echo 5. Add Environment Variables in Render:
echo    - MONGODB_URL (from MongoDB Atlas)
echo    - REDIS_URL (from Redis Cloud)
echo    - SECRET_KEY (will be auto-generated)
echo.
echo Full guide: See RENDER_DEPLOYMENT.md
echo.
echo Good luck with your deployment!
echo.
pause

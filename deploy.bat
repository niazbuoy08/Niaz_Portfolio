@echo off
REM Niaz Portfolio - Vercel Deployment Script for Windows
REM This script helps deploy both frontend and backend to Vercel

echo 🚀 Starting Niaz Portfolio Deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

echo 🔍 Choose deployment option:
echo 1. Deploy Backend only
echo 2. Deploy Frontend only
echo 3. Deploy Both (Recommended)
set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" goto deploy_backend
if "%choice%"=="2" goto deploy_frontend
if "%choice%"=="3" goto deploy_both
echo ❌ Invalid choice. Exiting...
exit /b 1

:deploy_backend
echo 📦 Deploying Backend...
cd Backend
echo 📥 Installing backend dependencies...
npm install
echo 🚀 Deploying backend to Vercel...
vercel --prod
cd ..
echo ✅ Backend deployment completed!
goto end

:deploy_frontend
echo 🎨 Deploying Frontend...
cd Frontend
echo 📥 Installing frontend dependencies...
npm install
echo 🔨 Building frontend...
npm run build
echo 🚀 Deploying frontend to Vercel...
vercel --prod
cd ..
echo ✅ Frontend deployment completed!
goto end

:deploy_both
echo 📦 Deploying Backend...
cd Backend
echo 📥 Installing backend dependencies...
npm install
echo 🚀 Deploying backend to Vercel...
vercel --prod
cd ..
echo ✅ Backend deployment completed!

echo ⏳ Waiting 10 seconds before frontend deployment...
timeout /t 10 /nobreak >nul

echo 🎨 Deploying Frontend...
cd Frontend
echo 📥 Installing frontend dependencies...
npm install
echo 🔨 Building frontend...
npm run build
echo 🚀 Deploying frontend to Vercel...
vercel --prod
cd ..
echo ✅ Frontend deployment completed!

:end
echo 🎉 Deployment process completed!
echo 📋 Next steps:
echo 1. Update environment variables in Vercel dashboard
echo 2. Test your deployed applications
echo 3. Configure custom domains (optional)
pause
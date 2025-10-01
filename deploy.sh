#!/bin/bash

# Niaz Portfolio - Vercel Deployment Script
# This script helps deploy both frontend and backend to Vercel

echo "🚀 Starting Niaz Portfolio Deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Function to deploy backend
deploy_backend() {
    echo "📦 Deploying Backend..."
    cd Backend
    
    # Install dependencies
    echo "📥 Installing backend dependencies..."
    npm install
    
    # Deploy to Vercel
    echo "🚀 Deploying backend to Vercel..."
    vercel --prod
    
    cd ..
    echo "✅ Backend deployment completed!"
}

# Function to deploy frontend
deploy_frontend() {
    echo "🎨 Deploying Frontend..."
    cd Frontend
    
    # Install dependencies
    echo "📥 Installing frontend dependencies..."
    npm install
    
    # Build the project
    echo "🔨 Building frontend..."
    npm run build
    
    # Deploy to Vercel
    echo "🚀 Deploying frontend to Vercel..."
    vercel --prod
    
    cd ..
    echo "✅ Frontend deployment completed!"
}

# Main deployment process
echo "🔍 Choose deployment option:"
echo "1. Deploy Backend only"
echo "2. Deploy Frontend only"
echo "3. Deploy Both (Recommended)"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        deploy_backend
        ;;
    2)
        deploy_frontend
        ;;
    3)
        deploy_backend
        echo "⏳ Waiting 10 seconds before frontend deployment..."
        sleep 10
        deploy_frontend
        ;;
    *)
        echo "❌ Invalid choice. Exiting..."
        exit 1
        ;;
esac

echo "🎉 Deployment process completed!"
echo "📋 Next steps:"
echo "1. Update environment variables in Vercel dashboard"
echo "2. Test your deployed applications"
echo "3. Configure custom domains (optional)"
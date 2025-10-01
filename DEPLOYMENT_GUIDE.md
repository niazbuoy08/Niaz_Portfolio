# Vercel Deployment Guide for Niaz Portfolio

This guide will help you deploy your full-stack portfolio project to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Set up a cloud database (free tier available)

## Step 1: Prepare Your Database

### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and new cluster
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel deployment
5. Get your connection string (replace `<password>` with your actual password)

## Step 2: Deploy Backend to Vercel

### 2.1 Backend Environment Variables
In your Vercel dashboard for the backend project, add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/niaz_portfolio
PORT=5000
MAX_FILE_SIZE=20971520
UPLOAD_PATH=uploads/
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 2.2 Deploy Backend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `Backend` folder as the root directory
5. Vercel will auto-detect it as a Node.js project
6. Add the environment variables listed above
7. Deploy the project
8. Note your backend URL (e.g., `https://your-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

### 3.1 Update Frontend Configuration
Before deploying the frontend, create a `.env` file in the Frontend directory:

```
VITE_API_URL=https://your-backend-domain.vercel.app
VITE_BACKEND_URL=https://your-backend-domain.vercel.app
```

### 3.2 Deploy Frontend
1. In Vercel Dashboard, click "New Project" again
2. Import the same GitHub repository
3. Select the `Frontend` folder as the root directory
4. Vercel will auto-detect it as a Vite project
5. Add the environment variables:
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app
   VITE_BACKEND_URL=https://your-backend-domain.vercel.app
   ```
6. Deploy the project

## Step 4: Update CORS Configuration

After both deployments are complete:

1. Go to your backend Vercel project settings
2. Add your frontend URL to the `FRONTEND_URL` environment variable
3. Redeploy the backend if needed

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Test all functionality:
   - Navigation
   - Contact forms
   - Image uploads
   - Admin panel (if applicable)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend URL is added to the backend's CORS configuration
2. **Database Connection**: Verify your MongoDB Atlas connection string and IP whitelist
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **File Uploads**: Vercel has a 50MB limit for serverless functions

### File Upload Limitations
- Vercel serverless functions have a 50MB payload limit
- For larger files, consider using cloud storage (AWS S3, Cloudinary)

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/niaz_portfolio
PORT=5000
MAX_FILE_SIZE=20971520
UPLOAD_PATH=uploads/
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-domain.vercel.app
VITE_BACKEND_URL=https://your-backend-domain.vercel.app
```

## Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Database connected
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] All features tested
- [ ] Custom domain configured (optional)

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection

Your portfolio should now be live and accessible worldwide! 🚀
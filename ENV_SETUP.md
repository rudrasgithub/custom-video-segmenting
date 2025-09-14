# Environment Configuration Guide

## 📋 Environment Variables Setup

### 🖥️ Development
- Uses `.env` and `.env.development`
- Backend URL: `http://localhost:3000`
- Automatically detected when running `npm run dev`

### 🚀 Production (Vercel)
- Uses `.env.production` as template
- **MUST** be configured in Vercel Dashboard
- Backend URL: Your deployed backend Vercel app URL

## 🔧 Vercel Deployment Setup

### 1. Deploy Backend First
```bash
cd backend
vercel --prod
```
**Note down the backend URL** (e.g., `https://custom-video-backend-xyz.vercel.app`)

### 2. Deploy Frontend with Environment Variable
```bash
cd frontend
vercel --prod
```

### 3. Configure Frontend Environment in Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Frontend Project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_BACKEND_URL` | `https://your-backend-app.vercel.app` | Production |

### 4. Redeploy Frontend
After setting the environment variable:
```bash
vercel --prod --force
```

## 🧪 Testing Environment Configuration

The app will log the current environment configuration in the browser console:
```javascript
Environment: {
  mode: "development" | "production",
  isDevelopment: true | false,
  isProduction: true | false,
  backendUrl: "http://localhost:3000" | "https://your-backend.vercel.app"
}
```

## 📁 Environment Files Structure

```
frontend/
├── .env                    # Development (localhost:3000)
├── .env.development       # Development (localhost:3000) 
├── .env.production        # Production template
└── .env.local             # Local overrides (gitignored)
```

## 🔒 Security Notes

- ✅ `.env.development` and `.env.production` are tracked in git (safe for frontend)
- ✅ `.env.local` and `*.local` files are gitignored (for secrets)
- ✅ All environment variables are prefixed with `VITE_` (required for Vite)
- ✅ Backend URL is public information (safe to commit)

## 🚨 Important Deployment Steps

1. **Always deploy backend first** to get the URL
2. **Set `VITE_BACKEND_URL` in Vercel** before deploying frontend
3. **Redeploy frontend** after setting environment variables
4. **Test the deployed app** to ensure API calls work

## 🐛 Troubleshooting

### Frontend can't connect to backend:
1. Check browser network tab for failed requests
2. Verify `VITE_BACKEND_URL` is set correctly in Vercel
3. Check console for environment configuration
4. Ensure backend is deployed and accessible

### Environment variable not updating:
1. Clear browser cache
2. Redeploy with `vercel --prod --force`
3. Check Vercel dashboard for correct variable settings

# 🚀 Backend Deployment Guide

## ⚡ Quick Deploy to Railway (Recommended)

Railway offers **free tier** with auto-scaling, makes deployment super easy.

### Step 1: Setup Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Step 2: Deploy Backend

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create railway.json in project root
```

Create `railway.json` in project root:
```json
{
  "buildCommand": "cd backend && npm install && npm run build",
  "startCommand": "cd backend && npm start",
  "envPrefix": "BACKEND_"
}
```

```bash
# Deploy
railway up
```

### Step 3: Set Environment Variables in Railway Dashboard

1. Go to your Railway project
2. Click on "Variables"
3. Add these:
   - `GEMINI_API_KEY` - Your Gemini API key
   - `NODE_ENV` - Set to `production`
   - `PORT` - Leave empty (Railway auto-assigns)
   - `FRONTEND_URL` - Your GitHub Pages URL: `https://phuong0511.github.io/translateChinesev1.0.0.1`

### Step 4: Get Your Backend URL
- Railway shows your public URL
- Example: `https://chinese-translator-prod-xxxxx.railway.app`
- Copy this URL

---

## 🔐 Update Frontend with Backend URL

Edit `.env.local`:
```
VITE_BACKEND_URL=https://chinese-translator-prod-xxxxx.railway.app
```

Then rebuild and deploy frontend:
```bash
npm run build
npm run deploy
```

---

## 🛠️ Alternative: Deploy to Render

If Railway doesn't work, use **Render.com** (also free tier):

### Step 1: Create `render.yaml`

```yaml
services:
  - type: web
    name: chinese-translator-backend
    runtime: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: GEMINI_API_KEY
        scope: build,runtime
      - key: NODE_ENV
        value: production
      - key: FRONTEND_URL
        value: https://phuong0511.github.io/translateChinesev1.0.0.1
```

### Step 2: Deploy
1. Push to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repo
5. Render auto-deploys

---

## ✅ Verify Deployment

Once deployed, test the backend:

```bash
# Test health check
curl https://your-backend-url/health

# Test translation API
curl -X POST https://your-backend-url/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好",
    "context": "简单的问候",
    "mode": "translate"
  }'
```

---

## 🔒 Security Checklist

✅ API Key stored in backend environment variables (not in code)  
✅ API Key never exposed to frontend  
✅ CORS restricted to your GitHub Pages domain  
✅ Input validation on all endpoints  
✅ Rate limiting (add later if needed)  
✅ Environment variables per deployment  

---

## 📊 Environment Variables Summary

### Frontend (.env.local)
```
VITE_BACKEND_URL=<your_backend_url>
VITE_FIREBASE_API_KEY=<firebase_key>
... (Firebase config)
```

### Backend (.env)
```
GEMINI_API_KEY=<your_gemini_api_key>
NODE_ENV=production
FRONTEND_URL=<your_github_pages_url>
PORT=3001
```

---

## 🐛 Debugging

If translation fails:

1. **Check Backend Health**
   ```bash
   curl https://your-backend-url/health
   ```

2. **Check Logs**
   - Railway: Dashboard → Logs
   - Render: Dashboard → Logs

3. **Check API Key**
   - Verify GEMINI_API_KEY is set
   - Test key at https://makersuite.google.com

4. **Check CORS**
   - Verify FRONTEND_URL in backend matches your domain
   - Check browser console for CORS errors

5. **Check Frontend**
   - Verify VITE_BACKEND_URL in .env.local is correct
   - Check Network tab in DevTools

---

## 🎯 Final Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Environment variables set on backend
- [ ] FRONTEND_URL points to your GitHub Pages URL
- [ ] Frontend .env.local has correct VITE_BACKEND_URL
- [ ] Health check returns `{"status": "ok"}`
- [ ] Test translation works in app
- [ ] GitHub Pages frontend communicates with backend successfully

✅ You're done! Your app is now **secure** with API key protected on backend.

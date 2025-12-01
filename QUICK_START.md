# 🚀 Quick Start Guide

## For Evaluators

### Access the Live App

1. **Visit**: https://your-project-name.vercel.app
2. **Click**: "Login with Google"
3. **Use test account**: `testingcheckuser1234@gmail.com`
4. **Try commands**:
   - "Show me my latest emails"
   - "Reply to email #1"
   - "Delete email #2" → "yes delete it"
   - "Categorize my inbox"
   - "Give me today's email digest"

---

## For Deployment

### Step 1: Push to GitHub (2 minutes)

```bash
cd /home/satvik/Desktop/conass

# Initialize and push
git init
git add .
git commit -m "Initial commit: AI Email Assistant"
git remote add origin https://github.com/YOUR_USERNAME/ai-email-assistant.git
git push -u origin main
```

### Step 2: Deploy Backend to Render (5 minutes)

1. Go to [render.com](https://render.com) → Login with GitHub
2. New Project → Deploy from GitHub repo
3. Select `ai-email-assistant`
4. Settings → Root Directory: `backend`
5. Settings → Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Variables → Add all from `backend/.env` (update GOOGLE_REDIRECT_URI and FRONTEND_URL later)
7. Deploy → Copy Render URL

### Step 3: Deploy Frontend to Vercel (3 minutes)

```bash
cd frontend
vercel --prod
# Follow prompts, select defaults
# After deploy, add environment variable:
# NEXT_PUBLIC_API_URL = your-railway-url
# Redeploy: vercel --prod
```

### Step 4: Configure OAuth (2 minutes)

1. [Google Cloud Console](https://console.cloud.google.com/)
2. OAuth consent screen → Test users → Add `testingcheckuser1234@gmail.com`
3. Credentials → OAuth Client → Add redirect URI: `https://your-vercel-app.vercel.app/auth/callback`
4. Render → Update `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` with your Vercel URL

### Step 5: Update README (1 minute)

Replace placeholder URLs in README.md with your actual:
- Vercel URL
- Render URL

```bash
git add README.md
git commit -m "Update: Live deployment URLs"
git push
```

---

## Total Time: ~15 minutes

**Documentation**: 
- Full guide: [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
- Complete README: [`README.md`](README.md)

**Code Quality**: 
- ✅ Ruff (backend): 0 errors
- ✅ ESLint (frontend): 0 errors
- ✅ Type-safe with Pydantic + TypeScript

# 🚀 AI Email Assistant - Complete Deployment Guide

## 📋 Deployment Checklist

Follow these steps to deploy your AI Email Assistant to production.

---

## Step 1: Prepare for GitHub

### 1.1 Create .gitignore

```bash
cd /home/satvik/Desktop/conass

cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.venv/
venv/
ENV/
env/

# Node
node_modules/
.next/
out/
build/
.DS_Store
*.pem
.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment files - IMPORTANT: Never commit these!
.env
backend/.env
frontend/.env.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# Backup files
*.backup
EOF
```

### 1.2 Create requirements.txt for Backend

```bash
cd backend
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
supabase==2.0.3
httpx==0.25.2
google-auth==2.25.2
google-auth-oauthlib==1.2.0
google-auth-httplib2==0.2.0
google-api-python-client==2.110.0
google-generativeai==0.3.1
beautifulsoup4==4.12.2
lxml==4.9.3
EOF
```

---

## Step 2: Push to GitHub

### 2.1 Initialize Git Repository

```bash
cd /home/satvik/Desktop/conass

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Email Assistant with FastAPI + Next.js

Features:
- Google OAuth2 authentication with Gmail API
- AI-powered chatbot using Google Gemini
- Email operations: read, reply, delete
- Natural language command processing
- Smart inbox categorization
- Daily email digest
- Production-ready with strict linting (Ruff + ESLint)"
```

### 2.2 Create GitHub Repository

1. Go to [github.com](https://github.com) and login
2. Click the **+** icon → **New repository**
3. Repository name: `ai-email-assistant`
4. Description: `AI-powered email assistant built with FastAPI + Next.js for Constructure AI`
5. Make it **Public**
6. **DO NOT** initialize with README (we already have one)
7. Click **Create repository**

### 2.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-email-assistant.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Render (Free Tier)

### Why Render?
- ✅ **Free tier**: 750 hours/month (enough for 1 service running 24/7)
- ✅ **No credit card required**
- ✅ Automatic HTTPS
- ✅ GitHub integration (auto-deploy on push)
- ✅ Environment variables management

### 3.1 Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click **Get Started** → **Sign up with GitHub**
3. Authorize Render to access your GitHub

### 3.2 Create Web Service

1. Click **New +** → **Web Service**
2. Connect your repository: `ai-email-assistant`
3. Configure the service:

**Basic Settings:**
- **Name**: `ai-email-assistant-backend`
- **Region**: Select closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

**Build & Deploy:**
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

**Plan:**
- Select **Free** ($0/month)

### 3.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable** for each:

```env
ENVIRONMENT=production
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8000

GOOGLE_CLIENT_ID=72427716014-pofi06hsqvkqm0l66fvvacgtfsfntejp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://YOUR-VERCEL-APP.vercel.app/auth/callback

SUPABASE_URL=https://enxptpsialeacmybofdw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVueHB0cHNpYWxlYWNteWJvZmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTY2NzQsImV4cCI6MjA4MDE3MjY3NH0.bWaFOlORBroConT7kzxJu_glegVtz6P_P7d3tmh-89M
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVueHB0cHNpYWxlYWNteWJvZmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU5NjY3NCwiZXhwIjoyMDgwMTcyNjc0fQ.6ga11_JRVm_2EYiOgu1fug7rSmOwxlB3SufMGWi88O4

GEMINI_API_KEY=AIzaSyBRJbMapGCJAVWzl_1FGCGqPHt5Q2aD4Qo

FRONTEND_URL=https://YOUR-VERCEL-APP.vercel.app

PYTHON_VERSION=3.11.0
```

**Note**: You'll update `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` after deploying frontend.

### 3.4 Deploy

1. Click **Create Web Service**
2. Render will start building and deploying (takes 3-5 minutes)
3. Once deployed, your backend URL will be shown at the top
4. It will look like: `https://ai-email-assistant-backend.onrender.com`

**Important**: Free tier services spin down after 15 minutes of inactivity. First request after idle may take 30-60 seconds to wake up.

**✅ Backend Deployed!** Copy your Render URL.

---

## Step 4: Deploy Frontend to Vercel (Free Tier)

### 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 4.2 Login to Vercel

```bash
vercel login
# Follow the email verification link
```

### 4.3 Deploy Frontend

```bash
cd /home/satvik/Desktop/conass/frontend

# Deploy to production
vercel --prod
```

Follow the prompts:
- **Set up and deploy**: `Y`
- **Which scope**: Select your account
- **Link to existing project**: `N`
- **Project name**: `ai-email-assistant` (or your choice)
- **In which directory is your code located**: `./`
- **Override settings**: `N`

### 4.4 Add Environment Variable

After deployment:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project (`ai-email-assistant`)
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend.onrender.com` (your Render URL)
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**

### 4.5 Redeploy

```bash
# Trigger redeploy with new env var
vercel --prod
```

**✅ Frontend Deployed!** Your Vercel URL: `https://your-project-name.vercel.app`

---

## Step 5: Update OAuth Redirect URIs

### 5.1 Add Test User

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Scroll to **Test users** section
5. Click **+ ADD USERS**
6. Add email: `testingcheckuser1234@gmail.com`
7. Click **SAVE**

**✅ Test user added!**

### 5.2 Update Authorized Redirect URIs

1. Still in Google Cloud Console
2. Navigate to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Add your Vercel URL:
   ```
   https://your-project-name.vercel.app/auth/callback
   ```
6. Keep the localhost URI for local development:
   ```
   http://localhost:3000/auth/callback
   ```
7. Click **SAVE**

**✅ OAuth configured!**

---

## Step 6: Update Render Environment Variables

Go back to Render dashboard:

1. Click your web service (`ai-email-assistant-backend`)
2. Go to **Environment** tab
3. Update these two variables with your actual Vercel URL:
   - `GOOGLE_REDIRECT_URI` = `https://your-project-name.vercel.app/auth/callback`
   - `FRONTEND_URL` = `https://your-project-name.vercel.app`
4. Click **Save Changes**
5. Render will automatically redeploy with new variables

**✅ Backend updated!**

---

## Step 7: Verify Deployment

### 7.1 Test Backend Health

```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{"status":"healthy","environment":"production"}
```

**Note**: If service was idle, first request may take 30-60 seconds (free tier cold start).

### 7.2 Test Frontend

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Click **Login with Google**
3. Authenticate with `testingcheckuser1234@gmail.com`
4. You should land on the chat dashboard
5. Try commands:
   - "Show me my latest emails"
   - "Reply to email #1"
   - "Delete email #2"

**✅ Full deployment complete!**

---

## 🎯 Final Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on both platforms
- [ ] Test user `testingcheckuser1234@gmail.com` added to Google OAuth
- [ ] OAuth redirect URIs updated with production URLs
- [ ] Backend health check returns 200 OK (may take 30-60s on first request)
- [ ] Can login and use the app end-to-end
- [ ] README updated with live URLs

---

## 📊 Update README with Live URLs

After deployment, update your main `README.md`:

```markdown
## 🌐 Live Demo

**🔗 Frontend**: https://your-project-name.vercel.app
**🔗 Backend API**: https://your-backend.up.railway.app
**📚 API Docs**: https://your-backend.up.railway.app/docs

### Test Account
Login with: `testingcheckuser1234@gmail.com`
```

---

## 🐛 Troubleshooting

### Backend Not Starting
- Check Render logs: Click **Logs** tab in Render dashboard
- Verify all environment variables are set correctly
- Check `requirements.txt` has all dependencies
- Ensure `PYTHON_VERSION=3.11.0` is in environment variables

### First Request is Very Slow (30-60 seconds)
- **Normal behavior**: Render free tier services sleep after 15 minutes of inactivity
- First request after idle takes time to "wake up" the service
- Subsequent requests are fast
- This is expected and not an error

### Frontend Not Connecting to Backend
- Verify `NEXT_PUBLIC_API_URL` environment variable in Vercel points to Render URL
- Check CORS settings in backend (should allow your Vercel URL)
- Open browser console for errors
- Wait 30-60 seconds if backend was idle

### OAuth Errors
- Verify redirect URI matches exactly (no trailing slash)
- Ensure test user `testingcheckuser1234@gmail.com` is added
- Check client ID and secret are correct
- Confirm Render environment variables are updated with Vercel URL

### 429 Rate Limit Errors
- Gemini free tier: 15 req/min, 1500 req/day
- Wait a few minutes and try again
- Consider upgrading Gemini API key if needed

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on push:

```bash
# Make changes
git add .
git commit -m "Update: your changes"
git push origin main

# Render auto-deploys backend
# Vercel auto-deploys frontend
```

---

## 📝 Cost Breakdown

- **Render**: Free tier (750 hours/month, services sleep after 15 min idle)
- **Vercel**: Free tier (unlimited deploys, 100GB bandwidth)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Gemini API**: Free tier (15 req/min, 1500 req/day)

**Total Cost**: $0/month (within free tier limits)

**Note**: First request to Render backend after idle period takes 30-60 seconds.

---

**Deployment complete! 🎉**

Your app is now live and ready for evaluation.

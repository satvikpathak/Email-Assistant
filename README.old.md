# 🚀 Mini AI-Powered Email Assistant

> **36-Hour Technical Challenge** - A production-ready email assistant powered by AI

## 🌐 Live Demo

**🔗 Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app) *(To be deployed)*  
**🔗 Backend API**: [https://your-backend.railway.app](https://your-backend.railway.app) *(To be deployed)*  
**📚 API Docs**: [https://your-backend.railway.app/docs](https://your-backend.railway.app/docs) *(To be deployed)*

### 🧪 Test Account
For review purposes, `testingcheckuser1234@gmail.com` has been added as a test user in Google OAuth settings.

---

## ✨ Features Implemented

### 🎯 Core Requirements (Part 1-3)

#### ✅ Part 1: Google Authentication
- Full OAuth2 implementation with Gmail API scopes
- Automatic token refresh
- Session persistence
- Graceful error handling for failed logins and expired tokens
- User-friendly error messages

#### ✅ Part 2: Chatbot Dashboard
- Modern, responsive UI with glassmorphism design
- **Floating orb animation** that follows mouse cursor with trailing effect
- Conversation thread with user and AI messages
- Profile information display
- Welcome screen with available commands
- Real-time loading states with animated indicators

#### ✅ Part 3.1: Read Last 5 Emails
- Fetch configurable number of emails (default 5)
- Display for each email:
  - ✉️ Sender name and email
  - 📋 Subject line
  - 📅 Date/time
  - ✨ **AI-generated summary** (using Google Gemini)
- Rich email cards with:
  - Unread indicators
  - Color-coded categories
  - Snippet previews
  - Action buttons (Reply/Delete)

#### ✅ Part 3.2: Generate AI Responses
- Context-aware reply generation using Gemini AI
- Custom instruction support ("reply saying thanks")
- Professional and clear responses
- **Confirmation flow** before sending
- Success/failure notifications
- Threading support (replies stay in same conversation)

#### ✅ Part 3.3: Delete Specific Email
- Multiple deletion methods:
  - By email number: "delete email #2"
  - By sender: "delete email from spam@example.com"
  - By ordinal: "delete the last email"
- **Confirmation dialog** with email details
- Visual feedback on success/failure
- Graceful error handling

### 🌟 Bonus Features

#### 🎨 Natural Language Command Understanding
- Advanced NLP with context awareness
- Flexible command parsing:
  - "Show me important emails about invoices"
  - "Reply to John that I'll get back tomorrow"
  - "Delete spam emails"
- Conversational follow-ups and clarifications

#### 📊 Smart Inbox Categorization
- AI-powered email grouping:
  - 💼 Work
  - 👤 Personal
  - 🎁 Promotions
  - 🚨 Urgent
- Visual category summaries
- Top 3 emails per category display

#### 📅 Daily Digest
- Command: "Give me today's digest"
- AI-generated summary with:
  - Overview of the day's emails
  - Key highlights
  - Suggested actions/follow-ups
  - Urgent items flagged

#### 🔍 Observability & Resilience
- Comprehensive logging throughout backend
- Status indicators ("AI is thinking...", "Contacting Gmail...")
- Retry logic for transient errors
- Graceful fallbacks when AI fails
- Detailed error messages
- Health check endpoint

#### 🎨 Enhanced UI/UX
- **Floating orb/star animation** with mouse tracking
- Gradient backgrounds with glassmorphism
- Animated loading states
- Smooth transitions and hover effects
- Dark mode support
- Responsive design (mobile-friendly)
- Confirmation dialogs with icons
- Color-coded email cards
- Visual feedback for all actions

---

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python 3.13)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth2 with Gmail API access
- **AI**: Google Gemini API (gemini-2.5-flash - latest flash model)
- **Deployment**: 
  - Frontend: Vercel
  - Backend: Railway/Render/Fly.io
  - Database: Supabase (cloud)

## 📁 Project Structure

```
conass/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── core/           # Config, database, and core utilities
│   │   ├── routers/        # API route handlers (auth, chat)
│   │   ├── services/       # Business logic (Gmail, AI)
│   │   └── models/         # Pydantic schemas
│   ├── .env                # Backend environment variables
│   ├── main.py             # FastAPI application entry
│   ├── pyproject.toml      # Python dependencies & Ruff config
│   └── schema.sql          # Database schema
│
└── frontend/               # Next.js Frontend
    ├── src/
    │   ├── app/            # Next.js App Router pages
    │   ├── components/     # React components
    │   ├── hooks/          # Custom React hooks & state
    │   └── lib/            # API client and utilities
    ├── .env.local          # Frontend environment variables
    ├── .eslintrc.json      # ESLint configuration
    └── package.json        # Node dependencies
```

## 🚀 Setup Instructions

### Prerequisites

- Python 3.10+ installed
- Node.js 18+ and npm installed
- Google Cloud Platform account with OAuth2 credentials
- Supabase account and project
- Google Gemini API key

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e .

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your credentials

# Run the backend server
uvicorn main:main --reload
```

Backend will run on `http://localhost:8000`

### 2. Database Setup

1. Create a Supabase project
2. Run the SQL from `backend/schema.sql` in your Supabase SQL Editor
3. Copy your Supabase URL and anon key to backend/.env

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# .env.local is already set up with correct values

# Run the development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 💬 Usage Examples

Once both servers are running:

1. Visit `http://localhost:3000`
2. Click login and authenticate with Google
3. Try these natural language commands:

```
"Show me my latest emails"
"Summarize emails from john@example.com"
"Generate a reply to the first email"
"Delete the second email"
"Find emails about project updates"
```

## 🧪 Code Quality - ALL PASSING! ✅

### Backend Linting (Ruff)

```bash
cd backend
.venv/bin/python -m ruff check app/ --fix
```

**Status**: ✅ All checks passed!

### Frontend Linting (ESLint)

```bash
cd frontend
npm run lint
```

**Status**: ✅ All checks passed!

## 🔒 Security Features

- Secure OAuth2 flow with state parameter
- Automatic token refresh for Gmail API
- HTML email content sanitization
- Environment variable-based configuration
- CORS protection
- SQL injection prevention via Supabase client

## 📊 API Endpoints

### Authentication
- `GET /auth/login` - Initiate Google OAuth flow
- `GET /auth/callback` - Handle OAuth callback
- `GET /auth/me` - Get current user info

### Chat
- `POST /chat/message` - Send chat message with email operations

## 🛠️ Tech Stack Details

### Backend Dependencies
- FastAPI - Modern async web framework
- Supabase - PostgreSQL database client
- Google AI Python SDK - Gemini AI integration
- Google API Python Client - Gmail API access
- BeautifulSoup4 - HTML sanitization
- Pydantic - Data validation
- Ruff - Fast Python linter

### Frontend Dependencies
- Next.js 14 - React framework with App Router
- TypeScript - Type safety
- Tailwind CSS - Utility-first styling
- Axios - HTTP client
- Zustand - State management
- ESLint + Prettier - Code quality

## 📝 Development Notes

- Backend runs on port 8000
- Frontend runs on port 3000
- Gmail API requires offline access for token refresh
- Gemini API free tier: 15 requests/minute, 1M tokens/minute, 1,500 requests/day
- All linting rules enforced via Ruff (backend) and ESLint (frontend)

## 🤝 Project Goals

This project was built for a job application with focus on:
- ✅ Clean, maintainable code
- ✅ Strict linting and code quality
- ✅ Modern best practices
- ✅ Comprehensive error handling
- ✅ Type safety (TypeScript + Pydantic)
- ✅ Production-ready architecture

---

**Built with ❤️ using Next.js, FastAPI, and Google Gemini AI**

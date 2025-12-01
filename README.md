# AI-Powered Email Assistant

An intelligent email management system combining Google Gmail API with AI-powered natural language processing for conversational email management.

## Live Demo

- **Frontend**: [https://email-assistant-roan.vercel.app](https://email-assistant-roan.vercel.app)
- **Backend API**: [https://email-assistant-tgtp.onrender.com](https://email-assistant-tgtp.onrender.com)
- **API Docs**: [https://email-assistant-tgtp.onrender.com/docs](https://email-assistant-tgtp.onrender.com/docs)
- **GitHub**: [https://github.com/satvikpathak/Email-Assistant](https://github.com/satvikpathak/Email-Assistant)

---

## Features

- **OAuth2 Authentication** - Secure Google login with automatic token refresh
- **Natural Language Commands** - "Show my emails", "Reply to John saying I'll be late"
- **AI Email Summaries** - Concise summaries using Google Gemini AI
- **Smart Reply Generation** - Context-aware professional responses
- **Email Operations** - Read, reply, delete with confirmation dialogs
- **Inbox Categorization** - Auto-group emails (Work, Personal, Promotions, Urgent)
- **Daily Digest** - AI-generated daily email summaries
- **Modern UI** - Responsive design with animated backgrounds

---

## Tech Stack

### Backend
- **FastAPI** (Python 3.13) - Modern async web framework
- **Google Gmail API** - Email operations
- **Google Gemini AI** (gemini-1.5-pro) - NLP and content generation
- **Supabase** - PostgreSQL database
- **Pydantic** - Type validation
- **BeautifulSoup4** - HTML sanitization
- **Uvicorn** - ASGI server

### Frontend
- **Next.js 16** (App Router) with React 19
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client
- **Zustand** - State management

### Code Quality & Integrity
- **Ruff** - Fast Python linter (enforced on backend)
  - PEP 8 compliance, import sorting, unused code detection
  - Type hint enforcement, code complexity limits
- **ESLint** - JavaScript/TypeScript linter (enforced on frontend)
  - TypeScript strict mode, no `any` types
  - React hooks rules, Next.js best practices
- **Pydantic** - Runtime type validation
- **Pre-commit hooks** - Automated quality checks

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **GitHub** - Version control

---

## Setup Instructions

### Prerequisites

- Python 3.10+ and Node.js 18+
- Google Cloud Platform account
- Supabase account
- Google Gemini API key

### Quick Start

```bash
# Clone repository
git clone https://github.com/satvikpathak/Email-Assistant.git
cd Email-Assistant

# Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your credentials
uvicorn main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

Visit `http://localhost:3000`

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project and enable **Gmail API**
3. Create **OAuth2 credentials** (Web application)
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (dev)
   - `https://email-assistant-roan.vercel.app/auth/callback` (prod)
5. Configure **OAuth consent screen** with scopes:
   - `gmail.readonly`, `gmail.send`, `gmail.modify`
6. Add test users

### 2. Supabase Setup

1. Create project at [Supabase](https://supabase.com/)
2. Copy project URL and anon key from Settings > API
3. Run `backend/schema.sql` in SQL Editor

### 3. Google Gemini API Setup

Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Environment Variables

See `.env.example` files in root and `frontend/` directories for complete reference.

**Backend (.env):**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`
- `FRONTEND_URL`

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL`

---

## Deployment

**Frontend (Vercel):**
1. Import GitHub repo: [https://github.com/satvikpathak/Email-Assistant](https://github.com/satvikpathak/Email-Assistant)
2. Root Directory: `frontend`
3. Add env: `NEXT_PUBLIC_API_URL=https://email-assistant-tgtp.onrender.com`
4. Deploy

**Backend (Render):**
1. New Web Service from GitHub
2. Root Directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env`

**Update OAuth redirect URIs** in Google Cloud Console with production URLs.

---

## Usage Examples

**Fetch:** "Show me my latest emails" | "Get unread emails"  
**Reply:** "Reply to email #1" | "Reply to John saying I'll be late"  
**Delete:** "Delete email #2" | "Delete the email from spam"  
**Smart:** "Categorize my inbox" | "Give me today's digest"

---

## Code Quality

This project enforces strict code quality standards through automated linting:

### Backend (Python)
```bash
cd backend
ruff check app/ --fix  # Lint with auto-fix
```
- PEP 8 compliance
- Import sorting (isort)
- Unused imports/variables detection
- Type annotations enforced
- Security checks (bandit rules)

### Frontend (TypeScript)
```bash
cd frontend
npm run lint  # ESLint check
```
- TypeScript strict mode
- No `any` types allowed
- Unused variable detection
- React hooks rules enforced
- Next.js best practices

### Security
- OAuth2 with CSRF protection
- HTML sanitization
- SQL injection prevention
- Environment-based secrets
- CORS configuration

---

## API Documentation

Full interactive docs: [https://email-assistant-tgtp.onrender.com/docs](https://email-assistant-tgtp.onrender.com/docs)

**Key Endpoints:**
- `GET /auth/login` - OAuth initiation
- `GET /auth/callback` - OAuth callback
- `POST /chat/message` - Process commands (fetch, reply, delete, categorize, digest)

---

## Project Structure

```
Email-Assistant/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── core/              # Config & database
│   │   ├── models/            # Pydantic schemas
│   │   ├── routers/           # API endpoints
│   │   └── services/          # Business logic
│   ├── main.py                # FastAPI app
│   ├── requirements.txt       # Python dependencies
│   └── schema.sql             # Database schema
│
├── frontend/                  # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   └── lib/              # Utilities
│   ├── package.json          # Node dependencies
│   └── tsconfig.json         # TypeScript config
│
└── .env.example              # Environment template
```

---

## Assumptions & Limitations

**Assumptions:**
- Users have Gmail accounts
- Modern browsers (Chrome, Firefox, Safari, Edge)
- English language commands
- Stable internet connectivity

**Limitations:**
- Rate limits: Gemini API (15 req/min on free tier)
- Email attachments not supported
- English-optimized only
- OAuth consent screen approval required for production
- Automated tests not included

**Future Enhancements:**
- Attachment support
- Multi-language support
- Automated test suite
- Email scheduling
- Calendar integration

---

## Made By

**Satvik Pathak**

---

## License

Created for educational and demonstration purposes.

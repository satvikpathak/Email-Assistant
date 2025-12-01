#!/bin/bash

# Mini AI-Powered Email Assistant - Quick Start Script
# This script starts both backend and frontend servers

set -e

echo "🚀 Starting Mini AI-Powered Email Assistant"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the conass/ directory"
    exit 1
fi

# Start backend
echo "📦 Starting Backend Server..."
cd backend
if [ ! -d ".venv" ]; then
    echo "❌ Error: Backend virtual environment not found!"
    echo "   Please run: cd backend && python -m venv .venv && .venv/bin/pip install -e ."
    exit 1
fi

.venv/bin/uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend started on http://localhost:8000 (PID: $BACKEND_PID)"
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend
echo ""
echo "🎨 Starting Frontend Server..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "❌ Error: Frontend dependencies not installed!"
    echo "   Please run: cd frontend && npm install"
    kill $BACKEND_PID
    exit 1
fi

npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started on http://localhost:3000 (PID: $FRONTEND_PID)"
cd ..

echo ""
echo "==========================================="
echo "✨ Both servers are running!"
echo "==========================================="
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Keep script running
wait

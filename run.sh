#!/bin/bash

# DataPilot Single-Command Runner
# Starts both FastAPI Backend and React Frontend concurrently

echo "🚀 Starting DataPilot (FastAPI Backend + React Frontend)..."

# Trap CTRL+C and kill background processes cleanly
trap 'kill $(jobs -p) 2>/dev/null; exit' SIGINT SIGTERM EXIT

# 1. Start Backend in the background
echo "📦 Starting FastAPI Backend on http://localhost:8000..."
cd "$(dirname "$0")/backend"
python3 -m uvicorn main:app --port 8000 &
BACKEND_PID=$!

# 2. Wait 1 second for backend socket to open
sleep 1

# 3. Start Frontend
echo "💻 Starting React Frontend on http://localhost:5173..."
cd "../frontend"
npm run dev

# Wait for both
wait $BACKEND_PID

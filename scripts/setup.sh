#!/usr/bin/env bash
set -e

echo "========================================="
echo "   SimpleStore Developer Setup"
echo "========================================="

# 1. Copy .env if not exists
if [ ! -f .env ]; then
  echo "📄 Creating .env from .env.example..."
  cp .env.example .env
fi

# 2. Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install

# 3. Setup Python backend virtual environment
echo "🐍 Setting up Python backend virtual environment..."
cd apps/api
if [ ! -d "venv" ]; then
  if command -v python3.12 &>/dev/null; then
    python3.12 -m venv venv
  elif command -v python3.11 &>/dev/null; then
    python3.11 -m venv venv
  else
    python3 -m venv venv
  fi
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ../..

echo "========================================="
echo "✅ SimpleStore Setup Complete!"
echo "To start with Docker: docker compose up --build"
echo "To start locally: npm run dev:web (Terminal 1) & uvicorn app.main:app --reload (Terminal 2)"
echo "========================================="

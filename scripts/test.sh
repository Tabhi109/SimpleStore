#!/usr/bin/env bash
set -e

echo "========================================="
echo "   Running SimpleStore Test Suites"
echo "========================================="

echo "🐍 Running Backend Pytest & Ruff..."
cd apps/api
if [ -d "venv" ]; then
  source venv/bin/activate
fi
ruff check .
pytest -v
cd ../..

echo "⚛️ Running Frontend Type Check & Lint..."
cd apps/web
npm run type-check
npm run lint
cd ../..

echo "========================================="
echo "✅ All SimpleStore test suites passed!"
echo "========================================="

#!/bin/bash

# OURS App - Backend Startup Script

echo "🚀 Starting OURS Backend Server..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit backend/.env and add your configuration!"
    echo "   Especially: Firebase credentials and PostgreSQL password"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit and configure..."
fi

# Start the development server
echo "🔧 Starting development server..."
echo ""
npm run dev

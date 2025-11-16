#!/bin/bash

# OURS App - Frontend Startup Script

echo "📱 Starting OURS Frontend App..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

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
    echo "⚠️  IMPORTANT: Please edit frontend/.env and add your Firebase configuration!"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit and configure..."
fi

# Start Expo
echo "🎨 Starting Expo development server..."
echo ""
echo "Once started, press:"
echo "  w - Open in web browser"
echo "  a - Open in Android emulator"
echo "  i - Open in iOS simulator"
echo ""
npm start

#!/bin/bash

# Sustainability Platform - Local Production Startup Script
# This script starts the application locally in production mode

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Sustainability Platform - Production Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Copy .env.example to .env and update with your production values:"
    echo "   cp .env.example .env"
    exit 1
fi

# Check if .env has minimal required values
if ! grep -q "DB_PASSWORD" .env || grep "DB_PASSWORD=your_" .env; then
    echo "❌ .env file not properly configured!"
    echo "   Please update .env with your actual database credentials"
    exit 1
fi

echo "✅ Configuration found"

# Check PostgreSQL
echo ""
echo "🔍 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client not found. Install with:"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo "✅ PostgreSQL client found"

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Test database connection
echo ""
echo "🔍 Testing database connection..."
if ! psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database"
    echo "   Check your .env file and ensure PostgreSQL is running:"
    echo "   macOS: brew services start postgresql"
    echo "   Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ Database connected"

# Apply migrations
echo ""
echo "📦 Applying database migrations..."
if [ -d "migrations" ]; then
    for migration in migrations/*.sql; do
        echo "   Applying $(basename $migration)..."
        psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f "$migration" > /dev/null 2>&1 || true
    done
    echo "✅ Migrations complete"
else
    echo "⚠️  No migrations directory found"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
if [ ! -d "node_modules" ]; then
    npm install --production
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build frontend
echo ""
echo "🏗️  Building frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
cd ..
echo "✅ Frontend built"

# Start backend
echo ""
echo "🚀 Starting backend server..."
echo "   Backend will run on http://localhost:${PORT:-5001}"
export NODE_ENV=production
node src/server.js &
BACKEND_PID=$!

sleep 2

# Start frontend
echo ""
echo "🚀 Starting frontend server..."
echo "   Frontend will run on http://localhost:5173"
cd frontend
http-server dist -p 5173 -c-1 > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Application started successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Access the application:"
echo "   • Admin Portal: http://localhost:5173/company"
echo "   • Client Portal: http://localhost:5173/client"
echo "   • API Server: http://localhost:${PORT:-5001}"
echo ""
echo "📝 Default credentials:"
echo "   • Email: admin@company.com"
echo "   • Password: Check your database seeders"
echo ""
echo "🛑 To stop the servers:"
echo "   • Kill backend: kill $BACKEND_PID"
echo "   • Kill frontend: kill $FRONTEND_PID"
echo ""
echo "Press Ctrl+C in any terminal to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Keep script running
wait

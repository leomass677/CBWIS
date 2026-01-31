#!/bin/bash

# CBWIS - Project Setup Script
# This script helps with initial project configuration

echo "═══════════════════════════════════════════════════════"
echo "CBWIS - Computer-Based Warehousing Information System"
echo "Setup Assistant"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check Node.js
echo "✓ Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "  ✅ Node.js $NODE_VERSION found"
else
    echo "  ❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

# Check npm
echo ""
echo "✓ Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "  ✅ npm $NPM_VERSION found"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Setup Frontend
echo ""
echo "═══════════════════════════════════════════════════════"
echo "Setting up Frontend..."
echo "═══════════════════════════════════════════════════════"

if [ ! -f "frontend/.env" ]; then
    echo "✓ Creating frontend/.env"
    cp frontend/.env.example frontend/.env
    echo "  ⚠️  Please edit frontend/.env with your Firebase credentials"
else
    echo "✓ frontend/.env already exists"
fi

echo ""
echo "✓ Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..
echo "  ✅ Frontend dependencies installed"

# Setup Backend
echo ""
echo "═══════════════════════════════════════════════════════"
echo "Setting up Backend..."
echo "═══════════════════════════════════════════════════════"

if [ ! -f "backend/.env" ]; then
    echo "✓ Creating backend/.env"
    cp backend/.env.example backend/.env
    echo "  ⚠️  Please edit backend/.env with your Firebase credentials"
else
    echo "✓ backend/.env already exists"
fi

echo ""
echo "✓ Installing backend dependencies..."
cd backend
npm install --silent
cd ..
echo "  ✅ Backend dependencies installed"

# Summary
echo ""
echo "═══════════════════════════════════════════════════════"
echo "Setup Complete! ✅"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Firebase:"
echo "   → Visit: https://console.firebase.google.com"
echo "   → Create a new project named 'cbwis-warehouse'"
echo "   → Enable Firestore Database"
echo "   → Enable Email/Password Authentication"
echo "   → Get credentials from Project Settings"
echo ""
echo "2. Update environment files:"
echo "   → Edit frontend/.env with Firebase config"
echo "   → Edit backend/.env with Firebase Admin SDK credentials"
echo ""
echo "3. Set user roles (from backend directory):"
echo "   → cd backend && node scripts/set-user-roles.js"
echo ""
echo "4. Start the application:"
echo ""
echo "   Terminal 1 (Frontend):"
echo "   $ cd frontend && npm run dev"
echo "   → http://localhost:5173"
echo ""
echo "   Terminal 2 (Backend):"
echo "   $ cd backend && npm start"
echo "   → http://localhost:3000"
echo ""
echo "5. Login with test credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123456"
echo ""
echo "📚 Documentation:"
echo "   → README.md - Project overview"
echo "   → INSTALLATION.md - Detailed setup guide"
echo "   → API_DOCUMENTATION.md - API reference"
echo "   → firebase-setup/SETUP_INSTRUCTIONS.md - Firebase setup"
echo ""
echo "═══════════════════════════════════════════════════════"

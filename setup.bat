@echo off
REM CBWIS - Project Setup Script for Windows
REM This script helps with initial project configuration

echo.
echo ============================================================
echo CBWIS - Computer-Based Warehousing Information System
echo Setup Assistant (Windows)
echo ============================================================
echo.

REM Check Node.js
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo ✓ Node.js %NODE_VERSION% found
) else (
    echo ✗ Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)

REM Check npm
echo.
echo Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo ✓ npm %NPM_VERSION% found
) else (
    echo ✗ npm not found
    pause
    exit /b 1
)

REM Setup Frontend
echo.
echo ============================================================
echo Setting up Frontend...
echo ============================================================

if not exist "frontend\.env" (
    echo Creating frontend\.env
    copy "frontend\.env.example" "frontend\.env"
    echo ⚠ Please edit frontend\.env with your Firebase credentials
) else (
    echo ✓ frontend\.env already exists
)

echo.
echo Installing frontend dependencies...
cd frontend
call npm install --silent
cd ..
echo ✓ Frontend dependencies installed

REM Setup Backend
echo.
echo ============================================================
echo Setting up Backend...
echo ============================================================

if not exist "backend\.env" (
    echo Creating backend\.env
    copy "backend\.env.example" "backend\.env"
    echo ⚠ Please edit backend\.env with your Firebase credentials
) else (
    echo ✓ backend\.env already exists
)

echo.
echo Installing backend dependencies...
cd backend
call npm install --silent
cd ..
echo ✓ Backend dependencies installed

REM Summary
echo.
echo ============================================================
echo Setup Complete! ✓
echo ============================================================
echo.
echo Next Steps:
echo.
echo 1. Configure Firebase:
echo    - Visit: https://console.firebase.google.com
echo    - Create a new project named 'cbwis-warehouse'
echo    - Enable Firestore Database
echo    - Enable Email/Password Authentication
echo    - Get credentials from Project Settings
echo.
echo 2. Update environment files:
echo    - Edit frontend\.env with Firebase config
echo    - Edit backend\.env with Firebase Admin SDK credentials
echo.
echo 3. Set user roles:
echo    - cd backend
echo    - node scripts/set-user-roles.js
echo.
echo 4. Start the application:
echo.
echo    Terminal 1 (Frontend):
echo    cd frontend ^&^& npm run dev
echo    http://localhost:5173
echo.
echo    Terminal 2 (Backend):
echo    cd backend ^&^& npm start
echo    http://localhost:3000
echo.
echo 5. Login with test credentials:
echo    Email: admin@example.com
echo    Password: admin123456
echo.
echo Documentation:
echo    - README.md - Project overview
echo    - INSTALLATION.md - Detailed setup guide
echo    - API_DOCUMENTATION.md - API reference
echo    - firebase-setup\SETUP_INSTRUCTIONS.md - Firebase setup
echo.
echo ============================================================
pause

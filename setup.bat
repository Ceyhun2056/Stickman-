@echo off
echo 🎬 Setting up Fullstack Movie Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo [INFO] Node.js version detected: 
node --version

REM Setup Backend
echo [INFO] Setting up backend...
cd server

if not exist package.json (
    echo [ERROR] Backend package.json not found!
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM Copy environment file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo [WARNING] Created .env file from .env.example. Please edit it with your configuration.
)

echo [INFO] Backend setup complete ✓

REM Setup Frontend
echo [INFO] Setting up frontend...
cd ..\client

if not exist package.json (
    echo [ERROR] Frontend package.json not found!
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Copy environment file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo [WARNING] Created .env file from .env.example. Please edit it with your configuration.
)

echo [INFO] Frontend setup complete ✓

cd ..

echo.
echo [INFO] 🎉 Setup completed successfully!
echo.
echo [INFO] Next steps:
echo 1. Get your TMDb API key from https://www.themoviedb.org/settings/api
echo 2. Edit server/.env and client/.env with your configuration
echo 3. Start MongoDB (locally or use MongoDB Atlas)
echo 4. Run the application:
echo.
echo    Backend:  cd server ^&^& npm run dev
echo    Frontend: cd client ^&^& npm start
echo.
echo    Or use Docker: docker-compose up --build
echo.
echo [INFO] Happy coding! 🚀
pause

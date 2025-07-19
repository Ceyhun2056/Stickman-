@echo off
echo 🎬 Setting up Fullstack Movie Application...

echo.
echo [INFO] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)
echo ✅ Server dependencies installed!

echo.
echo [INFO] Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install client dependencies  
    pause
    exit /b 1
)
echo ✅ Client dependencies installed!

echo.
echo [INFO] Environment files already created!
echo    📁 server\.env
echo    📁 client\.env

echo.
echo ✅ Setup Complete!
echo.
echo 🚀 To start the application, run: start-dev.bat
echo.
echo ⚠️  Before starting, make sure to:
echo    1. Get TMDb API key: https://www.themoviedb.org/settings/api
echo    2. Replace "your_tmdb_api_key_here" in both .env files
echo    3. Install/start MongoDB or use MongoDB Atlas
echo.
pause

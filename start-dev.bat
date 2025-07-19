@echo off
echo 🎬 Starting Fullstack Movie Application...

echo.
echo [INFO] Starting Backend Server...
cd server
start "Backend Server - MovieApp" cmd /k "npm run dev"

echo [INFO] Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo [INFO] Starting Frontend Client...
cd ..\client  
start "Frontend Client - MovieApp" cmd /k "npm start"

echo.
echo ✅ Application Started Successfully!
echo.
echo 🌐 Access your app at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000/api
echo.
echo ⚠️  Don't forget to:
echo    1. Get TMDb API key from: https://www.themoviedb.org/settings/api
echo    2. Replace "your_tmdb_api_key_here" in both .env files
echo    3. Start MongoDB or use MongoDB Atlas
echo.
echo Press any key to continue...
pause > nul

@echo off
echo ========================================================
echo  PERSONAL TRACKER — Centralized SaaS Application
echo ========================================================
echo.
echo Starting Express Backend API on port 5000...
start "Personal Tracker - Backend (Port 5000)" cmd /k "cd backend && node server.js"

timeout /t 2 /nobreak >nul

echo Starting Next.js Frontend on port 3000...
start "Personal Tracker - Frontend (Port 3000)" cmd /k "cd frontend && npm start"

echo.
echo Application started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000/api
echo.
pause


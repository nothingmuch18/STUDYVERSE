@echo off
echo ==========================================
echo Starting StudyOS Local Environment
echo ==========================================

echo [1/3] Backend API...
cd backend
start "StudyOS Backend" cmd /k "npm run dev"
cd ..

echo [2/3] Frontend Dependencies (Ensuring compatibility)...
cd frontend
call npm install

echo [3/3] Starting Website...
echo If this fails, YOU MUST INSTALL NODE.JS v20.
call npm run dev
pause

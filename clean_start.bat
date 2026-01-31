@echo off
echo ==========================================
echo      STUDYOS - CLEAN START SCRIPT
echo ==========================================

echo [1/4] Killing ALL Node.js processes (Zombies)...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo Done.

echo [2/4] Starting Backend (Port 3002)...
cd backend
start "StudyOS Backend" cmd /k "npm run dev"
cd ..

echo [3/4] Starting Frontend (Port 5173)...
cd frontend
start "StudyOS Frontend" cmd /k "npm run dev"
cd ..

echo ==========================================
echo [4/4] SYSTEM LAUNCHED
echo ==========================================
echo Please wait 10 seconds for servers to boot...
echo Then reload your browser.
pause

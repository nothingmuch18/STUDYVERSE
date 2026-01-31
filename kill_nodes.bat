@echo off
echo ==========================================
echo STOPPING ALL STUDYOS PROCESSES
echo ==========================================

taskkill /F /IM node.exe
taskkill /F /IM cmd.exe

echo.
echo All Node.js and Terminal processes have been killed.
echo You can now run start_all.bat cleanly.
pause

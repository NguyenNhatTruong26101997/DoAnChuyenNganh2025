@echo off
echo Stopping server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting server...
cd /d "%~dp0"
start cmd /k "node server.js"

echo Server restarted!
pause

@echo off
echo ========================================
echo   Restarting LaptopWorld Backend Server
echo ========================================
echo.

echo [1/3] Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo      Server stopped successfully
) else (
    echo      No running server found
)
echo.

echo [2/3] Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Starting server...
echo.
node server.js

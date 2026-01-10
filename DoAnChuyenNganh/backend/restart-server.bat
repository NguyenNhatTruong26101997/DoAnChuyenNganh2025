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

echo [3/3] Starting server...c:\Users\GIGABYTE\AppData\Local\Packages\MicrosoftWindows.Client.Core_cw5n1h2txyewy\TempState\ScreenClip\{32181297-AF74-4E31-8161-AD3598F5AD21}.png
echo.
node server.js

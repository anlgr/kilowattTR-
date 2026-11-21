@echo off
echo ==================================================
echo   KilowattTR - Next.js Frontend Baslatiliyor...
echo ==================================================
cd /d "%~dp0frontend"

if exist ".next\dev\lock" (
    echo Eski kilit dosyasi temizleniyor...
    del /f /q ".next\dev\lock" 2>nul
)

npm run dev
pause

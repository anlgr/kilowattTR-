@echo off
echo ==================================================
echo   KilowattTR - Tum Servisler Baslatiliyor...
echo ==================================================

set "PY_CMD=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
)

echo 0. Guncel Sarj Tarifeleri ve EV Haberleri Cekiliyor...
cd /d "%~dp0scraper"
"%PY_CMD%" sarj_scraper.py
"%PY_CMD%" haber_scraper.py
cd /d "%~dp0"

echo 1. Backend baslatiliyor (Port 8000)...
start "KilowattTR - Backend (FastAPI)" cmd /c "%~dp0start_backend.bat"

timeout /t 2 /nobreak >nul

echo 2. Frontend baslatiliyor (Port 3000)...
start "KilowattTR - Frontend (Next.js)" cmd /c "%~dp0start_frontend.bat"

echo.
echo ==================================================
echo   Servisler Calisiyor!
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://127.0.0.1:8000
echo   - Swagger:  http://127.0.0.1:8000/docs
echo ==================================================
echo.
pause

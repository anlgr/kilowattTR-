@echo off
echo ==================================================
echo   KilowattTR - Tarifeler ve Haberler Guncelleniyor...
echo ==================================================
cd /d "%~dp0scraper"

set "PY_CMD=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
)

echo [1/2] Sarj Tarifeleri Cekiliyor...
"%PY_CMD%" sarj_scraper.py
echo.
echo [2/2] Guncel EV Haberleri Cekiliyor...
"%PY_CMD%" haber_scraper.py
echo.
pause

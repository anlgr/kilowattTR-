@echo off
echo ==================================================
echo   KilowattTR - FastAPI Backend Baslatiliyor...
echo ==================================================
cd /d "%~dp0backend"
set PYTHONPATH=%cd%

set "PY_CMD=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
)

echo Python calistiriliyor: %PY_CMD%
"%PY_CMD%" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause

@echo off
echo ==================================================
echo   KilowattTR - GitHub (anlgr/kilowattTR) Yukleyici
echo ==================================================
cd /d "%~dp0"

git add .
git commit -m "KilowattTR guncelleme" 2>nul
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/anlgr/kilowattTR-.git

echo.
echo GitHub hesabiniza (https://github.com/anlgr/kilowattTR-.git) gonderiliyor...
git push -u origin main

echo.
pause

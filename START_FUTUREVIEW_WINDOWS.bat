@echo off
title FUTUREVIEW V2
cd /d "%~dp0"
echo.
echo ==========================================
echo        FUTUREVIEW V2 LAUNCHER
echo ==========================================
echo.
start "FUTUREVIEW Backend" cmd /k "cd /d %~dp0backend && python -m pip install -r requirements.txt && python -m uvicorn app.main:app --reload --port 8000"
timeout /t 4 /nobreak >nul
start "FUTUREVIEW Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
echo.
echo Backend and frontend terminals opened.
echo Keep both windows running.
pause

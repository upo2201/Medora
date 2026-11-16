@echo off
title Medora Public Testing Mode
cd /d "%~dp0"
echo Starting Medora Public Testing Mode with ngrok...
if exist "backend\venv\Scripts\python.exe" (
    backend\venv\Scripts\python.exe start_public_mode.py
) else (
    python start_public_mode.py
)
pause


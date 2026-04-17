@echo off
title Dummy Spring Boot Server
echo ========================================================
echo   Starting Spring Boot Backend (Dummy implementation)
echo ========================================================
echo.
cd /d "%~dp0"
node ..\dummy-springboot.js
pause

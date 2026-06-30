@echo off
setlocal EnableExtensions
chcp 65001 >nul
title SuratRT - Backup Database

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan.
  pause
  exit /b 1
)

if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" set "%%a=%%b"
  )
)

echo.
echo  ========================================
echo   SuratRT - Backup Database
echo  ========================================
echo.

node scripts/backup-db.mjs
if errorlevel 1 (
  echo [ERROR] Backup gagal.
  pause
  exit /b 1
)

echo.
echo Backup selesai.
pause

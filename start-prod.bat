@echo off
setlocal EnableExtensions
chcp 65001 >nul
title SuratRT - Production Server

cd /d "%~dp0"

echo.
echo  ========================================
echo   SuratRT - Production Start
echo  ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Menginstall dependensi...
  call npm install
  if errorlevel 1 exit /b 1
)

if not exist ".env" (
  echo [ERROR] File .env belum ada. Jalankan start.bat terlebih dahulu.
  pause
  exit /b 1
)

if not exist "prisma\dev.db" (
  echo Setup database...
  call npm run db:setup
  if errorlevel 1 exit /b 1
)

echo Build production...
call npm run build
if errorlevel 1 (
  echo [ERROR] Build gagal.
  pause
  exit /b 1
)

echo.
echo Menjalankan server produksi di http://localhost:3000
echo Tekan Ctrl+C untuk berhenti.
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

call npm run start

pause

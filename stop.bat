@echo off
setlocal EnableExtensions
chcp 65001 >nul
title SuratRT - Stop Dev Server

cd /d "%~dp0"

echo.
echo  ========================================
echo   SuratRT - Stop Server
echo  ========================================
echo.

set FOUND=0

for %%P in (3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P " ^| findstr LISTENING') do (
    for /f "tokens=1" %%b in ('wmic process where "ProcessId=%%a" get CommandLine /format:list 2^>nul ^| findstr /i "aplikasi-surat-rt next"') do (
      echo Menghentikan SuratRT di port %%P ^(PID %%a^)...
      taskkill /PID %%a /F >nul 2>&1
      set FOUND=1
    )
  )
)

if "%FOUND%"=="0" (
  echo Tidak ada proses SuratRT yang berjalan di port 3000-3010.
) else (
  echo Selesai.
)

echo.
pause

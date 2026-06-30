@echo off
setlocal EnableExtensions
chcp 65001 >nul
title SuratRT - Development Server

cd /d "%~dp0"

echo.
echo  ========================================
echo   SuratRT - Auto Start
echo  ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan.
  echo         Install Node.js 20+ dari https://nodejs.org
  echo.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm tidak ditemukan.
  echo.
  pause
  exit /b 1
)

echo [INFO] Node: 
node -v
echo [INFO] npm:  
npm -v
echo.

if not exist "node_modules\" (
  echo [1/6] Menginstall dependensi ^(npm install^)...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install gagal.
    pause
    exit /b 1
  )
  echo.
) else (
  echo [1/6] Dependensi sudah terinstall, skip npm install.
  echo.
)

if not exist ".env" (
  echo [2/6] Membuat file .env dari .env.example...
  copy /Y ".env.example" ".env" >nul

  for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set "AUTH_SECRET=%%i"
  powershell -NoProfile -Command "(Get-Content -Raw '.env') -replace 'ganti-dengan-string-acak-minimal-32-karakter', '%AUTH_SECRET%' | Set-Content '.env'"
  echo       AUTH_SECRET otomatis digenerate.
  echo.
) else (
  echo [2/6] File .env sudah ada, skip.
  echo.
)

if not exist "prisma\dev.db" (
  echo [3/6] Setup database pertama kali ^(db:setup^)...
  call npm run db:setup
  if errorlevel 1 (
    echo [ERROR] Setup database gagal.
    pause
    exit /b 1
  )
  echo.
) else (
  echo [3/6] Database sudah ada, sync schema...
  call npm run db:push
  if errorlevel 1 (
    echo [ERROR] db:push gagal. Coba hentikan dev server lain lalu jalankan ulang.
    pause
    exit /b 1
  )
  echo.
)

echo [4/6] Generate Prisma Client...
call npm run db:generate
if errorlevel 1 (
  echo [ERROR] prisma generate gagal.
  pause
  exit /b 1
)
echo.

echo [5/6] Mencari port yang tersedia...
set TRY=3000
call :find_port
if errorlevel 1 (
  echo [ERROR] Tidak ada port kosong di 3000-3010.
  pause
  exit /b 1
)
set PORT=%TRY%

if not "%PORT%"=="3000" (
  echo [WARN] Port 3000 sudah dipakai aplikasi lain.
  echo        SuratRT akan berjalan di port %PORT%.
  echo        ^(Tutup project lain di port 3000 jika ingin pakai 3000^)
  echo.
)

powershell -NoProfile -Command "(Get-Content -Raw '.env') -replace 'AUTH_URL=\"http://localhost:\d+\"', 'AUTH_URL=\"http://localhost:%PORT%\"' | Set-Content '.env'"

echo [6/6] Menjalankan development server...
echo.
echo  URL   : http://localhost:%PORT%
echo  Stop  : tekan Ctrl+C di jendela ini
echo.

start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:%PORT%"

call npx next dev -p %PORT%

echo.
echo Server berhenti.
pause
exit /b 0

:find_port
if %TRY% GTR 3010 exit /b 1
set "BUSY="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%TRY% " ^| findstr LISTENING') do set "BUSY=1"
if defined BUSY (
  set /a TRY+=1
  goto find_port
)
exit /b 0

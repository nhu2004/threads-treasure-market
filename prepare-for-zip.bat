@echo off
REM Script để chuẩn bị dự án trước khi zip
REM Chạy file này từ folder gốc của dự án

setlocal enabledelayedexpansion
chcp 65001 >nul

echo.
echo 🧹 Đang chuẩn bị dự án để zip...
echo.

REM Xóa node_modules
if exist "node_modules" (
    echo ❌ Xóa: node_modules
    rmdir /s /q "node_modules" 2>nul
)

REM Xóa server/node_modules
if exist "server\node_modules" (
    echo ❌ Xóa: server\node_modules
    rmdir /s /q "server\node_modules" 2>nul
)

REM Xóa dist
if exist "dist" (
    echo ❌ Xóa: dist
    rmdir /s /q "dist" 2>nul
)

REM Xóa lock files
if exist "bun.lock" (
    echo ❌ Xóa: bun.lock
    del /q "bun.lock" 2>nul
)

if exist "bun.lockb" (
    echo ❌ Xóa: bun.lockb
    del /q "bun.lockb" 2>nul
)

echo.
echo ✅ Hoàn thành!
echo.
echo 💡 Tiếp theo:
echo    1. Nén project bây giờ
echo    2. Khi giải nén, chạy: npm install
echo    3. Chạy: npm run build (nếu cần)
echo.
pause

@echo off
setlocal
cd /d "%~dp0"
title Antigravity 2.0 卸载汉化还原工具

echo ============================================================
echo         Antigravity 2.0 卸载汉化还原官方原版工具
echo ============================================================
echo.

node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js 环境！
    pause
    exit /b 1
)

node localization_engine.js --restore

echo.
echo ============================================================
pause
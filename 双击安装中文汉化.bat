@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo   Antigravity 2.0 中文汉化注入工具 (v2.9.1 全新适配版)
echo ============================================================
echo.

set "NODE_BIN=node"
where node >nul 2>&1
if %errorlevel% neq 0 (
    if exist "D:\Program Files\nodejs\node.exe" set "NODE_BIN=D:\Program Files\nodejs\node.exe"
    if exist "C:\Program Files\nodejs\node.exe" set "NODE_BIN=C:\Program Files\nodejs\node.exe"
)

"%NODE_BIN%" localization_engine.js %*

echo.
echo ============================================================
echo   汉化流程已执行完毕，请按任意键退出本窗口...
echo ============================================================
pause
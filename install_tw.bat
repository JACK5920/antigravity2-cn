@echo off
cd /d "%~dp0"
title Antigravity 2.0 Traditional Chinese Tool

echo ============================================================
echo   Antigravity 2.0 繁體中文漢化注入工具 (v2.9.1 全新適配版)
echo ============================================================
echo.

set "NODE_BIN=node"
where node >nul 2>nul
if errorlevel 1 (
    if exist "D:\Program Files\nodejs\node.exe" (
        set "NODE_BIN=D:\Program Files\nodejs\node.exe"
    ) else if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_BIN=C:\Program Files\nodejs\node.exe"
    ) else (
        echo [錯誤] 未檢測到 Node.js，請先安裝 Node.js!
        pause
        exit /b 1
    )
)

echo [執行] 正在啟動繁體中文漢化注入引擎，請稍候...
echo.
"%NODE_BIN%" localization_engine.js --tw %*
echo.
echo ============================================================
echo   漢化流程已執行完畢，請按任意鍵退出本視窗...
echo ============================================================
pause
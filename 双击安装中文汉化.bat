@echo off
cd /d "%~dp0"
title Antigravity 2.0 Chinese Localization Tool

echo ============================================================
echo   Antigravity 2.0 中文汉化注入工具 (v2.9.1 全新适配版)
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
        echo [错误] 未检测到 Node.js，请先安装 Node.js!
        pause
        exit /b 1
    )
)

echo [执行] 正在启动汉化注入引擎，请稍候...
echo.
"%NODE_BIN%" localization_engine.js %*
echo.
echo ============================================================
echo   汉化流程已执行完毕，请按任意键退出本窗口...
echo ============================================================
pause
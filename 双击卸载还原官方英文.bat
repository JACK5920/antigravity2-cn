@echo off
cd /d "%~dp0"
title Antigravity 2.0 Restore Tool

echo ============================================================
echo   Antigravity 2.0 卸载汉化还原官方原版工具
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

echo [执行] 正在还原官方原版，请稍候...
echo.
"%NODE_BIN%" localization_engine.js --restore
echo.
echo ============================================================
echo   官方原版已成功还原，请按任意键退出本窗口...
echo ============================================================
pause
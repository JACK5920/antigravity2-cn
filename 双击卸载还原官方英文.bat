@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo   Antigravity 2.0 卸载汉化还原官方原版工具
echo ============================================================
echo.

set "NODE_BIN=node"
where node >nul 2>&1
if %errorlevel% neq 0 (
    if exist "D:\Program Files\nodejs\node.exe" set "NODE_BIN=D:\Program Files\nodejs\node.exe"
    if exist "C:\Program Files\nodejs\node.exe" set "NODE_BIN=C:\Program Files\nodejs\node.exe"
)

"%NODE_BIN%" localization_engine.js --restore

echo.
echo ============================================================
echo   官方原版已成功还原，请按任意键退出本窗口...
echo ============================================================
pause
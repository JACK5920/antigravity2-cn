@echo off
cd /d "%~dp0"
title Antigravity 2.0 Chinese Localization Tool

echo ============================================================
echo   Antigravity 2.0 ���ĺ���ע�빤�� (v2.12.2 ȫ�������)
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
        echo [����] δ��⵽ Node.js�����Ȱ�װ Node.js!
        pause
        exit /b 1
    )
)

echo [ִ��] ������������ע�����棬���Ժ�...
echo.
"%NODE_BIN%" localization_engine.js %*
echo.
echo ============================================================
echo   ����������ִ����ϣ��밴������˳�������...
echo ============================================================
pause
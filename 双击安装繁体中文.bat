@echo off
cd /d "%~dp0"
title Antigravity 2.0 Traditional Chinese Tool

echo ============================================================
echo   Antigravity 2.0 ���w���ĝh��ע�빤�� (v2.12.2 ȫ���m���)
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
        echo [�e�`] δ�z�y�� Node.js��Ո�Ȱ��b Node.js!
        pause
        exit /b 1
    )
)

echo [����] ���چ��ӷ��w���ĝh��ע�����棬Ո�Ժ�...
echo.
"%NODE_BIN%" localization_engine.js --tw %*
echo.
echo ============================================================
echo   �h�������ш����ꮅ��Ո�������I�˳���ҕ��...
echo ============================================================
pause
@echo off
cd /d "%~dp0"
title Antigravity 2.0 Chinese Localization Tool

set "NODE_BIN=node"
where node >nul 2>nul
if errorlevel 1 (
    if exist "D:\Program Files\nodejs\node.exe" (
        set "NODE_BIN=D:\Program Files\nodejs\node.exe"
    ) else if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_BIN=C:\Program Files\nodejs\node.exe"
    ) else (
        echo [ERROR] Node.js is not found. Please install Node.js from https://nodejs.org
        pause
        exit /b 1
    )
)

"%NODE_BIN%" localization_engine.js %*
pause
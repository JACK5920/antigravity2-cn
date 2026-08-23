@echo off
setlocal
cd /d "%~dp0"
title Antigravity 2.0 繁體中文漢化安裝器

echo ============================================================
echo         Antigravity 2.0 繁體中文漢化注入安裝工具 (v2.9.1 適配版)
echo ============================================================
echo.

node -v >nul 2>&1
if errorlevel 1 (
    echo [錯誤] 未檢測到 Node.js 環境！
    echo 請先安裝 Node.js (https://nodejs.org) 後再執行本指令碼。
    echo.
    pause
    exit /b 1
)

echo 請選擇左上角品牌名顯示方式:
echo   [1] 英文品牌名 (Antigravity) [預設推薦]
echo   [2] 隱藏品牌名
echo   [3] 中文品牌名 (反重力智慧程式設計)
echo.
set "brand_choice=1"
set /p "brand_choice=請輸入選項編號 [直接 Enter 預設 1]: "

if "%brand_choice%"=="2" (
    node localization_engine.js --tw --brand-title hidden
) else if "%brand_choice%"=="3" (
    node localization_engine.js --tw --brand-title translated
) else (
    node localization_engine.js --tw --brand-title english
)

echo.
echo ============================================================
pause
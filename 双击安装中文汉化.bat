@echo off
title Antigravity 2.0 中文汉化安装器

echo ============================================================
echo         Antigravity 2.0 中文汉化注入安装工具 (v2.9.1 适配版)
echo ============================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境！
    echo 请先安装 Node.js (https://nodejs.org) 后再运行本脚本。
    echo.
    pause
    exit /b 1
)

echo 请选择左上角品牌名显示方式:
echo   [1] 英文品牌名 (Antigravity) [默认推荐]
echo   [2] 隐藏品牌名
echo   [3] 中文品牌名 (反重力智能编程)
echo.
set /p brand_choice="请输入选项编号 [默认 1]: "

if "%brand_choice%"=="2" (
    node "%~dp0localization_engine.js" --brand-title hidden
) else if "%brand_choice%"=="3" (
    node "%~dp0localization_engine.js" --brand-title translated
) else (
    node "%~dp0localization_engine.js" --brand-title english
)

echo.
pause
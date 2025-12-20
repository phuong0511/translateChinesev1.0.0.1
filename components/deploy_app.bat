@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul
title Deploy to GitHub Pages

echo ========================================================
echo   TU DONG CAP NHAT VA DEPLOY LEN GITHUB PAGES
echo ========================================================

:: 1. Kiem tra file .env.local
if not exist .env.local (
    echo [!] Khong tim thay file .env.local
    echo [!] Ung dung can GEMINI_API_KEY de hoat dong.
    set /p API_KEY="Nhap GEMINI_API_KEY cua ban (Enter de bo qua): "
    if not "!API_KEY!"=="" (
        echo GEMINI_API_KEY=!API_KEY!> .env.local
        echo [+] Da tao file .env.local
    )
)

echo [1/3] Luu thay doi vao Git...
git add .
git commit -m "Fix API Key and Update App"

echo [2/3] Build va Deploy...
call npm run deploy

echo [3/3] Hoan tat! Truy cap: https://sujuejin02.github.io/classical-chinese-novel/
pause
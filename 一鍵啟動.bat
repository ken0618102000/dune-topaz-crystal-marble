@echo off
setlocal
cd /d "%~dp0"
title 羽排 YUPAI
chcp 65001 >nul
echo.
echo   羽排 — Windows 一鍵啟動
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\windows\start.ps1"
if errorlevel 1 (
  echo.
  echo   啟動失敗。請把上面的紅字留下來，視窗先不要關。
  pause
)
endlocal

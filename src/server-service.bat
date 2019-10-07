@echo off
echo =====================
echo Run as Administrator!
echo =====================

REM go to folder where this file resides
cd %~dp0
set mypath=%cd%

REM install node-windows parallel
echo ...
echo Install node-windows and link it to %mypath%
echo =====================
call npm install -g node-windows
call npm init --force --yes
call npm link node-windows

REM remove service (if exists)
echo ...
echo Remove existing service...
echo =====================
call sc delete "acpnormsuploader.exe"

REM install service
REM echo ...
REM echo Install service "%cd%\server-service.js"...
REM echo =====================
REM call node server-service.js

REM echo All done! Hit any key to quit

echo Please run manually: node server-service.js
pause

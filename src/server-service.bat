@echo off
echo =====================
echo Run as Administrator!
echo =====================

REM go to folder where this file resides
cd %~dp0
set mypath=%cd%

REM install node-windows parallel
echo ...
echo Install npm stuff...
echo =====================
call npm install -g node-windows
call npm init --force --yes 2> nul
call npm install fs-extra klaw express multer method-override
call npm link node-windows

REM remove service (if exists)
echo ...
echo Remove existing service...
echo =====================
call sc delete "acpnormsuploader2.exe"

REM install service
echo ...
echo Install service "%cd%\server-service.js"...
echo =====================
call node server-service.js

echo All done! Hit any key to quit

pause

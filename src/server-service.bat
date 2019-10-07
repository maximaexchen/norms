@echo off
echo Run as Administrator!
pause

REM go to folder where this file resides
cd %~dp0
set mypath=%cd%

REM install node-windows
npm install -g node-windows
npm link node-windows

REM remove service (if exists)
sc delete acpnormenverwaltunguploadhandler.exe

REM install service
node "%cd%\server-service.js"

echo All done! Hit any key to quit
pause

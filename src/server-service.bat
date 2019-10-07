@echo off
echo Run as Administrator!
pause

REM go to folder where this file resides
%~dp0
set mypath=%cd%

REM remove service (if exists)
sc delete acpnormenverwaltunguploadhandler.exe

REM install service
node "%cd%\server-service.js"

echo All done! Hit any key to quit
pause

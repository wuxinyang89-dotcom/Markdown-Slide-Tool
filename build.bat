@echo off
rem ============================================================
rem  Markdown PPT - build launcher
rem ------------------------------------------------------------
rem  This file is intentionally PURE ASCII and contains no logic.
rem
rem  Why: cmd.exe decodes a .bat file using the console code page
rem  and re-reads it by byte offset. If a .bat contains multi-byte
rem  (Chinese) characters and the code page does not match the file
rem  encoding, lines get misaligned and are run as commands.
rem  Pure ASCII is immune to that.
rem
rem  All the real work (menu, scanning decks, building) lives in
rem  scripts\build.mjs, which handles Unicode paths correctly.
rem
rem  USAGE
rem    double-click              interactive menu
rem    build.bat all             every deck, all formats
rem    build.bat html            every deck, HTML only
rem    build.bat pdf | pptx      same idea
rem    build.bat list            list all decks
rem    build.bat clean           empty the dist folder
rem    build.bat preview [kw]    live preview
rem    build.bat <keyword> [fmt] build only matching decks
rem ============================================================

cd /d "%~dp0"

rem switch the console to UTF-8 so Chinese output is not garbled
for /f "tokens=2 delims=:" %%A in ('chcp') do set "OLDCP=%%A"
set "OLDCP=%OLDCP: =%"
chcp 65001 >nul

where node >nul 2>nul
if errorlevel 1 goto nonode

set "RC=0"
node "scripts\build.mjs" %*
set "RC=%errorlevel%"
goto end

:nonode
echo.
echo   [ERROR] Node.js not found. Please install it first:
echo           https://nodejs.org
echo.
set "RC=1"

:end
if defined OLDCP chcp %OLDCP% >nul
if not defined RC set "RC=1"
rem keep the window open when launched by double-click (no arguments)
if "%~1"=="" pause
exit /b %RC%

@echo off
echo Iniciando TruFadeCU...
echo.
echo ====================================
echo    TruFadeCU - Text-to-Speech
echo    Google Cloud Integration
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao esta instalado!
    echo.
    echo Por favor, instale Node.js de: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm dependencies are installed
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Start the application
echo Abrindo aplicacao...
npm start

pause
@echo off
echo Starting TrufadecuTTS - Google Cloud Text-to-Speech Interface...
echo Building application...

cd TrufadecuTTS

REM Build the application
dotnet build

if %ERRORLEVEL% EQU 0 (
    echo Build successful! Starting the application...
    echo Open your browser and navigate to the URL shown below:
    echo.
    
    REM Run the application
    dotnet run
) else (
    echo Build failed! Please check the error messages above.
    pause
    exit /b 1
)
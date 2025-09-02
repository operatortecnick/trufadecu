#!/bin/bash

# TrufadecuTTS Startup Script
echo "Starting TrufadecuTTS - Google Cloud Text-to-Speech Interface..."
echo "Building application..."

cd TrufadecuTTS

# Build the application
dotnet build

if [ $? -eq 0 ]; then
    echo "Build successful! Starting the application..."
    echo "Open your browser and navigate to the URL shown below:"
    echo ""
    
    # Run the application
    dotnet run
else
    echo "Build failed! Please check the error messages above."
    exit 1
fi
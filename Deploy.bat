@echo off
color 0A
echo ==============================================
echo      Deploying TutorM to Cloudflare Pages
echo ==============================================
echo.

echo [1/2] Building the React Application...
call npm run build
if %errorlevel% neq 0 (
    echo.
    color 0C
    echo Error: Build failed! Please check your code for errors.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Deploying to Cloudflare...
call npm run deploy
if %errorlevel% neq 0 (
    echo.
    color 0C
    echo Error: Deployment failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ==============================================
echo        Deployment SUCCESSFUL!
echo ==============================================
pause

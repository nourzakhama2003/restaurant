@echo off
echo ===========================================
echo   Restaurant Management - Development Workflow
echo ===========================================
echo.

echo Current Status Check:
echo.

echo Checking if Angular is running on port 4200...
netstat -ano | findstr :4200 >nul
if errorlevel 1 (
    echo [STATUS] Angular app: NOT RUNNING
    echo [ACTION] You can start it after Keycloak setup
) else (
    echo [STATUS] Angular app: RUNNING ✓
    echo [ACTION] Keep it running, use separate terminal for Keycloak
)

echo.
echo Checking if Keycloak is running on port 8080...
netstat -ano | findstr :8080 >nul
if errorlevel 1 (
    echo [STATUS] Keycloak: NOT RUNNING
    echo [ACTION] Will start fresh Keycloak
) else (
    echo [STATUS] Keycloak: RUNNING ✓
    echo [ACTION] Will restart with fresh config
)

echo.
echo ===========================================
echo   EXECUTING KEYCLOAK RESET
echo ===========================================
echo.

echo [1/2] Stopping and cleaning existing Keycloak...
call stop-all.bat

echo.
echo [2/2] Starting fresh Keycloak with your config...
call start-keycloak.bat

echo.
echo ===========================================
echo   WORKFLOW COMPLETE!
echo ===========================================
echo.

netstat -ano | findstr :4200 >nul
if errorlevel 1 (
    echo ⚠️  Angular app is not running
    echo    To start it: cd restaurant-frontend && npm start
) else (
    echo ✅ Angular app is still running on http://localhost:4200
)

echo ✅ Keycloak is running with fresh config on http://localhost:8080
echo ✅ Test users: testuser/password123, adminuser/admin123
echo.
pause

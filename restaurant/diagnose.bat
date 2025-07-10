@echo off
echo ===========================================
echo   Restaurant Management - System Diagnosis
echo ===========================================
echo.

echo [STEP 1] Checking current directory...
echo Current directory: %CD%
echo.

echo [STEP 2] Checking if required files exist...
if exist docker-compose.yml (
    echo ✅ docker-compose.yml - FOUND
) else (
    echo ❌ docker-compose.yml - NOT FOUND
)

if exist start-keycloak.bat (
    echo ✅ start-keycloak.bat - FOUND
) else (
    echo ❌ start-keycloak.bat - NOT FOUND
)

if exist keycloak-import\myrealm-config.json (
    echo ✅ myrealm-config.json - FOUND
) else (
    echo ❌ myrealm-config.json - NOT FOUND
)

if exist restaurant-frontend\package.json (
    echo ✅ Angular frontend - FOUND
) else (
    echo ❌ Angular frontend - NOT FOUND
)

echo.
echo [STEP 3] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker - NOT INSTALLED or NOT RUNNING
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
) else (
    echo ✅ Docker - INSTALLED
    docker --version
)

echo.
echo [STEP 4] Checking what's running on ports...
echo Checking port 8080 (Keycloak):
netstat -ano | findstr :8080
if errorlevel 1 (
    echo ❌ Nothing running on port 8080
) else (
    echo ✅ Something is running on port 8080
)

echo.
echo Checking port 4200 (Angular):
netstat -ano | findstr :4200
if errorlevel 1 (
    echo ❌ Nothing running on port 4200
) else (
    echo ✅ Something is running on port 4200
)

echo.
echo [STEP 5] Checking Node.js and npm...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js - NOT INSTALLED
    echo Please install Node.js from https://nodejs.org/
) else (
    echo ✅ Node.js - INSTALLED
    node --version
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm - NOT AVAILABLE
) else (
    echo ✅ npm - AVAILABLE
    npm --version
)

echo.
echo ===========================================
echo   DIAGNOSIS COMPLETE
echo ===========================================
echo.
echo Please share this output so I can help you fix the issues!
echo.
pause

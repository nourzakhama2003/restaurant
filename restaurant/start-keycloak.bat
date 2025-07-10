@echo off
echo ===========================================
echo   Restaurant Management - Quick Start
echo ===========================================
echo.

echo [1/3] Starting Keycloak with Docker Compose...
docker-compose up -d

echo.
echo [2/3] Waiting for Keycloak to be ready...
timeout /t 30 /nobreak

echo.
echo [3/3] Keycloak should be ready!
echo.
echo ===========================================
echo   READY TO USE!
echo ===========================================
echo.
echo Keycloak Admin: http://localhost:8080/admin
echo   Username: admin
echo   Password: admin
echo.
echo Your Angular App: http://localhost:4200
echo   Test User: testuser / password123
echo   Admin User: adminuser / admin123
echo.
echo To start Angular app, run:
echo   cd restaurant-frontend
echo   npm start
echo.
echo ===========================================

pause

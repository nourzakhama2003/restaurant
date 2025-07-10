@echo off
echo Stopping all restaurant services...

echo [1/2] Stopping Docker containers...
docker-compose down

echo [2/2] Removing containers and volumes...
docker-compose down -v

echo.
echo All services stopped and cleaned up!
echo.
echo To start fresh, run: start-keycloak.bat
pause

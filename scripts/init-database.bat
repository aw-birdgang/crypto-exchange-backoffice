@echo off
REM 데이터베이스 초기화 스크립트 (Windows)
REM 실행: scripts\init-database.bat

echo 🚀 Starting database initialization...

REM 컨테이너가 실행 중인지 확인
docker ps | findstr "crypto-exchange-api" >nul
if %errorlevel% neq 0 (
    echo ❌ crypto-exchange-api container is not running!
    echo Please start the containers first: docker compose up -d
    exit /b 1
)

docker ps | findstr "crypto-exchange-db" >nul
if %errorlevel% neq 0 (
    echo ❌ crypto-exchange-db container is not running!
    echo Please start the containers first: docker compose up -d
    exit /b 1
)

REM MySQL이 준비될 때까지 대기
echo ⏳ Waiting for MySQL to be ready...
for /L %%i in (1,1,10) do (
    echo Attempt %%i/10: Checking MySQL connection...
    
    docker exec crypto-exchange-db mysqladmin ping -h localhost -u crypto_user -ppassword --silent >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ MySQL is ready!
        goto :mysql_ready
    )
    
    if %%i equ 10 (
        echo ❌ MySQL failed to start within 60 seconds
        exit /b 1
    )
    
    echo ⏳ MySQL not ready yet, waiting 6 seconds...
    timeout /t 6 /nobreak >nul
)

:mysql_ready

REM API 컨테이너가 준비될 때까지 대기
echo ⏳ Waiting for API container to be ready...
for /L %%i in (1,1,10) do (
    echo Attempt %%i/10: Checking API container...
    
    docker exec crypto-exchange-api node -e "console.log('API ready')" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ API container is ready!
        goto :api_ready
    )
    
    if %%i equ 10 (
        echo ❌ API container failed to start within 60 seconds
        exit /b 1
    )
    
    echo ⏳ API container not ready yet, waiting 6 seconds...
    timeout /t 6 /nobreak >nul
)

:api_ready

echo 🌱 Running database initialization...

REM 로컬에서 초기화 스크립트 실행
cd apps\api
set DB_HOST=localhost
set DB_PORT=3306
set DB_USERNAME=crypto_user
set DB_PASSWORD=password
set DB_DATABASE=crypto_exchange
pnpm init:db

if %errorlevel% equ 0 (
    echo ✅ Database initialization completed successfully!
    echo.
    echo 📋 Available login accounts:
    echo   SUPER_ADMIN: superadmin@crypto-exchange.com / superadmin123!
    echo   ADMIN:       admin@crypto-exchange.com / admin123!
    echo   MODERATOR:   moderator@crypto-exchange.com / moderator123!
    echo   SUPPORT:     support@crypto-exchange.com / support123!
    echo   AUDITOR:     auditor@crypto-exchange.com / auditor123!
    echo.
    echo 🌐 API Server: http://localhost:3001
    echo 📚 API Documentation: http://localhost:3001/api-docs
) else (
    echo ❌ Database initialization failed!
    exit /b 1
)

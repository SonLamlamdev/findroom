@echo off
echo ========================================
echo   Setup Environment Files
echo ========================================
echo.

REM Create backend .env file
echo Creating backend/.env file...
(
echo MONGODB_URI=mongodb://localhost:27017/student-accommodation
echo JWT_SECRET=your_super_secret_key_change_this_in_production_12345
echo PORT=5000
echo NODE_ENV=development
echo UPLOAD_PATH=./uploads
echo MAX_FILE_SIZE=10485760
echo CLIENT_URL=http://localhost:5173
) > backend\.env

if exist backend\.env (
    echo [OK] backend/.env created successfully
) else (
    echo [ERROR] Failed to create backend/.env
)

echo.

REM Create frontend .env file
echo Creating frontend/.env file...
(
echo VITE_API_URL=http://localhost:5000
) > frontend\.env

if exist frontend\.env (
    echo [OK] frontend/.env created successfully
) else (
    echo [ERROR] Failed to create frontend/.env
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Please edit backend/.env and change JWT_SECRET to a secure random string!
echo.
pause


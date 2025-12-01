@echo off
echo ========================================
echo   Create Admin Accounts
echo ========================================
echo.

cd backend
node scripts/createAdminAccounts.js

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo You can now login with:
echo   Email: admin1@findroom.com
echo   Password: Admin123!@#
echo.
pause


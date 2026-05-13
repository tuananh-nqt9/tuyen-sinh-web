@echo off
echo ====================================
echo  HE THONG TUYEN SINH DAI HOC
echo ====================================
echo.

echo Kiem tra MongoDB...
netstat -an | findstr "27017" >nul
if %errorlevel% neq 0 (
    echo WARNING: MongoDB khong chay. Vui long khoi dong MongoDB truoc.
    echo Co the su dung: mongod
    echo.
)

echo.
echo ====================================
echo  KHOI Dong Backend (Node.js)...
echo ====================================
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"

echo.
echo ====================================
echo  Khoi Dong Frontend (UmiJS)...
echo ====================================
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ====================================
echo  Thong tin truy cap:
echo.
echo  Frontend: http://localhost:8000
echo  Backend:  http://localhost:5000
echo  API:      http://localhost:5000/api
echo.
echo  Admin login:
echo    Email:    admin@university.edu.vn
echo    Password: admin123
echo.
echo  Press any key to exit...
pause >nul

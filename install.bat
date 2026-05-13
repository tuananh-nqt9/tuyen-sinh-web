@echo off
echo ====================================
echo  CAI DAT HE THONG TUYEN SINH
echo ====================================
echo.

echo Dang tai cac goi can thiet...
echo.

echo ====================================
echo  Cai dat Backend...
echo ====================================
cd /d "%~dp0backend"
call npm install

echo.
echo ====================================
echo  Cai dat Frontend...
echo ====================================
cd /d "%~dp0frontend"
call npm install

echo.
echo ====================================
echo  Cai dat hoan tat!
echo ====================================
echo.
echo Chay file start.bat de khoi dong he thong.
echo.
pause

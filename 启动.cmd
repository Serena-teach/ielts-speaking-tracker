@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   雅思口语题库练习记录 - 本地启动
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有找到 Node.js，请先安装：https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 首次运行，正在安装依赖（大约 1 分钟）...
  call npm install
  if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
)

echo.
echo 正在启动开发服务器，浏览器会自动打开 http://localhost:5173/
echo 使用期间请不要关闭这个窗口；按 Ctrl + C 可停止服务。
echo.
call npm run dev
if errorlevel 1 (
  echo.
  echo [提示] 开发服务器启动失败，改用已构建好的静态版本启动 ...
  echo 浏览器打开 http://localhost:5173/ 即可。
  call node scripts\serve-static.mjs dist 5173
)
pause

@echo off
REM Clear Next.js build cache
echo Clearing Next.js cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .turbo rmdir /s /q .turbo

REM Clear npm cache
echo Clearing npm cache...
call npm cache clean --force

echo Cache cleared successfully!
echo Run 'npm run dev' to start the development server
pause

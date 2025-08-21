@echo off
echo Fixing Next.js permissions and cache issues...

REM Stop any running Next.js processes
taskkill /F /IM node.exe 2>nul

REM Take ownership and reset permissions
takeown /f .next /r /d y
icacls .next /reset /t

REM Remove the problematic directory
rmdir /s /q .next

REM Clear npm cache
npm cache clean --force

REM Remove node_modules and package-lock.json for clean reinstall
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Permissions fixed. Now run: npm install && npm run dev
pause
@echo off
echo === QUICK NEXTJS FIX ===

echo [1] Killing Node processes...
taskkill /F /IM node.exe 2>nul

echo [2] Cleaning caches...
rmdir /S /Q .next 2>nul
del package-lock.json 2>nul

echo [3] Fresh install...
npm install

echo [4] Starting clean server...
npm run dev -- --port 3000
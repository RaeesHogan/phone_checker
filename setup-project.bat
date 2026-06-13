@echo off
echo ==========================================
echo   CUSTOMER RESERVATION LOCK SYSTEM SETUP
echo ==========================================
echo.
echo 1. Installing dependencies using pnpm...
call pnpm add typescript prisma @prisma/client argon2 @types/node tsx next react react-dom

echo.
echo 2. Generating Prisma Client...
call npx prisma generate

echo.
echo 3. Creating Admin User (admin / admin123)...
node -e "const { PrismaClient } = require('@prisma/client'); const argon2 = require('argon2'); const prisma = new PrismaClient(); async function s(){ try { const h = await argon2.hash('admin123'); await prisma.user.upsert({ where:{username:'admin'}, update:{passwordHash:h}, create:{username:'admin', passwordHash:h, fullName:'Admin', role:'ADMIN', active:true} }); console.log('OK: Admin Created Successfully'); } catch(e){ console.error('Error:', e.message); } } s().catch(console.error);"

echo.
echo ==========================================
echo   SETUP COMPLETE!
echo   You can now run 'run-dev.bat'
echo ==========================================
pause

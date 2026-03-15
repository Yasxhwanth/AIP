@echo off
echo y | npx prisma db push --force-reset --skip-generate

@echo off
REM Limpieza express de dist/ en cmd.exe
rmdir /s /q dist\public
rmdir /s /q dist\tracking
del /q dist\.htaccess
del /q dist\_headers
del /q dist\debug-*.html
del /q dist\verificacion-post-deploy.js
del /q dist\llms.txt
del /q "dist\Cobertura Vita365 - Zinha.pdf"
if exist dist\tracking-module.js if %~z0==0 del dist\tracking-module.js

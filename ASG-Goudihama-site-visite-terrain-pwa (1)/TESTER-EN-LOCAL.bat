@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Ouverture du site en mode test local (rien n'est envoyé en ligne)...
start "" "%~dp0index.html"
start "" "%~dp0admin.html"

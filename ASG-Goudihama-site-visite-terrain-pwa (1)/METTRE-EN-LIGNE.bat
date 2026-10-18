@echo off
chcp 65001 >nul
setlocal EnableExtensions
title ASG Goudihama - Mise en ligne du site
cd /d "%~dp0"

rem ===== Réglages =====
set "PROJET=asg-goudihama"
set "BRANCHE=main"

echo.
echo  ==========================================================
echo     ASG GOUDIHAMA  -  Mise en ligne du site (Cloudflare)
echo  ==========================================================
echo.

rem --- 1. Vérifier que Node.js est installé ---
where node >nul 2>nul
if errorlevel 1 (
    echo  [!] Node.js n'est pas installé sur cet ordinateur.
    echo      Il est nécessaire une seule fois pour envoyer le site.
    echo.
    echo      La page de téléchargement va s'ouvrir : prenez la version "LTS",
    echo      installez-la ^(Suivant, Suivant...^), puis relancez ce fichier.
    echo.
    start "" "https://nodejs.org/fr/download"
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node -v') do echo  [OK] Node.js %%v détecté.

rem --- 2. Connexion au compte Cloudflare (la première fois seulement) ---
echo.
echo  Vérification de la connexion à Cloudflare...
call npx --yes wrangler@4 whoami 2>nul | findstr /i "associated with" >nul
if errorlevel 1 (
    echo.
    echo  [i] Première utilisation : votre navigateur va s'ouvrir.
    echo      Connectez-vous à Cloudflare puis cliquez sur "Allow / Autoriser".
    echo      Revenez ensuite sur cette fenêtre.
    echo.
    pause
    call npx --yes wrangler@4 login
    if errorlevel 1 (
        echo  [X] La connexion a échoué. Relancez ce fichier pour réessayer.
        pause
        exit /b 1
    )
)
echo  [OK] Connecté à Cloudflare.

rem --- 3. Préparer une copie propre du site (sans les fichiers d'outils) ---
set "TMPDIR=%TEMP%\asg-site-envoi"
if exist "%TMPDIR%" rmdir /s /q "%TMPDIR%"
mkdir "%TMPDIR%"
robocopy "%~dp0." "%TMPDIR%" /E /NFL /NDL /NJH /NJS /NP ^
    /XF "*.bat" "LISEZMOI.md" "*.zip" "Thumbs.db" "desktop.ini" ^
    /XD ".wrangler" "node_modules" ".git" >nul
if errorlevel 8 (
    echo  [X] Impossible de préparer les fichiers.
    pause
    exit /b 1
)

rem --- 4. Envoi vers Cloudflare Pages ---
echo.
echo  Envoi du site vers Cloudflare (projet "%PROJET%")...
echo.
call npx --yes wrangler@4 pages deploy "%TMPDIR%" --project-name "%PROJET%"
if errorlevel 1 (
    echo.
    echo  [X] L'envoi a échoué. Vérifiez votre connexion internet et réessayez.
    echo      Si le message parle du nom de projet, vérifiez qu'il s'appelle
    echo      bien "%PROJET%" dans Cloudflare (Travailleurs et pages).
    rmdir /s /q "%TMPDIR%" 2>nul
    pause
    exit /b 1
)
rmdir /s /q "%TMPDIR%" 2>nul

echo.
echo  ==========================================================
echo     [OK] SITE MIS EN LIGNE AVEC SUCCES
echo  ==========================================================
echo.
echo   Le contenu saisi dans l'administration est conservé.
echo   Si l'ancienne version s'affiche encore, rechargez la page.
echo.
start "" "https://%PROJET%.pages.dev"
pause

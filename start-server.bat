@echo off
title STARTECH - Serveur Local
cls
echo ============================================
echo   STARTECH - Serveur de developpement local
echo ============================================
echo.
echo Choisissez une option :
echo.
echo   1. Python (python -m http.server 8080)
echo   2. Node.js (npx serve .)
echo   3. PHP (php -S localhost:8080)
echo   4. Quitter
echo.

set /p choix="Votre choix (1/2/3/4) : "

if "%choix%"=="1" (
    echo.
    echo Demarrage du serveur Python sur http://localhost:8080
    echo.
    echo Ouvrez http://localhost:8080/devis.html dans votre navigateur
    echo Appuyez sur Ctrl+C pour arreter.
    echo.
    python -m http.server 8080
    goto fin
)

if "%choix%"=="2" (
    echo.
    echo Demarrage du serveur Node.js...
    echo.
    npx serve .
    goto fin
)

if "%choix%"=="3" (
    echo.
    echo Demarrage du serveur PHP sur http://localhost:8080
    echo.
    echo Ouvrez http://localhost:8080/devis.html dans votre navigateur
    echo Appuyez sur Ctrl+C pour arreter.
    echo.
    php -S localhost:8080
    goto fin
)

if "%choix%"=="4" goto fin

echo.
echo Choix invalide.
goto fin

:fin
echo.
pause
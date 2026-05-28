@echo off
title Launcher de Microservicios - SaludPol
echo ===================================================
echo Iniciando entorno de desarrollo de Microservicios
echo ===================================================

:: 1. Servidor de Descubrimiento (Eureka) con delay de 15 segundos
echo [1/7] Iniciando api-eureka-main...
start "Eureka Server" cmd /k "cd api-eureka-main && mvn spring-boot:run"
echo Esperando que Eureka levante por completo...
timeout /t 15 /nobreak

:: 2. API Gateway con delay de 10 segundos
echo [2/7] Iniciando api-gateway-main...
start "API Gateway" cmd /k "cd api-gateway-main && mvn spring-boot:run"
echo Esperando que el Gateway se registre en Eureka...
timeout /t 10 /nobreak

:: 3. Microservicios del ecosistema HCE
echo [4/7] Iniciando hce-filiacion...
start "HCE Filiacion" cmd /k "cd hce-filiacion && mvn spring-boot:run"
timeout /t 6 /nobreak

echo [3/7] Iniciando hce-consulta-externa...
start "HCE Consulta Externa" cmd /k "cd hce-consulta-externa && mvn spring-boot:run"
timeout /t 6 /nobreak

echo [5/7] Iniciando hce-orden-medica...
start "HCE Orden Medica" cmd /k "cd hce-orden-medica && mvn spring-boot:run"
timeout /t 6 /nobreak

:: 4. Frontend / Aplicación Principal (NodeJS / Next.js)
echo [6/7] Iniciando historia-clinica (Frontend)...
start "Frontend Historia Clinica" cmd /k "cd historia-clinica && npm run dev"

timeout /t 2 /nobreak
echo ===================================================
echo [Ok] ¡Todos los servicios han sido lanzados!
echo Puedes cerrar esta ventana principal si deseas.
echo ===================================================
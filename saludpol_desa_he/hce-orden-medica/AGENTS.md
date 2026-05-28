# SALUDPOL HCE - AGENTS.md

## Contexto General

Sistema HCE distribuido basado en microservicios.

Microservicios principales:
- hce-filiacion
- hce-consulta-externa
- hce-orden-medica
- api-gateway-main
- api-eureka-main

Stack:
- Java 21
- Spring Boot
- Oracle
- JPA/Hibernate
- OpenFeign
- Eureka
- React frontend

---

# Arquitectura

Frontend -> Gateway -> Microservicio -> Oracle

Los microservicios consumen contexto mediante OpenFeign.

No duplicar lógica innecesaria entre servicios.

---

# Filosofía de diseño

- Cada microservicio debe tener responsabilidad clara.
- Evitar acoplamiento excesivo.
- Evitar snapshots innecesarios.
- Guardar solo datos históricos mínimos.
- Los datos vivos deben pertenecer a su servicio dueño.
- Mantener contratos simples y estables.

---

# Orden Médica

Responsabilidad:
- administrar OAP
- registrar prestaciones
- registrar órdenes especializadas
- validar contexto clínico

No es dueño de:
- filiación
- admisión
- historia clínica completa
- atención clínica

---

# Reglas importantes

- HistoriaClinicaId y AdmisionId actualmente tienen relación 1:1.
- En el futuro puede existir relación 1:N.
- OAP futuro = atencionId + tipoAtencion.
- No generar correlativos artificiales desde Orden Médica.
- Emergencia y Hospitalización aún no implementados completamente.

---

# Integraciones

## Filiación

Responsable de:
- paciente
- admisión
- historia clínica
- cobertura
- IPRESS

## Consulta Externa

Responsable de:
- contexto clínico
- atención
- profesional
- servicio

---

# Convenciones

- DTOs pequeños y segmentados.
- Responses agrupados por bloques funcionales.
- Services contienen lógica.
- Controllers solo orquestan requests/responses.
- Repositories sin lógica compleja.
- Evitar lógica clínica en controllers.

---

# Reglas para agentes IA

- No inventar endpoints.
- No asumir tablas inexistentes.
- Validar contratos antes de modificar DTOs.
- Mantener compatibilidad con frontend.
- Explicar impacto cross-microservice.
- Preferir cambios incrementales.
- Evitar duplicidad innecesaria.
- No romper contratos REST existentes.
- Mantener nombres consistentes con el proyecto.

---

# Naming

Evitar nombres ambiguos como:
- contexto
- data
- info
- helper

Preferir nombres explícitos:
- contexto-clinico
- admision-resumen
- orden-medica-detalle

---

# Performance

- Evitar llamadas Feign innecesarias.
- Evitar N+1 queries.
- Mantener listados ligeros.
- El detalle completo puede enriquecer información.

---

# Seguridad

- JWT obligatorio.
- Reenviar Authorization entre microservicios.
- No exponer endpoints internos innecesarios.

---

# Estado actual conocido

- Existe listado y detalle de órdenes.
- Formulario completo de creación aún no visible en frontend.
- Emergencia y Hospitalización pendientes.
- Firma digital clínica pendiente.
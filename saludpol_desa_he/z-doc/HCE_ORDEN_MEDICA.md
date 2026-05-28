# Documentacion del microservicio hce-orden-medica

Este documento explica el proyecto `hce-orden-medica` dentro del workspace `saludpol_desa_he`. La idea es leerlo como una guia practica: que hace, con quien conversa, por donde entra una peticion y que archivo participa en cada parte.

> Nota importante: esta documentacion se basa en los archivos reales revisados. Cuando algo no aparece claro en codigo, lo marco como **pendiente de validar**.

## 1. Proposito general

`hce-orden-medica` es el microservicio HCE encargado de registrar, actualizar, listar y consultar ordenes medicas u OAP.

En este proyecto una orden medica se compone de:

- Una cabecera: numero OAP, admision, historia clinica, atencion, estado, fecha, APS, carta de garantia, datos de seguro.
- Uno o varios detalles generales: prestaciones solicitadas de laboratorio, imagen, procedimiento diagnostico, procedimiento terapeutico programado, terapia especializada u otros.
- Un bloque especial exclusivo cuando el tipo de orden es hemodialisis o quimioterapia.
- Datos enriquecidos desde filiacion: paciente, historia clinica, admision, IPRESS, cobertura, acto medico y profesional.

La base propia del microservicio es Oracle, esquema `SCH_HCE_ORDEN`, y sus tablas principales son:

```text
SCH_HCE_ORDEN
|-- TBL_ORDEN_MEDICA
|-- TBL_ORDEN_MEDICA_DET
|-- TBL_ORDEN_HEMODIALISIS
`-- TBL_ORDEN_QUIMIOTERAPIA
```

El servicio corre localmente en el puerto `8094` con context path `/api/v1/hce`.

## 2. Relacion con otros proyectos del workspace

### historia-clinica frontend

El frontend `historia-clinica` consume endpoints REST a traves de `src/api/ordenMedica.js`.

Endpoints usados por ese archivo:

```text
GET  /api/v1/hce/orden-medica/historia-clinica/{historiaClinicaId}
GET  /api/v1/hce/orden-medica/admision/{admisionId}
GET  /api/v1/hce/orden-medica/{id}
POST /api/v1/hce/orden-medica
PUT  /api/v1/hce/orden-medica/{id}
```

En la pantalla actual `src/pages/ordenmedica/OrdenMedicaPage.jsx`, el flujo visible es:

```text
Usuario busca admision por DNI
        |
        v
FiliacionSearchTray
        |
        v
Selecciona una admision
        |
        v
OrdenMedicaListaPanel lista ordenes por admisionId
        |
        v
OrdenMedicaDetallePanel muestra el detalle de una orden
```

Pendiente de validar: el frontend tiene funciones `crearOrdenMedica` y `actualizarOrdenMedica`, pero en la pantalla revisada de orden medica solo encontre listado y detalle. No encontre formulario visible de alta/edicion de orden en `pages/ordenmedica`.

### api-gateway-main

`api-gateway-main` publica la ruta hacia este microservicio usando Eureka:

```properties
spring.cloud.gateway.routes[24].id=hce-orden-medica
spring.cloud.gateway.routes[24].uri=lb://hce-orden-medica
spring.cloud.gateway.routes[24].predicates[0]=Path=/api/v1/hce/orden-medica/**
```

Eso significa:

```text
Frontend
  |
  | /api/v1/hce/orden-medica/...
  v
api-gateway-main :8085
  |
  | lb://hce-orden-medica
  v
hce-orden-medica :8094
```

Nota: en el comentario del gateway dice "solo lectura", pero la ruta permite todo `/api/v1/hce/orden-medica/**`. El microservicio si expone `POST` y `PUT`. Esto queda como **pendiente de validar funcionalmente/politicamente**, porque el codigo no bloquea esos metodos en gateway.

### api-eureka-main

`api-eureka-main` es el servidor Eureka, puerto `8761`.

`hce-orden-medica` se registra con:

```properties
spring.application.name=hce-orden-medica
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/
```

El gateway usa ese nombre logico `lb://hce-orden-medica` para encontrar la instancia.

### hce-filiacion

`hce-orden-medica` depende de `hce-filiacion` para resolver admisiones e historia clinica. Lo hace mediante `FiliacionClient`.

Llamadas Feign reales:

```text
hce-orden-medica
  |
  | FeignClient(name = "hce-filiacion")
  v
hce-filiacion

GET /api/v1/hce/admision/{id}
GET /api/v1/hce/admision?dni=&nroHc=&page=&size=
GET /api/v1/hce/admision/historia-clinica/dni/{dni}
```

El microservicio guarda en su BD los identificadores y algunos datos snapshot, pero los datos completos del paciente/admission se consultan a filiacion.

### hce-consulta-externa

`hce-orden-medica` guarda `tipoAtencion` y `atencionId` para identificar el origen asistencial de la orden.

Ademas consume `hce-consulta-externa` mediante `ConsultaExternaClient`:

```text
GET /api/v1/hce/consulta/atenciones/{id}/contexto
```

Ese contexto se usa al crear, actualizar y consultar detalle para validar que la atencion origen:

- tenga el tipo de atencion enviado;
- pertenezca a la admision indicada;
- pertenezca a la historia clinica de esa admision.

Pendiente de validar: no encontre una llamada desde `hce-consulta-externa` hacia `hce-orden-medica` que dispare la creacion de la orden desde la atencion. La dependencia tecnica visible hoy va desde Orden Medica hacia Consulta Externa para resolver contexto.

## 3. Flujo funcional completo

### 3.1 Busqueda por DNI

Hay dos caminos posibles en codigo:

```text
Camino usado por la pantalla actual

historia-clinica
  FiliacionSearchTray.jsx
    |
    v
  src/api/admision.js
    GET /api/v1/hce/admision?dni=...
    |
    v
  gateway
    |
    v
  hce-filiacion
```

```text
Camino expuesto por hce-orden-medica

Cliente
  |
  v
GET /api/v1/hce/orden-medica/paciente/admisiones?dni=...
  |
  v
PacienteOrdenController
  |
  v
PacienteOrdenService
  |
  v
FiliacionClient.buscarAdmisiones(...)
  |
  v
hce-filiacion /admision
```

Pendiente de validar: el segundo camino existe en backend, pero no encontre que el frontend actual lo consuma.

### 3.2 Obtencion de datos de filiacion / historia clinica

Para obtener historia clinica por DNI:

```text
GET /api/v1/hce/orden-medica/paciente/historia-clinica/dni/{dni}
  -> PacienteOrdenController.obtenerHcPorDni
  -> PacienteOrdenService.obtenerHistoriaClinicaPorDni
  -> FiliacionClient.obtenerHcPorDni
  -> hce-filiacion /admision/historia-clinica/dni/{dni}
```

Para obtener una admision especifica:

```text
GET /api/v1/hce/orden-medica/paciente/admision/{id}
  -> PacienteOrdenController.obtenerAdmision
  -> PacienteOrdenService.obtenerAdmision
  -> FiliacionClient.obtenerAdmision
  -> hce-filiacion /admision/{id}
```

Para crear o consultar una orden, `OrdenMedicaService` tambien llama a `resolverAdmision(admisionId)`. Esa admision se usa para:

- validar que la admision exista;
- copiar `historiaClinicaId`;
- calcular edad;
- completar tipo de seguro, beneficiario, plan y carta de garantia cuando faltan;
- armar la respuesta detalle con paciente, IPRESS, cobertura, acto medico, profesional y firma.

### 3.3 Generacion de orden medica

Endpoint real:

```text
POST /api/v1/hce/orden-medica
```

Flujo tecnico:

```text
OrdenMedicaController.crear(request)
  |
  v
OrdenMedicaService.crear(request)
  |
  |-- resolverAdmision(request.admisionId)
  |     `-- FiliacionClient.obtenerAdmision(admisionId)
  |
  |-- resolverContextoAtencion(request.tipoAtencion, request.atencionId)
  |     `-- ConsultaExternaClient.obtenerContexto(atencionId)
  |
  |-- validar que atencion, admision e historia clinica coincidan
  |-- crear Entity OrdenMedica
  |-- generar nroOap con OapCorrelativoService
  |-- aplicar snapshot desde admision
  |-- aplicar detalles
  |-- aplicar hemodialisis si viene
  |-- aplicar quimioterapia si viene
  |
  v
OrdenMedicaRepository.save(orden)
  |
  v
Oracle SCH_HCE_ORDEN
```

El numero OAP se genera automaticamente con formato:

```text
YYYY-MM-NNNNNN
ejemplo: 2026-05-000135
```

Lo genera `OapCorrelativoService`, buscando el maximo `nroOap` del periodo actual y sumando 1.

### 3.4 Registro de cabecera

La cabecera se guarda en `TBL_ORDEN_MEDICA`, representada por la entity `OrdenMedica`.

Campos relevantes:

```text
I_ID
V_NRO_OAP
V_TIPO_ATENCION
I_ATENCION_ID
I_ADMISION_ID
I_HISTORIA_CLINICA_ID
V_TIPO_ORDEN
I_EDAD
V_TIPO_SEGURO
V_TIPO_BENEFICIARIO
V_PLAN_SEGURO
V_NRO_APS
V_NRO_CARTA_GARANTIA
V_ESTADO
T_FECHA_EMISION
T_CREATED_AT / V_CREATED_BY
T_UPDATED_AT / V_UPDATED_BY
```

`OrdenMedica` hereda auditoria de `AuditableEntity`, por eso al insertar/actualizar se llenan fechas y usuario.

### 3.5 Registro de detalle

Los detalles se guardan en `TBL_ORDEN_MEDICA_DET`, representada por `OrdenMedicaDet`.

Cada detalle tiene:

```text
tipo: LAB | IMG | PDI | PTE | TES | OTR
codigoCie10
codigoCpms
codigoSegus
descripcion
cantidad
prioridad
observaciones
estado
```

En `OrdenMedicaService.aplicarDetalles`:

- Si llega un detalle sin `id`, se crea uno nuevo.
- Si llega con `id`, se actualiza el detalle existente.
- Si antes existia un detalle y ya no viene en el request, se remueve de la orden.
- La relacion en `OrdenMedica` tiene `cascade = CascadeType.ALL` y `orphanRemoval = true`, por eso JPA persiste y elimina hijos junto con la cabecera.

### 3.6 Ordenes especiales: hemodialisis y quimioterapia

Son hijos especiales 0..1 y exclusivos por orden.

```text
OrdenMedica
  |-- detalles comunes: uno o muchos del mismo tipo
  |-- hemodialisis: uno solo cuando tipoOrden = HEM
  `-- quimioterapia: uno solo cuando tipoOrden = QUI
```

Hemodialisis:

- Request: `OrdenHemodialisisRequest`
- Entity: `OrdenHemodialisis`
- Tabla: `TBL_ORDEN_HEMODIALISIS`
- Repository: `OrdenHemodialisisRepository`
- Response: `OrdenHemodialisisDto`

Quimioterapia:

- Request: `OrdenQuimioterapiaRequest`
- Entity: `OrdenQuimioterapia`
- Tabla: `TBL_ORDEN_QUIMIOTERAPIA`
- Repository: `OrdenQuimioterapiaRepository`
- Response: `OrdenQuimioterapiaDto`

Si en una actualizacion el request trae `hemodialisis = null`, el servicio elimina la relacion especial. Igual para `quimioterapia = null`.

### 3.7 Consulta de ordenes registradas

Endpoints reales:

```text
GET /api/v1/hce/orden-medica/historia-clinica/{historiaClinicaId}
GET /api/v1/hce/orden-medica/admision/{admisionId}
GET /api/v1/hce/orden-medica/atencion/{tipoAtencion}/{atencionId}
GET /api/v1/hce/orden-medica/{id}
```

Listado por historia clinica:

```text
Controller
  -> OrdenMedicaService.listarPorHistoriaClinica
  -> OrdenMedicaRepository.findByHistoriaClinicaIdOrderByFechaEmisionDesc
  -> OrdenMedicaResumenDto
```

Listado por admision:

```text
Controller
  -> OrdenMedicaService.listarPorAdmision
  -> OrdenMedicaRepository.findByAdmisionIdOrderByFechaEmisionDesc
  -> OrdenMedicaResumenDto
```

Detalle:

```text
GET /orden-medica/{id}
  |
  v
OrdenMedicaService.obtenerDetalle(id)
  |
  |-- busca cabecera en OrdenMedicaRepository
  |-- consulta admision en hce-filiacion
  |-- consulta contexto de atencion en hce-consulta-externa
  |-- busca detalles en OrdenMedicaDetRepository
  |-- busca hemodialisis en OrdenHemodialisisRepository
  |-- busca quimioterapia en OrdenQuimioterapiaRepository
  |
  v
OrdenMedicaDetalleResponse
```

## 4. Flujo tecnico general

### Frontend -> Gateway -> Controller -> Service -> Repository -> BD

```text
historia-clinica
  src/api/ordenMedica.js
        |
        v
api-gateway-main :8085
  Path=/api/v1/hce/orden-medica/**
        |
        v
hce-orden-medica :8094
  OrdenMedicaController
        |
        v
  OrdenMedicaService
        |
        v
  OrdenMedicaRepository / DetRepository / EspecialesRepository
        |
        v
Oracle SCH_HCE_ORDEN
```

### Service -> FeignClient -> hce-filiacion

```text
OrdenMedicaService
  resolverAdmision(admisionId)
        |
        v
FiliacionClient
  @FeignClient(name = "hce-filiacion")
        |
        v
Eureka resuelve hce-filiacion
        |
        v
hce-filiacion
  AdmisionController
        |
        v
AdmisionService / BD de filiacion
```

`FeignConfig` reenvia el header `Authorization` al servicio llamado. Asi, si llega un JWT al microservicio de orden medica, tambien viaja hacia `hce-filiacion`.

## 5. Explicacion de carpetas

```text
hce-orden-medica
|-- client
|   |-- dto
|   |-- FeignConfig.java
|   `-- FiliacionClient.java
|-- common
|   |-- audit
|   |-- dto
|   |-- exception
|   |-- security
|   `-- util
|-- config
|-- controller
|-- dto
|-- entity
|-- repository
|-- service
`-- src/main/resources
    |-- application.properties
    `-- db
```

### client

Contiene clientes para llamar a otros microservicios. En este caso, llama a `hce-filiacion`.

### client/dto

Contiene los modelos que representan lo que devuelve `hce-filiacion`. No son entities propias de orden medica; son contratos de respuesta externa.

### common

Agrupa piezas transversales usadas por todo el microservicio: respuesta estandar, errores, seguridad, auditoria y utilidades.

### common/audit

Base de auditoria para entities. Hoy la usa `OrdenMedica`.

### common/dto

DTO generico de respuesta REST: `ApiResponse`.

### common/exception

Excepciones propias y manejador global para convertir errores Java en respuestas HTTP claras.

### common/security

Filtro JWT que autentica requests con `Authorization: Bearer <token>`.

### common/util

Utilidades generales. En este proyecto contiene `JwtUtil`.

### config

Configuraciones Spring: seguridad y documentacion OpenAPI/Swagger.

### controller

Puntos de entrada HTTP. Aqui estan los endpoints reales.

### dto

Contratos de entrada y salida del propio microservicio `hce-orden-medica`.

### entity

Mapeo Java de tablas Oracle del esquema `SCH_HCE_ORDEN`.

### repository

Interfaces Spring Data JPA para consultar/guardar entities.

### service

Logica de negocio y orquestacion: crear ordenes, actualizar, listar, enriquecer con filiacion, generar correlativos.

### resources

Configuracion del servicio y scripts SQL.

## 6. Archivo por archivo

### Raiz del proyecto

#### `pom.xml`

Define el proyecto Maven, Java 21, Spring Boot, dependencias web, JPA, Security, Validation, Actuator, Oracle, Lombok, JWT, OpenAPI, Eureka Client y OpenFeign. Lo consume Maven al compilar/ejecutar.

#### `README.md`

Resumen operativo del microservicio: seguridad, token, puerto, context path, endpoints y DDL. Lo consume el equipo como guia rapida.

#### `mvnw` y `mvnw.cmd`

Wrappers de Maven para ejecutar comandos sin depender de una instalacion global de Maven. Se usan al construir o correr el proyecto.

#### `HceOrdenMedicaApplication.java`

Clase principal Spring Boot. Tiene `@EnableFeignClients`, por eso Spring detecta los clientes Feign del modulo. Se usa al iniciar el microservicio.

### client

#### `client/FiliacionClient.java`

FeignClient hacia `hce-filiacion`. Expone tres llamadas: obtener admision, buscar admisiones y obtener historia clinica por DNI. Lo consumen `PacienteOrdenService` y `OrdenMedicaService`.

Se usa cuando:

- se busca paciente/admisiones desde endpoints proxy de orden medica;
- se crea o actualiza una orden;
- se consulta el detalle de una orden y se necesita completar datos de paciente/IPRESS/profesional.

#### `client/ConsultaExternaClient.java`

FeignClient hacia `hce-consulta-externa`. Obtiene el contexto de una atencion por id para que `OrdenMedicaService` valide el origen de la orden y complete acto medico, servicio y profesional en el detalle.

#### `client/FeignConfig.java`

Configura un interceptor Feign que copia el header `Authorization` del request entrante hacia las llamadas salientes. Lo consume Spring al crear clientes Feign.

### client/dto

#### `AdmisionClientDto.java`

Representa una admision devuelta por `hce-filiacion`: paciente, historia clinica, datos de cobertura, acto medico, IPRESS y profesional. Lo consumen `PacienteOrdenService` y `OrdenMedicaService`.

#### `AdmisionClientResponse.java`

Wrapper de respuesta para una sola admision: `success` y `data`. Lo devuelve `FiliacionClient.obtenerAdmision`.

#### `AdmisionPageClientResponse.java`

Wrapper de respuesta paginada para busqueda de admisiones. Lo devuelve `FiliacionClient.buscarAdmisiones`.

#### `HistoriaClinicaClientDto.java`

Representa historia clinica devuelta por filiacion: id, nro HC, DNI, nombres, fecha nacimiento, sexo, estado y fecha apertura. Se usa en el endpoint proxy de busqueda por DNI.

#### `HistoriaClinicaClientResponse.java`

Wrapper de respuesta para una historia clinica. Lo devuelve `FiliacionClient.obtenerHcPorDni`.

#### `PageClientDto.java`

DTO generico de pagina: contenido, numero, size, total, first/last. Lo usa la busqueda de admisiones.

### common/audit

#### `AuditableEntity.java`

Clase base para auditoria JPA. Llena `createdAt`, `createdBy`, `updatedAt`, `updatedBy` antes de insertar/actualizar. La consume `OrdenMedica`, que extiende esta clase.

### common/dto

#### `ApiResponse.java`

Respuesta estandar de exito/error: `success`, `data`, `message`. La consumen los controllers para envolver respuestas.

Ejemplo:

```json
{
  "success": true,
  "data": { }
}
```

### common/exception

#### `EntityNotFoundException.java`

Excepcion para recursos no encontrados. La lanzan services cuando no existe una orden, admision o historia clinica.

#### `EntityUnprocessableException.java`

Excepcion para reglas de negocio no procesables, por ejemplo intentar editar una orden `ANULADA` o cambiar la admision de una orden.

#### `EntityUnauthorizedException.java`

Excepcion preparada para errores de autorizacion. En el codigo revisado no aparece lanzada por los services principales.

#### `EntityGenericClientException.java`

Excepcion generica para errores 4xx con status y suberrores. La maneja `GlobalExceptionHandler`.

#### `EntityGenericServerException.java`

Excepcion generica para errores internos controlados. La maneja `GlobalExceptionHandler`.

#### `GlobalExceptionHandler.java`

Manejador global de errores. Convierte excepciones en respuestas HTTP con `ErrorDTO`. Tambien maneja validaciones de `@Valid`, JSON mal formado, parametros faltantes, tipos incorrectos y conflictos de integridad.

#### `ErrorDTO.java`

Formato de respuesta de error: status, httpStatus, timestamp, message, debugMessage, subErrors.

#### `GlobalConstant.java`

Constantes de codigos de error: `CLIENT_404`, `422`, `401`, `500`, prefijos cliente/servidor.

#### `SubError.java`

Interfaz base para errores secundarios dentro de un error principal.

#### `ValidationError.java`

Implementa `SubError` para errores de validacion de campos: objeto, campo, valor rechazado y mensaje.

### common/security

#### `JwtAuthFilter.java`

Filtro que lee `Authorization: Bearer <token>`, valida el JWT con `JwtUtil` y coloca el usuario en el `SecurityContext`. Si el token es invalido, responde `401`.

Se ejecuta antes de llegar a controllers.

### common/util

#### `JwtUtil.java`

Valida y parsea JWT usando `jwt.secret`. Extrae el `subject` como usuario. Lo consume `JwtAuthFilter`.

### config

#### `SecurityConfig.java`

Configura seguridad stateless:

- CSRF deshabilitado;
- headers de seguridad;
- `/api/hce/public/**` publico;
- cualquier otro endpoint autenticado;
- registra `JwtAuthFilter`.

Nota: como el microservicio usa context path `/api/v1/hce`, los endpoints reales de orden medica requieren JWT.

#### `OpenApiConfig.java`

Configura Swagger/OpenAPI con esquema `bearerAuth`. Sirve para documentar y probar endpoints con JWT.

### controller

#### `OrdenMedicaController.java`

Controller principal de ordenes medicas.

Endpoints reales:

```text
POST /orden-medica
PUT  /orden-medica/{id}
GET  /orden-medica/{id}
GET  /orden-medica/historia-clinica/{historiaClinicaId}
GET  /orden-medica/admision/{admisionId}
```

Consume `OrdenMedicaService`. Se usa para crear, actualizar, listar y consultar detalle.

#### `PacienteOrdenController.java`

Controller auxiliar para busquedas de paciente/admisiones desde el contexto de orden medica.

Endpoints reales:

```text
GET /orden-medica/paciente/admisiones?dni=&nroHc=&page=&size=
GET /orden-medica/paciente/historia-clinica/dni/{dni}
GET /orden-medica/paciente/admision/{id}
```

Consume `PacienteOrdenService`, que a su vez usa `FiliacionClient`.

Pendiente de validar: no encontre consumo de estos endpoints desde la pantalla actual de `historia-clinica`, que usa `/api/v1/hce/admision` directamente.

### dto

#### `OrdenMedicaRequest.java`

Request de crear/actualizar orden. Incluye `admisionId`, `atencionId`, origen, APS, carta garantia, estado, lista de detalles y bloques especiales de hemodialisis/quimioterapia. El service valida que el contenido enviado sea exclusivo segun el tipo de orden: `LAB`, `IMG`, `PDI`, `PTE`, `TES`, `OTR`, `HEM` o `QUI`.

Lo consume `OrdenMedicaController` en `POST` y `PUT`.

#### `OrdenMedicaDetRequest.java`

Request de cada detalle de prestacion. Tiene validaciones para tipo, codigos, descripcion, cantidad, prioridad, observaciones y estado. Lo consume `OrdenMedicaRequest`.

#### `OrdenHemodialisisRequest.java`

Request opcional con datos especificos de hemodialisis. Lo consume `OrdenMedicaRequest`.

#### `OrdenQuimioterapiaRequest.java`

Request opcional con datos especificos de quimioterapia. Lo consume `OrdenMedicaRequest`.

#### `OrdenMedicaDetalleResponse.java`

Response completo de detalle de orden. Agrupa cabecera, asegurado, establecimiento, cobertura, acto medico, profesional, prestaciones, hemodialisis, quimioterapia y firma. Lo devuelve `GET /orden-medica/{id}`, `POST` y `PUT`.

#### `OrdenMedicaCabeceraDto.java`

Parte de la respuesta detalle. Contiene datos administrativos de la orden: id, nro OAP, nro HC, fecha/hora, APS, carta, estado, origen, ids y snapshot de cobertura.

#### `AseguradoDto.java`

Parte de la respuesta detalle. Contiene datos del paciente/asegurado, construidos desde la admision de filiacion y la orden.

#### `EstablecimientoDto.java`

Parte de la respuesta detalle. Contiene IPRESS, sede, region, categoria y plan.

#### `CoberturaDto.java`

Parte de la respuesta detalle. Contiene tipo de seguro, plan, cobertura y beneficio.

#### `ActoMedicoDto.java`

Parte de la respuesta detalle. Contiene tipo de atencion, actividad, subactividad, servicio y fecha de atencion.

#### `ProfesionalDto.java`

Parte de la respuesta detalle. Contiene profesional solicitante, profesion y colegiatura. Algunos campos salen como `null` porque no llegan desde la admision actual.

#### `FirmaProfesionalDto.java`

Parte de la respuesta detalle. Contiene datos para bloque de firma. El hash de firma y registro especialista salen como `null` en el mapeo actual.

#### `PrestacionesAgrupadasDto.java`

Agrupa detalles en `laboratorio`, `imagen`, `procedimientoDiagnostico`, `procedimientoTerapeutico`, `terapiaEspecializada` y `otros`. Lo arma `OrdenMedicaService.agruparPrestaciones`.

#### `OrdenMedicaDetDto.java`

Response de una fila de detalle. Es lo que se muestra en tablas de prestaciones.

#### `OrdenHemodialisisDto.java`

Response de datos de hemodialisis. Lo arma `toHemodialisisDto`.

#### `OrdenQuimioterapiaDto.java`

Response de datos de quimioterapia. Lo arma `toQuimioterapiaDto`.

#### `OrdenMedicaResumenDto.java`

Response resumido para listados por historia clinica o admision. Incluye cantidad de detalles.

### entity

#### `OrdenMedica.java`

Entity principal. Mapea `TBL_ORDEN_MEDICA`. Tiene relaciones:

```text
OrdenMedica
|-- List<OrdenMedicaDet> detalles
|-- OrdenHemodialisis hemodialisis
`-- OrdenQuimioterapia quimioterapia
```

La consume `OrdenMedicaRepository` y `OrdenMedicaService`.

#### `OrdenMedicaDet.java`

Entity hija de detalle. Mapea `TBL_ORDEN_MEDICA_DET`. Pertenece a una orden por `@ManyToOne`.

#### `OrdenHemodialisis.java`

Entity hija especial 0..1. Mapea `TBL_ORDEN_HEMODIALISIS`. Pertenece a una orden por `@OneToOne`.

#### `OrdenQuimioterapia.java`

Entity hija especial 0..1. Mapea `TBL_ORDEN_QUIMIOTERAPIA`. Pertenece a una orden por `@OneToOne`.

### repository

#### `OrdenMedicaRepository.java`

Repositorio JPA de cabecera. Tiene consultas por historia clinica, por admision y maximo OAP por prefijo.

Lo consumen `OrdenMedicaService` y `OapCorrelativoService`.

#### `OrdenMedicaDetRepository.java`

Repositorio JPA de detalles. Busca detalles por id de orden, ordenados ascendentemente. Lo consume `OrdenMedicaService`.

#### `OrdenHemodialisisRepository.java`

Repositorio JPA de hemodialisis. Busca por id de orden. Lo consume `OrdenMedicaService`.

#### `OrdenQuimioterapiaRepository.java`

Repositorio JPA de quimioterapia. Busca por id de orden. Lo consume `OrdenMedicaService`.

### service

#### `OrdenMedicaService.java`

Corazon del microservicio. Orquesta:

- crear orden;
- actualizar orden;
- validar estados editables;
- validar que no se cambie la admision;
- resolver admision desde `hce-filiacion`;
- aplicar snapshot de filiacion;
- guardar detalles;
- guardar/eliminar hemodialisis y quimioterapia;
- listar resumenes;
- construir detalle completo.

Archivos relacionados: controllers, repositories, entities, DTOs, `FiliacionClient` y `ConsultaExternaClient`.

#### `PacienteOrdenService.java`

Servicio proxy hacia filiacion para busqueda de admisiones, historia clinica por DNI y admision por id. Lo consume `PacienteOrdenController`.

#### `OapCorrelativoService.java`

Genera el siguiente numero OAP del mes actual. Usa `OrdenMedicaRepository.findMaxNroOapByPrefijo`.

### resources

#### `application.properties`

Configura nombre de aplicacion, puerto, context path, datasource Oracle, JPA, CORS, actuator, logs, JWT y Eureka.

Puntos clave:

```properties
spring.application.name=hce-orden-medica
server.port=8094
server.servlet.context-path=/api/v1/hce
spring.jpa.properties.hibernate.default_schema=SCH_HCE_ORDEN
```

#### `db/SCH_HCE_ORDEN.ddl.sql`

Script DDL para crear secuencias, tablas, constraints e indices del esquema de orden medica.

#### `db/SCH_HCE_ORDEN.sample-data.sql`

Datos de ejemplo para pruebas locales. Segun el README, trae ordenes demo relacionadas a HC/admision/atencion `1`.

## 7. Por que hay tantos DTO pequenos y no un solo DTO gigante

Hay varios DTO pequenos porque cada uno representa una parte concreta del contrato.

Ejemplo:

```text
OrdenMedicaDetalleResponse
|-- OrdenMedicaCabeceraDto
|-- AseguradoDto
|-- EstablecimientoDto
|-- CoberturaDto
|-- ActoMedicoDto
|-- ProfesionalDto
|-- PrestacionesAgrupadasDto
|-- OrdenHemodialisisDto
|-- OrdenQuimioterapiaDto
`-- FirmaProfesionalDto
```

Ventajas en este proyecto:

- La pantalla de detalle se organiza por secciones; cada DTO coincide con una seccion.
- No todo dato viene de la misma fuente: cabecera viene de `SCH_HCE_ORDEN`, paciente/IPRESS/profesional vienen de `hce-filiacion`.
- Facilita validar inputs: `OrdenMedicaDetRequest`, `OrdenHemodialisisRequest` y `OrdenQuimioterapiaRequest` tienen reglas propias.
- Evita mandar campos innecesarios en listados: `OrdenMedicaResumenDto` es pequeno y no carga todo el detalle.
- Permite cambiar una parte sin romper todo el contrato.

Un DTO gigante mezclaria cabecera, paciente, detalles, firma, cobertura y especiales. Seria dificil saber que campos son de entrada, de salida, de BD propia o de otro microservicio.

## 8. Diferencia entre DTO, Entity, Repository, Service, Controller y Client Feign

### DTO

Objeto para transportar datos hacia afuera o hacia adentro de la API. Ejemplo: `OrdenMedicaRequest` entra por HTTP; `OrdenMedicaDetalleResponse` sale por HTTP.

No representa necesariamente una tabla.

### Entity

Objeto que mapea una tabla de BD. Ejemplo: `OrdenMedica` mapea `TBL_ORDEN_MEDICA`.

Se guarda con JPA.

### Repository

Interfaz que sabe consultar/guardar entities. Ejemplo: `OrdenMedicaRepository.save(orden)`.

No deberia contener logica de negocio compleja.

### Service

Lugar donde vive la logica del caso de uso. Ejemplo: `OrdenMedicaService.crear` valida admision, genera OAP, arma entities y guarda.

### Controller

Entrada HTTP. Recibe requests, valida con `@Valid`, llama al service y devuelve responses.

### Client Feign

Cliente HTTP declarativo para llamar a otro microservicio. Ejemplo: `FiliacionClient` llama a `hce-filiacion`.

## 9. Diagramas ASCII

### Vista de componentes

```text
                 +--------------------+
                 | historia-clinica   |
                 | Frontend React     |
                 +---------+----------+
                           |
                           v
                 +--------------------+
                 | api-gateway-main   |
                 | :8085              |
                 +---------+----------+
                           |
                           v
                 +--------------------+
                 | hce-orden-medica   |
                 | :8094              |
                 +----+----------+----+
                      |          |
                      |          v
                      |   +----------------+
                      |   | hce-filiacion  |
                      |   +----------------+
                      |
                      v
              +---------------------+
              | Oracle              |
              | SCH_HCE_ORDEN      |
              +---------------------+
```

### Arbol de datos de una orden

```text
OrdenMedica
|-- Cabecera
|   |-- nroOap
|   |-- admisionId
|   |-- historiaClinicaId
|   |-- atencionId
|   `-- estado
|-- Detalles
|   |-- Laboratorio
|   |-- Imagen
|   |-- Procedimiento diagnostico
|   |-- Procedimiento terapeutico programado
|   |-- Terapia especializada
|   `-- Otros
|-- Hemodialisis exclusiva
`-- Quimioterapia exclusiva
```

### Flujo crear orden

```text
POST /orden-medica
  |
  v
validar request
  |
  v
consultar admision en hce-filiacion
  |
  v
generar nro OAP
  |
  v
llenar cabecera + snapshot
  |
  v
mapear detalles/especiales
  |
  v
guardar en Oracle
  |
  v
responder detalle completo
```

## 10. Como leer este proyecto sin perderme

Ruta recomendada:

1. Empieza por `README.md` para ubicar puerto, context path y endpoints.
2. Lee `application.properties` para entender nombre Eureka, BD y ruta base.
3. Lee `OrdenMedicaController` y `PacienteOrdenController`; ahi estan las URLs reales.
4. Sigue cada metodo hacia `OrdenMedicaService` o `PacienteOrdenService`.
5. Cuando veas `repository.save` o `findBy...`, abre la entity correspondiente.
6. Cuando veas `FiliacionClient`, recuerda que el dato viene de otro microservicio.
7. Para entender lo que recibe/devuelve la API, abre los DTOs.
8. Para ver tablas reales, compara entities con `SCH_HCE_ORDEN.ddl.sql`.
9. Para entender que usa la UI, revisa `historia-clinica/src/api/ordenMedica.js` y luego `useOrdenMedica.js`.

Regla mental simple:

```text
Controller = puerta HTTP
Service = decision y flujo
Repository = acceso a BD
Entity = tabla
DTO = mensaje de entrada/salida
FeignClient = llamada a otro microservicio
```

## 11. Que archivos tocaria si quiero agregar un nuevo campo

Depende de donde vive el campo.

### Si el campo pertenece a la cabecera de la orden

Tocaria:

```text
db/SCH_HCE_ORDEN.ddl.sql
entity/OrdenMedica.java
dto/OrdenMedicaRequest.java             si entra desde API
dto/OrdenMedicaCabeceraDto.java         si debe salir en detalle
dto/OrdenMedicaResumenDto.java          si debe salir en listado
service/OrdenMedicaService.java         mapeo request -> entity -> response
historia-clinica/src/api/ordenMedica.js si cambia contrato usado por frontend
pantallas React correspondientes        si se muestra/captura
```

### Si el campo viene desde filiacion

Tocaria:

```text
client/dto/AdmisionClientDto.java
service/OrdenMedicaService.java
dto de respuesta donde se muestre
frontend si se visualiza
```

Tambien habria que validar que `hce-filiacion` ya lo exponga. Si no, se debe cambiar ese microservicio primero.

### Si el campo pertenece a detalle

Tocaria:

```text
db/SCH_HCE_ORDEN.ddl.sql
entity/OrdenMedicaDet.java
dto/OrdenMedicaDetRequest.java
dto/OrdenMedicaDetDto.java
service/OrdenMedicaService.mapearDetalleDesdeRequest
service/OrdenMedicaService.toDetDto
frontend si se captura/muestra
```

## 12. Que archivos tocaria si quiero agregar una nueva tabla hija

Ejemplo: agregar una tabla hija `TBL_ORDEN_REHABILITACION`.

Tocaria:

```text
db/SCH_HCE_ORDEN.ddl.sql
entity/OrdenRehabilitacion.java
entity/OrdenMedica.java                 nueva relacion @OneToOne o @OneToMany
repository/OrdenRehabilitacionRepository.java
dto/OrdenRehabilitacionRequest.java
dto/OrdenRehabilitacionDto.java
dto/OrdenMedicaRequest.java             incluir bloque nuevo
dto/OrdenMedicaDetalleResponse.java     incluir bloque nuevo si sale en detalle
service/OrdenMedicaService.java         aplicarX, toXDto, obtenerDetalle
controller/OrdenMedicaController.java   solo si se mantiene dentro del mismo POST/PUT no cambia
frontend si se captura/muestra
```

Decision clave:

- Si es 0..1 por orden, usar una relacion parecida a hemodialisis/quimioterapia.
- Si son muchos registros por orden, usar una relacion parecida a `detalles`.

## 13. Que archivos tocaria si quiero crear un nuevo endpoint

Ejemplo: listar ordenes por estado.

Tocaria:

```text
controller/OrdenMedicaController.java   agregar @GetMapping
service/OrdenMedicaService.java         agregar metodo de caso de uso
repository/OrdenMedicaRepository.java   agregar query findByEstado...
dto/OrdenMedicaResumenDto.java          si el response existente sirve, no tocar
frontend src/api/ordenMedica.js         si lo va a consumir React
hook React                              si se usa React Query
```

Si el endpoint devuelve una forma nueva de datos, crear un DTO nuevo. Si devuelve lo mismo que el listado actual, reutilizar `OrdenMedicaResumenDto`.

## 14. Reglas de negocio visibles en codigo

- Una orden nueva recibe `estado = EMITIDA` si no se envia estado.
- Una orden nueva requiere `admisionId`, `tipoAtencion`, `atencionId` y `tipoOrden`.
- El `nroOap` se genera automaticamente al crear.
- La atencion origen debe coincidir con el tipo de atencion, la admision y la historia clinica de la admision.
- Una orden debe tener al menos un hijo asociado.
- Una orden general solo admite detalles que coincidan con su tipo de orden.
- Hemodialisis (`HEM`) y quimioterapia (`QUI`) son tipos especiales exclusivos: no se mezclan entre si ni con detalles generales.
- Emergencia y Hospitalizacion estan declaradas como tipos, pero el servicio actual las rechaza mientras no haya servicio origen disponible.
- No se puede editar una orden en estado `ANULADA` o `ATENDIDA`.
- Una orden `ANULADA` no puede cambiar a otro estado.
- No se permite cambiar la admision de una orden existente.
- No se permite cambiar la atencion origen ni el tipo de orden de una orden existente.
- Si no viene cantidad en detalle, usa `1`.
- Si no viene prioridad en detalle, usa `Normal`.
- Si no viene estado en detalle, usa `PENDIENTE`.
- Si se actualiza la orden y se omite un detalle que antes existia, se elimina de la coleccion.

## 15. Endpoints reales del microservicio

Recordar que por `server.servlet.context-path=/api/v1/hce`, la ruta completa incluye `/api/v1/hce`.

```text
POST /api/v1/hce/orden-medica
PUT  /api/v1/hce/orden-medica/{id}
GET  /api/v1/hce/orden-medica/{id}
GET  /api/v1/hce/orden-medica/historia-clinica/{historiaClinicaId}
GET  /api/v1/hce/orden-medica/admision/{admisionId}
GET  /api/v1/hce/orden-medica/atencion/{tipoAtencion}/{atencionId}

GET  /api/v1/hce/orden-medica/paciente/admisiones?dni=&nroHc=&page=&size=
GET  /api/v1/hce/orden-medica/paciente/historia-clinica/dni/{dni}
GET  /api/v1/hce/orden-medica/paciente/admision/{id}
```

## 16. Resumen ejecutivo para Lugo

`hce-orden-medica` es el servicio que administra las OAP u ordenes medicas.

Guarda la orden en su propia base Oracle, pero no guarda todo el universo del paciente. Para saber quien es el paciente, su historia clinica, admision, IPRESS y cobertura, consulta a `hce-filiacion`. Para validar la atencion origen y completar el contexto asistencial, consulta a `hce-consulta-externa`.

El frontend entra por el gateway. El gateway encuentra el servicio por Eureka. El backend recibe la peticion en un controller, ejecuta reglas en un service, guarda con repositories y responde DTOs pensados para la pantalla.

La orden tiene una cabecera y detalles generales, o un bloque especial exclusivo de hemodialisis o quimioterapia. Crear una orden genera automaticamente un numero OAP mensual.

Lo mas importante para no perderse:

```text
Frontend -> Gateway -> Controller -> Service -> Repository -> Oracle
                              |
                              v
                       FeignClient -> hce-filiacion
                                   -> hce-consulta-externa
```

Si vas a cambiar algo:

- Campo nuevo: busca si es cabecera, detalle o dato que viene de filiacion.
- Tabla hija nueva: crea entity, repository, DTOs y mapeo en service.
- Endpoint nuevo: controller, service, repository y API frontend si aplica.

Pendientes de validar:

- La pantalla actual de orden medica parece consultar listado/detalle, pero no muestra formulario de crear/editar.
- Los endpoints `PacienteOrdenController` existen, pero el frontend actual busca admisiones directamente en `hce-filiacion`.
- No encontre llamada desde `hce-consulta-externa` hacia `hce-orden-medica` para disparar la creacion de una orden desde la atencion.
- El gateway comenta "solo lectura", aunque enruta tambien `POST` y `PUT` porque el predicate cubre todo `/orden-medica/**`.

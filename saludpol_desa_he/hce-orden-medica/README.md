# hce-orden-medica

Microservicio HCE para consulta, alta y actualizacion de ordenes medicas (OAP).

## Seguridad

- API stateless con JWT (`Authorization: Bearer <token>`).
- Sin token o token invalido: acceso denegado.
- Misma clave `jwt.secret` que el resto de microservicios HCE.
- Rutas publicas unicamente bajo `/api/hce/public/**` si se agregan en el futuro.

Swagger UI (`/swagger-ui/**`) y actuator health son publicos solo para cargar documentacion y health check. Invocar `/orden-medica/**` desde Swagger sigue requiriendo `Authorize` con JWT.

## Obtener el token para pruebas

1. Frontend HCE: login en `historia-clinica`, DevTools, Local Storage, `hce-auth`, copiar `token`.
2. API de autenticacion via gateway o IOS BE:

```http
POST /api/v1/auth/token
Content-Type: application/json

{ "username": "<usuario>", "password": "<clave>" }
```

3. Swagger UI con el servicio arriba: `http://localhost:8094/api/v1/hce/swagger-ui/index.html`.
4. Flujo integrado: levantar gateway, Eureka y frontend; las llamadas a `/api/v1/hce/orden-medica/**` llevan el token automaticamente.

## Configuracion local

| Parametro | Valor |
| --- | --- |
| Puerto | `8094` |
| Context path | `/api/v1/hce` |
| Eureka | `hce-orden-medica` |
| Esquema Oracle | `SCH_HCE_ORDEN` |

## DDL y datos de ejemplo

1. `../z-db/SCH_HCE_ORDEN/SCH_HCE_ORDEN.ddl.sql`
2. `../z-db/SCH_HCE_ORDEN/SCH_HCE_ORDEN.sample-data.sql`

El script de ejemplo incluye una orden unica por cada tipo funcional: `LAB`, `IMG`, `PDI`, `PTE`, `TES`, `OTR`, `HEM` y `QUI`.

## Busqueda y cabecera historica

Orden Medica no genera un correlativo. `nroOap` es obligatorio y se recibe desde el contexto clinico de la atencion origen; la orden se identifica tecnicamente por `id`.

La busqueda principal se hace por `dniPaciente` directamente contra `SCH_HCE_ORDEN.TBL_ORDEN_MEDICA`. La cabecera guarda los datos historicos que debe congelar la orden: contexto de atencion, cobertura, `ipressCui`, edad, DNI del paciente y profesional firmante. Datos descriptivos como nombres del paciente, numero de HC e IPRESS detallada se resuelven por consulta desde sus servicios duenos.

## Endpoints

| Metodo | Ruta |
| --- | --- |
| POST | `/orden-medica` |
| POST | `/orden-medica/crear-consolidado` |
| PUT | `/orden-medica/{id}` |
| GET | `/orden-medica/paciente/{dniPaciente}` |
| GET | `/orden-medica/atencion/{tipoAtencion}/{atencionId}` |
| GET | `/orden-medica/atencion/{tipoAtencion}/{atencionId}/lineas` |
| GET | `/orden-medica/{id}` |

Regla de edicion: no se puede modificar una orden en estado `ATENDIDA` o `ANULADA`.

Via gateway: `http://localhost:8085/api/v1/hce/orden-medica/...`

## Respuesta detalle

`OrdenMedicaDetalleResponse` agrupa cabecera, asegurado, IPRESS, cobertura, acto medico, profesional, prestaciones generales separadas por codigo (`LAB`, `IMG`, `PDI`, `PTE`, `TES`, `OTR`), hemodialisis (`HEM`), quimioterapia (`QUI`) y firma.

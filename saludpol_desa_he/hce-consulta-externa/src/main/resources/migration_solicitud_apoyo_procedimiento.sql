-- ============================================================
-- MIGRACIÓN: Solicitud de Apoyo - campos de procedimiento en cascada
-- Ejecutar sobre BD existente.
-- ============================================================

-- 1. Eliminar constraint de tipo fijo; V_TIPO ahora almacena la
--    descripción del sub-tipo padre (texto libre).
ALTER TABLE "SCH_HCE_CONSULTA"."TBL_SOLICITUD_APOYO"
    DROP CONSTRAINT "CK_SOLAP_TIPO";

-- 2. Ampliar V_TIPO para admitir descripciones de sub-tipo (hasta 100 chars).
ALTER TABLE "SCH_HCE_CONSULTA"."TBL_SOLICITUD_APOYO"
    MODIFY "V_TIPO" VARCHAR2(100 BYTE);

-- 3. Nuevas columnas de trazabilidad del procedimiento seleccionado.
ALTER TABLE "SCH_HCE_CONSULTA"."TBL_SOLICITUD_APOYO"
    ADD "V_ID_SUBTIPO_PARENT" VARCHAR2(20 BYTE);

ALTER TABLE "SCH_HCE_CONSULTA"."TBL_SOLICITUD_APOYO"
    ADD "V_ID_SUBTIPO_ULTIMO" VARCHAR2(20 BYTE);

ALTER TABLE "SCH_HCE_CONSULTA"."TBL_SOLICITUD_APOYO"
    ADD "V_CODIGO_CPMS" VARCHAR2(30 BYTE);

ALTER TABLE "SCH_HCE_CONSULTA"."TBL_SOLICITUD_APOYO"
    ADD "V_CODIGO_SEGUS" VARCHAR2(30 BYTE);

COMMIT;

-- Mapeo de campos resultante:
-- V_TIPO (100)          → descripcionSubTipoProcedimiento del nivel 1 (padre)
-- V_DESCRIPCION (300)   → descripcionSegus del procedimiento seleccionado
-- V_ID_SUBTIPO_PARENT   → idSubTipoProcedimiento del nivel 1
-- V_ID_SUBTIPO_ULTIMO   → idSubTipoProcedimiento del último nivel
-- V_CODIGO_CPMS         → codigoProcedimiento  (ProcedimientoSegusListDTO)
-- V_CODIGO_SEGUS        → codigoSegus          (ProcedimientoSegusListDTO)

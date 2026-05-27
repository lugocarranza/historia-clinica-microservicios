import client from './client'

export const buscarCie10 = (q, page = 0, size = 20) =>
  client.get('/maestro/cie10', { params: { q, page, size } }).then((r) => r.data.data)

export const buscarCie10PorCodigo = (codigo) =>
  client.get(`/maestro/cie10/${codigo}`).then((r) => r.data.data)

export const buscarProfesionales = (q, page = 0, size = 20) =>
  client.get('/maestro/profesionales', { params: { q, page, size } }).then((r) => r.data.data)

export const obtenerEstablecimientoPorCodigoIpress = (codigoIpress) =>
  client.get(`/api/v1/maestros/establecimientos/${codigoIpress}`).then((r) => r.data.data)

export const buscarMedicamentos = async (termino) => {
  if (!termino?.trim()) return []
  const { data } = await client.get('/api/v1/maestros/medicamentos/list', {
    params: { termino },
  })
  return data.data ?? []
}

export const obtenerMedicamentoPorCodigo = (codigo) =>
  client.get(`/api/v1/maestros/medicamentos/${codigo}`).then((r) => r.data.data)

export const buscarProcedimientos = async (termino) => {
  if (!termino?.trim()) return []
  const { data } = await client.get('/api/v1/maestros/procedimientos/list', {
    params: { termino },
  })
  return data.data ?? []
}

export const buscarSubTiposProcedimiento = async (idTipoProcedimiento, idSubTipoProcedimientoParent) => {
  const { data } = await client.get('/api/v1/maestros/subTipoProcedimiento/list', {
    params: {
      idTipoProcedimiento,
      ...(idSubTipoProcedimientoParent != null && { idSubTipoProcedimientoParent }),
    },
  })
  return data.data ?? []
}

export const buscarProfesionalSalud = (numeroDocumento) =>
  client
    .get('/api/v1/maestros/profesional_salud/obtener', { params: { numero_documento: numeroDocumento } })
    .then((r) => r.data.data)

export const buscarProcedimientosCpms = async (termino, idSubTipoProcedimiento) => {
  if (!termino?.trim()) return []
  const { data } = await client.get('/api/v1/maestros/procedimientos/list_cpms_privada_publica', {
    params: { privada_publica: 2, idTipoProcedimiento: 2, idSubTipoProcedimiento, codigoUpss: 0, termino },
  })
  return data.data ?? []
}

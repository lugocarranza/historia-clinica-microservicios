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

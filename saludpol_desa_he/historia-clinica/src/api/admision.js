import client from './client'

const normalizarDni = (value) => `${value || ''}`.trim()

export const registrarAdmision = (data) =>
  client.post('/api/v1/hce/admision', data).then((r) => r.data.data)

export const obtenerAdmision = (id) =>
  client.get(`/api/v1/hce/admision/${id}`).then((r) => r.data.data)

export const buscarAdmisiones = ({ dni = '', nroHc = '', page = 0, size = 20 } = {}) =>
  client.get('/api/v1/hce/admision', { params: { dni, nroHc, page, size } }).then((r) => r.data.data)

export const obtenerUltimaAdmisionPorDni = async (dni) => {
  const dniExacto = normalizarDni(dni)
  if (!dniExacto) return null

  const data = await buscarAdmisiones({ dni: dniExacto, page: 0, size: 20 })
  const resultados = data?.content || []

  return resultados.find((item) => normalizarDni(item?.dniPaciente) === dniExacto) || null
}

export const obtenerHcPorDni = (dni) =>
  client.get(`/api/v1/hce/admision/historia-clinica/dni/${dni}`).then((r) => r.data.data)

export const listarAtenciones = (historiaClinicaId) =>
  client.get(`/api/v1/hce/consulta/atenciones/historia-clinica/${historiaClinicaId}`).then((r) => r.data.data)

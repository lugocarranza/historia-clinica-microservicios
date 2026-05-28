import client from './client'

export const listarOrdenesPorDni = (dniPaciente) =>
  client.get(`/api/v1/hce/orden-medica/paciente/${dniPaciente}`).then((r) => r.data.data)

export const listarOrdenesPorAtencion = (tipoAtencion, atencionId) =>
  client.get(`/api/v1/hce/orden-medica/atencion/${tipoAtencion}/${atencionId}`).then((r) => r.data.data)

export const listarLineasOrdenesPorAtencion = (tipoAtencion, atencionId) =>
  client.get(`/api/v1/hce/orden-medica/atencion/${tipoAtencion}/${atencionId}/lineas`).then((r) => r.data.data)

export const obtenerOrdenMedica = (id) =>
  client.get(`/api/v1/hce/orden-medica/${id}`).then((r) => r.data.data)

export const crearOrdenMedica = (data) =>
  client.post('/api/v1/hce/orden-medica', data).then((r) => r.data.data)

export const crearOrdenMedicaConsolidada = (data) =>
  client.post('/api/v1/hce/orden-medica/crear-consolidado', data).then((r) => r.data.data)

export const actualizarOrdenMedica = (id, data) =>
  client.put(`/api/v1/hce/orden-medica/${id}`, data).then((r) => r.data.data)

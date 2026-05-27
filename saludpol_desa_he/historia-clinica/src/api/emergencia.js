import client from './client'

const BASE = '/api/v1/hce/emergencia'
const admBase = (id) => `${BASE}/admision/${id}`
const atBase = (id) => `${BASE}/atencion/${id}`

export const listarEmergencias = (admisionId) =>
  client.get(`${admBase(admisionId)}/lista`).then((r) => r.data.data)

export const iniciarEmergencia = (admisionId) =>
  client.post(`${admBase(admisionId)}/iniciar`).then((r) => r.data.data)

export const iniciarEmergenciaDirecta = (data) =>
  client.post(`${BASE}/iniciar`, data).then((r) => r.data.data)

export const listarEmergenciasPorDni = (dni) =>
  client.get(`${BASE}/paciente/${dni}/lista`).then((r) => r.data.data)

export const getResumen = (atencionId) =>
  client.get(`${atBase(atencionId)}/resumen`).then((r) => r.data.data)

export const guardarIngreso = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/ingreso`, data).then((r) => r.data)

export const guardarAseguramiento = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/aseguramiento`, data).then((r) => r.data)

export const guardarTriage = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/triage`, data).then((r) => r.data)

export const guardarAnamnesis = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/anamnesis`, data).then((r) => r.data)

export const guardarExamenFisico = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/examen-fisico`, data).then((r) => r.data)

export const guardarDiagnosticos = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/diagnosticos`, data).then((r) => r.data)

export const guardarDecision = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/decision`, data).then((r) => r.data)

export const guardarApoyoDiag = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/apoyo-diagnostico`, data).then((r) => r.data)

export const guardarProcedimiento = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/procedimiento`, data).then((r) => r.data)

export const guardarTratamiento = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/tratamiento`, data).then((r) => r.data)

export const guardarCriterio = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/criterio`, data).then((r) => r.data)

export const guardarEvolucion = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/evolucion`, data).then((r) => r.data)

export const guardarCondicion = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/condicion`, data).then((r) => r.data)

export const guardarDestino = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/destino`, data).then((r) => r.data)

export const guardarAuditoria = (atencionId, data) =>
  client.put(`${atBase(atencionId)}/auditoria`, data).then((r) => r.data)

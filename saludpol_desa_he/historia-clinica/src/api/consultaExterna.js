import client from './client'

const base = (id) => `/api/v1/hce/consulta/externa/admision/${id}`

export const getResumen = (atencionId) =>
  client.get(`${base(atencionId)}/resumen`).then((r) => r.data.data)

export const guardarMotivo = (atencionId, data) =>
  client.put(`${base(atencionId)}/motivo`, data).then((r) => r.data.data)

export const guardarAntPersonal = (atencionId, data) =>
  client.put(`${base(atencionId)}/antecedentes-personales`, data).then((r) => r.data)

export const guardarAntFamiliares = (atencionId, data) =>
  client.put(`${base(atencionId)}/antecedentes-familiares`, data).then((r) => r.data)

export const guardarRevisionSistemas = (atencionId, data) =>
  client.put(`${base(atencionId)}/revision-sistemas`, data).then((r) => r.data)

export const guardarExamenFisico = (atencionId, data) =>
  client.put(`${base(atencionId)}/examen-fisico`, data).then((r) => r.data.data)

export const guardarListaProblemas = (atencionId, data) =>
  client.put(`${base(atencionId)}/lista-problemas`, data).then((r) => r.data)

export const guardarDiagnosticos = (atencionId, data) =>
  client.put(`${base(atencionId)}/diagnosticos`, data).then((r) => r.data)

export const guardarTratamientos = (atencionId, data) =>
  client.put(`${base(atencionId)}/tratamientos`, data).then((r) => r.data)

export const guardarSolicitudesApoyo = (atencionId, data) =>
  client.put(`${base(atencionId)}/solicitudes-apoyo`, data).then((r) => r.data)

export const guardarDecisionClinica = (atencionId, data) =>
  client.put(`${base(atencionId)}/decision-clinica`, data).then((r) => r.data)

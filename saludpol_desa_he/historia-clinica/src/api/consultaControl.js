import client from './client'

const base = (id) => `/api/v1/hce/consulta/control/${id}`

export const getResumen = (atencionId) =>
  client.get(`${base(atencionId)}/resumen`).then((r) => r.data.data)

export const guardarSubjetivo = (atencionId, data) =>
  client.put(`${base(atencionId)}/soap-subjetivo`, data).then((r) => r.data)

export const guardarObjetivo = (atencionId, data) =>
  client.put(`${base(atencionId)}/soap-objetivo`, data).then((r) => r.data)

export const guardarAnalisis = (atencionId, data) =>
  client.put(`${base(atencionId)}/soap-analisis`, data).then((r) => r.data)

export const guardarPlan = (atencionId, data) =>
  client.put(`${base(atencionId)}/soap-plan`, data).then((r) => r.data)

export const guardarListaProblemas = (atencionId, data) =>
  client.put(`${base(atencionId)}/lista-problemas`, data).then((r) => r.data)

export const guardarDiagnosticos = (atencionId, data) =>
  client.put(`${base(atencionId)}/diagnosticos`, data).then((r) => r.data)

export const guardarPlanControl = (atencionId, data) =>
  client.put(`${base(atencionId)}/plan-control`, data).then((r) => r.data)

export const guardarDecisionControl = (atencionId, data) =>
  client.put(`${base(atencionId)}/decision-control`, data).then((r) => r.data)

const baseAdmision = (id) => `/api/v1/hce/consulta/control/admision/${id}`

export const iniciarConsultaControl = (admisionId) =>
  client.post(`${baseAdmision(admisionId)}/iniciar`).then((r) => r.data.data)

export const listarConsultasCS = (admisionId) =>
  client.get(`${baseAdmision(admisionId)}/lista`).then((r) => r.data.data)

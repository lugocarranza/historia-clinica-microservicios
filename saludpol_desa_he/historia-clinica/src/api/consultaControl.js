import client from './client'

const base = (atencionId) => `/api/v1/hce/consulta/control/${atencionId}`
const baseCE = (ceId) => `/api/v1/hce/consulta/control/ce/${ceId}`

export const iniciarConsultaControl = (ceAtencionId, data) =>
  client.post(`${baseCE(ceAtencionId)}/iniciar`, data).then((r) => r.data.data)

export const listarConsultasCS = (ceAtencionId) =>
  client.get(`${baseCE(ceAtencionId)}/lista`).then((r) => r.data.data)

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

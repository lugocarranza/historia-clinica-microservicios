import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarEmergencias, iniciarEmergencia,
  iniciarEmergenciaDirecta, listarEmergenciasPorDni,
  getResumen, guardarIngreso, guardarAseguramiento, guardarTriage,
  guardarAnamnesis, guardarExamenFisico, guardarDiagnosticos,
  guardarDecision, guardarApoyoDiag, guardarProcedimiento,
  guardarTratamiento, guardarCriterio, guardarEvolucion,
  guardarCondicion, guardarDestino, guardarAuditoria,
} from '@/api/emergencia'

export function useListarEmergencias(admisionId) {
  return useQuery({
    queryKey: ['emerg-lista', admisionId],
    queryFn: () => listarEmergencias(admisionId),
    enabled: !!admisionId,
    retry: false,
  })
}

export function useIniciarEmergencia(admisionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => iniciarEmergencia(admisionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emerg-lista', admisionId] }),
  })
}

export function useListarEmergenciasPorDni(dni) {
  return useQuery({
    queryKey: ['emerg-lista-dni', dni],
    queryFn: () => listarEmergenciasPorDni(dni),
    enabled: !!dni,
    retry: false,
  })
}

export function useIniciarEmergenciaDirecta(dni) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => iniciarEmergenciaDirecta(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emerg-lista-dni', dni] }),
  })
}

export function useResumenEmerg(atencionId) {
  return useQuery({
    queryKey: ['emerg-resumen', atencionId],
    queryFn: () => getResumen(atencionId),
    enabled: !!atencionId,
    retry: false,
  })
}

function useSaveMutation(atencionId, saveFn, queryClient) {
  return useMutation({
    mutationFn: (data) => saveFn(atencionId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emerg-resumen', atencionId] }),
  })
}

export function useSaveEmerg(atencionId) {
  const qc = useQueryClient()
  return {
    saveIngreso:       useSaveMutation(atencionId, guardarIngreso, qc),
    saveAseguramiento: useSaveMutation(atencionId, guardarAseguramiento, qc),
    saveTriage:        useSaveMutation(atencionId, guardarTriage, qc),
    saveAnamnesis:     useSaveMutation(atencionId, guardarAnamnesis, qc),
    saveExamenFisico:  useSaveMutation(atencionId, guardarExamenFisico, qc),
    saveDiagnosticos:  useSaveMutation(atencionId, guardarDiagnosticos, qc),
    saveDecision:      useSaveMutation(atencionId, guardarDecision, qc),
    saveApoyoDiag:     useSaveMutation(atencionId, guardarApoyoDiag, qc),
    saveProcedimiento: useSaveMutation(atencionId, guardarProcedimiento, qc),
    saveTratamiento:   useSaveMutation(atencionId, guardarTratamiento, qc),
    saveCriterio:      useSaveMutation(atencionId, guardarCriterio, qc),
    saveEvolucion:     useSaveMutation(atencionId, guardarEvolucion, qc),
    saveCondicion:     useSaveMutation(atencionId, guardarCondicion, qc),
    saveDestino:       useSaveMutation(atencionId, guardarDestino, qc),
    saveAuditoria:     useSaveMutation(atencionId, guardarAuditoria, qc),
  }
}

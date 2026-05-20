import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getResumen, guardarSubjetivo, guardarObjetivo, guardarAnalisis,
  guardarPlan, guardarListaProblemas, guardarDiagnosticos,
  guardarPlanControl, guardarDecisionControl,
  iniciarConsultaControl, listarConsultasCS,
} from '@/api/consultaControl'
import { useResumenResource, useSaveResource } from '@/hooks/consultaShared'

export function useListarConsultasCS(admisionId) {
  return useQuery({
    queryKey: ['cs-lista', admisionId],
    queryFn: () => listarConsultasCS(admisionId),
    enabled: !!admisionId,
  })
}

export function useIniciarConsultaControl(admisionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => iniciarConsultaControl(admisionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cs-lista', admisionId] }),
  })
}

export function useResumenCC(atencionId) {
  return useResumenResource('cc-resumen', atencionId, getResumen)
}

export function useSaveCC(atencionId) {
  return {
    saveSubjetivo: useSaveResource('cc-resumen', atencionId, guardarSubjetivo),
    saveObjetivo: useSaveResource('cc-resumen', atencionId, guardarObjetivo),
    saveAnalisis: useSaveResource('cc-resumen', atencionId, guardarAnalisis),
    savePlan: useSaveResource('cc-resumen', atencionId, guardarPlan),
    saveListaProblemas: useSaveResource('cc-resumen', atencionId, guardarListaProblemas),
    saveDiagnosticos: useSaveResource('cc-resumen', atencionId, guardarDiagnosticos),
    savePlanControl: useSaveResource('cc-resumen', atencionId, guardarPlanControl),
    saveDecisionControl: useSaveResource('cc-resumen', atencionId, guardarDecisionControl),
  }
}

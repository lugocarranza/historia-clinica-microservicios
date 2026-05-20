import {
  getResumen, guardarMotivo, guardarAntPersonal, guardarAntFamiliares,
  guardarRevisionSistemas, guardarExamenFisico, guardarListaProblemas,
  guardarDiagnosticos, guardarTratamientos, guardarSolicitudesApoyo,
  guardarDecisionClinica,
} from '@/api/consultaExterna'
import { useResumenResource, useSaveResource } from '@/hooks/consultaShared'

export function useResumenCE(atencionId) {
  return useResumenResource('ce-resumen', atencionId, getResumen)
}

export function useSaveCE(atencionId) {
  return {
    saveMotivo: useSaveResource('ce-resumen', atencionId, guardarMotivo),
    saveAntPersonal: useSaveResource('ce-resumen', atencionId, guardarAntPersonal),
    saveAntFamiliares: useSaveResource('ce-resumen', atencionId, guardarAntFamiliares),
    saveRevisionSistemas: useSaveResource('ce-resumen', atencionId, guardarRevisionSistemas),
    saveExamenFisico: useSaveResource('ce-resumen', atencionId, guardarExamenFisico),
    saveListaProblemas: useSaveResource('ce-resumen', atencionId, guardarListaProblemas),
    saveDiagnosticos: useSaveResource('ce-resumen', atencionId, guardarDiagnosticos),
    saveTratamientos: useSaveResource('ce-resumen', atencionId, guardarTratamientos),
    saveSolicitudesApoyo: useSaveResource('ce-resumen', atencionId, guardarSolicitudesApoyo),
    saveDecisionClinica: useSaveResource('ce-resumen', atencionId, guardarDecisionClinica),
  }
}

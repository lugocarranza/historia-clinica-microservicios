import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { registrarAdmision, obtenerHcPorDni, listarAtenciones, listarAtencionesPorDni, buscarAdmisiones } from '@/api/admision'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export function useRegistrarAdmision(options) {
  return useMutation({ mutationFn: registrarAdmision, ...options })
}

export function useObtenerHcPorDni(dni) {
  return useQuery({
    queryKey: ['hc-dni', dni],
    queryFn: () => obtenerHcPorDni(dni),
    enabled: !!dni,
    retry: false,
  })
}

export function useListarAtenciones(historiaClinicaId) {
  return useQuery({
    queryKey: ['atenciones', historiaClinicaId],
    queryFn: () => listarAtenciones(historiaClinicaId),
    enabled: !!historiaClinicaId,
  })
}

export function useListarAtencionesPorDni(dniPaciente) {
  return useQuery({
    queryKey: ['atenciones-dni', dniPaciente],
    queryFn: () => listarAtencionesPorDni(dniPaciente),
    enabled: !!dniPaciente,
  })
}

export function useBuscarAdmisiones({ dni = '', nroHc = '', page = 0, size = 20, debounceMs = 500 } = {}) {
  const dniDebounced = useDebouncedValue(dni, debounceMs)
  const nroHcDebounced = useDebouncedValue(nroHc, debounceMs)
  const dniFiltro = dniDebounced.trim()
  const nroHcFiltro = nroHcDebounced.trim()
  const enabled = Boolean(dniFiltro || nroHcFiltro)

  return useQuery({
    queryKey: ['admision-search', dniFiltro, nroHcFiltro, page, size],
    queryFn: () => buscarAdmisiones({ dni: dniFiltro, nroHc: nroHcFiltro, page, size }),
    enabled,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

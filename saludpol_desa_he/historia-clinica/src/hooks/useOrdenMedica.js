import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarOrdenMedica,
  crearOrdenMedica,
  crearOrdenMedicaConsolidada,
  listarOrdenesPorDni,
  listarOrdenesPorAtencion,
  listarLineasOrdenesPorAtencion,
  obtenerOrdenMedica,
} from '@/api/ordenMedica'

export function useListarOrdenesMedica(dniPaciente) {
  return useQuery({
    queryKey: ['orden-medica', 'dni', dniPaciente],
    queryFn: () => listarOrdenesPorDni(dniPaciente),
    enabled: !!dniPaciente,
  })
}

export function useListarOrdenesPorAtencion(tipoAtencion, atencionId) {
  return useQuery({
    queryKey: ['orden-medica', 'atencion', tipoAtencion, atencionId],
    queryFn: () => listarOrdenesPorAtencion(tipoAtencion, atencionId),
    enabled: !!tipoAtencion && !!atencionId,
  })
}

export function useListarLineasOrdenesPorAtencion(tipoAtencion, atencionId) {
  return useQuery({
    queryKey: ['orden-medica', 'atencion-lineas', tipoAtencion, atencionId],
    queryFn: () => listarLineasOrdenesPorAtencion(tipoAtencion, atencionId),
    enabled: !!tipoAtencion && !!atencionId,
  })
}

export function useOrdenMedicaDetalle(ordenId) {
  return useQuery({
    queryKey: ['orden-medica', 'detalle', ordenId],
    queryFn: () => obtenerOrdenMedica(ordenId),
    enabled: !!ordenId,
  })
}

export function useCrearOrdenMedica() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearOrdenMedica,
    onSuccess: (data) => {
      const dniPaciente = data?.cabecera?.dniPaciente
      if (dniPaciente) qc.invalidateQueries({ queryKey: ['orden-medica', 'dni', dniPaciente] })
    },
  })
}

export function useCrearOrdenMedicaConsolidada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearOrdenMedicaConsolidada,
    onSuccess: (data) => {
      const primeraOrden = Array.isArray(data) ? data[0] : data
      const dniPaciente = primeraOrden?.cabecera?.dniPaciente
      if (dniPaciente) qc.invalidateQueries({ queryKey: ['orden-medica', 'dni', dniPaciente] })
    },
  })
}

export function useActualizarOrdenMedica(ordenId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => actualizarOrdenMedica(ordenId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['orden-medica', 'detalle', ordenId] })
      const dniPaciente = data?.cabecera?.dniPaciente
      if (dniPaciente) qc.invalidateQueries({ queryKey: ['orden-medica', 'dni', dniPaciente] })
    },
  })
}

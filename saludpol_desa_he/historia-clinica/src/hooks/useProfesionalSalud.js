import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { buscarProfesionalSalud } from '@/api/maestro'

export function useProfesionalSalud() {
  const { user } = useAuthStore()
  const isMedico = user?.roles?.includes('ROLE_HCE_MEDICO')

  return useQuery({
    queryKey: ['profesional-salud', user?.dni],
    queryFn: () => buscarProfesionalSalud(user.dni),
    enabled: !!user?.dni && !!isMedico,
    staleTime: Infinity,
  })
}

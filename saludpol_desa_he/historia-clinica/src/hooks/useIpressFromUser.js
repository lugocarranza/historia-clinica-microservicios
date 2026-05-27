import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { obtenerEstablecimientoPorCodigoIpress } from '@/api/maestro'

const resolveCodigoIpress = (user) => {
  const primerIpress = Array.isArray(user?.ipress) ? user.ipress[0] : null
  if (!primerIpress) return ''
  if (typeof primerIpress === 'string') return primerIpress.trim()
  if (typeof primerIpress !== 'object') return ''
  const keys = ['codigoIpress', 'codigo', 'cuiIpress', 'renipress', 'codigoRenipress']
  for (const key of keys) {
    const value = primerIpress?.[key]
    if (value != null && String(value).trim() !== '') return String(value).trim()
  }
  return ''
}

export function useIpressFromUser() {
  const { user } = useAuthStore()
  const [ipressData, setIpressData] = useState(null)

  useEffect(() => {
    const cui = resolveCodigoIpress(user)
    if (!cui) return
    obtenerEstablecimientoPorCodigoIpress(cui)
      .then((est) => {
        setIpressData({ ipressCui: est?.codigoIpress || cui })
      })
      .catch(() => {})
  }, [user])

  return ipressData
}

import client from './client'

const decodeJwtPayload = (token) => {
  try {
    const payloadPart = token?.split('.')?.[1]
    if (!payloadPart) return {}

    const normalized = payloadPart.replaceAll('-', '+').replaceAll('_', '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return JSON.parse(atob(padded))
  } catch (e) {
    console.error('Error al decodificar el payload del token:', e)
    return {}
  }
}

const obtenerPerfilPostLogin = async (token) => {
  try {
    const tokenData = decodeJwtPayload(token)
    console.log('TOKEN DATA', tokenData)


    if (!tokenData?.sub) {
      throw new Error('Token no contiene información de usuario')
    }

    const response = await client.get(`/api/v1/users/usuarios/detalle/${tokenData.sub}/HCE`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const userData = response.data?.data

    // Devolvemos solo los datos necesarios
    return {
      nombres: userData?.nombres || '',
      apellidoPaterno: userData?.apellidoPaterno || '',
      apellidoMaterno: userData?.apellidoMaterno || '',
      roles: userData?.roles || [],
      ipress: userData?.ipress || [],
    }
  } catch (e) {
    console.error(e)
  }
}

export const login = async (credentials) => {
  const response = await client.post('/api/v1/auth/token', credentials, { _skipAuthRedirect: true })
  const payload = response.data ?? {}

  if (!payload?.token) {
    throw new Error('No se recibió token en la respuesta de login')
  }

  const user = await obtenerPerfilPostLogin(payload.token)
  return { token: payload.token, ...user }
}

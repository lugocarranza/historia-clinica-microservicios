import client from './client'

export const buscarAsegurado = async (dni) => {
  const { data } = await client.get(`/api/v1/asegurados/afiliacion/${dni}`)
  if (!data.data) {
    const err = new Error(data.message || 'Asegurado no encontrado')
    err.padronNotFound = true
    err.apiMessage = data.message
    throw err
  }
  return mapearAsegurado(data.data)
}

export const buscarCie10 = async (termino) => {
  if (!termino?.trim()) return []
  const { data } = await client.get('/api/v1/maestros/cie10/list', {
    params: { termino },
  })
  return data.data ?? []
}

const mapearAsegurado = (ms) => ({
  dniPaciente: ms.numeroDocumento,
  apellidosPaciente: `${ms.apellidoPaterno} ${ms.apellidoMaterno}`.trim(),
  nombresPaciente: ms.nombres,
  fechaNac: ms.fechaNacimiento,
  sexo: ms.sexo === 'MASCULINO' ? 'M' : 'F',
  situacion: ms.estadoAsegurado,
  condicion: ms.tipoPlan,
  parentesco: ms.tipoPlan,
  tipoCobertura: ms.tipoCobertura,
})
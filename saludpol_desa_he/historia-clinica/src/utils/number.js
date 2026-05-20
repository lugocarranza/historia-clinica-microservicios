export const toNumberOrNull = (value) => {
  if (value === '' || value == null) return null
  const normalized = typeof value === 'string' ? value.replace(',', '.') : value
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

export const calculateImcKgM2 = (peso, tallaCm) => {
  const pesoNumber = toNumberOrNull(peso)
  const tallaNumber = toNumberOrNull(tallaCm)

  if (pesoNumber == null || tallaNumber == null || tallaNumber <= 0) return ''

  const imc = pesoNumber / Math.pow(tallaNumber / 100, 2)
  return Number.isFinite(imc) ? imc.toFixed(2) : ''
}
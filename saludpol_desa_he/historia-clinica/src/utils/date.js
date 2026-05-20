import { format, differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = (date) => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm')
}

export const toDateTimeLocal = (date = new Date()) =>
  format(date, "yyyy-MM-dd'T'HH:mm")

export const todayDateInput = (date = new Date()) =>
  format(date, 'yyyy-MM-dd')

export const calcEdad = (fechaNac) => {
  if (!fechaNac) return '—'
  const d = typeof fechaNac === 'string' ? parseISO(fechaNac) : fechaNac
  const hoy = new Date()
  const anios = differenceInYears(hoy, d)
  const despAnios = addYears(d, anios)
  const meses = differenceInMonths(hoy, despAnios)
  const despMeses = addMonths(despAnios, meses)
  const dias = differenceInDays(hoy, despMeses)
  return `${anios} años ${String(meses).padStart(2, '0')} meses ${String(dias).padStart(2, '0')} días`
}

export const todayStr = () =>
  format(new Date(), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })
